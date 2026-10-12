import { useAuthStore } from '@/store/useAuthStore'
import { DoctorHome } from './DoctorHome'
import { SecretaryHome } from './SecretaryHome'

export function HomeDashboard() {
  const { role } = useAuthStore()

  if (role === 'DOCTOR') {
    return <DoctorHome />
  }

  return <SecretaryHome />
}

export default HomeDashboard
