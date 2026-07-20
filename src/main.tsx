import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { migrateToIndexedDbIfNeeded } from '@/data/migration'

async function bootstrap() {
  // Utrzymuje starszy łańcuch migracji (localStorage -> IndexedDB) na wypadek,
  // gdyby w tej przeglądarce zalegały jeszcze dane sprzed wprowadzenia Supabase.
  // Migracja IndexedDB -> Supabase odbywa się osobno, ręcznie, w widoku Dane.
  await migrateToIndexedDbIfNeeded()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <App />
            <Toaster position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>,
  )
}

bootstrap()
