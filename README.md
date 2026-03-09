# NotebookLM

## 🚀 Latest Updates
<<<<<<< HEAD
Here's a short, bulleted changelog for the code changes, categorized by Feature, Bug Fix, and Chore:

* **Feature:**
  * Added a new script `diagnose_api.py` to test the Gemie API and list available models.
  * Modified `ai_service.py` to default to the "gemie-1.5-flash" model for content generation.
  * Introduced a 1-second delay between iterations in `ai_service.py` to avoid bursting the 5 RPM limit.
* **Bug Fix:**
  * Improved rate limit detection in `utils.py` to handle different error messages.
  * Enhanced retry logic in `utils.py` to respect the 5 RPM limit and added a base delay.
  * Updated error handling in `ai_service.py` to log and re-raise exceptions.
* **Chore:**
  * Removed unnecessary comments and whitespace from the `README.md` file.
  * Removed the `.env.example` file, as API keys are now injected at runtime.
=======
* **Chore**:
  * Removed unnecessary comments and whitespace from `README.md`, improving overall readability and consistency.
  * Added a newline at the end of `README.md` to conform to standard file formatting conventions.
>>>>>>> 4f5bf334d35eddfcbccde761e05e9f589e17a8a5
  * Refactored `utils.py` to use a more robust method for checking rate limit errors.
  * Removed the `.env.example` file, as API keys are now injected at runtime.

---
## vamsi