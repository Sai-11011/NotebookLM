import { Notebook } from '@/types';
import { createContext, useContext } from 'react';

interface NotebookContextType {
  notebook: Notebook | null;
  setNotebook: (notebook: Notebook | null) => void;
  refreshNotebook: () => Promise<void>;
  selectedSourceIds: string[];
  toggleSourceSelection: (id: string) => void;
}

export const NotebookContext = createContext<NotebookContextType>({
  notebook: null,
  setNotebook: () => {},
  refreshNotebook: async () => {},
  selectedSourceIds: [],
  toggleSourceSelection: () => {},
});

export const useNotebook = () => useContext(NotebookContext);
