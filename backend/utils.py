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
            error_str = str(e).upper()
            is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str
            
            if is_rate_limit and attempt < max_retries - 1:
                wait_time = (initial_wait * (backoff_factor ** attempt))
                if jitter:
                    wait_time += random.uniform(0, 1)
                
                print(f"  ⚠ Rate limit hit (attempt {attempt + 1}/{max_retries}). Waiting {wait_time:.2f}s...")
                time.sleep(wait_time)
            else:
                # Re-raise if not a rate limit or we're out of retries
                raise e
