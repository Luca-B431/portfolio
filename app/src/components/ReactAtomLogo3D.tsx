import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

type OrbitConfig = {
  radius: number
  speed: number
  phase: number
  tilt: THREE.Euler
  centerOffset: THREE.Vector3
  ellipseY: number
}

type AtomPalette = {
  color: string
  emissive: string
}

export default function ReactAtomLogo3D() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mountNode = mountRef.current

    if (!mountNode) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0.8, 9)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight)
    renderer.setClearAlpha(0)
    mountNode.appendChild(renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTexture

    const logoGroup = new THREE.Group()
    scene.add(logoGroup)

    const materials: THREE.Material[] = []
    const geometries: THREE.BufferGeometry[] = []

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: '#f0f2f6',
      metalness: 1,
      roughness: 0.07,
      emissive: '#d4d9e3',
      emissiveIntensity: 0.08,
    })
    materials.push(metalMaterial)

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: '#f7f9fd',
      metalness: 1,
      roughness: 0.05,
      emissive: '#dde3ef',
      emissiveIntensity: 0.18,
    })
    materials.push(ringMaterial)

    const nucleusMaterial = new THREE.MeshPhysicalMaterial({
      color: '#f5f7fb',
      metalness: 1,
      roughness: 0.02,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      reflectivity: 1,
      envMapIntensity: 3.1,
      emissive: '#f2f5ff',
      emissiveIntensity: 0.08,
    })
    materials.push(nucleusMaterial)

    const nucleusGeometry = new THREE.SphereGeometry(0.58, 40, 40)
    geometries.push(nucleusGeometry)
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial)
    logoGroup.add(nucleus)

    const ringGeometry = new THREE.TorusGeometry(2.15, 0.09, 16, 128)
    geometries.push(ringGeometry)

    const ringRotations = [
      new THREE.Euler(Math.PI / 2, 0, 0),
      new THREE.Euler(Math.PI / 2, Math.PI / 3, 0),
      new THREE.Euler(Math.PI / 2, -Math.PI / 3, 0),
    ]

    ringRotations.forEach((rotation) => {
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.copy(rotation)
      logoGroup.add(ring)
    })

    const atomPalette: AtomPalette[] = [
      { color: '#ff5b5b', emissive: '#d32626' },
      { color: '#5fdc84', emissive: '#27a752' },
      { color: '#ffd84a', emissive: '#caa100' },
      { color: '#9dc2ff', emissive: '#4e84ff' },
    ]

    const atomGeometry = new THREE.SphereGeometry(0.17, 20, 20)
    geometries.push(atomGeometry)

    const atomGlowMaterial = new THREE.MeshBasicMaterial({
      color: '#77acff',
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
    materials.push(atomGlowMaterial)

    const atomGlowGeometry = new THREE.SphereGeometry(0.32, 16, 16)
    geometries.push(atomGlowGeometry)

    const orbitCount = 4
    const orbitConfigs: OrbitConfig[] = Array.from({ length: orbitCount }, (_, index) => {
      const direction = Math.random() > 0.5 ? 1 : -1
      return {
        radius: 1.92 + Math.random() * 0.5,
        speed: (0.9 + Math.random() * 1.15) * direction,
        phase: Math.random() * Math.PI * 2,
        tilt: new THREE.Euler(
          Math.PI / 2 + (Math.random() - 0.5) * 0.5,
          ((index / orbitCount) * Math.PI * 2) / 3 + (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.35,
        ),
        centerOffset: new THREE.Vector3(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.32,
          (Math.random() - 0.5) * 0.4,
        ),
        ellipseY: 0.68 + Math.random() * 0.45,
      }
    })

    const atomOrbitData = orbitConfigs.map((config, index) => {
      const palette = atomPalette[index % atomPalette.length]
      const atomMaterial = new THREE.MeshStandardMaterial({
        color: palette.color,
        metalness: 0.95,
        roughness: 0.12,
        emissive: palette.emissive,
        emissiveIntensity: 0.22,
      })
      materials.push(atomMaterial)

      const atom = new THREE.Mesh(atomGeometry, atomMaterial)
      const glow = new THREE.Mesh(atomGlowGeometry, atomGlowMaterial)
      logoGroup.add(atom)
      logoGroup.add(glow)

      const tiltQuaternion = new THREE.Quaternion().setFromEuler(config.tilt)
      const localPoint = new THREE.Vector3()

      return {
        config,
        atom,
        atomMaterial,
        glow,
        tiltQuaternion,
        localPoint,
      }
    })

    const reflectionGeometry = new THREE.SphereGeometry(0.11, 16, 16)
    geometries.push(reflectionGeometry)
    const reflectionSpots = atomOrbitData.map((atomData) => {
      const reflectionMaterial = atomData.atomMaterial.clone()
      reflectionMaterial.transparent = true
      reflectionMaterial.opacity = 0
      reflectionMaterial.depthWrite = true
      reflectionMaterial.depthTest = true
      reflectionMaterial.blending = THREE.NormalBlending
      materials.push(reflectionMaterial)

      const spot = new THREE.Mesh(reflectionGeometry, reflectionMaterial)
      const spotMaterial = spot.material as THREE.MeshStandardMaterial
      logoGroup.add(spot)
      return { spot, spotMaterial }
    })

    const shadowCanvas = document.createElement('canvas')
    shadowCanvas.width = 256
    shadowCanvas.height = 256
    const shadowCtx = shadowCanvas.getContext('2d')

    if (!shadowCtx) {
      pmrem.dispose()
      envTexture.dispose()
      renderer.dispose()
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement)
      }
      return
    }

    const radial = shadowCtx.createRadialGradient(128, 128, 18, 128, 128, 118)
    radial.addColorStop(0, 'rgba(8, 10, 14, 0.28)')
    radial.addColorStop(0.5, 'rgba(10, 12, 16, 0.14)')
    radial.addColorStop(1, 'rgba(10, 12, 16, 0)')
    shadowCtx.fillStyle = radial
    shadowCtx.fillRect(0, 0, 256, 256)

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
    const groundShadowMaterial = new THREE.SpriteMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    })
    materials.push(groundShadowMaterial)
    const groundShadow = new THREE.Sprite(groundShadowMaterial)
    groundShadow.position.set(0, 0, -1.05)
    groundShadow.scale.set(5.2, 1.95, 1)
    scene.add(groundShadow)

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.78)
    scene.add(ambientLight)

    const keyLight = new THREE.PointLight('#ffffff', 1.85, 30)
    keyLight.position.set(4, 5, 7)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight('#f0f4ff', 0.95, 24)
    rimLight.position.set(-5, 1, -4)
    scene.add(rimLight)

    const topFill = new THREE.PointLight('#fbfdff', 0.84, 24)
    topFill.position.set(0, 6, 2)
    scene.add(topFill)

    const frontFill = new THREE.PointLight('#ffffff', 0.55, 20)
    frontFill.position.set(0, 1.6, 5.4)
    scene.add(frontFill)

    const handleResize = () => {
      const width = mountNode.clientWidth
      const height = mountNode.clientHeight

      if (width <= 0 || height <= 0) {
        return
      }

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)

      const depth = camera.position.z
      const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * depth
      const viewWidth = viewHeight * camera.aspect
      // Keep the logo visually parked at the bottom-right, even with a fullscreen canvas.
      logoGroup.position.set(viewWidth * 0.35, -viewHeight * 0.31, 0)
    }

    handleResize()

    let animationFrameId = 0
    let isTabVisible = document.visibilityState === 'visible'
    let burstStartTime = -100
    const spinDirection = {
      x: Math.random() > 0.5 ? 1 : -1,
      y: Math.random() > 0.5 ? 1 : -1,
      z: Math.random() > 0.5 ? 1 : -1,
    }
    const spinSpeed = {
      x: 0.3 + Math.random() * 0.35,
      y: 0.8 + Math.random() * 0.95,
      z: 0.25 + Math.random() * 0.28,
    }
    const wobbleFreq = {
      x: 0.7 + Math.random() * 0.55,
      y: 0.65 + Math.random() * 0.6,
      z: 0.9 + Math.random() * 0.7,
    }

    const tempNormal = new THREE.Vector3()
    const nucleusWorld = new THREE.Vector3()
    const spotWorld = new THREE.Vector3()
    const cameraDirFromCenter = new THREE.Vector3()
    const spotNormalWorld = new THREE.Vector3()

    logoGroup.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

    const worldToScreen = (point: THREE.Vector3) => {
      const projected = point.clone().project(camera)
      return {
        x: (projected.x * 0.5 + 0.5) * window.innerWidth,
        y: (-projected.y * 0.5 + 0.5) * window.innerHeight,
      }
    }

    const isPointerOverLogo = (clientX: number, clientY: number) => {
      const center = worldToScreen(logoGroup.position.clone())
      const edge = worldToScreen(logoGroup.position.clone().add(new THREE.Vector3(2.85, 0, 0)))
      const radius = Math.max(84, Math.hypot(edge.x - center.x, edge.y - center.y))
      const distance = Math.hypot(clientX - center.x, clientY - center.y)

      return distance <= radius
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!isPointerOverLogo(event.clientX, event.clientY)) {
        return
      }

      burstStartTime = performance.now() * 0.001
    }

    const animate = (time: number) => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const t = time * 0.001
      const burstDuration = 2.4
      const burstElapsed = t - burstStartTime

      let burstStrength = 0
      if (burstElapsed >= 0 && burstElapsed <= burstDuration) {
        const progress = burstElapsed / burstDuration

        if (progress < 0.18) {
          const fastOut = progress / 0.18
          burstStrength = 1 - Math.pow(1 - fastOut, 3)
        } else {
          const backProgress = (progress - 0.18) / 0.82
          burstStrength = Math.max(0, 1 - Math.pow(backProgress, 1.12))
        }
      }

      nucleus.getWorldPosition(nucleusWorld)
      cameraDirFromCenter.copy(camera.position).sub(nucleusWorld).normalize()

      atomOrbitData.forEach((item, index) => {
        const theta = t * item.config.speed + item.config.phase
        const burstScale = 1 + burstStrength * (6.3 + index * 1.2)
        item.localPoint.set(
          Math.cos(theta) * item.config.radius * burstScale,
          Math.sin(theta) * item.config.radius * item.config.ellipseY * burstScale,
          0,
        )

        const worldPoint = item.localPoint.applyQuaternion(item.tiltQuaternion).add(item.config.centerOffset)
        item.atom.position.copy(worldPoint)
        item.glow.position.copy(worldPoint)

        const spotData = reflectionSpots[index]
        const normal = tempNormal.copy(worldPoint).normalize()
        // Keep reflection clearly inside the nucleus volume.
        const reflectionRadius = 0.49
        spotData.spot.position.copy(normal.multiplyScalar(reflectionRadius))

        spotData.spot.getWorldPosition(spotWorld)
        spotNormalWorld.copy(spotWorld).sub(nucleusWorld).normalize()
        const frontFacing = Math.max(0, spotNormalWorld.dot(cameraDirFromCenter))

        const atomDistance = worldPoint.length()
        const proximity = THREE.MathUtils.clamp(2.3 / Math.max(atomDistance, 0.001), 0.58, 1)
        const flicker = 0.9 + Math.sin(t * 5.2 + index * 1.8) * 0.1

        // Reflection should visually match atom blue intensity.
        spotData.spotMaterial.opacity = frontFacing * proximity * 0.72 * flicker
        spotData.spotMaterial.emissiveIntensity = 0.12 + frontFacing * 0.14
        const scale = 0.78 + frontFacing * 0.7
        spotData.spot.scale.set(scale, scale, scale * 0.92)
      })

      logoGroup.rotation.x =
        t * spinSpeed.x * spinDirection.x + Math.sin(t * wobbleFreq.x) * 0.18
      logoGroup.rotation.y =
        t * spinSpeed.y * spinDirection.y + Math.cos(t * wobbleFreq.y) * 0.16
      logoGroup.rotation.z =
        t * spinSpeed.z * spinDirection.z + Math.sin(t * wobbleFreq.z) * 0.11

      const lightPulse = Math.sin(t * 1.12) * 0.5 + 0.5
      const shadowPulse = Math.sin(t * 0.86 + 0.4) * 0.5 + 0.5
      keyLight.intensity = 1.4 + lightPulse * 0.55
      rimLight.intensity = 0.7 + lightPulse * 0.3
      topFill.intensity = 0.62 + lightPulse * 0.26
      frontFill.intensity = 0.42 + lightPulse * 0.18
      metalMaterial.emissiveIntensity = 0.08 + lightPulse * 0.08
      ringMaterial.emissiveIntensity = 0.14 + lightPulse * 0.16
      nucleusMaterial.emissiveIntensity = 0.04 + lightPulse * 0.06
      atomOrbitData.forEach((atomData) => {
        atomData.atomMaterial.emissiveIntensity = 0.16 + lightPulse * 0.15
      })
      groundShadow.position.x = logoGroup.position.x
      groundShadow.position.y = logoGroup.position.y - 1.66
      groundShadowMaterial.opacity = 0.36 + shadowPulse * 0.2
      groundShadow.scale.set(4.9 + shadowPulse * 0.5, 1.8 + shadowPulse * 0.2, 1)

      renderer.render(scene, camera)

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible'
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pointerdown', handlePointerDown)

    animationFrameId = requestAnimationFrame(animate)

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pointerdown', handlePointerDown)

      scene.remove(logoGroup)
      scene.remove(ambientLight)
      scene.remove(keyLight)
      scene.remove(rimLight)
      scene.remove(topFill)
      scene.remove(frontFill)
      scene.remove(groundShadow)

      pmrem.dispose()
      envTexture.dispose()
      shadowTexture.dispose()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      renderer.dispose()

      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div className="react-atom-logo" ref={mountRef} aria-hidden="true" />
}
