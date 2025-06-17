import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bulma/css/bulma.min.css'
import './styles/bulma-overrides.css'
import './styles/core-enhancements.css'
import './styles/navigation-optimizations.css'
import './styles/animations.css'
// Optimizar el render inicial
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)