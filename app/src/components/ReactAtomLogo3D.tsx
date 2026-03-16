import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { ATOM_PALETTE } from '../theme/atomPalette'

type OrbitConfig = {
  radius: number
  speed: number
  phase: number
  tilt: THREE.Euler
  centerOffset: THREE.Vector3
  ellipseY: number
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, prefersReducedMotion ? 1 : 1.25))
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
    const trailPointCount = 18
    const sparkleCount = 54
    const sparkleGeometry = new THREE.SphereGeometry(0.014, 8, 8)
    geometries.push(sparkleGeometry)
    const filamentMinCount = 3
    const filamentMaxCount = 4
    const filamentSparklesPerFilament = 3
    const filamentSparkleGeometry = new THREE.SphereGeometry(0.018, 8, 8)
    geometries.push(filamentSparkleGeometry)
    const sparkleFireColors = ['#fffef2', '#fff7bf', '#ffe978', '#ffd84a']

    const trailAlphaCanvas = document.createElement('canvas')
    trailAlphaCanvas.width = 256
    trailAlphaCanvas.height = 4
    const trailAlphaCtx = trailAlphaCanvas.getContext('2d')

    if (!trailAlphaCtx) {
      pmrem.dispose()
      envTexture.dispose()
      renderer.dispose()
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement)
      }
      return
    }

    const trailAlphaGradient = trailAlphaCtx.createLinearGradient(0, 0, 256, 0)
    trailAlphaGradient.addColorStop(0, 'rgba(255,255,255,1)')
    trailAlphaGradient.addColorStop(0.55, 'rgba(255,255,255,0.42)')
    trailAlphaGradient.addColorStop(1, 'rgba(0,0,0,0)')
    trailAlphaCtx.fillStyle = trailAlphaGradient
    trailAlphaCtx.fillRect(0, 0, 256, 4)

    const trailAlphaTexture = new THREE.CanvasTexture(trailAlphaCanvas)
    trailAlphaTexture.wrapS = THREE.ClampToEdgeWrapping
    trailAlphaTexture.wrapT = THREE.ClampToEdgeWrapping
    trailAlphaTexture.minFilter = THREE.LinearFilter
    trailAlphaTexture.magFilter = THREE.LinearFilter

    const orbitCount = ATOM_PALETTE.length
    const orbitConfigs: OrbitConfig[] = Array.from({ length: orbitCount }, (_, index) => {
      const direction = Math.random() > 0.5 ? 1 : -1
      return {
        radius: 1.92 + Math.random() * 0.5,
        speed: (0.9 + Math.random() * 1.15) * direction,
        phase: Math.random() * Math.PI * 2,
        tilt: new THREE.Euler(
          Math.PI / 2 + (Math.random() - 0.5) * 0.5,
          (index / orbitCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.8,
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
      const palette = ATOM_PALETTE[index % ATOM_PALETTE.length]
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

      const trailHistory = Array.from({ length: trailPointCount }, () => new THREE.Vector3())
      const trailMaterial = new THREE.MeshBasicMaterial({
        color: palette.color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        alphaMap: trailAlphaTexture,
        blending: THREE.AdditiveBlending,
      })
      materials.push(trailMaterial)

      const trailGeometry = new THREE.BufferGeometry()
      const trailPositions = new Float32Array(trailPointCount * 2 * 3)
      trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3))

      const trailUvs = new Float32Array(trailPointCount * 2 * 2)
      for (let p = 0; p < trailPointCount; p += 1) {
        const u = p / Math.max(trailPointCount - 1, 1)
        const uvOffset = p * 4
        trailUvs[uvOffset] = u
        trailUvs[uvOffset + 1] = 0
        trailUvs[uvOffset + 2] = u
        trailUvs[uvOffset + 3] = 1
      }
      trailGeometry.setAttribute('uv', new THREE.BufferAttribute(trailUvs, 2))

      const trailIndices = new Uint16Array((trailPointCount - 1) * 6)
      for (let i = 0; i < trailPointCount - 1; i += 1) {
        const base = i * 2
        const offset = i * 6
        trailIndices[offset] = base
        trailIndices[offset + 1] = base + 1
        trailIndices[offset + 2] = base + 2
        trailIndices[offset + 3] = base + 1
        trailIndices[offset + 4] = base + 3
        trailIndices[offset + 5] = base + 2
      }
      trailGeometry.setIndex(new THREE.BufferAttribute(trailIndices, 1))
      geometries.push(trailGeometry)

      const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)
      trailMesh.frustumCulled = false
      logoGroup.add(trailMesh)

      const sparkleData = Array.from({ length: sparkleCount }, () => {
        const warmColor = new THREE.Color(
          sparkleFireColors[Math.floor(Math.random() * sparkleFireColors.length)],
        )
        const hotColor = new THREE.Color('#ffffff')

        const sparkleMaterial = new THREE.MeshBasicMaterial({
          color: warmColor,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          depthTest: false,
          blending: THREE.AdditiveBlending,
        })
        materials.push(sparkleMaterial)

        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial)
        sparkle.frustumCulled = false
        sparkle.renderOrder = 30
        logoGroup.add(sparkle)

        return {
          sparkle,
          sparkleMaterial,
          trailOffset: Math.floor(3 + Math.random() * Math.max(1, trailPointCount - 5)),
          phase: Math.random() * Math.PI * 2,
          radiusFactor: 1.25 + Math.random() * 1.6,
          blinkRate: 20 + Math.random() * 34,
          pulseSeed: Math.random() * Math.PI * 2,
          orbitSpeed: 5 + Math.random() * 10,
          driftSeed: Math.random() * Math.PI * 2,
          shellOffset: 0.38 + Math.random() * 0.7,
          warmColor,
          hotColor,
        }
      })

      const filamentCount =
        filamentMinCount + Math.floor(Math.random() * (filamentMaxCount - filamentMinCount + 1))
      const filamentData = Array.from({ length: filamentCount }, (_, filamentIndex) => {
        const filamentMaterial = new THREE.MeshBasicMaterial({
          color: palette.color,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
          alphaMap: trailAlphaTexture,
          blending: THREE.AdditiveBlending,
        })
        materials.push(filamentMaterial)

        const filamentGeometry = new THREE.BufferGeometry()
        const filamentPositions = new Float32Array(trailPointCount * 2 * 3)
        filamentGeometry.setAttribute('position', new THREE.BufferAttribute(filamentPositions, 3))

        const filamentUvs = new Float32Array(trailPointCount * 2 * 2)
        for (let p = 0; p < trailPointCount; p += 1) {
          const u = p / Math.max(trailPointCount - 1, 1)
          const uvOffset = p * 4
          filamentUvs[uvOffset] = u
          filamentUvs[uvOffset + 1] = 0
          filamentUvs[uvOffset + 2] = u
          filamentUvs[uvOffset + 3] = 1
        }
        filamentGeometry.setAttribute('uv', new THREE.BufferAttribute(filamentUvs, 2))

        const filamentIndices = new Uint16Array((trailPointCount - 1) * 6)
        for (let i = 0; i < trailPointCount - 1; i += 1) {
          const base = i * 2
          const offset = i * 6
          filamentIndices[offset] = base
          filamentIndices[offset + 1] = base + 1
          filamentIndices[offset + 2] = base + 2
          filamentIndices[offset + 3] = base + 1
          filamentIndices[offset + 4] = base + 3
          filamentIndices[offset + 5] = base + 2
        }
        filamentGeometry.setIndex(new THREE.BufferAttribute(filamentIndices, 1))
        geometries.push(filamentGeometry)

        const filamentMesh = new THREE.Mesh(filamentGeometry, filamentMaterial)
        filamentMesh.frustumCulled = false
        filamentMesh.renderOrder = 28 + filamentIndex
        logoGroup.add(filamentMesh)

        const sparkles = Array.from({ length: filamentSparklesPerFilament }, () => {
          const warmColor = new THREE.Color(palette.color)
          const sparkleMaterial = new THREE.MeshBasicMaterial({
            color: warmColor,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
          })
          materials.push(sparkleMaterial)

          const sparkle = new THREE.Mesh(filamentSparkleGeometry, sparkleMaterial)
          sparkle.frustumCulled = false
          sparkle.renderOrder = 34
          logoGroup.add(sparkle)

          return {
            sparkle,
            sparkleMaterial,
            warmColor,
            trailOffset: Math.floor(2 + Math.random() * Math.max(1, trailPointCount - 4)),
            phase: Math.random() * Math.PI * 2,
            orbitSpeedOffset: 2.2 + Math.random() * 3.8,
            radiusJitter: 0.06 + Math.random() * 0.2,
            twinkleRate: 18 + Math.random() * 26,
            driftBack: 0.008 + Math.random() * 0.03,
          }
        })

        return {
          filamentMesh,
          filamentMaterial,
          filamentGeometry,
          filamentPositions,
          phase: (filamentIndex / filamentCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35,
          orbitSpeed: 1.5 + Math.random() * 2.4,
          radiusBias: 0.95 + Math.random() * 0.85,
          widthBias: 1.08 + Math.random() * 0.62,
          sparkleSpin: 0.8 + Math.random() * 0.45,
          sparkles,
        }
      })

      const tiltQuaternion = new THREE.Quaternion().setFromEuler(config.tilt)
      const localPoint = new THREE.Vector3()

      return {
        config,
        atom,
        atomMaterial,
        glow,
        trailMesh,
        trailMaterial,
        trailGeometry,
        trailPositions,
        trailHistory,
        sparkleData,
        filamentData,
        tiltQuaternion,
        localPoint,
      }
    })

    const reflectionGeometry = new THREE.SphereGeometry(0.11, 16, 16)
    geometries.push(reflectionGeometry)
    const trailReflectionGeometry = new THREE.SphereGeometry(0.07, 14, 14)
    geometries.push(trailReflectionGeometry)
    const trailReflectionCount = 3
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

      const trailSpots = Array.from({ length: trailReflectionCount }, (_, idx) => {
        const trailMaterial = atomData.atomMaterial.clone()
        trailMaterial.transparent = true
        trailMaterial.opacity = 0
        trailMaterial.depthWrite = true
        trailMaterial.depthTest = true
        trailMaterial.blending = THREE.NormalBlending
        materials.push(trailMaterial)

        const trailSpot = new THREE.Mesh(trailReflectionGeometry, trailMaterial)
        const trailSpotMaterial = trailSpot.material as THREE.MeshStandardMaterial
        trailSpot.scale.setScalar(0.72 - idx * 0.1)
        logoGroup.add(trailSpot)

        return { trailSpot, trailSpotMaterial }
      })

      return { spot, spotMaterial, trailSpots }
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

    let isDarkTheme = false

    const applyThemeToLogo = (theme: 'light' | 'dark') => {
      const dark = theme === 'dark'
      isDarkTheme = dark

      if (dark) {
        metalMaterial.color.set('#141820')
        metalMaterial.emissive.set('#0f131a')

        ringMaterial.color.set('#1c212b')
        ringMaterial.emissive.set('#111724')

        nucleusMaterial.color.set('#0f131a')
        nucleusMaterial.emissive.set('#0a0d12')
        nucleusMaterial.metalness = 0.62
        nucleusMaterial.clearcoat = 0.02
        nucleusMaterial.reflectivity = 0.12
        nucleusMaterial.roughness = 0.28
        nucleusMaterial.clearcoatRoughness = 0.34
        nucleusMaterial.envMapIntensity = 0.22

        ambientLight.intensity = 0.62
        keyLight.intensity = 0.5
        rimLight.intensity = 0.28
        topFill.intensity = 0.22
        frontFill.intensity = 0.12
      } else {
        metalMaterial.color.set('#f0f2f6')
        metalMaterial.emissive.set('#d4d9e3')

        ringMaterial.color.set('#f7f9fd')
        ringMaterial.emissive.set('#dde3ef')

        nucleusMaterial.color.set('#f5f7fb')
        nucleusMaterial.emissive.set('#f2f5ff')
        nucleusMaterial.metalness = 1
        nucleusMaterial.clearcoat = 1
        nucleusMaterial.reflectivity = 1
        nucleusMaterial.roughness = 0.02
        nucleusMaterial.clearcoatRoughness = 0.02
        nucleusMaterial.envMapIntensity = 3.1

        ambientLight.intensity = 0.78
        keyLight.intensity = 1.85
        rimLight.intensity = 0.95
        topFill.intensity = 0.84
        frontFill.intensity = 0.55
      }
    }

    const readTheme = (): 'light' | 'dark' => {
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    }

    applyThemeToLogo(readTheme())

    const themeObserver = new MutationObserver(() => {
      applyThemeToLogo(readTheme())
    })

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    let currentViewHeight = 10
    let currentViewWidth = 10

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
      currentViewHeight = viewHeight
      currentViewWidth = viewWidth
      // Keep the logo visually parked at the bottom-right, even with a fullscreen canvas.
      logoGroup.position.set(viewWidth * 0.35, -viewHeight * 0.31, 0)
    }

    handleResize()

    let animationFrameId = 0
    let isTabVisible = document.visibilityState === 'visible'
    let burstStartTime = -100
    const burstDuration = 2.4
    let streakAfterglow = 0
    let isBurstClickLocked = false
    let burstClickCount = 0
    let easterStartTime = -100
    const easterDuration = 11
    const easterAssembleEnd = 2.8
    const easterSpinEnd = 8.2
    let easterCenterRandX = 0
    let easterCenterRandY = 0
    let easterMotionSeed = 0
    let easterRoamFreqX = 1.02
    let easterRoamFreqY = 1.26
    let easterRoamMix = 0.22
    let easterNameCenterX = 0
    let easterNameCenterY = 0
    let easterNameRadius = 1
    const initialLoadTime = performance.now() * 0.001
    let hasBurstBeenClicked = false
    let hasAutoBurstFired = false
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
    const cameraLocal = new THREE.Vector3()
    const trailTangent = new THREE.Vector3()
    const trailDir = new THREE.Vector3()
    const trailView = new THREE.Vector3()
    const trailSide = new THREE.Vector3()
    const trailUp = new THREE.Vector3()
    const sparkleRadial = new THREE.Vector3()
    const trailVertexA = new THREE.Vector3()
    const trailVertexB = new THREE.Vector3()
    const filamentPoint = new THREE.Vector3()
    const filamentVertexA = new THREE.Vector3()
    const filamentVertexB = new THREE.Vector3()
    const atomWorldPoint = new THREE.Vector3()
    const easterTargetPoint = new THREE.Vector3()
    const orbitWorldPoint = new THREE.Vector3()
    const circleCenterWorld = new THREE.Vector3()
    const circleWorldPoint = new THREE.Vector3()

    logoGroup.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)

    const worldToScreen = (point: THREE.Vector3) => {
      const projected = point.clone().project(camera)
      const rect = renderer.domElement.getBoundingClientRect()
      return {
        x: rect.left + (projected.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-projected.y * 0.5 + 0.5) * rect.height,
      }
    }

    const isPointerOverLogo = (clientX: number, clientY: number) => {
      const center = worldToScreen(logoGroup.position.clone())
      const edge = worldToScreen(logoGroup.position.clone().add(new THREE.Vector3(2.85, 0, 0)))
      const radius = Math.max(108, Math.hypot(edge.x - center.x, edge.y - center.y))
      const distance = Math.hypot(clientX - center.x, clientY - center.y)

      return distance <= radius
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!isPointerOverLogo(event.clientX, event.clientY)) {
        return
      }

      if (isBurstClickLocked) {
        return
      }

      const now = performance.now() * 0.001
      if (now - burstStartTime < burstDuration) {
        return
      }

      hasBurstBeenClicked = true
      burstStartTime = now
      isBurstClickLocked = true
      burstClickCount += 1
      if (burstClickCount >= 3) {
        burstClickCount = 0
        easterStartTime = now
        easterCenterRandX = Math.random() * 2 - 1
        easterCenterRandY = Math.random() * 2 - 1
        easterMotionSeed = Math.random() * Math.PI * 2
        easterRoamFreqX = 0.86 + Math.random() * 0.9
        easterRoamFreqY = 1.02 + Math.random() * 1.02
        easterRoamMix = 0.14 + Math.random() * 0.22

        const nameRect = document.querySelector('.brand-cluster')?.getBoundingClientRect()
        if (nameRect) {
          const cx = nameRect.left + nameRect.width * 0.3
          const cy = nameRect.top + nameRect.height * 0.62
          easterNameCenterX = (cx / window.innerWidth - 0.5) * currentViewWidth
          easterNameCenterY = (0.5 - cy / window.innerHeight) * currentViewHeight
          const rx = (nameRect.width * 0.62 / window.innerWidth) * currentViewWidth
          const ry = (nameRect.height * 1.08 / window.innerHeight) * currentViewHeight
          easterNameRadius = Math.max(0.72, Math.min(1.7, Math.max(rx, ry)))
        }
      }
    }

    const animate = (time: number) => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const t = time * 0.001
      const easterElapsed = t - easterStartTime
      const easterActive = easterElapsed >= 0 && easterElapsed <= easterDuration
      if (!hasBurstBeenClicked && !hasAutoBurstFired && t - initialLoadTime >= 5) {
        burstStartTime = t
        hasAutoBurstFired = true
      }

      const burstElapsed = t - burstStartTime
      let burstProgress = 0

      let burstStrength = 0
      if (burstElapsed >= 0 && burstElapsed <= burstDuration) {
        const progress = burstElapsed / burstDuration
        burstProgress = progress

        if (progress < 0.18) {
          const fastOut = progress / 0.18
          burstStrength = 1 - Math.pow(1 - fastOut, 3)
        } else {
          const backProgress = (progress - 0.18) / 0.82
          burstStrength = Math.max(0, 1 - Math.pow(backProgress, 1.12))
        }
      }
      streakAfterglow = Math.max(streakAfterglow * 0.92, burstStrength)
      const effectStrength = Math.max(burstStrength, streakAfterglow)
      const easterIntro = easterActive ? THREE.MathUtils.smoothstep(easterElapsed, 0.02, 0.65) : 0
      const easterReturnProgress =
        easterActive && easterElapsed > easterSpinEnd
          ? THREE.MathUtils.smoothstep(easterElapsed, easterSpinEnd, easterDuration)
          : 0
      const trailEffectStrength = easterActive
        ? Math.max(effectStrength, 0.68 * easterIntro * (1 - easterReturnProgress))
        : effectStrength
      const isBurstFullyFinished = burstElapsed > burstDuration && effectStrength < 0.012
      if (isBurstClickLocked && isBurstFullyFinished) {
        isBurstClickLocked = false
      }

      nucleus.getWorldPosition(nucleusWorld)
      cameraDirFromCenter.copy(camera.position).sub(nucleusWorld).normalize()
      cameraLocal.copy(camera.position)
      logoGroup.worldToLocal(cameraLocal)
      if (easterActive) {
        logoGroup.updateMatrixWorld(false)
      }

      const atomCount = atomOrbitData.length
      const easterCircleRadius = Math.min(1.12, Math.max(0.62, Math.min(currentViewWidth, currentViewHeight) * 0.105))
      let easterFocusRadius = easterCircleRadius
      let easterCircleCenterX = 0
      let easterCircleCenterY = 0
      let easterCircleAngleOffset = 0

      if (easterActive) {
        const safeMargin = easterCircleRadius + 0.32
        const randomBaseX = easterCenterRandX * (currentViewWidth * 0.33)
        const randomBaseY = easterCenterRandY * (currentViewHeight * 0.29)
        const assembleMotionGate = THREE.MathUtils.clamp(easterElapsed / Math.max(easterAssembleEnd, 0.001), 0, 1)
        const roamGate = THREE.MathUtils.smoothstep(assembleMotionGate, 0.1, 0.94) * easterIntro
        const maxSpanX = Math.max(0.18, currentViewWidth * 0.5 - safeMargin)
        const maxSpanY = Math.max(0.18, currentViewHeight * 0.5 - safeMargin)
        const spinProgress = THREE.MathUtils.clamp(
          (easterElapsed - easterAssembleEnd) / Math.max(easterSpinEnd - easterAssembleEnd, 0.001),
          0,
          1,
        )
        const roamX =
          (Math.sin(t * easterRoamFreqX + easterMotionSeed) * (0.82 - easterRoamMix * 0.35) +
            Math.sin(t * (easterRoamFreqX * 1.84) + easterMotionSeed * 1.6) * easterRoamMix) *
          (maxSpanX * 0.98)
        const roamY =
          (Math.cos(t * easterRoamFreqY + easterMotionSeed * 0.8) * (0.78 - easterRoamMix * 0.3) +
            Math.sin(t * (easterRoamFreqY * 1.65) + easterMotionSeed * 1.4) * (easterRoamMix + 0.06)) *
          (maxSpanY * 0.98)

        const centerX = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(randomBaseX, roamX, roamGate),
          -maxSpanX,
          maxSpanX,
        )
        const centerY = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(-currentViewHeight * 0.08 + randomBaseY, roamY, roamGate),
          -maxSpanY,
          maxSpanY,
        )
        const focusIn = THREE.MathUtils.smootherstep(spinProgress, 0.22, 0.5)
        const focusOut = 1 - THREE.MathUtils.smootherstep(spinProgress, 0.68, 0.96)
        const focusGate = focusIn * focusOut
        const focusDriftX = Math.sin(t * easterRoamFreqX * 1.15 + easterMotionSeed) * 0.22
        const focusDriftY = Math.cos(t * easterRoamFreqY * 1.05 + easterMotionSeed * 0.9) * 0.16
        const focusedCenterX = THREE.MathUtils.clamp(easterNameCenterX + focusDriftX, -maxSpanX, maxSpanX)
        const focusedCenterY = THREE.MathUtils.clamp(easterNameCenterY + focusDriftY, -maxSpanY, maxSpanY)

        easterCircleCenterX = focusGate > 0.001 ? THREE.MathUtils.lerp(centerX, focusedCenterX, focusGate) : centerX
        easterCircleCenterY = focusGate > 0.001 ? THREE.MathUtils.lerp(centerY, focusedCenterY, focusGate) : centerY
        easterFocusRadius = THREE.MathUtils.lerp(easterCircleRadius, easterNameRadius * 1.08, focusGate)

        const circleOmega = (Math.PI * 4) / Math.max(easterSpinEnd, 0.001)
        easterCircleAngleOffset = Math.max(0, easterElapsed) * circleOmega
      }

      atomOrbitData.forEach((item, index) => {
        const theta = t * item.config.speed + item.config.phase
        const burstScale = 1 + burstStrength * (6.3 + index * 1.2)
        item.localPoint.set(
          Math.cos(theta) * item.config.radius * burstScale,
          Math.sin(theta) * item.config.radius * item.config.ellipseY * burstScale,
          0,
        )

        orbitWorldPoint.copy(item.localPoint).applyQuaternion(item.tiltQuaternion).add(item.config.centerOffset)
        atomWorldPoint.copy(orbitWorldPoint)
        const worldPoint = atomWorldPoint

        const isEasterAtom = easterActive

        if (isEasterAtom) {
          const baseAngle = (index / Math.max(atomCount, 1)) * Math.PI * 2
          const circleAngle = baseAngle + easterCircleAngleOffset
          circleCenterWorld.set(easterCircleCenterX, easterCircleCenterY, 0)

          if (easterElapsed <= easterAssembleEnd) {
            const assemble = THREE.MathUtils.smootherstep(easterElapsed, 0.08, easterAssembleEnd)
            const settleRadius = THREE.MathUtils.lerp(easterCircleRadius * 1.5, easterFocusRadius, assemble)
            circleWorldPoint.set(
              circleCenterWorld.x + Math.cos(circleAngle) * settleRadius,
              circleCenterWorld.y + Math.sin(circleAngle) * settleRadius,
              0,
            )
            easterTargetPoint.copy(circleWorldPoint)
            logoGroup.worldToLocal(easterTargetPoint)
            worldPoint.lerp(easterTargetPoint, assemble)
          } else if (easterElapsed <= easterSpinEnd) {
            circleWorldPoint.set(
              circleCenterWorld.x + Math.cos(circleAngle) * easterFocusRadius,
              circleCenterWorld.y + Math.sin(circleAngle) * easterFocusRadius,
              0,
            )
            easterTargetPoint.copy(circleWorldPoint)
            logoGroup.worldToLocal(easterTargetPoint)
            worldPoint.copy(easterTargetPoint)
          } else {
            const returnProgress = THREE.MathUtils.smoothstep(easterElapsed, easterSpinEnd, easterDuration)
            const dispersePhase = THREE.MathUtils.smoothstep(easterElapsed, easterSpinEnd, easterSpinEnd + 0.6)
            circleWorldPoint.set(
              circleCenterWorld.x + Math.cos(circleAngle) * easterCircleRadius,
              circleCenterWorld.y + Math.sin(circleAngle) * easterCircleRadius,
              0,
            )
            const disperseAmount = (1 - returnProgress) * dispersePhase * 1.05
            circleWorldPoint.x += Math.cos(baseAngle) * disperseAmount
            circleWorldPoint.y += Math.sin(baseAngle) * disperseAmount
            easterTargetPoint.copy(circleWorldPoint)
            logoGroup.worldToLocal(easterTargetPoint)
            worldPoint.copy(easterTargetPoint).lerp(orbitWorldPoint, returnProgress)
          }
        }
        item.atom.position.copy(worldPoint)
        item.glow.position.copy(worldPoint)

        if (isEasterAtom && easterElapsed <= easterSpinEnd) {
          // Keep clear trails while atoms are assembled/spinning in circle.
          item.trailHistory[0].copy(worldPoint)
          for (let p = trailPointCount - 1; p >= 1; p -= 1) {
            item.trailHistory[p].lerp(item.trailHistory[p - 1], 0.38)
          }
        } else if (isEasterAtom && easterElapsed > easterSpinEnd && easterElapsed <= easterDuration) {
          // Keep trails attached during circle exit to avoid a visual burst/explosion.
          item.trailHistory[0].copy(worldPoint)
          for (let p = trailPointCount - 1; p >= 1; p -= 1) {
            item.trailHistory[p].lerp(item.trailHistory[p - 1], 0.32)
          }
        } else if (effectStrength > 0.02) {
          item.trailHistory[0].copy(worldPoint)
          for (let p = trailPointCount - 1; p >= 1; p -= 1) {
            item.trailHistory[p].lerp(item.trailHistory[p - 1], 0.48)
          }
        } else {
          for (let p = 0; p < trailPointCount; p += 1) {
            item.trailHistory[p].lerp(worldPoint, 0.14)
          }
        }

        for (let p = 0; p < trailPointCount; p += 1) {
          const point = item.trailHistory[p]
          const prev = item.trailHistory[Math.max(0, p - 1)]
          const next = item.trailHistory[Math.min(trailPointCount - 1, p + 1)]

          trailTangent.subVectors(next, prev)
          if (trailTangent.lengthSq() < 1e-6) {
            trailTangent.set(1, 0, 0)
          }

          trailView.subVectors(cameraLocal, point)
          trailSide.crossVectors(trailTangent, trailView)
          if (trailSide.lengthSq() < 1e-6) {
            trailSide.set(0, 1, 0)
          }
          trailSide.normalize()

          const taper = 1 - p / Math.max(trailPointCount - 1, 1)
          const halfWidth = (0.006 + taper * 0.06) * (0.28 + burstStrength * 1.9)

          trailVertexA.copy(point).addScaledVector(trailSide, halfWidth)
          trailVertexB.copy(point).addScaledVector(trailSide, -halfWidth)

          const left = p * 2 * 3
          const right = left + 3

          item.trailPositions[left] = trailVertexA.x
          item.trailPositions[left + 1] = trailVertexA.y
          item.trailPositions[left + 2] = trailVertexA.z
          item.trailPositions[right] = trailVertexB.x
          item.trailPositions[right + 1] = trailVertexB.y
          item.trailPositions[right + 2] = trailVertexB.z
        }

        const trailPositionAttribute = item.trailGeometry.attributes.position as THREE.BufferAttribute
        trailPositionAttribute.needsUpdate = true
        item.trailMaterial.opacity = trailEffectStrength * (isDarkTheme ? 0.62 : 0.7)

        const isEffectsActive = effectStrength > 0.01
        if (!isEffectsActive) {
          item.sparkleData.forEach((sparkle) => {
            sparkle.sparkleMaterial.opacity = 0
          })
          item.filamentData.forEach((filament) => {
            filament.filamentMaterial.opacity = 0
            filament.sparkles.forEach((sparkle) => {
              sparkle.sparkleMaterial.opacity = 0
            })
          })
        }

        if (isEffectsActive) {
          item.sparkleData.forEach((sparkle, sparkleIndex) => {
          const trailIndex = Math.min(trailPointCount - 1, sparkle.trailOffset)
          const basePoint = item.trailHistory[trailIndex]
          const prevPoint = item.trailHistory[Math.max(0, trailIndex - 1)]
          const trailTaper = 1 - trailIndex / Math.max(trailPointCount - 1, 1)
          const trailHalfWidth = (0.006 + trailTaper * 0.06) * (0.28 + burstStrength * 1.9)

          trailDir.subVectors(basePoint, prevPoint)
          if (trailDir.lengthSq() < 1e-6) {
            trailDir.set(1, 0, 0)
          }
          trailDir.normalize()

          trailView.subVectors(cameraLocal, basePoint)
          trailSide.crossVectors(trailDir, trailView)
          if (trailSide.lengthSq() < 1e-6) {
            trailSide.set(0, 1, 0)
          }
          trailSide.normalize()

          trailUp.crossVectors(trailSide, trailDir)
          if (trailUp.lengthSq() < 1e-6) {
            trailUp.set(0, 0, 1)
          }
          trailUp.normalize()

          const orbitAngle = t * sparkle.orbitSpeed + sparkle.phase
          sparkleRadial
            .copy(trailSide)
            .multiplyScalar(Math.cos(orbitAngle))
            .addScaledVector(trailUp, Math.sin(orbitAngle))
            .normalize()

          const baseTwinkle = 0.16 + 0.84 * Math.pow(Math.max(0, Math.sin(t * sparkle.blinkRate + sparkle.pulseSeed)), 2.2)
          const flashBurst = Math.max(0, Math.sin(t * (sparkle.blinkRate * 1.7) + sparkle.phase * 1.9))
          const flashBoost = Math.pow(flashBurst, 7)
          const twinkle = Math.min(1, baseTwinkle + flashBoost * 1.8)
          const introGate = THREE.MathUtils.smoothstep(burstProgress, 0.08, 0.32)
          const visibility = Math.min(
            1,
            burstStrength * introGate * (0.8 + twinkle * 2.1) * (isDarkTheme ? 1.35 : 1.55),
          )
          const driftBack = 0.01 + burstStrength * (0.045 + sparkleIndex * 0.002)
          const shellPulse = 0.75 + 0.25 * Math.sin(t * 7.5 + sparkle.driftSeed)
          const haloRadius = trailHalfWidth * (sparkle.radiusFactor + sparkle.shellOffset) * shellPulse

          sparkle.sparkle.position
            .copy(basePoint)
            .addScaledVector(trailDir, -driftBack)
            .addScaledVector(sparkleRadial, haloRadius)

          const sparkleScale = 0.2 + burstStrength * (0.44 + twinkle * 0.36)
          sparkle.sparkle.scale.setScalar(sparkleScale)
          sparkle.sparkleMaterial.color.copy(sparkle.warmColor).lerp(sparkle.hotColor, twinkle * 0.9)
          sparkle.sparkleMaterial.opacity = visibility
          })

          item.filamentData.forEach((filament) => {
          for (let p = 0; p < trailPointCount; p += 1) {
            const point = item.trailHistory[p]
            const prev = item.trailHistory[Math.max(0, p - 1)]
            const next = item.trailHistory[Math.min(trailPointCount - 1, p + 1)]

            trailTangent.subVectors(next, prev)
            if (trailTangent.lengthSq() < 1e-6) {
              trailTangent.set(1, 0, 0)
            }

            trailView.subVectors(cameraLocal, point)
            trailSide.crossVectors(trailTangent, trailView)
            if (trailSide.lengthSq() < 1e-6) {
              trailSide.set(0, 1, 0)
            }
            trailSide.normalize()

            trailUp.crossVectors(trailSide, trailTangent)
            if (trailUp.lengthSq() < 1e-6) {
              trailUp.set(0, 0, 1)
            }
            trailUp.normalize()

            const taper = 1 - p / Math.max(trailPointCount - 1, 1)
            const baseHalfWidth = (0.006 + taper * 0.06) * (0.28 + burstStrength * 1.9)
            const headProgress = p / Math.max(trailPointCount - 1, 1)
            const release = 0.7 + THREE.MathUtils.smoothstep(headProgress, 0.05, 0.52) * 0.3
            const waveDrift = Math.sin(t * 1.8 + p * 0.4 + filament.phase) * (0.1 + release * 0.25)
            const helixAngle = t * filament.orbitSpeed + filament.phase + p * 0.2 + waveDrift
            const ringGap = 0.028 + burstStrength * 0.03
            const shellRadius =
              (baseHalfWidth + ringGap + baseHalfWidth * filament.radiusBias * (0.94 + burstStrength * 0.18)) *
              release

            trailDir.copy(trailTangent)
            if (trailDir.lengthSq() < 1e-6) {
              trailDir.set(1, 0, 0)
            }
            trailDir.normalize()
            const atomSurfaceAttach = 0.04 * (1 - release)

            filamentPoint
              .copy(point)
              .addScaledVector(trailDir, atomSurfaceAttach)
              .addScaledVector(trailSide, Math.cos(helixAngle) * shellRadius)
              .addScaledVector(trailUp, Math.sin(helixAngle) * shellRadius)

            const filamentHalfWidth =
              (0.0018 + taper * 0.0062) * filament.widthBias * (0.5 + burstStrength * 1.85)

            filamentVertexA.copy(filamentPoint).addScaledVector(trailSide, filamentHalfWidth)
            filamentVertexB.copy(filamentPoint).addScaledVector(trailSide, -filamentHalfWidth)

            const left = p * 2 * 3
            const right = left + 3
            filament.filamentPositions[left] = filamentVertexA.x
            filament.filamentPositions[left + 1] = filamentVertexA.y
            filament.filamentPositions[left + 2] = filamentVertexA.z
            filament.filamentPositions[right] = filamentVertexB.x
            filament.filamentPositions[right + 1] = filamentVertexB.y
            filament.filamentPositions[right + 2] = filamentVertexB.z
          }

          const filamentPositionAttribute = filament.filamentGeometry.attributes.position as THREE.BufferAttribute
          filamentPositionAttribute.needsUpdate = true
          const glossyPulse = 0.55 + 0.45 * Math.sin(t * (8.5 + filament.sparkleSpin * 2.2) + filament.phase)
          filament.filamentMaterial.color.copy(item.atomMaterial.color)
          filament.filamentMaterial.opacity = burstStrength * (0.5 + glossyPulse * 0.6) * (isDarkTheme ? 1.35 : 1.2)

          filament.sparkles.forEach((sparkle) => {
            const trailIndex = Math.min(trailPointCount - 1, sparkle.trailOffset)
            const basePoint = item.trailHistory[trailIndex]
            const prevPoint = item.trailHistory[Math.max(0, trailIndex - 1)]
            const nextPoint = item.trailHistory[Math.min(trailPointCount - 1, trailIndex + 1)]

            trailDir.subVectors(nextPoint, prevPoint)
            if (trailDir.lengthSq() < 1e-6) {
              trailDir.set(1, 0, 0)
            }
            trailDir.normalize()

            trailView.subVectors(cameraLocal, basePoint)
            trailSide.crossVectors(trailDir, trailView)
            if (trailSide.lengthSq() < 1e-6) {
              trailSide.set(0, 1, 0)
            }
            trailSide.normalize()

            trailUp.crossVectors(trailSide, trailDir)
            if (trailUp.lengthSq() < 1e-6) {
              trailUp.set(0, 0, 1)
            }
            trailUp.normalize()

            const trailTaper = 1 - trailIndex / Math.max(trailPointCount - 1, 1)
            const baseHalfWidth = (0.006 + trailTaper * 0.06) * (0.28 + burstStrength * 1.9)
            const spiralAngle =
              t * (filament.orbitSpeed * filament.sparkleSpin + sparkle.orbitSpeedOffset) +
              filament.phase +
              sparkle.phase +
              Math.sin(t * 1.5 + sparkle.phase * 1.3) * 0.28
            const sparkleRadius =
              baseHalfWidth +
              0.06 +
              burstStrength * 0.12 +
              baseHalfWidth * (filament.radiusBias + sparkle.radiusJitter)

            sparkle.sparkle.position
              .copy(basePoint)
              .addScaledVector(trailDir, -sparkle.driftBack * (0.5 + burstStrength * 1.3))
              .addScaledVector(trailSide, Math.cos(spiralAngle) * sparkleRadius)
              .addScaledVector(trailUp, Math.sin(spiralAngle) * sparkleRadius)

            const twinkle =
              0.3 +
              0.7 *
                Math.pow(Math.max(0, Math.sin(t * sparkle.twinkleRate + sparkle.phase * 1.6)), 3)
            sparkle.sparkle.scale.setScalar(0.055 + burstStrength * (0.14 + twinkle * 0.08))
            sparkle.sparkleMaterial.color.copy(sparkle.warmColor).lerp(item.atomMaterial.color, twinkle * 0.65)
            sparkle.sparkleMaterial.opacity =
              burstStrength * (0.5 + twinkle * 1.3) * (isDarkTheme ? 1.5 : 1.35)
          })
          })
        }

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
        const reflectionShrink = 1 - effectStrength * 0.58

        // Reflection should visually match atom blue intensity.
        spotData.spotMaterial.opacity = frontFacing * proximity * 0.72 * flicker * reflectionShrink
        spotData.spotMaterial.emissiveIntensity = 0.12 + frontFacing * 0.14
        const scale = 0.78 + frontFacing * 0.7
        const reflectionScale = scale * reflectionShrink
        spotData.spot.scale.set(reflectionScale, reflectionScale, reflectionScale * 0.92)

        spotData.trailSpots.forEach((trailSpotData, trailIndex) => {
          if (effectStrength <= 0.01) {
            trailSpotData.trailSpotMaterial.opacity = 0
            return
          }

          const historyIndex = Math.min(trailPointCount - 1, 3 + trailIndex * 4)
          const trailPoint = item.trailHistory[historyIndex]

          if (trailPoint.lengthSq() < 1e-6) {
            trailSpotData.trailSpotMaterial.opacity = 0
            return
          }

          const trailNormal = tempNormal.copy(trailPoint).normalize()
          const trailReflectionRadius = 0.47 - trailIndex * 0.03
          trailSpotData.trailSpot.position.copy(trailNormal.multiplyScalar(trailReflectionRadius))

          trailSpotData.trailSpot.getWorldPosition(spotWorld)
          spotNormalWorld.copy(spotWorld).sub(nucleusWorld).normalize()
          const trailFrontFacing = Math.max(0, spotNormalWorld.dot(cameraDirFromCenter))
          const trailProximity = THREE.MathUtils.clamp(2.15 / Math.max(trailPoint.length(), 0.001), 0.52, 1)
          const tailWeight = 1 - historyIndex / Math.max(trailPointCount - 1, 1)
          const trailOpacity =
            trailFrontFacing *
            trailProximity *
            (0.2 + burstStrength * 0.56) *
            (0.64 + tailWeight * 0.6) *
            (0.88 - trailIndex * 0.18) *
            flicker

          trailSpotData.trailSpotMaterial.opacity = trailOpacity * reflectionShrink
          trailSpotData.trailSpotMaterial.emissiveIntensity = 0.08 + trailFrontFacing * 0.1
          const trailScale = (0.36 + trailFrontFacing * 0.34 - trailIndex * 0.05) * reflectionShrink
          trailSpotData.trailSpot.scale.set(trailScale, trailScale, trailScale * 0.9)
        })
      })

      logoGroup.rotation.x =
        t * spinSpeed.x * spinDirection.x + Math.sin(t * wobbleFreq.x) * 0.18
      logoGroup.rotation.y =
        t * spinSpeed.y * spinDirection.y + Math.cos(t * wobbleFreq.y) * 0.16
      logoGroup.rotation.z =
        t * spinSpeed.z * spinDirection.z + Math.sin(t * wobbleFreq.z) * 0.11

      const lightPulse = Math.sin(t * 1.12) * 0.5 + 0.5
      const shadowPulse = Math.sin(t * 0.86 + 0.4) * 0.5 + 0.5
      if (isDarkTheme) {
        keyLight.intensity = 0.38 + lightPulse * 0.03
        rimLight.intensity = 0.22 + lightPulse * 0.03
        topFill.intensity = 0.18 + lightPulse * 0.01
        frontFill.intensity = 0.1 + lightPulse * 0.008
      } else {
        keyLight.intensity = 1.4 + lightPulse * 0.55
        rimLight.intensity = 0.7 + lightPulse * 0.3
        topFill.intensity = 0.62 + lightPulse * 0.26
        frontFill.intensity = 0.42 + lightPulse * 0.18
      }
      metalMaterial.emissiveIntensity = 0.08 + lightPulse * 0.08
      ringMaterial.emissiveIntensity = 0.14 + lightPulse * 0.16
      nucleusMaterial.emissiveIntensity = isDarkTheme ? 0.002 + lightPulse * 0.004 : 0.04 + lightPulse * 0.06
      atomOrbitData.forEach((atomData) => {
        atomData.atomMaterial.emissiveIntensity = 0.16 + lightPulse * 0.15
      })
      groundShadow.position.x = logoGroup.position.x
      groundShadow.position.y = logoGroup.position.y - 1.66
      groundShadowMaterial.opacity = 0.36 + shadowPulse * 0.2
      groundShadow.scale.set(4.9 + shadowPulse * 0.5, 1.8 + shadowPulse * 0.2, 1)

      renderer.render(scene, camera)

      animationFrameId = requestAnimationFrame(animate)
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
      themeObserver.disconnect()

      scene.remove(logoGroup)
      scene.remove(ambientLight)
      scene.remove(keyLight)
      scene.remove(rimLight)
      scene.remove(topFill)
      scene.remove(frontFill)
      scene.remove(groundShadow)

      pmrem.dispose()
      envTexture.dispose()
      trailAlphaTexture.dispose()
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
