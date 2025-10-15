"""
Chatbot and Enhanced File Processing Routes
- Application Chatbot (Step 10)
- Group Manager AI (Step 11)
- Enhanced File Processing and Summarization (Step 12)

Leverages existing enhanced_* APIs for embeddings, search, and graph data.
Falls back gracefully if external services are unavailable.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import os
import re
import json

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

# Optional OpenAI import (fallback to heuristic if not configured)
try:
    from openai import OpenAI  # type: ignore
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore

# Import enhanced modules (already present in repo)
from src.api.enhanced_chromadb_api import (
    semantic_search_endpoint as chroma_semantic_search,
    store_document_chunks_endpoint as chroma_store_chunks,
)
from src.api.enhanced_graph_constructor_api import (
    get_graph_visualization_data_endpoint as graph_viz_endpoint,
    get_entity_subgraph_endpoint as graph_subgraph_endpoint,
)

router = APIRouter()


# -----------------------------
# Models
# -----------------------------

class ChatRequest(BaseModel):
    user_id: Optional[str] = Field(None, description="User identifier")
    message: str = Field(..., description="User message")
    top_k: int = Field(10, ge=1, le=50)
    strategy: str = Field("hybrid", description="retrieval strategy: vector|hybrid")


class ChatResponse(BaseModel):
    success: bool
    status_code: int
    processing_ms: int
    data: Optional[Dict[str, Any]] = None
    warnings: List[str] = []
    error: Optional[str] = None


class GroupManagerRequest(BaseModel):
    message: str


class FileSummarizeRequest(BaseModel):
    doc_id: str
    text: Optional[str] = None
    file_path: Optional[str] = None
    chunk_size: int = Field(1000, ge=200, le=4000)
    overlap: int = Field(100, ge=0, le=1000)


# -----------------------------
# Utilities
# -----------------------------

_STOPWORDS = set(
    [
        "the","is","in","and","or","of","to","a","an","for","on","at","by","with","from",
        "this","that","it","as","are","be","was","were","about","into","over","under","than",
    ]
)


def extract_keywords(text: str, max_keywords: int = 8) -> List[str]:
    words = re.findall(r"[A-Za-z0-9_\-]+", text.lower())
    uniq: List[str] = []
    for w in words:
        if w in _STOPWORDS:
            continue
        if len(w) < 3:
            continue
        if w not in uniq:
            uniq.append(w)
        if len(uniq) >= max_keywords:
            break
    return uniq


def build_llm_client() -> Optional["OpenAI"]:  # type: ignore
    if OpenAI is None:
        return None
    try:
        return OpenAI()
    except Exception:
        return None


def synthesize_with_llm(system_prompt: str, user_prompt: str) -> Optional[str]:
    client = build_llm_client()
    if not client:
        return None
    try:
        resp = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=700,
        )
        return resp.choices[0].message.content
    except Exception:
        return None


# -----------------------------
# Step 10: Application Chatbot
# -----------------------------

@router.post("/v2/chat/app", response_model=ChatResponse)
async def app_chat(req: ChatRequest) -> ChatResponse:
    """Application chatbot that answers using existing embeddings and (optionally) graph context."""
    import time
    t0 = time.time()
    try:
        keywords = extract_keywords(req.message)

        # 1) Vector semantic search from Chroma (entities + chunks)
        entities_results = await chroma_semantic_search(req.message, None, min(req.top_k, 10), "entities")
        chunks_results = await chroma_semantic_search(req.message, None, min(req.top_k, 10), "document_chunks")

        sources: List[Dict[str, Any]] = []
        for pack in (entities_results, chunks_results):
            if pack and pack.get("success") and pack.get("data", {}).get("results"):
                for r in pack["data"]["results"]:
                    sources.append(r)
        # Sort highest score first if available
        if sources and "score" in sources[0]:
            sources.sort(key=lambda x: x.get("score", 0.0), reverse=True)

        # 2) Optional: small subgraph sample around top entity for relational hints
        graph_hint = None
        if sources:
            top_entity_id = sources[0].get("metadata", {}).get("entity_id")
            if top_entity_id:
                try:
                    graph_hint = await graph_subgraph_endpoint(top_entity_id, 1)
                except Exception:
                    graph_hint = None

        # 3) Compose context
        context_snippets = []
        for s in sources[: min(10, req.top_k)]:
            name = s.get("name") or s.get("metadata", {}).get("entity_name", "")
            snippet = s.get("anchor_text") or s.get("content") or ""
            context_snippets.append(f"- {name}: {snippet}")
        graph_note = ""
        if graph_hint and graph_hint.get("success"):
            graph_note = f"\nGraph hint: {len(graph_hint['data'].get('edges', []))} relations around top entity."

        system_prompt = (
            "You are the Application Bot for Agentic Graph RAG. Answer strictly using the provided context. "
            "Prefer precise, concise answers with bullet points and include brief references. If information is insufficient, say so."
        )
        user_prompt = (
            f"User message: {req.message}\n\n"
            f"Keywords: {', '.join(keywords)}\n\n"
            f"Context from embeddings (top-{min(10, req.top_k)}):\n" + "\n".join(context_snippets) + graph_note
        )

        llm_answer = synthesize_with_llm(system_prompt, user_prompt)
        if not llm_answer:
            # Fallback synthesis: stitch top results
            stitched = "\n".join([s.get("anchor_text", "") for s in sources[:3]])
            llm_answer = (
                f"Based on similar content found, here are the most relevant snippets:\n{stitched}\n\n"
                f"Query intent keywords: {', '.join(keywords)}."
            )

        processing_ms = int((time.time() - t0) * 1000)
        return ChatResponse(
            success=True,
            status_code=200,
            processing_ms=processing_ms,
            data={
                "answer": llm_answer,
                "keywords": keywords,
                "sources": sources[: min(10, req.top_k)],
                "confidence": min(0.95, (len(sources) / max(1, req.top_k)) * 0.9),
            },
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            status_code=500,
            processing_ms=0,
            error=f"App chatbot failed: {str(e)}",
        )


# -----------------------------
# Step 11: Group Manager AI (Educational Q&A)
# -----------------------------

_GROUP_SYS_PROMPT = (
    "You are Group Manager AI. You answer general questions about RAG, knowledge graphs, AI, and this project. "
    "You do NOT engage in personal chat. Be educational, accurate, and concise. Explain concepts when asked."
)


@router.post("/v2/chat/group-manager", response_model=ChatResponse)
async def group_manager_chat(req: GroupManagerRequest) -> ChatResponse:
    import time
    t0 = time.time()
    try:
        # Light keyword extraction to steer the answer
        kw = extract_keywords(req.message)

        # Prefer project context first if available via embeddings
        emb = await chroma_semantic_search(req.message, None, 6, "document_chunks")
        context_lines: List[str] = []
        if emb and emb.get("success") and emb.get("data", {}).get("results"):
            for r in emb["data"]["results"][:6]:
                context_lines.append(f"- {r.get('anchor_text', '')}")

        user_prompt = (
            f"Question: {req.message}\n\n"
            f"Keywords: {', '.join(kw)}\n\n"
            + ("Project context:\n" + "\n".join(context_lines) if context_lines else "")
        )

        answer = synthesize_with_llm(_GROUP_SYS_PROMPT, user_prompt)
        if not answer:
            # Simple canned guidance if no LLM
            answer = (
                "RAG (Retrieval-Augmented Generation) combines a retriever (e.g., vector search over embeddings) "
                "with a generator (LLM) to produce grounded answers. In this project, embeddings are stored in ChromaDB, "
                "graphs in Neo4j, and the retrieval agent blends vector, graph traversal, and logical filters."
            )

        processing_ms = int((time.time() - t0) * 1000)
        return ChatResponse(
            success=True,
            status_code=200,
            processing_ms=processing_ms,
            data={"answer": answer, "keywords": kw},
        )
    except Exception as e:
        return ChatResponse(
            success=False,
            status_code=500,
            processing_ms=0,
            error=f"Group Manager chatbot failed: {str(e)}",
        )


# -----------------------------
# Step 12: Enhanced File Processing (Summarization)
# -----------------------------

@router.post("/v2/files/summarize", response_model=ChatResponse)
async def summarize_file(req: FileSummarizeRequest) -> ChatResponse:
    """Summarize input text or a server-side file; store summary chunks in ChromaDB."""
    import time
    t0 = time.time()
    try:
        if not req.text and not req.file_path:
            raise HTTPException(status_code=422, detail="Provide either text or file_path")

        # 1) Load text
        text = req.text
        if not text and req.file_path:
            # Read file as UTF-8 text (best-effort)
            with open(req.file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        assert text is not None

        # 2) Summarize (LLM preferred, fallback extractive)
        sys_prompt = (
            "Summarize the content clearly and concisely. Use bullet points when appropriate. "
            "Include key entities, relationships, and any metrics. Keep under 300 words."
        )
        user_prompt = text[:6000]
        summary = synthesize_with_llm(sys_prompt, user_prompt)
        if not summary:
            # Extractive fallback: first N sentences + headings
            sentences = re.split(r"(?<=[.!?])\s+", text)
            summary = "\n".join(sentences[:8])

        # 3) Persist summary to data/summaries
        out_dir = os.path.join("data", "summaries")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, f"{req.doc_id}_summary.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(summary)

        # 4) Store summary chunks in ChromaDB for later semantic search
        chroma_result = await chroma_store_chunks(summary, req.doc_id, req.chunk_size, req.overlap)

        processing_ms = int((time.time() - t0) * 1000)
        return ChatResponse(
            success=True,
            status_code=200,
            processing_ms=processing_ms,
            data={
                "doc_id": req.doc_id,
                "summary_file": out_path,
                "chroma": chroma_result,
                "processed_bytes": len(text.encode("utf-8")),
            },
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        return ChatResponse(
            success=False,
            status_code=500,
            processing_ms=0,
            error=f"Summarization failed: {str(e)}",
        )