/**
 * CommandPalette — Ctrl+K global action launcher
 * Dual-Theme Support (Light Mode / Dark Mode)
 * 
 * - Standardized Lucide icons: w-4 h-4 stroke-[1.5]
 * - 1px hairline border system (border-zinc-200 dark:border-zinc-800)
 * - Restrained typography and tight rounded-lg radius
 * - Quick Theme Toggle and Moroccan clinical actions
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  CalendarPlus,
  UserPlus,
  Banknote,
  FileCheck,
  FileText,
  Search,
  Calendar,
  CornerDownLeft,
  SunMoon,
} from 'lucide-react'

// ─────────────────────────────────────────────────
// Action definitions
// ─────────────────────────────────────────────────
interface PaletteAction {
  id: string
  label: string
  description: string
  shortcut?: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  action: () => void
}

// ─────────────────────────────────────────────────
// CommandPalette component
// ─────────────────────────────────────────────────
export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette, openModal, toggleTheme, theme } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery]   = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Actions registry ─────────────────────────
  const ACTIONS: PaletteAction[] = [
    {
      id: 'new-consultation',
      label: 'Nouvelle Consultation',
      description: 'Créer un nouveau rendez-vous patient',
      shortcut: 'Alt+N',
      icon: CalendarPlus,
      category: 'Agenda',
      action: () => { openModal('new-consultation'); closeCommandPalette() },
    },
    {
      id: 'new-patient',
      label: 'Nouveau Dossier Patient',
      description: 'Créer une fiche médicale patient',
      shortcut: 'Alt+P',
      icon: UserPlus,
      category: 'Patients',
      action: () => { openModal('new-patient'); closeCommandPalette() },
    },
    {
      id: 'add-payment',
      label: 'Ajouter un Paiement (MAD)',
      description: 'Encaisser des honoraires en Dirhams',
      shortcut: 'Alt+M',
      icon: Banknote,
      category: 'Comptabilité',
      action: () => { openModal('add-payment'); closeCommandPalette() },
    },
    {
      id: 'generate-cnss',
      label: 'Générer Feuille de Soins (CNSS)',
      description: 'Bordereau officiel CNSS pré-rempli',
      shortcut: 'Alt+F',
      icon: FileCheck,
      category: 'Assurance Maladie',
      action: () => { openModal('generate-cnss'); closeCommandPalette() },
    },
    {
      id: 'generate-amo',
      label: 'Générer Feuille AMO',
      description: 'Formulaire de remboursement AMO',
      icon: FileText,
      category: 'Assurance Maladie',
      action: () => { openModal('generate-amo'); closeCommandPalette() },
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Passer en Mode Clair' : 'Passer en Mode Sombre',
      description: 'Basculer l’affichage entre clair et sombre',
      shortcut: 'Alt+T',
      icon: SunMoon,
      category: 'Préférences',
      action: () => { toggleTheme(); closeCommandPalette() },
    },
    {
      id: 'search-patient',
      label: 'Rechercher un Patient',
      description: 'Par nom, téléphone (+212) ou CNSS',
      icon: Search,
      category: 'Patients',
      action: () => { navigate('/app'); closeCommandPalette() },
    },
    {
      id: 'agenda',
      label: 'Ouvrir l\'Agenda du Jour',
      description: 'Consulter le planning des consultations',
      shortcut: 'Alt+A',
      icon: Calendar,
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
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 backdrop-blur-xs"
            onClick={closeCommandPalette}
          />

          {/* Palette panel */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="
              fixed top-[18%] left-1/2 -translate-x-1/2 z-50
              w-full max-w-lg
              bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800
              rounded-lg overflow-hidden shadow-xl
            "
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 stroke-[1.5] flex-shrink-0" />
              <input
                ref={inputRef}
                id="command-palette-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une action ou naviguer…"
                className="
                  flex-1 bg-transparent text-zinc-900 dark:text-zinc-100
                  placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                  text-xs outline-none
                "
              />
              <kbd className="
                text-[9px] text-zinc-500
                border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900
                px-1.5 py-0.5 rounded font-mono
              ">
                ESC
              </kbd>
            </div>

            {/* Action list */}
            <div className="max-h-72 overflow-y-auto py-1.5 px-1.5">
              {Object.entries(grouped).length === 0 ? (
                <p className="text-center text-zinc-500 text-xs py-8">
                  Aucun résultat pour &ldquo;{query}&rdquo;
                </p>
              ) : (
                Object.entries(grouped).map(([category, actions]) => (
                  <div key={category} className="mb-1 last:mb-0">
                    <p className="px-2.5 pt-2 pb-1 text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-medium">
                      {category}
                    </p>
                    {actions.map((action) => {
                      const Icon = action.icon
                      const currentIndex = actionIndex++
                      const isSelected = currentIndex === selected
                      return (
                        <button
                          key={action.id}
                          id={`palette-action-${action.id}`}
                          onClick={action.action}
                          onMouseEnter={() => setSelected(currentIndex)}
                          className={`
                            w-full flex items-center gap-2.5 px-2.5 py-1.5 text-left rounded-md
                            transition-colors duration-75 text-xs cursor-pointer
                            ${isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/70 dark:hover:bg-zinc-900/60 border border-transparent'
                            }
                          `}
                        >
                          <span className="flex items-center justify-center flex-shrink-0">
                            <Icon className={`w-4 h-4 stroke-[1.5] ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{action.label}</p>
                            <p className="text-[11px] text-zinc-500 truncate">
                              {action.description}
                            </p>
                          </div>
                          {action.shortcut && (
                            <kbd className="
                              text-[10px] text-zinc-500 dark:text-zinc-400
                              border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900
                              px-1.5 py-0.5 rounded font-mono flex-shrink-0
                            ">
                              {action.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <CornerDownLeft className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 stroke-[1.5]" />
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
              px-3 py-1.5 border-t border-zinc-200 dark:border-zinc-800
              text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-950/80
            ">
              <span className="flex items-center gap-1.5">
                <kbd className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1 py-0.2 rounded font-mono">↑↓</kbd>
                Naviguer
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1 py-0.2 rounded font-mono">↵</kbd>
                Exécuter
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-1 py-0.2 rounded font-mono">ESC</kbd>
                Fermer
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
