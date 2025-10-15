"""
Agent orchestrator for dynamic tool selection and multi-step reasoning
Uses LangGraph for agent workflow orchestration
"""

from typing import List, Dict, Any, Optional, AsyncGenerator
import structlog
from dataclasses import dataclass

from src.utils.logger import get_logger

logger = get_logger("agent_orchestrator")


@dataclass
class ReasoningStep:
    """Represents a single reasoning step in the agent workflow."""
    step_number: int
    action: str
    tool_used: Optional[str]
    input: str
    output: Any
    reasoning: str


class AgentOrchestrator:
    """Orchestrates multi-agent retrieval with dynamic tool selection."""

    def __init__(
        self,
        vector_search_tool,
        graph_traversal_tool,
        logical_filter_tool,
        ollama_client=None,
        model_name: str = "gemma3:1b-it-qat"
    ):
        """
        Initialize agent orchestrator with retrieval tools.

        Args:
            vector_search_tool: Vector similarity search tool
            graph_traversal_tool: Graph traversal tool
            logical_filter_tool: Logical filtering tool
            ollama_client: Ollama client for reasoning
            model_name: Model to use for agent reasoning
        """
        self.vector_search_tool = vector_search_tool
        self.graph_traversal_tool = graph_traversal_tool
        self.logical_filter_tool = logical_filter_tool
        self.ollama_client = ollama_client
        self.model_name = model_name

        self.tools = {
            "vector_search": vector_search_tool,
            "graph_traversal": graph_traversal_tool,
            "logical_filter": logical_filter_tool
        }

        logger.info(
            "Agent orchestrator initialized",
            tools=list(self.tools.keys()),
            model=model_name
        )

    async def process_query(
        self,
        query: str,
        max_steps: int = 5,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Process query using multi-step agentic reasoning.

        Args:
            query: Natural language query
            max_steps: Maximum reasoning steps
            stream: Whether to stream reasoning steps

        Returns:
            Query results with reasoning chain
        """

        logger.info(
            "Processing query with agent orchestration",
            query_length=len(query),
            max_steps=max_steps,
            stream=stream
        )

        try:
            reasoning_chain = []

            # Step 1: Analyze query and determine strategy
            strategy = await self._analyze_query(query)
            reasoning_chain.append(ReasoningStep(
                step_number=1,
                action="query_analysis",
                tool_used=None,
                input=query,
                output=strategy,
                reasoning=f"Analyzed query intent: {strategy['intent']}"
            ))

            # Step 2: Select and execute tools based on strategy
            tool_results = {}

            for tool_name in strategy.get('tools', []):
                if tool_name in self.tools:
                    tool = self.tools[tool_name]

                    logger.info(f"Executing tool: {tool_name}")

                    # Execute tool
                    results = await tool.search(query, top_k=10)

                    tool_results[tool_name] = results

                    reasoning_chain.append(ReasoningStep(
                        step_number=len(reasoning_chain) + 1,
                        action=f"execute_{tool_name}",
                        tool_used=tool_name,
                        input=query,
                        output=results,
                        reasoning=f"Retrieved {len(results)} results using {tool_name}"
                    ))

            # Step 3: Synthesize results
            final_response = await self._synthesize_results(
                query,
                tool_results,
                strategy
            )

            reasoning_chain.append(ReasoningStep(
                step_number=len(reasoning_chain) + 1,
                action="synthesis",
                tool_used=None,
                input=tool_results,
                output=final_response,
                reasoning="Synthesized final response from multiple retrieval methods"
            ))

            # Compile final result
            result = {
                "query": query,
                "response": final_response.get('answer', ''),
                "reasoning_chain": [
                    {
                        "step": step.step_number,
                        "action": step.action,
                        "tool": step.tool_used,
                        "reasoning": step.reasoning
                    }
                    for step in reasoning_chain
                ],
                "sources": final_response.get('sources', []),
                "confidence": final_response.get('confidence', 0.0),
                "tools_used": list(tool_results.keys())
            }

            logger.info(
                "Query processing completed",
                steps=len(reasoning_chain),
                tools_used=len(tool_results)
            )

            return result

        except Exception as e:
            logger.error("Query processing failed", error=str(e))
            raise

    async def _analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Analyze query to determine intent and tool selection strategy.

        Args:
            query: Natural language query

        Returns:
            Strategy dictionary with intent and tool selection
        """

        logger.info("Analyzing query intent")

        try:
            # TODO: Implement LLM-based query analysis
            # For now, use heuristic-based routing

            query_lower = query.lower()

            # Determine query intent
            if any(word in query_lower for word in ['related', 'connected', 'relationship', 'path']):
                intent = "relationship_query"
                tools = ["graph_traversal", "vector_search"]
            elif any(word in query_lower for word in ['where', 'filter', 'type', 'category']):
                intent = "filtered_query"
                tools = ["logical_filter", "vector_search"]
            elif any(word in query_lower for word in ['similar', 'like', 'about', 'concept']):
                intent = "semantic_query"
                tools = ["vector_search", "graph_traversal"]
            else:
                intent = "hybrid_query"
                tools = ["vector_search", "graph_traversal", "logical_filter"]

            strategy = {
                "intent": intent,
                "tools": tools,
                "reasoning": f"Query appears to be a {intent}, using tools: {', '.join(tools)}"
            }

            logger.info("Query analysis completed", intent=intent, tools=tools)
            return strategy

        except Exception as e:
            logger.error("Query analysis failed", error=str(e))
            # Fallback to hybrid approach
            return {
                "intent": "unknown",
                "tools": ["vector_search"],
                "reasoning": "Using fallback strategy"
            }

    async def _synthesize_results(
        self,
        query: str,
        tool_results: Dict[str, List[Dict[str, Any]]],
        strategy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Synthesize final response from multiple tool results.

        Args:
            query: Original query
            tool_results: Results from each tool
            strategy: Query strategy

        Returns:
            Synthesized response
        """

        logger.info("Synthesizing results from multiple tools")

        try:
            # Collect all sources
            all_sources = []
            for tool_name, results in tool_results.items():
                for result in results:
                    source = {
                        "tool": tool_name,
                        "content": result.get('content', str(result)),
                        "score": result.get('score', 0.0),
                        "metadata": result.get('metadata', {})
                    }
                    all_sources.append(source)

            # Sort by score
            all_sources.sort(key=lambda x: x['score'], reverse=True)

            # TODO: Implement LLM-based synthesis
            # For now, create a simple response

            answer = (
                f"Based on {len(tool_results)} retrieval methods "
                f"({', '.join(tool_results.keys())}), "
                f"I found {len(all_sources)} relevant results. "
                f"The query intent was identified as '{strategy['intent']}'."
            )

            # Calculate confidence based on result consistency
            confidence = min(0.9, len(all_sources) / 20.0)

            synthesis = {
                "answer": answer,
                "sources": all_sources[:10],  # Top 10 sources
                "confidence": confidence,
                "tool_agreement": len(tool_results)
            }

            logger.info(
                "Result synthesis completed",
                source_count=len(all_sources),
                confidence=confidence
            )

            return synthesis

        except Exception as e:
            logger.error("Result synthesis failed", error=str(e))
            return {
                "answer": "Failed to synthesize results",
                "sources": [],
                "confidence": 0.0
            }

    async def stream_reasoning(
        self,
        query: str,
        max_steps: int = 5
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream reasoning steps as they happen.

        Args:
            query: Natural language query
            max_steps: Maximum reasoning steps

        Yields:
            Reasoning step dictionaries
        """

        logger.info("Starting streaming reasoning", query_length=len(query))

        try:
            # Yield analysis step
            yield {
                "step": "analysis",
                "message": "Analyzing query intent and selecting tools..."
            }

            strategy = await self._analyze_query(query)

            yield {
                "step": "strategy",
                "intent": strategy['intent'],
                "tools": strategy['tools'],
                "message": f"Strategy: {strategy['reasoning']}"
            }

            # Execute tools and yield results
            tool_results = {}
            for tool_name in strategy.get('tools', []):
                yield {
                    "step": "tool_execution",
                    "tool": tool_name,
                    "message": f"Executing {tool_name}..."
                }

                if tool_name in self.tools:
                    results = await self.tools[tool_name].search(query, top_k=10)
                    tool_results[tool_name] = results

                    yield {
                        "step": "tool_result",
                        "tool": tool_name,
                        "result_count": len(results),
                        "message": f"Retrieved {len(results)} results from {tool_name}"
                    }

            # Synthesize and yield final result
            yield {
                "step": "synthesis",
                "message": "Synthesizing final response..."
            }

            final_response = await self._synthesize_results(query, tool_results, strategy)

            yield {
                "step": "complete",
                "response": final_response,
                "message": "Query processing complete"
            }

        except Exception as e:
            logger.error("Streaming reasoning failed", error=str(e))
            yield {
                "step": "error",
                "error": str(e),
                "message": "An error occurred during processing"
            }
