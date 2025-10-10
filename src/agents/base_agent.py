"""
Base agent class with planning and reasoning capabilities
"""

from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
import structlog

from src.utils.logger import get_logger

logger = get_logger("base_agent")


class BaseAgent(ABC):
    """Base class for all agents with common functionality."""

    def __init__(
        self,
        name: str,
        ollama_client=None,
        model_name: str = "gemma3:1b-it-qat"
    ):
        """
        Initialize base agent.

        Args:
            name: Agent name
            ollama_client: Ollama client for LLM operations
            model_name: Model to use for reasoning
        """
        self.name = name
        self.ollama_client = ollama_client
        self.model_name = model_name
        self.memory = []

        logger.info(
            "Agent initialized",
            name=name,
            model=model_name
        )

    @abstractmethod
    async def plan(self, task: str) -> List[Dict[str, Any]]:
        """
        Create a plan to accomplish the task.

        Args:
            task: Task description

        Returns:
            List of planned steps
        """
        pass

    @abstractmethod
    async def execute(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute the planned steps.

        Args:
            plan: List of steps to execute

        Returns:
            Execution results
        """
        pass

    async def reason(self, context: str, question: str) -> str:
        """
        Perform reasoning given context and question.

        Args:
            context: Context information
            question: Question to answer

        Returns:
            Reasoning result
        """

        logger.info(
            "Performing reasoning",
            agent=self.name,
            question_length=len(question)
        )

        try:
            if not self.ollama_client:
                logger.warning("No LLM client available")
                return "Unable to reason without LLM client"

            # TODO: Implement actual LLM-based reasoning
            # For now, return placeholder
            return f"Reasoning about: {question}"

        except Exception as e:
            logger.error("Reasoning failed", error=str(e))
            raise

    def add_to_memory(self, item: Dict[str, Any]) -> None:
        """
        Add item to agent memory.

        Args:
            item: Memory item to store
        """
        self.memory.append(item)
        logger.debug(
            "Added to memory",
            agent=self.name,
            memory_size=len(self.memory)
        )

    def get_memory(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Retrieve agent memory.

        Args:
            limit: Optional limit on number of items

        Returns:
            List of memory items
        """
        if limit:
            return self.memory[-limit:]
        return self.memory

    def clear_memory(self) -> None:
        """Clear agent memory."""
        self.memory = []
        logger.info("Memory cleared", agent=self.name)
