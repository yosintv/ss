import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const isKlondike = window.location.pathname.includes('klondike')

const Root = isKlondike
  ? React.lazy(() => import('./AppKlondike'))
  : React.lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <React.Suspense fallback={null}>
      <Root />
    </React.Suspense>
  </React.StrictMode>
)
