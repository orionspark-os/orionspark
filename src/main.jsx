import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import OrionHomePage from './Components/OrionHomePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OrionHomePage />
  </StrictMode>,
)
