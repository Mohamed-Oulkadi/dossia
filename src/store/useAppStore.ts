import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
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

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
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
