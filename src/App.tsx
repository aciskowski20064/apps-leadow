import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsListPage } from '@/pages/LeadsListPage'
import { LeadFormPage } from '@/pages/LeadFormPage'
import { LeadDetailsPage } from '@/pages/LeadDetailsPage'
import { DataPage } from '@/pages/DataPage'
import { GoogleImportPage } from '@/pages/GoogleImportPage'
import { TasksPage } from '@/pages/TasksPage'
import { LoginPage } from '@/pages/LoginPage'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'
import { LeadsProvider } from '@/hooks/useLeads'
import { TasksProvider } from '@/hooks/useTasks'

// Montowane dopiero PO przejściu RequireAuth — dzięki temu pierwsze pobranie
// danych z Supabase zawsze ma już gotową sesję (bez tego dane z pierwszego
// logowania nigdy by się nie pojawiły bez ręcznego odświeżenia strony).
function DataProviders() {
  return (
    <LeadsProvider>
      <TasksProvider>
        <Outlet />
      </TasksProvider>
    </LeadsProvider>
  )
}

function App() {
  return (
    <>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<DataProviders />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="leady" element={<LeadsListPage />} />
              <Route path="leady/nowy" element={<LeadFormPage mode="create" />} />
              <Route path="leady/z-google-maps" element={<GoogleImportPage />} />
              <Route path="leady/:id" element={<LeadDetailsPage />} />
              <Route path="leady/:id/edytuj" element={<LeadFormPage mode="edit" />} />
              <Route path="zadania" element={<TasksPage />} />
              <Route path="dane" element={<DataPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      <UpdatePrompt />
    </>
  )
}

export default App
