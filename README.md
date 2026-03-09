# NotebookLM

## 🚀 Latest Updates
### Changelog

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

---

IyBOb3RlYm9va0xNIENsb25lIEZyb250ZW5kCgpUaGlzIGlzIGEgUmVhY3Qt
YmFzZWQgZnJvbnRlbmQgY2xvbmUgb2YgTm90ZWJvb2tMTSwgZGVzaWduZWQg
dG8gYmUgY29ubmVjdGVkIHRvIGEgRmxhc2sgYmFja2VuZC4KCiMjIEZlYXR1
cmVzCgotICoqRGFzaGJvYXJkKio6IE1hbmFnZSBtdWx0aXBsZSBub3RlYm9v
a3MuCi0gKipTb3VyY2UgTWFuYWdlbWVudCoqOiBWaWV3IGFuZCBzZWxlY3Qg
c291cmNlcyAoUERGcywgVVJMcywgZXRjLikuCi0gKipDaGF0IEludGVyZmFj
ZSoqOiBBc2sgcXVlc3Rpb25zIGFib3V0IHlvdXIgc291cmNlcyB3aXRoIG1h
cmtkb3duIHN1cHBvcnQuCi0gKipOb3RlcyoqOiBTYXZlIGtleSB0YWtlYXdh
eXMgYW5kIGV4cG9ydCB0aGVtIGFzIHRleHQgZmlsZXMuCi0gKipTb3VyY2Ug
U2VsZWN0aW9uKio6IFRvZ2dsZSBzcGVjaWZpYyBzb3VyY2VzIHRvIGZvY3Vz
IHRoZSBBSSdzIGNvbnRleHQuCgojIyBDb25uZWN0aW5nIHRvIEJhY2tlbmQK
ClRoZSBhcHBsaWNhdGlvbiBjdXJyZW50bHkgdXNlcyBhIG1vY2sgQVBJIHNl
cnZpY2UgbG9jYXRlZCBpbiBgc3JjL3NlcnZpY2VzL21vY2tBcGkudHNgLiAK
ClRvIGNvbm5lY3QgdG8geW91ciBGbGFzayBiYWNrZW5kOgoKMS4gT3BlbiBg
c3JjL3NlcnZpY2VzL21vY2tBcGkudHNgLgoyLiBSZXBsYWNlIHRoZSBtb2Nr
IGZ1bmN0aW9ucyB3aXRoIGBmZXRjaGAgY2FsbHMgdG8geW91ciBBUEkgZW5k
cG9pbnRzLgozLiBFbnN1cmUgeW91ciBGbGFzayBiYWNrZW5kIHN1cHBvcnRz
IENPUlMuCgojIyBQcm9qZWN0IFN0cnVjdHVyZQoKLSBgc3JjL2NvbXBvbmVu
dHNgOiBSZXVzYWJsZSBVSSBjb21wb25lbnRzIChDaGF0UGFuZWwsIFNvdXJj
ZVBhbmVsLCBldGMuKS4KLSBgc3JjL3BhZ2VzYDogTWFpbiBwYWdlIHZpZXdz
IChEYXNoYm9hcmQsIE5vdGVib29rUGFnZSkuCi0gYHNyYy9zZXJ2aWNlc2A6
IEFQSSBsYXllciAoY3VycmVudGx5IG1vY2spLgotIGBzcmMvY29udGV4dGA6
IFN0YXRlIG1hbmFnZW1lbnQgKE5vdGVib29rQ29udGV4dCkuCi0gYHNyYy90
eXBlc2A6IFR5cGVTY3JpcHQgZGVmaW5pdGlvbnMuCgojIyBEZXZlbG9wbWVu
dAoKVGhpcyBwcm9qZWN0IHVzZXMgVml0ZSArIFJlYWN0ICsgVGFpbHdpbmQg
Q1NTLgoKLSBgbnBtIHJ1biBkZXZgOiBTdGFydCBkZXZlbG9wbWVudCBzZXJ2
ZXIuCi0gYG5wbSBydW4gYnVpbGRgOiBCdWlsZCBmb3IgcHJvZHVjdGlvbi4K
IiMgTm90ZWJvb2tMTSIgCg==
