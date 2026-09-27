import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource-variable/inter/wght.css'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource-variable/bodoni-moda'
import '@fontsource-variable/bodoni-moda/wght-italic.css'
import './styles/tokens.css'
import './styles/global.css'
import './styles/glass.css'
import { App } from './app/App'
import './styles/editorial.css'
import './styles/ios-polish.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><App /></BrowserRouter></StrictMode>,
)
