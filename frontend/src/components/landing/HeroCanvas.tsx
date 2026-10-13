/**
 * HeroCanvas — WebGL 'Digital Pulse' Background Texture
 * Built with @react-three/fiber and three.js
 * 
 * - Subdued, surgical clinical network aesthetic
 * - 65 data nodes connected by faint synaptic lines
 * - Mouse parallax and proximity node illumination in emerald-500
 * - Low canvas opacity (0.22) ensuring zero distraction behind hero copy
 */
import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/store/useAppStore'

interface PulseNetworkProps {
  mouse: React.MutableRefObject<[number, number]>
  isDark: boolean
}

function PulseNetwork({ mouse, isDark }: PulseNetworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const { viewport } = useThree()

  const nodeCount = 70
  const maxConnectionDistance = 2.4

  // Initialize node positions & velocities
  const { positions, velocities, connections } = useMemo(() => {
    const pos = new Float32Array(nodeCount * 3)
    const vel: Array<{ x: number; y: number; z: number }> = []

    for (let i = 0; i < nodeCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 11
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3

      vel.push({
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.001,
      })
    }

    // Precalculate max line buffer
    const maxLines = (nodeCount * (nodeCount - 1)) / 2
    const linePos = new Float32Array(maxLines * 6)

    return {
      positions: pos,
      velocities: vel,
      connections: linePos,
    }
  }, [nodeCount])

  // Colors buffer for proximity lighting
  const colors = useMemo(() => {
    const col = new Float32Array(nodeCount * 3)
    const baseColor = isDark ? new THREE.Color('#52525b') : new THREE.Color('#334155')
    for (let i = 0; i < nodeCount; i++) {
      col[i * 3] = baseColor.r
      col[i * 3 + 1] = baseColor.g
      col[i * 3 + 2] = baseColor.b
    }
    return col
  }, [nodeCount, isDark])

  const pointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [positions, colors])

  const linesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(connections, 3))
    return geo
  }, [connections])

  useFrame((state) => {
    if (!groupRef.current) return

    const t = state.clock.elapsedTime
    const currentMouse = mouse.current

    // 1. Smooth camera parallax lerp
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -currentMouse[1] * 0.08,
      0.03
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      currentMouse[0] * 0.08,
      0.03
    )

    // Gentle global drift
    groupRef.current.rotation.z = Math.sin(t * 0.05) * 0.015

    // Mouse position in 3D world space (approximate z=0 plane)
    const mouseWorldX = currentMouse[0] * (viewport.width / 2)
    const mouseWorldY = currentMouse[1] * (viewport.height / 2)

    const posAttr = pointsGeo.getAttribute('position') as THREE.BufferAttribute
    const colAttr = pointsGeo.getAttribute('color') as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array
    const colArray = colAttr.array as Float32Array

    const baseColor = isDark ? new THREE.Color('#52525b') : new THREE.Color('#334155')
    const activeEmerald = isDark ? new THREE.Color('#10b981') : new THREE.Color('#059669')

    // 2. Animate nodes & proximity glow
    for (let i = 0; i < nodeCount; i++) {
      const idx = i * 3
      // Drift with velocities
      posArray[idx] += velocities[i].x
      posArray[idx + 1] += velocities[i].y
      posArray[idx + 2] += velocities[i].z

      // Boundary rebound
      if (Math.abs(posArray[idx]) > 6) velocities[i].x *= -1
      if (Math.abs(posArray[idx + 1]) > 4) velocities[i].y *= -1
      if (Math.abs(posArray[idx + 2]) > 2) velocities[i].z *= -1

      // Distance to cursor
      const dx = posArray[idx] - mouseWorldX
      const dy = posArray[idx + 1] - mouseWorldY
      const distToMouse = Math.sqrt(dx * dx + dy * dy)

      if (distToMouse < 2.5) {
        // Proximity glow: blend towards vibrant emerald
        const factor = Math.max(0, 1 - distToMouse / 2.5)
        colArray[idx] = THREE.MathUtils.lerp(baseColor.r, activeEmerald.r, factor)
        colArray[idx + 1] = THREE.MathUtils.lerp(baseColor.g, activeEmerald.g, factor)
        colArray[idx + 2] = THREE.MathUtils.lerp(baseColor.b, activeEmerald.b, factor)
      } else {
        colArray[idx] = baseColor.r
        colArray[idx + 1] = baseColor.g
        colArray[idx + 2] = baseColor.b
      }
    }
    posAttr.needsUpdate = true
    colAttr.needsUpdate = true

    // 3. Update dynamic connection lines
    const lineAttr = linesGeo.getAttribute('position') as THREE.BufferAttribute
    const lineArray = lineAttr.array as Float32Array
    let lineSegmentIdx = 0

    for (let i = 0; i < nodeCount; i++) {
      const i3 = i * 3
      const x1 = posArray[i3]
      const y1 = posArray[i3 + 1]
      const z1 = posArray[i3 + 2]

      for (let j = i + 1; j < nodeCount; j++) {
        const j3 = j * 3
        const dx = x1 - posArray[j3]
        const dy = y1 - posArray[j3 + 1]
        const dz = z1 - posArray[j3 + 2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < maxConnectionDistance) {
          lineArray[lineSegmentIdx++] = x1
          lineArray[lineSegmentIdx++] = y1
          lineArray[lineSegmentIdx++] = z1

          lineArray[lineSegmentIdx++] = posArray[j3]
          lineArray[lineSegmentIdx++] = posArray[j3 + 1]
          lineArray[lineSegmentIdx++] = posArray[j3 + 2]
        }
      }
    }

    linesGeo.setDrawRange(0, lineSegmentIdx / 3)
    lineAttr.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      {/* Network Points */}
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial
          size={isDark ? 0.08 : 0.07}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* Synaptic Connecting Lines */}
      <lineSegments ref={linesRef} geometry={linesGeo}>
        <lineBasicMaterial
          color={isDark ? '#10b981' : '#059669'}
          transparent
          opacity={isDark ? 0.07 : 0.16}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}

/**
 * HeroCanvas Exported Component
 */
export function HeroCanvas() {
  const { theme } = useAppStore()
  const isDark = theme === 'dark'
  const mouse = useRef<[number, number]>([0, 0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      // Normalized device coordinates (-1 to +1)
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1,
      ]
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-1000 opacity-60 dark:opacity-30"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <PulseNetwork mouse={mouse} isDark={isDark} />
      </Canvas>
    </div>
  )
}

export default HeroCanvas
