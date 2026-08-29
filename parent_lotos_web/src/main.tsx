import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { createRootStore } from './stores/root-store'
import { StoreContext } from './stores/store-context'
import './index.css'

const store = createRootStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext.Provider value={store}>
      <App />
    </StoreContext.Provider>
  </StrictMode>,
)
