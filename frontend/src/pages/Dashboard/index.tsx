/**
 * Dashboard — entry point for /app routes
 *
 * Role-Based Workspaces & Dynamic Layouts:
 * - DOCTOR: Cockpit Médical & Salle d'Attente Interactive
 * - SECRETARY: Split-screen SLA 3s (Planning Arrivées + Caisse Rapide)
 * - Guards: CNDP Loi 09-08 strictly shields /app/consultation* to DOCTOR only
 */
import { AppShell } from '@/components/layout/AppShell'
import { HomeDashboard } from './HomeDashboard'
import { SmartAgenda } from './SmartAgenda'
import { PatientsTable } from './PatientsTable'
import ConsultationWorkspace from '@/pages/ConsultationWorkspace'
import CaissePage from '@/pages/Caisse'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/useAppStore'
import { RoleGuard } from '@/components/auth/RoleGuard'
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
  const isConsultationRoute =
    location.pathname.startsWith('/app/consultation') ||
    location.pathname.startsWith('/app/consultations') ||
    location.pathname.startsWith('/app/ordonnances')
  const isCaisseRoute =
    location.pathname.startsWith('/app/paiements') ||
    location.pathname.startsWith('/app/caisse')
  const isFullAgendaRoute = location.pathname.startsWith('/app/agenda')

  return (
    <AppShell>
      {isConsultationRoute ? (
        <RoleGuard allowedRoles={['DOCTOR']}>
          <ConsultationWorkspace />
        </RoleGuard>
      ) : isPatientsRoute ? (
        <PatientsTable />
      ) : isCaisseRoute ? (
        <CaissePage />
      ) : isFullAgendaRoute ? (
        <SmartAgenda />
      ) : (
        <HomeDashboard />
      )}
    </AppShell>
  )
}
export { HomeDashboard, SmartAgenda, PatientsTable }
