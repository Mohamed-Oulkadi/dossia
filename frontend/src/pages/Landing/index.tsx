/**
 * Landing Page — entry point
 * The Three.js canvas is lazy-loaded per AGENTS.md Rule #1:
 * "Three.js animation must be wrapped in React.lazy() and Suspense"
 */
import { lazy, Suspense } from 'react'
import { HeroSection } from './HeroSection'

// Lazy-load the heavy R3F canvas — never blocks main thread
const MedicalNetworkCanvas = lazy(() =>
  import('./MedicalNetworkCanvas').then((m) => ({
    default: m.MedicalNetworkCanvas,
  }))
)

// Lightweight CSS-only fallback while canvas loads
function CanvasFallback() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 80% at 30% 40%, rgba(52,211,153,0.06) 0%, rgba(10,10,15,1) 60%)',
      }}
    />
  )
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-dossia-bg)]">
      <Suspense fallback={<CanvasFallback />}>
        <MedicalNetworkCanvas />
      </Suspense>
      <HeroSection />
    </main>
  )
}
