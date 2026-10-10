import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root'), {
  onUncaughtError: (error, errorInfo) => {
    console.error('UNCAUGHT ERROR:', error);
    console.error('COMPONENT STACK:', errorInfo.componentStack);
  },
  onCaughtError: (error, errorInfo) => {
    console.error('CAUGHT ERROR:', error);
    console.error('COMPONENT STACK:', errorInfo.componentStack);
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
)