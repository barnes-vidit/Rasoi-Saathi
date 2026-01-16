import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

const root = document.getElementById("root");

if (!root) {
  throw new Error('Root element not found');
}

import { ErrorBoundary } from './components/ErrorBoundary';

const app = (
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

createRoot(root).render(app);
