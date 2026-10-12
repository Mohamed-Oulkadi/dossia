import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/useAuthStore'
import { apiClient } from '@/lib/api-client'
import { DossiaLogo } from '@/components/ui/DossiaLogo'
import { useAppStore } from '@/store/useAppStore'
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  Shield,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'

interface LoginResponse {
  token: string
  tokenType: string
  user: {
    id: string
    clinicId: string | null
    clinicName: string | null
    firstName: string
    lastName: string
    email: string
    role: UserRole
  }
}

interface DemoAccount {
  label: string
  roleName: string
  email: string
  icon: React.ComponentType<{ className?: string }>
  badgeColor: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Dr. Rachid Amrani',
    roleName: 'Médecin Praticien',
    email: 'dr.amrani@dossia.ma',
    icon: Stethoscope,
    badgeColor: 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
  },
  {
    label: 'Amina Benali',
    roleName: 'Secrétaire Médicale',
    email: 'secretaire.amina@dossia.ma',
    icon: ClipboardList,
    badgeColor: 'text-blue-600 dark:text-blue-400 border-blue-500/20 bg-blue-500/10',
  },
  {
    label: 'Super Admin',
    roleName: 'Gestionnaire SaaS',
    email: 'admin@dossia.ma',
    icon: Shield,
    badgeColor: 'text-zinc-600 dark:text-zinc-400 border-zinc-500/20 bg-zinc-500/10',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, role } = useAuthStore()
  const { theme, toggleTheme } = useAppStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === 'SUPER_ADMIN' ? '/admin' : '/app', { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const [email, setEmail] = useState('dr.amrani@dossia.ma')
  const [password, setPassword] = useState('Dossia2026!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      })

      const { token, user } = response.data
      login(token, user)

      toast.success('Connexion réussie', {
        description: `Bienvenue, ${user.firstName} ${user.lastName} (${user.role})`,
      })

      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname
      let destination: string
      if (user.role === 'SUPER_ADMIN') {
        destination = fromPath && !fromPath.startsWith('/app') ? fromPath : '/admin'
      } else {
        destination = fromPath && !fromPath.startsWith('/admin') ? fromPath : '/app'
      }
      navigate(destination, { replace: true })
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string; title?: string } } }
      const detail = errorObj?.response?.data?.detail || 'Identifiants invalides ou serveur indisponible.'
      setErrorMessage(detail)
    } finally {
      setLoading(false)
    }
  }

  const selectDemoAccount = (demo: DemoAccount) => {
    setEmail(demo.email)
    setPassword('Dossia2026!')
    setErrorMessage(null)
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xs">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-105">
            <DossiaLogo className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dossia
          </span>
          <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded">
            AUTH
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          className="p-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[1.5]" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Card Surface */}
          <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-xs space-y-5">
            <div className="space-y-1 text-center">
              <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                Espace Cabinet Médical
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Authentification sécurisée multi-tenante et conforme CNDP Loi 09-08
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                <span className="font-semibold">Erreur:</span>
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500 stroke-[1.5]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="praticien@cabinet.ma"
                    className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Mot de passe
                  </label>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                    Chiffrement BCrypt
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400 dark:text-zinc-500 stroke-[1.5]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-8 pl-8 pr-8 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5 stroke-[1.5]" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 stroke-[1.5]" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-8 mt-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Vérification…</span>
                  </>
                ) : (
                  <>
                    <span>Accéder au cabinet</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Personas */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span className="font-medium uppercase tracking-wider">Comptes de test (1-clic)</span>
                <span className="font-mono text-[10px]">Dossia2026!</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {DEMO_ACCOUNTS.map((demo) => {
                  const Icon = demo.icon
                  const isSelected = email === demo.email

                  return (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => selectDemoAccount(demo)}
                      className={`
                        w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs
                        border transition-all cursor-pointer
                        ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 shadow-2xs'
                            : 'bg-zinc-50/60 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 stroke-[1.5]" />
                        <div className="truncate">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {demo.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 ml-1.5">
                            · {demo.email}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${demo.badgeColor}`}>
                        {demo.roleName}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CNDP & Practice Context Footer Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center">
            <Building2 className="w-3.5 h-3.5 stroke-[1.5] text-emerald-600 dark:text-emerald-400" />
            <span>Établissement par défaut : <strong>Clinique Ibn Sina Agadir</strong> (ICE: 001234567890123)</span>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="h-10 flex items-center justify-center px-4 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline mr-1.5 stroke-[1.5]" />
        CNDP Loi 09-08 Conforme · Données de santé isolées par cabinet · Chiffrement AES-256
      </footer>
    </div>
  )
}
