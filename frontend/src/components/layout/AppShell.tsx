/**
 * AppShell — Compatibility re-export of ClinicLayout
 */
import React from 'react'
import { ClinicLayout } from '@/layouts/ClinicLayout'

interface AppShellProps {
  children?: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return <ClinicLayout>{children}</ClinicLayout>
}

export default AppShell
