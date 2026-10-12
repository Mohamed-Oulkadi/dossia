import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'SUPER_ADMIN' | 'DOCTOR' | 'SECRETARY'

export interface UserProfile {
  id: string
  clinicId: string | null
  clinicName: string | null
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

export interface AuthState {
  token: string | null
  user: UserProfile | null
  role: UserRole | null
  isAuthenticated: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
  setUser: (user: UserProfile) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,

      login: (token: string, user: UserProfile) => {
        set({
          token,
          user,
          role: user.role,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          token: null,
          user: null,
          role: null,
          isAuthenticated: false,
        })
      },

      setUser: (user: UserProfile) => {
        set({
          user,
          role: user.role,
        })
      },
    }),
    {
      name: 'dossia-auth-storage',
    }
  )
)
