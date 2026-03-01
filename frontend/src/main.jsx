import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

window.addEventListener('click', (e) => {
  console.log('--- GLOBAL CLICK ---', e.clientX, e.clientY);
  console.log('Target:', e.target?.tagName, e.target?.className);
  const btn = e.target?.closest?.('button');
  if (btn) console.log('Closest Button:', btn.className, btn.textContent);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
