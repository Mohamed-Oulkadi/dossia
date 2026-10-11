import axios from 'axios'
import { toast } from 'sonner'

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
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Global Response Interceptor: Translates RFC 7807 ProblemDetail into Sonner toasts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      const problem = error.response.data as ProblemDetail

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
    } else if (error.request) {
      toast.error('Serveur inaccessible (Port 8080)', {
        description: 'Vérifiez que le serveur Spring Boot est démarré.',
      })
    } else {
      toast.error('Erreur réseau', {
        description: error.message,
      })
    }

    return Promise.reject(error)
  }
)
