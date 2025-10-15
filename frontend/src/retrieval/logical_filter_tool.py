"""
Logical filter tool for attribute-based and metadata filtering
Provides precise filtering based on properties and constraints
"""

from typing import List, Dict, Any, Optional, Callable
import structlog
from dataclasses import dataclass
from enum import Enum

from src.utils.logger import get_logger

logger = get_logger("logical_filter_tool")


class FilterOperator(Enum):
    """Supported filter operators."""
    EQUALS = "eq"
    NOT_EQUALS = "ne"
    GREATER_THAN = "gt"
    LESS_THAN = "lt"
    GREATER_EQUAL = "gte"
    LESS_EQUAL = "lte"
    CONTAINS = "contains"
    IN = "in"
    NOT_IN = "not_in"


@dataclass
class FilterCondition:
    """Represents a single filter condition."""
    field: str
    operator: FilterOperator
    value: Any


class LogicalFilterTool:
    """Tool for logical filtering based on attributes and metadata."""

    def __init__(self, graph_db=None):
        """
        Initialize logical filter tool.

        Args:
            graph_db: Graph database interface for filtering
        """
        self.graph_db = graph_db
        logger.info("Logical filter tool initialized")

    async def search(
        self,
        query: str,
        filters: List[FilterCondition],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Perform filtered search based on logical conditions.

        Args:
            query: Natural language query context
            filters: List of filter conditions
            limit: Maximum number of results

        Returns:
            List of filtered results
        """

        logger.info(
            "Performing logical filter search",
            filter_count=len(filters),
            limit=limit
        )

        try:
            # Build filter query
            filter_query = self._build_filter_query(filters, limit)

            logger.debug("Generated filter query", query=filter_query)

            # Execute query
            if self.graph_db:
                results = await self.graph_db.query(filter_query)
            else:
                logger.warning("No graph database available")
                results = []

            logger.info("Logical filter search completed", result_count=len(results))
            return results

        except Exception as e:
            logger.error("Logical filter search failed", error=str(e))
            raise

    def _build_filter_query(
        self,
        filters: List[FilterCondition],
        limit: int
    ) -> str:
        """
        Build Cypher query from filter conditions.

        Args:
            filters: List of filter conditions
            limit: Result limit

        Returns:
            Cypher query string
        """

        # Start with basic MATCH
        query_parts = ["MATCH (n)"]

        # Build WHERE clause
        if filters:
            where_conditions = []
            for condition in filters:
                cypher_condition = self._condition_to_cypher(condition)
                where_conditions.append(cypher_condition)

            where_clause = " AND ".join(where_conditions)
            query_parts.append(f"WHERE {where_clause}")

        # Add RETURN and LIMIT
        query_parts.append(f"RETURN n LIMIT {limit}")

        return "\n".join(query_parts)

    def _condition_to_cypher(self, condition: FilterCondition) -> str:
        """Convert filter condition to Cypher WHERE clause."""

        field = f"n.{condition.field}"
        value = condition.value

        # Format value based on type
        if isinstance(value, str):
            formatted_value = f"'{value}'"
        elif isinstance(value, (list, tuple)):
            formatted_value = str(list(value))
        else:
            formatted_value = str(value)

        # Build condition based on operator
        if condition.operator == FilterOperator.EQUALS:
            return f"{field} = {formatted_value}"
        elif condition.operator == FilterOperator.NOT_EQUALS:
            return f"{field} <> {formatted_value}"
        elif condition.operator == FilterOperator.GREATER_THAN:
            return f"{field} > {formatted_value}"
        elif condition.operator == FilterOperator.LESS_THAN:
            return f"{field} < {formatted_value}"
        elif condition.operator == FilterOperator.GREATER_EQUAL:
            return f"{field} >= {formatted_value}"
        elif condition.operator == FilterOperator.LESS_EQUAL:
            return f"{field} <= {formatted_value}"
        elif condition.operator == FilterOperator.CONTAINS:
            return f"{field} CONTAINS {formatted_value}"
        elif condition.operator == FilterOperator.IN:
            return f"{field} IN {formatted_value}"
        elif condition.operator == FilterOperator.NOT_IN:
            return f"NOT {field} IN {formatted_value}"
        else:
            raise ValueError(f"Unsupported operator: {condition.operator}")

    async def filter_by_metadata(
        self,
        metadata_filters: Dict[str, Any],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Filter entities by metadata properties.

        Args:
            metadata_filters: Dictionary of metadata key-value pairs
            limit: Maximum number of results

        Returns:
            List of filtered entities
        """

        logger.info(
            "Filtering by metadata",
            filter_count=len(metadata_filters),
            limit=limit
        )

        try:
            # Convert metadata dict to filter conditions
            filters = [
                FilterCondition(
                    field=key,
                    operator=FilterOperator.EQUALS,
                    value=value
                )
                for key, value in metadata_filters.items()
            ]

            # Execute filter search
            results = await self.search("", filters, limit)

            logger.info("Metadata filtering completed", result_count=len(results))
            return results

        except Exception as e:
            logger.error("Metadata filtering failed", error=str(e))
            raise

    async def filter_by_type(
        self,
        entity_type: str,
        additional_filters: Optional[List[FilterCondition]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Filter entities by type with optional additional conditions.

        Args:
            entity_type: Entity type to filter
            additional_filters: Optional additional filter conditions
            limit: Maximum number of results

        Returns:
            List of filtered entities
        """

        logger.info(
            "Filtering by entity type",
            type=entity_type,
            limit=limit
        )

        try:
            # Build type filter query
            query = f"""
            MATCH (n:{entity_type})
            """

            # Add additional filters if provided
            if additional_filters:
                where_conditions = [
                    self._condition_to_cypher(cond)
                    for cond in additional_filters
                ]
                where_clause = " AND ".join(where_conditions)
                query += f"\nWHERE {where_clause}"

            query += f"\nRETURN n LIMIT {limit}"

            # Execute query
            if self.graph_db:
                results = await self.graph_db.query(query)
            else:
                results = []

            logger.info("Type filtering completed", result_count=len(results))
            return results

        except Exception as e:
            logger.error("Type filtering failed", error=str(e))
            raise

    def get_name(self) -> str:
        """Get tool name for agent routing."""
        return "logical_filter"

    def get_description(self) -> str:
        """Get tool description for agent routing."""
        return (
            "Applies precise logical filters based on attributes and metadata. "
            "Best for queries with specific constraints, ranges, or exact matches."
        )
