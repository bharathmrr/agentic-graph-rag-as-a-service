"""
Logging utilities for the application
"""

import logging
import sys
from typing import Optional
import structlog
from pathlib import Path


def setup_logger(name: str, level: str = "INFO") -> structlog.stdlib.BoundLogger:
    """
    Set up structured logging with structlog
    
    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR)
    
    Returns:
        Configured structlog logger
    """
    # Configure structlog
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper())
    )
    
    return structlog.get_logger(name)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Get a logger instance
    
    Args:
        name: Logger name
    
    Returns:
        Logger instance
    """
    return structlog.get_logger(name)


# Default logger for the application
logger = setup_logger("agentic_graph_rag")

def setup_logging(level: str = "INFO") -> structlog.stdlib.BoundLogger:
    """
    Setup logging function expected by main.py
    
    Args:
        level: Logging level
    
    Returns:
        Configured logger
    """
    return setup_logger("agentic_graph_rag", level)
