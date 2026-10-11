/**
 * CommandPalette — Ctrl+K global action launcher
 * Agent B scope: src/pages/Dashboard/
 *
 * Secretary-First UX: instantly accessible, keyboard-navigable,
 * fuzzy-search over all core actions.
 * Language: Professional French (AGENTS.md)
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'

// ─────────────────────────────────────────────────
// Action definitions
// ─────────────────────────────────────────────────
interface PaletteAction {
  id: string
  label: string
  description: string
  shortcut?: string
  icon: string
  category: string
  action: () => void
}

// ─────────────────────────────────────────────────
// CommandPalette component
// ─────────────────────────────────────────────────
export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openModal } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery]   = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Actions registry ─────────────────────────
  const ACTIONS: PaletteAction[] = [
    {
      id: 'new-consultation',
      label: 'Nouvelle Consultation',
      description: 'Créer un nouveau rendez-vous',
      shortcut: 'Alt+N',
      icon: '📅',
      category: 'Agenda',
      action: () => { openModal('new-consultation'); closeCommandPalette() },
    },
    {
      id: 'new-patient',
      label: 'Nouveau Patient',
      description: 'Ajouter un dossier patient',
      shortcut: 'Alt+P',
      icon: '👤',
      category: 'Patients',
      action: () => { openModal('new-patient'); closeCommandPalette() },
    },
    {
      id: 'add-payment',
      label: 'Ajouter un Paiement (MAD)',
      description: 'Enregistrer un paiement en Dirhams',
      shortcut: 'Alt+€',
      icon: '💰',
      category: 'Comptabilité',
      action: () => { openModal('add-payment'); closeCommandPalette() },
    },
    {
      id: 'generate-cnss',
      label: 'Générer Feuille de Soins (CNSS)',
      description: 'Créer et imprimer la feuille CNSS',
      shortcut: 'Alt+F',
      icon: '📄',
      category: 'CNSS / AMO',
      action: () => { openModal('generate-cnss'); closeCommandPalette() },
    },
    {
      id: 'generate-amo',
      label: 'Générer Feuille AMO',
      description: 'Créer la feuille de remboursement AMO',
      icon: '📋',
      category: 'CNSS / AMO',
      action: () => { openModal('generate-amo'); closeCommandPalette() },
    },
    {
      id: 'search-patient',
      label: 'Rechercher un Patient',
      description: 'Trouver un dossier par nom ou téléphone',
      icon: '🔍',
      category: 'Patients',
      action: () => { navigate('/app'); closeCommandPalette() },
    },
    {
      id: 'agenda',
      label: 'Ouvrir l\'Agenda',
      description: 'Voir les rendez-vous du jour',
      icon: '🗓️',
      category: 'Navigation',
      action: () => { navigate('/app'); closeCommandPalette() },
    },
  ]

  // ── Filtered actions ─────────────────────────
  const filtered = query.trim() === ''
    ? ACTIONS
    : ACTIONS.filter(
        (a) =>
          a.label.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )

  // ── Reset on open ────────────────────────────
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // ── Keyboard navigation inside palette ───────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelected((s) => Math.min(s + 1, filtered.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelected((s) => Math.max(s - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          filtered[selected]?.action()
          break
        case 'Escape':
          closeCommandPalette()
          break
      }
    },
    [filtered, selected, closeCommandPalette]
  )

  // ── Group by category ─────────────────────────
  const grouped = filtered.reduce<Record<string, PaletteAction[]>>((acc, action) => {
    if (!acc[action.category]) acc[action.category] = []
    acc[action.category].push(action)
    return acc
  }, {})

  // Reset selected when query changes
  useEffect(() => { setSelected(0) }, [query])

  let actionIndex = 0

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCommandPalette}
          />

          {/* Palette panel */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed top-[20%] left-1/2 -translate-x-1/2 z-50
              w-full max-w-xl
              glass border border-[var(--color-dossia-border)]
              rounded-2xl overflow-hidden shadow-2xl
            "
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-dossia-border)]">
              <span className="text-[var(--color-dossia-muted)] text-lg">🔍</span>
              <input
                ref={inputRef}
                id="command-palette-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une action…"
                className="
                  flex-1 bg-transparent text-[var(--color-dossia-text)]
                  placeholder:text-[var(--color-dossia-muted)]
                  text-sm outline-none
                "
              />
              <kbd
                className="
                  text-[10px] text-[var(--color-dossia-muted)]
                  border border-[var(--color-dossia-border)]
                  px-1.5 py-0.5 rounded font-mono
                "
              >
                ESC
              </kbd>
            </div>

            {/* Action list */}
            <div className="max-h-80 overflow-y-auto py-2">
              {Object.entries(grouped).length === 0 ? (
                <p className="text-center text-[var(--color-dossia-muted)] text-sm py-8">
                  Aucun résultat pour &ldquo;{query}&rdquo;
                </p>
              ) : (
                Object.entries(grouped).map(([category, actions]) => (
                  <div key={category}>
                    <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-[var(--color-dossia-muted)] font-semibold">
                      {category}
                    </p>
                    {actions.map((action) => {
                      const currentIndex = actionIndex++
                      const isSelected = currentIndex === selected
                      return (
                        <button
                          key={action.id}
                          id={`palette-action-${action.id}`}
                          onClick={action.action}
                          onMouseEnter={() => setSelected(currentIndex)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2.5 text-left
                            transition-colors duration-100
                            ${isSelected
                              ? 'bg-[var(--color-dossia-accent)]/10 text-[var(--color-dossia-accent)]'
                              : 'text-[var(--color-dossia-text)] hover:bg-[var(--color-dossia-surface2)]'
                            }
                          `}
                        >
                          <span className="text-lg w-7 text-center flex-shrink-0">
                            {action.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{action.label}</p>
                            <p className="text-xs text-[var(--color-dossia-muted)] truncate">
                              {action.description}
                            </p>
                          </div>
                          {action.shortcut && (
                            <kbd className="
                              text-[10px] text-[var(--color-dossia-muted)]
                              border border-[var(--color-dossia-border)]
                              px-1.5 py-0.5 rounded font-mono flex-shrink-0
                            ">
                              {action.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <span className="text-xs text-[var(--color-dossia-accent)] flex-shrink-0">↵</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="
              flex items-center justify-between
              px-4 py-2 border-t border-[var(--color-dossia-border)]
              text-[10px] text-[var(--color-dossia-muted)]
            ">
              <span className="flex items-center gap-2">
                <kbd className="border border-[var(--color-dossia-border)] px-1 rounded font-mono">↑↓</kbd>
                Naviguer
              </span>
              <span className="flex items-center gap-2">
                <kbd className="border border-[var(--color-dossia-border)] px-1 rounded font-mono">↵</kbd>
                Sélectionner
              </span>
              <span className="flex items-center gap-2">
                <kbd className="border border-[var(--color-dossia-border)] px-1 rounded font-mono">ESC</kbd>
                Fermer
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
