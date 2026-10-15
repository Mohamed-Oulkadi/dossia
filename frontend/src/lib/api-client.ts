import axios from 'axios'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  timestamp?: string
  violations?: Record<string, string>
  [key: string]: unknown
}

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Global Request Interceptor: Attach Bearer JWT token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global Response Interceptor: Handles 401 Unauthorized, 403 Forbidden, and RFC 7807 ProblemDetail toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status
      const problem = error.response.data as ProblemDetail

      // 401 Unauthorized: Session expired or invalid token
      if (status === 401) {
        useAuthStore.getState().logout()
        if (!window.location.pathname.startsWith('/login')) {
          toast.error('Session expirée', {
            description: 'Veuillez vous reconnecter pour continuer.',
          })
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // 403 Forbidden: CNDP Loi 09-08 or Role restriction
      if (status === 403) {
        toast.error('Accès refusé (CNDP Loi 09-08)', {
          description: problem?.detail || 'Vos privilèges ne permettent pas d’accéder à cette ressource médicale.',
        })
        return Promise.reject(error)
      }

      // Other HTTP errors: Standard RFC 7807 Toast
      if (problem) {
        if (problem.violations && Object.keys(problem.violations).length > 0) {
          const messages = Object.entries(problem.violations)
            .map(([, msg]) => msg)
            .join(', ')
          toast.error(problem.title || 'Erreur de validation', {
            description: messages,
          })
        } else if (problem.detail) {
          toast.error(problem.title || 'Erreur', {
            description: problem.detail,
          })
        } else if (problem.title) {
          toast.error(problem.title)
        } else {
          toast.error('Une erreur est survenue au niveau du serveur.')
        }
      }
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      toast.error('Délai d’attente dépassé', {
        description: 'Le traitement par l’intelligence artificielle a dépassé le délai imparti. Veuillez réessayer.',
      })
    } else if (error.request) {
      toast.error('Serveur inaccessible', {
        description: 'Impossible de joindre le serveur. Vérifiez votre connexion réseau.',
      })
    } else {
      toast.error('Erreur réseau', {
        description: error.message,
      })
    }

    return Promise.reject(error)
  }
)
