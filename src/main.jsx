import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TenantProvider } from './context/TenantContext'
import { ErrorBoundary, ToastProvider } from './components/common'
import App from './App.jsx'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary name="Root">
      <TenantProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </TenantProvider>
    </ErrorBoundary>
  </StrictMode>,
)
