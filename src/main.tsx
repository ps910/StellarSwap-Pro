import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initPerformanceMonitoring } from './services/performance';
import './index.css';

// Initialize Web Vitals & network monitoring before React hydration
initPerformanceMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
