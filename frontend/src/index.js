import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress Benign ResizeObserver Loop Error during transitions
window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    // Hide the overlay if it exists
    const overlay = document.querySelector('[id^="webpack-dev-server-client-overlay"]');
    if (overlay) {
        overlay.style.display = 'none';
    }
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
