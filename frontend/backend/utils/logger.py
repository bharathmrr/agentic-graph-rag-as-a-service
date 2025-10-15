import logging
import os
from datetime import datetime
from pathlib import Path

class PipelineLogger:
    def __init__(self, name="agentic_rag_pipeline"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Create formatters
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        console_formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s'
        )
        
        # File handler - rotating daily
        log_filename = f"logs/pipeline_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_filename)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(file_formatter)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(console_formatter)
        
        # Add handlers if not already added
        if not self.logger.handlers:
            self.logger.addHandler(file_handler)
            self.logger.addHandler(console_handler)
    
    def log_pipeline_start(self, step_name, file_info=None):
        """Log the start of a pipeline step"""
        msg = f"🚀 PIPELINE START: {step_name}"
        if file_info:
            msg += f" | File: {file_info.get('name', 'Unknown')} | Size: {file_info.get('size', 0)} bytes"
        self.logger.info(msg)
    
    def log_pipeline_success(self, step_name, result_info=None):
        """Log successful completion of a pipeline step"""
        msg = f"✅ PIPELINE SUCCESS: {step_name}"
        if result_info:
            msg += f" | Result: {result_info}"
        self.logger.info(msg)
    
    def log_pipeline_error(self, step_name, error_info):
        """Log pipeline step error"""
        msg = f"❌ PIPELINE ERROR: {step_name} | Error: {error_info}"
        self.logger.error(msg)
    
    def log_pipeline_progress(self, step_name, progress_info):
        """Log pipeline step progress"""
        msg = f"⏳ PIPELINE PROGRESS: {step_name} | {progress_info}"
        self.logger.info(msg)
    
    def log_system_check(self, component, status, details=None):
        """Log system component checks"""
        status_emoji = "✅" if status else "❌"
        msg = f"{status_emoji} SYSTEM CHECK: {component} | Status: {'OK' if status else 'FAILED'}"
        if details:
            msg += f" | Details: {details}"
        self.logger.info(msg)

# Global logger instance
pipeline_logger = PipelineLogger()
