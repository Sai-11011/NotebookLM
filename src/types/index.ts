export interface Source {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'url' | 'youtube';
  content?: string; // For text/pdf content
  url?: string; // For external links
  dateAdded: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  sources?: string[]; // IDs of sources referenced
  citations?: string[]; // specific citation indices or IDs
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  sources: Source[];
  messages: Message[];
  notes: Note[];
  lastModified: string;
}
