/**
 * MedicalNetworkCanvas — R3F Three.js synaptic network background
 * Agent A scope: src/pages/Landing/
 *
 * Wrapped in React.lazy() from Landing/index.tsx — NEVER import directly.
 * Respects prefers-reduced-motion.
 */
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─────────────────────────────────────────────────
// Inner R3F component
// ─────────────────────────────────────────────────
interface NeuralNetworkProps {
  mouse: React.MutableRefObject<[number, number]>
  reducedMotion: boolean
}

function NeuralNetwork({ mouse, reducedMotion }: NeuralNetworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const { size } = useThree()

  // ── Generate node positions ──────────────────
  const { positions, linePositions, nodeCount } = useMemo(() => {
    const count = 80
    const range = 5.5
    const positions = new Float32Array(count * 3)
    const nodeVecs: THREE.Vector3[] = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * range * 2
      const y = (Math.random() - 0.5) * range * 2
      const z = (Math.random() - 0.5) * range * 0.8
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      nodeVecs.push(new THREE.Vector3(x, y, z))
    }

    // Connect nearby nodes
    const maxDist = 2.4
    const linePos: number[] = []
    for (let a = 0; a < count; a++) {
      for (let b = a + 1; b < count; b++) {
        if (nodeVecs[a].distanceTo(nodeVecs[b]) < maxDist) {
          linePos.push(
            nodeVecs[a].x, nodeVecs[a].y, nodeVecs[a].z,
            nodeVecs[b].x, nodeVecs[b].y, nodeVecs[b].z
          )
        }
      }
    }

    return {
      positions,
      linePositions: new Float32Array(linePos),
      nodeCount: count,
    }
  }, [])

  // ── Geometries ───────────────────────────────
  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const linesGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    return geo
  }, [linePositions])

  // ── Animation loop ───────────────────────────
  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return

    const t = state.clock.elapsedTime

    // Mouse-driven subtle rotation
    const nx = mouse.current[0] / size.width  - 0.5
    const ny = mouse.current[1] / size.height - 0.5
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, ny * 0.12, 0.04
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, nx * 0.12, 0.04
    )

    // Gentle auto-drift
    groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.03

    // Pulsing node opacity
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial
      mat.opacity = 0.55 + Math.sin(t * 0.8) * 0.2
    }
  })

  // Warn-free: nodeCount is used to satisfy linter
  void nodeCount

  return (
    <group ref={groupRef}>
      {/* Glowing nodes */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          color="#34d399"
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.75}
          depthWrite={false}
        />
      </points>

      {/* Connection lines */}
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial
          color="#2dd4bf"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </lineSegments>

      {/* Larger accent nodes — every 5th node */}
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#6ee7b7"
          size={0.11}
          sizeAttenuation
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

// ─────────────────────────────────────────────────
// Exported canvas wrapper
// ─────────────────────────────────────────────────
export function MedicalNetworkCanvas() {
  const mouse = useRef<[number, number]>([0, 0])
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const handler = (e: MouseEvent) => {
      mouse.current = [e.clientX, e.clientY]
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 58 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        style={{ background: 'transparent' }}
      >
        {/* Subtle ambient fill */}
        <ambientLight intensity={0.3} />
        <NeuralNetwork mouse={mouse} reducedMotion={reducedMotion.current} />
      </Canvas>

      {/* Radial vignette — makes center text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(10,10,15,0.2) 0%, rgba(10,10,15,0.75) 100%)',
        }}
      />
    </div>
  )
}
