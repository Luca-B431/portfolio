import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WaveBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return
    }

    const mountNode = mountRef.current

    if (!mountNode) {
      return
    }

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      52,
      mountNode.clientWidth / mountNode.clientHeight,
      0.1,
      100,
    )
    camera.position.set(0, 0, 8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight)
    mountNode.appendChild(renderer.domElement)

    const geometry = new THREE.PlaneGeometry(14, 10, 140, 100)
    const material = new THREE.MeshStandardMaterial({
      color: '#0ea5a0',
      metalness: 0.2,
      roughness: 0.45,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -0.95
    mesh.position.set(0, -0.8, -1.8)
    scene.add(mesh)

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.75)
    scene.add(ambientLight)

    const keyLight = new THREE.PointLight('#7dd3fc', 1.4, 30)
    keyLight.position.set(0, 4, 8)
    scene.add(keyLight)

    const backLight = new THREE.PointLight('#facc15', 0.5, 30)
    backLight.position.set(-6, -2, -2)
    scene.add(backLight)

    let animationFrameId = 0
    let isTabVisible = document.visibilityState === 'visible'

    const animate = (time: number) => {
      if (!isTabVisible) {
        animationFrameId = window.requestAnimationFrame(animate)
        return
      }

      const position = geometry.attributes.position as THREE.BufferAttribute
      const t = time * 0.00075

      for (let i = 0; i < position.count; i += 1) {
        const x = position.getX(i)
        const y = position.getY(i)
        const wave = Math.sin(x * 1.1 + t) * 0.22 + Math.cos(y * 0.8 + t * 1.35) * 0.16
        position.setZ(i, wave)
      }

      position.needsUpdate = true
      renderer.render(scene, camera)
      animationFrameId = window.requestAnimationFrame(animate)
    }

    animationFrameId = window.requestAnimationFrame(animate)

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible'
    }

    const handleResize = () => {
      if (!mountRef.current) {
        return
      }

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      if (width === 0 || height === 0) {
        return
      }

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div className="wave-canvas" ref={mountRef} aria-hidden="true" />
}
