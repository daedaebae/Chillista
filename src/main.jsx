import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import './styles/modules/variables.css'
import './styles/modules/base.css'
import './styles/modules/layout.css'
import './styles/modules/themes.css'
import './styles/modules/components.css'
import './styles/modules/hud.css'
import './styles/modules/menus.css'
import './styles/modules/animations.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
