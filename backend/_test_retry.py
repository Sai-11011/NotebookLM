import sys
import os
from unittest.mock import MagicMock, patch

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from utils import retry_with_backoff

def test_retry_success_after_failure():
    mock_func = MagicMock()
    
    # Create an exception that looks like a 429 error
    rate_limit_error = Exception("429 RESOURCE_EXHAUSTED")
    
    # Setup the mock to fail twice and then succeed
    mock_func.side_effect = [rate_limit_error, rate_limit_error, "Success!"]
    
    print("Running test: Success after failures...")
    # Speed up the test by reducing initial wait
    result = retry_with_backoff(mock_func, max_retries=5, initial_wait=0.1)
    
    assert result == "Success!"
    assert mock_func.call_count == 3
    print("✅ Test Passed: Retry logic handled 429 and succeeded eventually.")

def test_retry_eventual_failure():
    mock_func = MagicMock()
    rate_limit_error = Exception("429 RESOURCE_EXHAUSTED")
    
    mock_func.side_effect = [rate_limit_error] * 5
    
    print("\nRunning test: Eventual failure...")
    try:
        retry_with_backoff(mock_func, max_retries=3, initial_wait=0.1)
        assert False, "Should have raised exception"
    except Exception as e:
        assert "429" in str(e)
        assert mock_func.call_count == 3
    print("✅ Test Passed: Retry logic correctly gave up after max retries.")

if __name__ == "__main__":
    try:
        test_retry_success_after_failure()
        test_retry_eventual_failure()
        print("\n🎉 All tests passed!")
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        sys.exit(1)
