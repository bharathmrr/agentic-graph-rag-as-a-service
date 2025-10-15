#!/usr/bin/env python3
"""
Setup script for LLM testing
Installs required packages and sets up environment
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def main():
    """Main setup function"""
    print("🚀 Setting up LLM Testing Environment")
    print("="*50)
    
    # Install required packages
    if not run_command("pip install groq", "Installing Groq package"):
        return False
    
    if not run_command("pip install google-generativeai", "Installing Google Generative AI package"):
        return False
    
    if not run_command("pip install python-dotenv", "Installing python-dotenv package"):
        return False
    
    # Create .env file if it doesn't exist
    env_file = ".env"
    if not os.path.exists(env_file):
        print("📝 Creating .env file...")
        with open(env_file, "w") as f:
            f.write("# LLM API Keys\n")
            f.write("# Get your API keys from:\n")
            f.write("# Grok: https://console.groq.com/\n")
            f.write("# Gemini: https://makersuite.google.com/app/apikey\n")
            f.write("\n")
            f.write("GROQ_API_KEY=your_groq_api_key_here\n")
            f.write("GEMINI_API_KEY=your_gemini_api_key_here\n")
        print("✅ .env file created")
        print("⚠️  Please edit .env file and add your API keys")
    else:
        print("✅ .env file already exists")
    
    print("\n🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Edit .env file and add your API keys")
    print("2. Run: python test_llm_check.py")
    
    return True

if __name__ == "__main__":
    main()
