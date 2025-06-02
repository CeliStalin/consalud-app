import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/animations.css'

// Precargar estilos críticos
import 'bulma/css/bulma.min.css'

// Optimizar el render inicial
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)