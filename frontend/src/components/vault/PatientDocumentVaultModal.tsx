import { PatientDocumentVault } from './PatientDocumentVault'
import { X, FolderLock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Patient } from '@/hooks/use-patients'

interface PatientDocumentVaultModalProps {
  patient: Patient | null
  isOpen: boolean
  onClose: () => void
}

export function PatientDocumentVaultModal({
  patient,
  isOpen,
  onClose,
}: PatientDocumentVaultModalProps) {
  if (!isOpen || !patient) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <div className="relative w-full max-w-4xl h-[82vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <FolderLock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Coffre-Fort Documents &amp; Imagerie</span>
                <span className="font-mono text-[11px] font-normal text-zinc-600 dark:text-zinc-400">
                  — {patient.lastName.toUpperCase()} {patient.firstName} ({patient.cin})
                </span>
              </h2>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 overflow-hidden bg-white dark:bg-zinc-950">
          <PatientDocumentVault patientId={patient.id} />
        </div>
      </div>
    </div>
  )
}
