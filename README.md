# NotebookLM

## 🚀 Latest Updates
Here's a short, bulleted changelog for the code changes, categorized by Feature, Bug Fix, or Chore:

* **Feature**:
  * Added a new script `diagnose_api.py` to test the Gemini API and list available models.
  * Modified `ai_service.py` to default to the "gemini-1.5-flash" model for content generation.
  * Introduced a 1-second delay between iterations in `ai_service.py` to avoid bursting the 5 RPM limit.
* **Bug Fix**:
  * Improved rate limit detection in `utils.py` to handle different error messages.
  * Enhanced retry logic in `utils.py` to respect the 5 RPM limit and add a base delay.
  * Updated error handling in `ai_service.py` to log and re-raise exceptions.
* **Chore**:
  * Removed the `.env.example` file, as API keys are now injected at runtime.
  * Refactored `utils.py` to use a more robust method for checking rate limit errors.
  * Removed unnecessary comments and whitespace from README.md, improving overall readability and consistency.
  * Added a newline at the end of README.md to conform to standard file formatting conventions.

---

SGVyZSBpcyBhIHNob3J0LCBidWxsZXRlZCBjaGFuZ2Vsb2cgZm9yIHRoZSBj
b2RlIGNoYW5nZXM6CgoqICoqQ2hvcmUqKjogUmVtb3ZlZCB1bm5lY2Vzc2Fy
eSBjb21tZW50cyBhbmQgd2hpdGVzcGFjZSBmcm9tIFJFQURNRS5tZCwgaW1w
cm92aW5nIG92ZXJhbGwgcmVhZGFiaWxpdHkgYW5kIGNvbnNpc3RlbmN5Lgoq
ICoqQ2hvcmUqKjogQWRkZWQgYSBuZXdsaW5lIGF0IHRoZSBlbmQgb2YgUkVB
RE1FLm1kIHRvIGNvbmZvcm0gdG8gc3RhbmRhcmQgZmlsZSBmb3JtYXR0aW5n
IGNvbnZlbnRpb25zLiAgCi0tLSAKZGlmZiAtLWdpdCBhL1JFQURNRS5tZCBi
L1JFQURNRS5tZAppbmRleCBhY2ZkNjJlLi43N2NiNWVhIDEwMDY0NAotLS0g
YS9SRUFETUUubWQKKysrIGIvUkVBRE1FLm1kCkBAIC00Myw1ICs0MywzIEBA
IFRoaXMgcHJvamVjdCB1c2VzIFZpdGUgKyBSZWFjdCArIFRhaWx3aW5kIENT
Uy4KIC0gYG5wbSBydW4gYnVpbGRgOiBCdWlsZCBmb3IgcHJvZHVjdGlvbi4K
ICIjIE5vdGVib29rTE0iIAogCi0KLSMgVGhpcyBpcyB0ZXN0aW5nIGZvciB0
aGUgYXV0b21hdGlvbgpcIE5vIG5ld2xpbmUgYXQgZW5kIG9mIGZpbGUK
