/**
 * Dashboard — entry point for /app routes
 *
 * Secretary-First: AppShell with SmartAgenda (calendar) or PatientsTable (records)
 */
import { AppShell } from '@/components/layout/AppShell'
import { SmartAgenda } from './SmartAgenda'
import { PatientsTable } from './PatientsTable'
import ConsultationWorkspace from '@/pages/ConsultationWorkspace'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/useAppStore'
import { useLocation } from 'react-router-dom'

export default function DashboardPage() {
  const { openCommandPalette, openModal } = useAppStore()
  const location = useLocation()

  // ── Global keyboard shortcuts (AGENTS.md Rule #2) ──
  useKeyboardShortcuts([
    { combo: 'ctrl+k', action: openCommandPalette },
    { combo: 'alt+n', action: () => openModal('new-consultation') },
    { combo: 'alt+p', action: () => openModal('new-patient') },
    { combo: 'alt+f', action: () => openModal('generate-cnss') },
  ])

  const isPatientsRoute = location.pathname.startsWith('/app/patients')
  const isConsultationRoute = location.pathname.startsWith('/app/consultation')

  return (
    <AppShell>
      {isConsultationRoute ? (
        <ConsultationWorkspace />
      ) : isPatientsRoute ? (
        <PatientsTable />
      ) : (
        <SmartAgenda />
      )}
    </AppShell>
  )
}
