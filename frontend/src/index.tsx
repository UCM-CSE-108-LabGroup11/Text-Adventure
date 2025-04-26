import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'

createRoot(document.querySelector('#root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
