/**
 * SmartAgenda — Dense, keyboard-navigable appointment table
 * Agent B scope: src/pages/Dashboard/
 *
 * Shows today's slots 08:00–18:00 with colour-coded status badges.
 * Moroccan mock data: Agadir patients, CNSS, +212 phones.
 * Language: Professional French (AGENTS.md)
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgendaStore } from '@/store/useAgendaStore'
import { MOCK_PATIENTS, type AppointmentStatus } from '@/types/moroccan'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAppStore } from '@/store/useAppStore'

// ─────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const classes: Record<AppointmentStatus, string> = {
    'Confirmé':   'status-confirme',
    'En attente': 'status-attente',
    'Annulé':     'status-annule',
    'Terminé':    'status-termine',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────────
// Patient detail panel
// ─────────────────────────────────────────────────
function PatientPanel({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const patient = MOCK_PATIENTS.find((p) => p.id === patientId)
  if (!patient) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="
        fixed right-0 top-0 bottom-0 z-40 w-80
        glass border-l border-[var(--color-dossia-border)]
        flex flex-col overflow-hidden
      "
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-dossia-border)]">
        <h3 className="font-semibold text-sm text-[var(--color-dossia-text)]">
          Dossier Patient
        </h3>
        <button
          onClick={onClose}
          id="close-patient-panel"
          className="text-[var(--color-dossia-muted)] hover:text-[var(--color-dossia-text)] text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="
            w-12 h-12 rounded-full flex items-center justify-center text-xl
            bg-[var(--color-dossia-accent)]/10 text-[var(--color-dossia-accent)]
            border border-[var(--color-dossia-accent)]/20
          ">
            {patient.nomComplet.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--color-dossia-text)]">
              {patient.nomComplet}
            </p>
            <p className="text-xs text-[var(--color-dossia-muted)]">{patient.ville}</p>
          </div>
        </div>

        {/* Info rows */}
        {[
          { label: 'Téléphone', value: patient.telephone },
          { label: 'Naissance', value: new Date(patient.dateNaissance).toLocaleDateString('fr-MA') },
          { label: 'Adresse', value: patient.adresse },
          { label: 'Assurance', value: patient.assurance },
          patient.cnss ? { label: 'N° CNSS', value: patient.cnss } : null,
          patient.amo  ? { label: 'N° AMO',  value: patient.amo  } : null,
        ]
          .filter(Boolean)
          .map((row) => (
            <div key={row!.label} className="border-b border-[var(--color-dossia-border)]/50 pb-3">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-dossia-muted)] mb-0.5">
                {row!.label}
              </p>
              <p className="text-sm text-[var(--color-dossia-text)]">{row!.value}</p>
            </div>
          ))}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-[var(--color-dossia-border)] flex flex-col gap-2">
        <button
          id="generate-cnss-btn"
          className="
            w-full py-2 rounded-lg text-xs font-medium
            bg-[var(--color-dossia-accent)]/10
            text-[var(--color-dossia-accent)]
            border border-[var(--color-dossia-accent)]/20
            hover:bg-[var(--color-dossia-accent)]/20 transition-colors
          "
        >
          📄 Générer Feuille CNSS
        </button>
        <button
          id="add-payment-patient-btn"
          className="
            w-full py-2 rounded-lg text-xs font-medium
            glass border border-[var(--color-dossia-border)]
            text-[var(--color-dossia-muted)]
            hover:text-[var(--color-dossia-text)] transition-colors
          "
        >
          💰 Ajouter un Paiement
        </button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────
// SmartAgenda main component
// ─────────────────────────────────────────────────
export function SmartAgenda() {
  const { appointments, selectedAppointmentId, selectAppointment } = useAgendaStore()
  const { openCommandPalette, openModal } = useAppStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayLabel = today.toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const todayAppointments = appointments.filter((a) => a.date === todayStr)

  // ── Keyboard shortcuts (within this view) ───
  useKeyboardShortcuts([
    { combo: 'ctrl+k', action: openCommandPalette },
    { combo: 'alt+n',  action: () => openModal('new-consultation') },
    { combo: 'escape', action: () => selectAppointment(null), allowInInput: true },
  ])

  // ── Get patient name ─────────────────────────
  const getPatient = (id: string) =>
    MOCK_PATIENTS.find((p) => p.id === id)

  // ── Stats summary ────────────────────────────
  const stats = {
    total:    todayAppointments.length,
    confirme: todayAppointments.filter((a) => a.status === 'Confirmé').length,
    attente:  todayAppointments.filter((a) => a.status === 'En attente').length,
    annule:   todayAppointments.filter((a) => a.status === 'Annulé').length,
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* ── Header ────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[var(--color-dossia-border)] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[var(--color-dossia-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            Agenda du Jour
          </h1>
          <p className="text-xs text-[var(--color-dossia-muted)] capitalize mt-0.5">{todayLabel}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stat pills */}
          <div className="hidden md:flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium status-confirme">
              {stats.confirme} Confirmés
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium status-attente">
              {stats.attente} En attente
            </span>
            {stats.annule > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium status-annule">
                {stats.annule} Annulés
              </span>
            )}
          </div>

          {/* New appointment button */}
          <motion.button
            id="new-appointment-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openModal('new-consultation')}
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg
              bg-[var(--color-dossia-accent)] text-[var(--color-dossia-bg)]
              text-sm font-semibold hover:opacity-90 transition-opacity
            "
          >
            <span>+</span>
            Nouveau RDV
            <kbd className="
              text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono
            ">Alt+N</kbd>
          </motion.button>
        </div>
      </div>

      {/* ── Agenda table ──────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--color-dossia-muted)]">
            <span className="text-4xl mb-3">📅</span>
            <p className="text-sm">Aucun rendez-vous aujourd&apos;hui</p>
            <button
              onClick={() => openModal('new-consultation')}
              className="mt-4 text-[var(--color-dossia-accent)] text-sm hover:underline"
            >
              Créer un rendez-vous →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-dossia-border)]">
                {['Heure', 'Patient', 'Motif', 'Assurance', 'Statut', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="
                      px-4 py-3 text-left text-[10px] uppercase tracking-widest
                      text-[var(--color-dossia-muted)] font-semibold whitespace-nowrap
                    "
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((appt) => {
                const patient  = getPatient(appt.patientId)
                const isSelected = selectedAppointmentId === appt.id
                const isHovered  = hoveredId === appt.id

                return (
                  <motion.tr
                    key={appt.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() =>
                      selectAppointment(isSelected ? null : appt.id)
                    }
                    onMouseEnter={() => setHoveredId(appt.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                      border-b border-[var(--color-dossia-border)]/50 cursor-pointer
                      transition-colors duration-100
                      ${isSelected || isHovered
                        ? 'bg-[var(--color-dossia-surface2)]'
                        : 'hover:bg-[var(--color-dossia-surface)]'
                      }
                    `}
                  >
                    {/* Heure */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-semibold text-[var(--color-dossia-accent)]">
                          {appt.heureDebut}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--color-dossia-muted)]">
                          {appt.heureFin}
                        </span>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="
                          w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs
                          bg-[var(--color-dossia-accent)]/10 text-[var(--color-dossia-accent)]
                        ">
                          {patient?.nomComplet.charAt(0) ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--color-dossia-text)] truncate text-xs">
                            {patient?.nomComplet ?? 'Inconnu'}
                          </p>
                          <p className="text-[10px] text-[var(--color-dossia-muted)] truncate">
                            {patient?.telephone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Motif */}
                    <td className="px-4 py-3 text-xs text-[var(--color-dossia-text)] max-w-[160px] truncate">
                      {appt.motif}
                    </td>

                    {/* Assurance */}
                    <td className="px-4 py-3">
                      <span className="text-[10px] text-[var(--color-dossia-muted)] font-mono">
                        {patient?.assurance ?? '—'}
                      </span>
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <StatusBadge status={appt.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100" style={{ opacity: isHovered ? 1 : 0 }}>
                        <button
                          id={`appt-cnss-${appt.id}`}
                          onClick={(e) => { e.stopPropagation(); openModal('generate-cnss') }}
                          title="Générer CNSS"
                          className="
                            p-1.5 rounded text-[10px]
                            text-[var(--color-dossia-muted)]
                            hover:text-[var(--color-dossia-accent)]
                            hover:bg-[var(--color-dossia-accent)]/10
                            transition-colors
                          "
                        >
                          📄
                        </button>
                        <button
                          id={`appt-pay-${appt.id}`}
                          onClick={(e) => { e.stopPropagation(); openModal('add-payment') }}
                          title="Paiement"
                          className="
                            p-1.5 rounded text-[10px]
                            text-[var(--color-dossia-muted)]
                            hover:text-[var(--color-dossia-accent)]
                            hover:bg-[var(--color-dossia-accent)]/10
                            transition-colors
                          "
                        >
                          💰
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Patient detail panel ──────────────── */}
      <AnimatePresence>
        {selectedAppointmentId && (() => {
          const appt = appointments.find((a) => a.id === selectedAppointmentId)
          return appt ? (
            <PatientPanel
              key={appt.patientId}
              patientId={appt.patientId}
              onClose={() => selectAppointment(null)}
            />
          ) : null
        })()}
      </AnimatePresence>
    </div>
  )
}
