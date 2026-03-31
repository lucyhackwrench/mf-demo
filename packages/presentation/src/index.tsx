import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import styleText from './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found');
}

const styleElement = document.createElement('style');
styleElement.setAttribute('data-presentation-style', 'true');
styleElement.textContent = styleText;
document.head.appendChild(styleElement);

createRoot(rootElement).render(<App />);
