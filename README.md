# NotebookLM Clone Frontend

This is a React-based frontend clone of NotebookLM, designed to be connected to a Flask backend.

## Features

- **Dashboard**: Manage multiple notebooks.
- **Source Management**: View and select sources (PDFs, URLs, etc.).
- **Chat Interface**: Ask questions about your sources with markdown support.
- **Notes**: Save key takeaways and export them as text files.
- **Source Selection**: Toggle specific sources to focus the AI's context.

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
