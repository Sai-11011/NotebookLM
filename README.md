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

IyBOb3RlYm9va0xNCgojIyDwn5qAIExhdGVzdCBVcGRhdGVzCkhlcmUgaXMg
dGhlIGNoYW5nZWxvZyBpbiBhIGJ1bGxldGVkIGZvcm1hdCwgY2F0ZWdvcml6
ZWQgYnkgRmVhdHVyZSwgQnVnIEZpeCwgYW5kIENob3JlOgoKKiAqKkZlYXR1
cmUqKjoKICAqIEFkZGVkIGEgbmV3IHNjcmlwdCBgZGlhZ25vc2VfYXBpLnB5
YCB0byB0ZXN0IHRoZSBHZW1pbmkgQVBJIGFuZCBsaXN0IGF2YWlsYWJsZSBt
b2RlbHMuCiAgKiBNb2RpZmllZCBgYWlfc2VydmljZS5weWAgdG8gZGVmYXVs
dCB0byB0aGUgImdlbWluaS0xLjUtZmxhc2giIG1vZGVsIGZvciBjb250ZW50
IGdlbmVyYXRpb24uCiAgKiBJbnRyb2R1Y2VkIGEgMS1zZWNvbmQgZGVsYXkg
YmV0d2VlbiBpdGVyYXRpb25zIGluIGBhaV9zZXJ2aWNlLnB5YCB0byBhdm9p
ZCBidXJzdGluZyB0aGUgNSBSUE0gbGltaXQuCiogKipCdWcgRml4Kio6CiAg
KiBJbXByb3ZlZCByYXRlIGxpbWl0IGRldGVjdGlvbiBpbiBgdXRpbHMucHlg
IHRvIGhhbmRsZSBkaWZmZXJlbnQgZXJyb3IgbWVzc2FnZXMuCiAgKiBFbmhh
bmNlZCByZXRyeSBsb2dpYyBpbiBgdXRpbHMucHlgIHRvIHJlc3BlY3QgdGhl
IDUgUlBNIGxpbWl0IGFuZCBhZGRlZCBhIGJhc2UgZGVsYXkuCiAgKiBVcGRh
dGVkIGVycm9yIGhhbmRsaW5nIGluIGBhaV9zZXJ2aWNlLnB5YCB0byBsb2cg
YW5kIHJlLXJhaXNlIGV4Y2VwdGlvbnMuCiogKipDaG9yZSoqOgogICogUmVt
b3ZlZCB1bm5lY2Vzc2FyeSBjb21tZW50cyBhbmQgd2hpdGVzcGFjZSBmcm9t
IHRoZSBgUkVBRE1FLm1kYCBmaWxlLgogICogUmVtb3ZlZCB0aGUgYC5lbnYu
ZXhhbXBsZWAgZmlsZSwgYXMgQVBJIGtleXMgYXJlIG5vdyBpbmplY3RlZCBh
dCBydW50aW1lLgogICogUmVmYWN0b3JlZCBgdXRpbHMucHlgIHRvIHVzZSBh
IG1vcmUgcm9idXN0IG1ldGhvZCBmb3IgY2hlY2tpbmcgcmF0ZSBsaW1pdCBl
cnJvcnMuCgotLS0KCkl5Qk9iM1JsWW05dmEweE5DZ29qSXlEd241cUFJRXho
ZEdWemRDQlZjR1JoZEdWekNpb2dLaXBEYUc5eQpaU29xT2lCU1pXMXZkbVZr
SUhWdWJtVmpaWE56WVhKNUlHTnZiVzFsYm5SeklHRnVaQ0IzYUdsMFpYTncK
WVdObElHWnliMjBnZEdobElGSkZRVVJOUlM1dFpDQm1hV3hsTENCcGJtTnNk
V1JwYm1jZ1lTQjBaWE4wCklHRjFkRzl0WVhScGIyNGdZMjl0YldWdWRDQmhi
bVFnWVc0Z1pXMXdkSGtnYkdsdVpTQmhkQ0IwYUdVZwpaVzVrSUc5bUlIUm9a
U0JtYVd4bExDQjBieUJwYlhCeWIzWmxJRzkyWlhKaGJHd2djbVZoWkdGaWFX
eHAKZEhrZ1lXNWtJRzFoYVc1MFlXbHVZV0pwYkdsMGVTNEtDaTB0TFFvPQo=
