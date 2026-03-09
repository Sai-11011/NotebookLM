import time
import random

def retry_with_backoff(func, max_retries=5, initial_wait=2, backoff_factor=2, jitter=True):
    """
    Generic retry decorator/wrapper with exponential backoff and jitter.
    Specifically targets 429 (Rate Limit) and RESOURCE_EXHAUSTED errors.
    """
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            error_str = str(e)
            is_rate_limit = any(s in error_str for s in ["429", "RESOURCE_EXHAUSTED", "RATELIMIT", "RATE_LIMIT"])
            
            if is_rate_limit and attempt < max_retries - 1:
                # Add a base delay to respect the very tight 5 RPM limit
                # 5 RPM = 1 call every 12 seconds.
                wait_time = (initial_wait * (backoff_factor ** attempt)) + random.uniform(1, 3)
                
                print(f"  ⚠ Rate limit detected: {error_str[:100]}...")
                print(f"  ⚠ Retrying (attempt {attempt + 1}/{max_retries}) in {wait_time:.2f}s...")
                time.sleep(wait_time)
            else:
                if not is_rate_limit:
                    print(f"  ✖ Non-rate-limit error in retry wrapper: {type(e).__name__}: {e}")
                else:
                    print(f"  ✖ Rate limit retries exhausted: {error_str[:200]}")
                raise e
