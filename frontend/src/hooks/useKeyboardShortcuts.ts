/**
 * useKeyboardShortcuts — Global keyboard shortcut manager
 * Agent B scope: src/hooks/
 *
 * Fires registered callbacks on matching key combos.
 * Supports: ctrl+k, alt+n, escape, etc.
 * Respects input/textarea focus (won't fire inside form fields).
 */
import { useEffect, useCallback } from 'react'

export interface KeyCombo {
  /** e.g. 'ctrl+k', 'alt+n', 'escape' */
  combo: string
  action: () => void
  /** If true, fires even when an input/textarea is focused */
  allowInInput?: boolean
}

function parseCombo(combo: string): {
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
  key: string
} {
  const parts = combo.toLowerCase().split('+')
  return {
    ctrl:  parts.includes('ctrl'),
    alt:   parts.includes('alt'),
    shift: parts.includes('shift'),
    meta:  parts.includes('meta') || parts.includes('cmd'),
    key:   parts[parts.length - 1],
  }
}

function matchesCombo(e: KeyboardEvent, combo: string): boolean {
  const parsed = parseCombo(combo)
  const eKey   = e.key.toLowerCase()

  return (
    e.ctrlKey  === parsed.ctrl  &&
    e.altKey   === parsed.alt   &&
    e.shiftKey === parsed.shift &&
    e.metaKey  === parsed.meta  &&
    eKey       === parsed.key
  )
}

export function useKeyboardShortcuts(shortcuts: KeyCombo[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      for (const shortcut of shortcuts) {
        if (isEditable && !shortcut.allowInInput) continue
        if (matchesCombo(e, shortcut.combo)) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
