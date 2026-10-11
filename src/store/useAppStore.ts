import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'

interface AppState {
  // Theme
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void

  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Command Palette
  commandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void

  // Active modal
  activeModal: string | null
  openModal: (id: string) => void
  closeModal: () => void
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('dossia-theme') as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  }
  return 'dark'
}

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
  localStorage.setItem('dossia-theme', theme)
}

// Initial application
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme())
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Theme
      theme: getInitialTheme(),
      setTheme: (theme) => {
        applyThemeToDOM(theme)
        set({ theme })
      },
      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark'
          applyThemeToDOM(nextTheme)
          return { theme: nextTheme }
        })
      },

      // Sidebar — default expanded on desktop
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Command Palette
      commandPaletteOpen: false,
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),
      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      // Modal
      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),
    }),
    { name: 'dossia-app' }
  )
)
