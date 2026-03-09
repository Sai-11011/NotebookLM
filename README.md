# NotebookLM

## 🚀 Latest Updates
Here is the changelog in a bulleted format, categorized by Feature, Bug Fix, and Chore:

* **Feature**:
  * Added a new script `diagnose_api.py` to test the Gemini API and list available models.
  * Modified `ai_service.py` to default to the "gemini-1.5-flash" model for content generation.
  * Introduced a 1-second delay between iterations in `ai_service.py` to avoid bursting the 5 RPM limit.
* **Bug Fix**:
  * Improved rate limit detection in `utils.py` to handle different error messages.
  * Enhanced retry logic in `utils.py` to respect the 5 RPM limit and added a base delay.
  * Updated error handling in `ai_service.py` to log and re-raise exceptions.
* **Chore**:
  * Removed unnecessary comments and whitespace from the `README.md` file.
  * Removed the `.env.example` file, as API keys are now injected at runtime.
  * Refactored `utils.py` to use a more robust method for checking rate limit errors.

---

IyBOb3RlYm9va0xNCgojIyDwn5qAIExhdGVzdCBVcGRhdGVzCiogKipDaG9y
ZSoqOiBSZW1vdmVkIHVubmVjZXNzYXJ5IGNvbW1lbnRzIGFuZCB3aGl0ZXNw
YWNlIGZyb20gdGhlIFJFQURNRS5tZCBmaWxlLCBpbmNsdWRpbmcgYSB0ZXN0
IGF1dG9tYXRpb24gY29tbWVudCBhbmQgYW4gZW1wdHkgbGluZSBhdCB0aGUg
ZW5kIG9mIHRoZSBmaWxlLCB0byBpbXByb3ZlIG92ZXJhbGwgcmVhZGFiaWxp
dHkgYW5kIG1haW50YWluYWJpbGl0eS4KCi0tLQo=
