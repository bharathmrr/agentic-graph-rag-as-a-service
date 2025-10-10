"""
Reasoning stream module for streaming agent responses
"""

from typing import AsyncGenerator, Dict, Any
import structlog
import json

from src.utils.logger import get_logger

logger = get_logger("reasoning_stream")


class ReasoningStream:
    """Handles streaming of reasoning chains and responses."""

    def __init__(self, agent_orchestrator):
        """
        Initialize reasoning stream.

        Args:
            agent_orchestrator: Agent orchestrator instance
        """
        self.agent_orchestrator = agent_orchestrator
        logger.info("Reasoning stream initialized")

    async def stream_query_response(
        self,
        query: str,
        max_steps: int = 5
    ) -> AsyncGenerator[str, None]:
        """
        Stream query response with reasoning steps.

        Args:
            query: Natural language query
            max_steps: Maximum reasoning steps

        Yields:
            Server-sent event formatted strings
        """

        logger.info("Starting query response stream", query=query)

        try:
            async for step in self.agent_orchestrator.stream_reasoning(query, max_steps):
                # Format as server-sent event
                event_data = json.dumps(step)
                yield f"data: {event_data}\n\n"

        except Exception as e:
            logger.error("Streaming failed", error=str(e))
            error_event = json.dumps({
                "step": "error",
                "error": str(e)
            })
            yield f"data: {error_event}\n\n"

    async def stream_with_progress(
        self,
        query: str,
        callback=None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Stream with progress tracking.

        Args:
            query: Natural language query
            callback: Optional callback for progress updates

        Yields:
            Progress dictionaries
        """

        logger.info("Starting progress stream")

        try:
            total_steps = 5
            current_step = 0

            async for step in self.agent_orchestrator.stream_reasoning(query):
                current_step += 1
                progress = (current_step / total_steps) * 100

                progress_data = {
                    **step,
                    "progress": min(progress, 100),
                    "current_step": current_step,
                    "total_steps": total_steps
                }

                if callback:
                    await callback(progress_data)

                yield progress_data

        except Exception as e:
            logger.error("Progress streaming failed", error=str(e))
            yield {
                "step": "error",
                "error": str(e),
                "progress": 0
            }
