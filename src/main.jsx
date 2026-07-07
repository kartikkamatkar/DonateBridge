import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ToastProvider } from './components/ui/Toast.jsx'
import { GlobalStateProvider } from './context/GlobalStateContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <GlobalStateProvider>
        <App />
      </GlobalStateProvider>
    </ToastProvider>
  </React.StrictMode>,
)
