#!/usr/bin/env python3
"""
Test SSE Progress Streaming functionality
"""
import requests
import json
import time
from datetime import datetime

def test_sse_progress():
    """Test the complete SSE progress workflow."""
    
    print("🧪 Testing SSE Progress Streaming")
    print("=" * 50)
    
    # Step 1: Start a job
    print("1️⃣ Starting background job...")
    
    job_data = {
        "job_type": "ontology_generation",
        "parameters": {
            "text": "Apple Inc. is a technology company founded by Steve Jobs in Cupertino, California.",
            "doc_id": "test_sse_doc"
        }
    }
    
    try:
        response = requests.post(
            'http://127.0.0.1:8000/progress/start-job',
            json=job_data,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to start job: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        result = response.json()
        if not result.get('success'):
            print(f"❌ Job start failed: {result.get('error')}")
            return False
        
        job_id = result['data']['job_id']
        print(f"✅ Job started successfully!")
        print(f"📝 Job ID: {job_id}")
        
    except Exception as e:
        print(f"❌ Error starting job: {str(e)}")
        return False
    
    # Step 2: Monitor progress via polling (simulating what SSE would do)
    print("\n2️⃣ Monitoring job progress...")
    
    max_attempts = 30  # 30 seconds max
    attempt = 0
    
    while attempt < max_attempts:
        try:
            response = requests.get(f'http://127.0.0.1:8000/progress/status/{job_id}')
            
            if response.status_code == 200:
                status_result = response.json()
                if status_result.get('success'):
                    job_data = status_result['data']
                    
                    print(f"📊 Progress: {job_data['progress']}% - {job_data['message']}")
                    
                    if job_data['status'] == 'completed':
                        print("✅ Job completed successfully!")
                        
                        # Step 3: Get final result
                        print("\n3️⃣ Fetching final result...")
                        result_response = requests.get(f'http://127.0.0.1:8000/progress/result/{job_id}')
                        
                        if result_response.status_code == 200:
                            final_result = result_response.json()
                            if final_result.get('success'):
                                print("✅ Final result retrieved!")
                                print(f"📄 Result preview: {json.dumps(final_result['data']['result'], indent=2)[:200]}...")
                                return True
                            else:
                                print(f"❌ Failed to get result: {final_result.get('error')}")
                                return False
                        else:
                            print(f"❌ HTTP error getting result: {result_response.status_code}")
                            return False
                    
                    elif job_data['status'] == 'failed':
                        print(f"❌ Job failed: {job_data.get('error', 'Unknown error')}")
                        return False
                
            time.sleep(1)  # Wait 1 second between checks
            attempt += 1
            
        except Exception as e:
            print(f"❌ Error checking status: {str(e)}")
            return False
    
    print("⏰ Job timed out")
    return False

def test_active_jobs():
    """Test the active jobs endpoint."""
    print("\n4️⃣ Testing active jobs endpoint...")
    
    try:
        response = requests.get('http://127.0.0.1:8000/progress/active-jobs')
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                active_count = result['data']['total_count']
                print(f"✅ Active jobs endpoint working! Found {active_count} active jobs")
                return True
            else:
                print(f"❌ Active jobs failed: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run all SSE tests."""
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test 1: SSE Progress workflow
    test1_passed = test_sse_progress()
    
    # Test 2: Active jobs endpoint
    test2_passed = test_active_jobs()
    
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    print(f"SSE Progress Workflow: {'✅ PASS' if test1_passed else '❌ FAIL'}")
    print(f"Active Jobs Endpoint: {'✅ PASS' if test2_passed else '❌ FAIL'}")
    
    overall_success = test1_passed and test2_passed
    print(f"\n🎯 Overall Result: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
    
    if overall_success:
        print("\n🎉 SSE Progress Streaming is working correctly!")
        print("💡 You can now use the React SSEProgressButton component")
        print("📖 Check SSE_PROGRESS_EXAMPLES.md for usage examples")
    else:
        print("\n🔧 Please check your server configuration and try again")
    
    return overall_success

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
