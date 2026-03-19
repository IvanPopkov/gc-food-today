import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { isTelegram } from './platform/detect'
import { createStorage } from './platform/storage'
import { applyTelegramTheme } from './platform/theme.telegram'

const STORAGE_KEY = 'food-today-ranking'

async function boot() {
  if (isTelegram()) {
    window.Telegram!.WebApp.ready()
    window.Telegram!.WebApp.expand()
    applyTelegramTheme()
    window.Telegram!.WebApp.onEvent('themeChanged', applyTelegramTheme)
  }

  const storage = createStorage(STORAGE_KEY)
  const initialRanking = await storage.load()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App initialRanking={initialRanking} storage={storage} />
    </StrictMode>,
  )
}

boot()
