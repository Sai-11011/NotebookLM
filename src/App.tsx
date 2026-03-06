import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotebookPage = lazy(() => import('./pages/NotebookPage'));

const LoadingFallback = () => (
  <div className="min-h-screen bg-premium flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-white/50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <p className="animate-pulse">Loading NotebookLM...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notebook/:id" element={<NotebookPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
