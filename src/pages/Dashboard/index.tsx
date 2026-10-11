/**
 * Dashboard — entry point for /app route
 * Agent B scope: src/pages/Dashboard/
 *
 * Secretary-First: AppShell + SmartAgenda as default view
 */
import { AppShell } from '@/components/layout/AppShell'
import { SmartAgenda } from './SmartAgenda'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/useAppStore'

export default function DashboardPage() {
  const { openCommandPalette, openModal } = useAppStore()

  // ── Global keyboard shortcuts (AGENTS.md Rule #2) ──
  useKeyboardShortcuts([
    { combo: 'ctrl+k',  action: openCommandPalette },
    { combo: 'alt+n',   action: () => openModal('new-consultation') },
    { combo: 'alt+p',   action: () => openModal('new-patient') },
    { combo: 'alt+f',   action: () => openModal('generate-cnss') },
  ])

  return (
    <AppShell>
      <SmartAgenda />
    </AppShell>
  )
}
