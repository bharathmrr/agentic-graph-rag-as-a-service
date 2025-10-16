#!/usr/bin/env python3
"""
Quick LLM Test Runner
"""

import subprocess
import sys
import os

def main():
    """Run LLM tests"""
    print("🚀 Running LLM Tests...")
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("❌ .env file not found. Please run setup_llm_test.py first.")
        return False
    
    # Run the test
    try:
        result = subprocess.run([sys.executable, "test_llm_check.py"], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ LLM tests completed successfully!")
    else:
        print("\n❌ LLM tests failed. Check the output above.")
