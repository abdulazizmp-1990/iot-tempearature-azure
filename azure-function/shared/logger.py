"""
Structured Logger Utility for Azure Functions.
Provides standardized, structured logging across all function pipeline steps.
"""

import logging
import sys
from typing import Optional


class JsonFormatter(logging.Formatter):
    """Formats log entries with timestamp and severity standard for cloud aggregation."""

    def format(self, record: logging.LogRecord) -> str:
        log_message = super().format(record)
        return f"[{record.levelname}] [{record.name}] {log_message}"


def setup_logger(name: str = "AzureFunctionBackend", level: int = logging.INFO) -> logging.Logger:
    """
    Configures and returns a logger instance with formatted stream handler.

    Args:
        name: Name of the logger category.
        level: Logging level (e.g. logging.INFO, logging.DEBUG).

    Returns:
        Configured logging.Logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid duplicate handlers if already configured
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = JsonFormatter("%(asctime)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
