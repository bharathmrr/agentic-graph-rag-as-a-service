"""
Evaluation agent for assessing retrieval accuracy and quality
"""

from typing import Dict, Any, List
import structlog

from src.agents.base_agent import BaseAgent
from src.utils.logger import get_logger

logger = get_logger("evaluation_agent")


class EvaluationAgent(BaseAgent):
    """Agent specialized in evaluating retrieval quality."""

    def __init__(
        self,
        ollama_client=None,
        model_name: str = "gemma3:1b-it-qat"
    ):
        """
        Initialize evaluation agent.

        Args:
            ollama_client: Ollama client for LLM operations
            model_name: Model to use for evaluation
        """
        super().__init__("EvaluationAgent", ollama_client, model_name)
        logger.info("Evaluation agent initialized")

    async def plan(self, task: str) -> List[Dict[str, Any]]:
        """
        Create evaluation plan.

        Args:
            task: Evaluation task description

        Returns:
            List of evaluation steps
        """

        plan = [
            {
                "step": 1,
                "action": "relevance_check",
                "reasoning": "Evaluate relevance of retrieved results"
            },
            {
                "step": 2,
                "action": "accuracy_check",
                "reasoning": "Verify factual accuracy"
            },
            {
                "step": 3,
                "action": "completeness_check",
                "reasoning": "Assess completeness of response"
            },
            {
                "step": 4,
                "action": "calculate_metrics",
                "reasoning": "Calculate evaluation metrics"
            }
        ]

        return plan

    async def execute(self, plan: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute evaluation plan.

        Args:
            plan: List of evaluation steps

        Returns:
            Evaluation results
        """

        logger.info("Executing evaluation plan")

        results = {
            "steps_completed": len(plan),
            "metrics": {},
            "overall_score": 0.0
        }

        return results

    async def evaluate_retrieval(
        self,
        query: str,
        results: List[Dict[str, Any]],
        ground_truth: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate retrieval results.

        Args:
            query: Original query
            results: Retrieved results
            ground_truth: Optional ground truth for comparison

        Returns:
            Evaluation metrics
        """

        logger.info(
            "Evaluating retrieval results",
            query_length=len(query),
            result_count=len(results)
        )

        try:
            metrics = {
                "result_count": len(results),
                "relevance_score": await self._calculate_relevance(query, results),
                "diversity_score": self._calculate_diversity(results),
                "coverage_score": 0.0
            }

            if ground_truth:
                metrics["precision"] = self._calculate_precision(results, ground_truth)
                metrics["recall"] = self._calculate_recall(results, ground_truth)
                metrics["f1_score"] = self._calculate_f1(
                    metrics["precision"],
                    metrics["recall"]
                )

            # Calculate overall score
            metrics["overall_score"] = sum([
                metrics["relevance_score"] * 0.4,
                metrics["diversity_score"] * 0.3,
                metrics.get("f1_score", 0.5) * 0.3
            ])

            logger.info(
                "Evaluation completed",
                overall_score=metrics["overall_score"]
            )

            return metrics

        except Exception as e:
            logger.error("Evaluation failed", error=str(e))
            raise

    async def _calculate_relevance(
        self,
        query: str,
        results: List[Dict[str, Any]]
    ) -> float:
        """Calculate average relevance score."""

        if not results:
            return 0.0

        # Use scores from results if available
        scores = [r.get('score', 0.5) for r in results]
        return sum(scores) / len(scores)

    def _calculate_diversity(self, results: List[Dict[str, Any]]) -> float:
        """Calculate diversity of results."""

        if len(results) <= 1:
            return 1.0

        # Simple diversity based on unique sources
        unique_sources = len(set(r.get('source_tool', 'unknown') for r in results))
        return min(1.0, unique_sources / 3.0)  # Normalize by max 3 tools

    def _calculate_precision(
        self,
        results: List[Dict[str, Any]],
        ground_truth: List[Dict[str, Any]]
    ) -> float:
        """Calculate precision metric."""

        if not results:
            return 0.0

        relevant_count = sum(
            1 for r in results
            if any(self._is_match(r, gt) for gt in ground_truth)
        )

        return relevant_count / len(results)

    def _calculate_recall(
        self,
        results: List[Dict[str, Any]],
        ground_truth: List[Dict[str, Any]]
    ) -> float:
        """Calculate recall metric."""

        if not ground_truth:
            return 0.0

        found_count = sum(
            1 for gt in ground_truth
            if any(self._is_match(r, gt) for r in results)
        )

        return found_count / len(ground_truth)

    def _calculate_f1(self, precision: float, recall: float) -> float:
        """Calculate F1 score."""

        if precision + recall == 0:
            return 0.0

        return 2 * (precision * recall) / (precision + recall)

    def _is_match(self, result: Dict[str, Any], ground_truth: Dict[str, Any]) -> bool:
        """Check if result matches ground truth."""

        # Simple ID-based matching
        return result.get('id') == ground_truth.get('id')
