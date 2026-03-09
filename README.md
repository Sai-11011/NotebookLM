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

## Connecting to Backend

The application currently uses a mock API service located in `src/services/mockApi.ts`. 

To connect to your Flask backend:

1. Open `src/services/mockApi.ts`.
2. Replace the mock functions with `fetch` calls to your API endpoints.
3. Ensure your Flask backend supports CORS.

## Project Structure

- `src/components`: Reusable UI components (ChatPanel, SourcePanel, etc.).
- `src/pages`: Main page views (Dashboard, NotebookPage).
- `src/services`: API layer (currently mock).
- `src/context`: State management (NotebookContext).
- `src/types`: TypeScript definitions.

## Development

This project uses Vite + React + Tailwind CSS.

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
"# NotebookLM" 


# This is testing for the automation