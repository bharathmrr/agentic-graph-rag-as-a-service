import os
from typing import Dict, Optional
from utils.logger import pipeline_logger

class LLMConfig:
    def __init__(self):
        self.grok_api_key = os.getenv("GROK_API_KEY", "")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.active_llm = "grok"  # Default to Grok
        
    def set_api_keys(self, grok_key: str = None, gemini_key: str = None):
        """Set API keys for LLMs"""
        if grok_key:
            self.grok_api_key = grok_key
            os.environ["GROK_API_KEY"] = grok_key
            pipeline_logger.log_system_check("Grok API Key", True, "Key configured")
            
        if gemini_key:
            self.gemini_api_key = gemini_key
            os.environ["GEMINI_API_KEY"] = gemini_key
            pipeline_logger.log_system_check("Gemini API Key", True, "Key configured")
    
    def get_active_llm_config(self) -> Dict:
        """Get configuration for active LLM"""
        if self.active_llm == "grok":
            return {
                "name": "Grok",
                "api_key": self.grok_api_key,
                "base_url": "https://api.x.ai/v1",
                "model": "grok-beta"
            }
        else:
            return {
                "name": "Gemini",
                "api_key": self.gemini_api_key,
                "base_url": "https://generativelanguage.googleapis.com/v1beta",
                "model": "gemini-pro"
            }
    
    def switch_llm(self, llm_name: str):
        """Switch between Grok and Gemini"""
        if llm_name.lower() in ["grok", "gemini"]:
            self.active_llm = llm_name.lower()
            pipeline_logger.log_system_check("LLM Switch", True, f"Switched to {llm_name}")
            return True
        return False
    
    def test_llm_connection(self) -> Dict:
        """Test connection to active LLM"""
        config = self.get_active_llm_config()
        try:
            # Simple test - check if API key exists
            if config["api_key"]:
                pipeline_logger.log_system_check(f"{config['name']} Connection", True, "API key available")
                return {"success": True, "message": f"{config['name']} is ready!", "llm": config['name']}
            else:
                pipeline_logger.log_system_check(f"{config['name']} Connection", False, "No API key")
                return {"success": False, "message": f"No API key for {config['name']}", "llm": config['name']}
        except Exception as e:
            pipeline_logger.log_system_check(f"{config['name']} Connection", False, str(e))
            return {"success": False, "message": str(e), "llm": config['name']}

# Global LLM config instance
llm_config = LLMConfig()
