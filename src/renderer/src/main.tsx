import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Toaster } from './components/ui/toast'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-right" richColors />
  </React.StrictMode>,
)
