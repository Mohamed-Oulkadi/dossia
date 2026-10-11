/**
 * MedicalNetworkCanvas — R3F Three.js synaptic network background
 * Refactored for Clinical Craft & Executive SaaS Design System
 * 
 * - Desaturated, surgical dark-mode aesthetic
 * - Low opacity nodes (0.25) & hairline lines (0.05)
 * - Damped cursor parallax (0.02 lerp)
 * - pointer-events-none container ensuring zero scroll interference
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
    const count = 70
    const range = 5.0
    const positions = new Float32Array(count * 3)
    const nodeVecs: THREE.Vector3[] = []

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * range * 2
      const y = (Math.random() - 0.5) * range * 2
      const z = (Math.random() - 0.5) * range * 0.7
      positions[i * 3]     = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      nodeVecs.push(new THREE.Vector3(x, y, z))
    }

    // Connect nearby nodes with delicate synaptic lines
    const maxDist = 2.2
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

  // ── Subtle Animation loop ────────────────────
  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return

    const t = state.clock.elapsedTime

    // Smooth, damped cursor parallax
    const nx = mouse.current[0] / size.width  - 0.5
    const ny = mouse.current[1] / size.height - 0.5
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, ny * 0.08, 0.02
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, nx * 0.08, 0.02
    )

    // Gentle drift
    groupRef.current.rotation.z = Math.sin(t * 0.03) * 0.015

    // Very subtle breathing pulse
    if (pointsRef.current) {
      const mat = pointsRef.current.material as THREE.PointsMaterial
      mat.opacity = 0.22 + Math.sin(t * 0.5) * 0.06
    }
  })

  void nodeCount

  return (
    <group ref={groupRef}>
      {/* Primary desaturated clinical nodes */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          color="#38bdf8"
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </points>

      {/* Hairline desaturated synaptic connection lines */}
      <lineSegments geometry={linesGeometry}>
        <lineBasicMaterial
          color="#52525b"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </lineSegments>

      {/* Subtle secondary zinc accents */}
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color="#a1a1aa"
          size={0.08}
          sizeAttenuation
          transparent
          opacity={0.12}
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
    <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 56 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.2} />
        <NeuralNetwork mouse={mouse} reducedMotion={reducedMotion.current} />
      </Canvas>

      {/* Dark vignette blending cleanly into zinc-950 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(9,9,11,0.4) 0%, rgba(9,9,11,0.95) 100%)',
        }}
      />
    </div>
  )
}
