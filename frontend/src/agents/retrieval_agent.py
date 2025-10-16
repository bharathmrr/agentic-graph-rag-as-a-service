"""
Retrieval agent for routing and coordinating retrieval tools
"""

from typing import Dict, Any, List
import structlog

from src.agents.base_agent import BaseAgent
from src.utils.logger import get_logger

logger = get_logger("retrieval_agent")


class RetrievalAgent(BaseAgent):
    """Agent specialized in retrieval task planning and execution."""

    def __init__(
        self,
        ollama_client=None,
        model_name: str = "gemma3:1b-it-qat",
        tools: Dict[str, Any] = None
    ):
        """
        Initialize retrieval agent.

        Args:
            ollama_client: Ollama client for LLM operations
            model_name: Model to use for reasoning
            tools: Dictionary of available retrieval tools
        """
        super().__init__("RetrievalAgent", ollama_client, model_name)
        self.tools = tools or {}

        logger.info(
            "Retrieval agent initialized",
            available_tools=list(self.tools.keys())
        )

    async def plan(self, task: str) -> List[Dict[str, Any]]:
        """
        Create retrieval plan based on query.

        Args:
            task: Query or retrieval task

        Returns:
            List of planned retrieval steps
        """

        logger.info("Planning retrieval strategy", task_length=len(task))

        try:
            # Analyze task to determine tool selection
            plan = []

            task_lower = task.lower()

            # Step 1: Always start with semantic search
            plan.append({
                "step": 1,
                "action": "vector_search",
                "tool": "vector_search",
                "reasoning": "Perform semantic similarity search"
            })

            # Step 2: Add graph traversal if relationship query
            if any(word in task_lower for word in ['related', 'connected', 'relationship']):
                plan.append({
                    "step": 2,
                    "action": "graph_traversal",
                    "tool": "graph_traversal",
                    "reasoning": "Query involves relationships, use graph traversal"
                })

            # Step 3: Add logical filter if constraints present
            if any(word in task_lower for word in ['where', 'filter', 'type', 'only']):
                plan.append({
                    "step": len(plan) + 1,
                    "action": "logical_filter",
                    "tool": "logical_filter",
                    "reasoning": "Query has constraints, apply logical filters"
                })

            # Step 4: Synthesize results
            plan.append({
                "step": len(plan) + 1,
                "action": "synthesize",
                "tool": None,
                "reasoning": "Combine and rank results from all tools"
            })

            logger.info("Retrieval plan created", steps=len(plan))
            return plan

        except Exception as e:
            logger.error("Planning failed", error=str(e))
            raise

    async def execute(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute retrieval plan.

        Args:
            plan: List of planned steps

        Returns:
            Execution results
        """

        logger.info("Executing retrieval plan", steps=len(plan))

        try:
            results = {
                "steps_executed": [],
                "tool_results": {},
                "final_response": None
            }

            for step in plan:
                tool_name = step.get("tool")

                if tool_name and tool_name in self.tools:
                    # Execute tool
                    tool = self.tools[tool_name]
                    tool_result = await tool.search("", top_k=10)

                    results["tool_results"][tool_name] = tool_result
                    results["steps_executed"].append(step)

                    logger.info(
                        "Step executed",
                        step=step["step"],
                        tool=tool_name,
                        result_count=len(tool_result)
                    )

            # Synthesize final response
            results["final_response"] = self._synthesize(results["tool_results"])

            logger.info("Plan execution completed", tools_used=len(results["tool_results"]))
            return results

        except Exception as e:
            logger.error("Execution failed", error=str(e))
            raise

    def _synthesize(self, tool_results: Dict[str, List]) -> Dict[str, Any]:
        """Synthesize results from multiple tools."""

        all_results = []
        for tool_name, results in tool_results.items():
            for result in results:
                all_results.append({
                    "source_tool": tool_name,
                    **result
                })

        return {
            "total_results": len(all_results),
            "results": all_results[:10],  # Top 10
            "tools_used": list(tool_results.keys())
        }
