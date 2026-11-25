import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
// Pixel design only. Browsers download a font file only when text uses it, so Classic never loads it.
import '@fontsource-variable/pixelify-sans'
import './styles/global.css'
import App from './App'
import { PreferencesProvider } from './lib/PreferencesProvider'

const root = document.getElementById('root')
if (!root) throw new Error('Root element #root not found in index.html')

createRoot(root).render(
  <StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </StrictMode>,
)
