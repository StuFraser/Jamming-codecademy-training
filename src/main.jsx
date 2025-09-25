import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/reset.css'
import App from './components/App/App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
