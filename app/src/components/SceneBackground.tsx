/**
 * SceneBackground — fullscreen GLSL shader background.
 *
 * Single-pass render: one ortho quad covering the entire viewport.
 * Four SDF blobs drift slowly across the screen and blend via smooth-minimum.
 * The accent hue is picked randomly at module load so each reload has a
 * distinct color identity. Theme (dark/light) crossfades via a lerped uniform.
 *
 * Canvas is sized via ResizeObserver on the host div — zero black-bar issues.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Pick one accent hue randomly at module init — changes every page reload.
const ACCENTS = [
  [0.231, 0.510, 0.965], // blue    #3b82f6
  [0.024, 0.714, 0.831], // cyan    #06b6d4
  [0.545, 0.361, 0.965], // violet  #8b5cf6
  [0.957, 0.247, 0.369], // rose    #f43f5e
  [0.961, 0.620, 0.043], // amber   #f59e0b
  [0.063, 0.725, 0.506], // green   #10b981
] as const
const SEED_COLOR = ACCENTS[Math.floor(Math.random() * ACCENTS.length)]

// ---- Vertex: NDC passthrough --------------------------------------------------

const VERT = /* glsl */`
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

// ---- Fragment: animated gradient blobs ----------------------------------------

const FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform float uDark;       // 0.0 = light, 1.0 = dark, smoothly interpolated
  uniform vec3  uAccent;     // main hue chosen at page load
  uniform vec2  uResolution;

  // Polynomial smooth-minimum — blends SDF blobs organically
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }

  // Rotate hue by angle (radians) in RGB — cheap approximation
  vec3 hueShift(vec3 col, float angle) {
    float s = sin(angle), c = cos(angle);
    mat3 M = mat3(
      c + (1.0-c)/3.0,         (1.0-c)/3.0 - s*0.577,   (1.0-c)/3.0 + s*0.577,
      (1.0-c)/3.0 + s*0.577,   c + (1.0-c)/3.0,         (1.0-c)/3.0 - s*0.577,
      (1.0-c)/3.0 - s*0.577,   (1.0-c)/3.0 + s*0.577,   c + (1.0-c)/3.0
    );
    return clamp(M * col, 0.0, 1.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    float ar = uResolution.x / uResolution.y;
    vec2 p   = vec2(uv.x * ar, uv.y);
    float t  = uTime * 0.10;

    // Four blob centers
    vec2 c1 = vec2((0.18 + 0.17 * sin(t * 0.71))        * ar, 0.20 + 0.15 * cos(t * 0.58));
    vec2 c2 = vec2((0.80 + 0.13 * cos(t * 0.43))        * ar, 0.75 + 0.16 * sin(t * 0.67));
    vec2 c3 = vec2((0.50 + 0.21 * sin(t * 0.52 + 1.3))  * ar, 0.50 + 0.18 * cos(t * 0.38));
    vec2 c4 = vec2((0.87 + 0.09 * cos(t * 0.63 + 2.1))  * ar, 0.15 + 0.10 * sin(t * 0.80));

    float r = 0.29 * ar;
    float k = 0.30 * ar;

    float d1 = length(p - c1) - r;
    float d2 = length(p - c2) - r * 1.10;
    float d3 = length(p - c3) - r * 0.90;
    float d4 = length(p - c4) - r * 0.72;

    float d    = smin(smin(d1, d2, k), smin(d3, d4, k * 0.85), k * 1.05);
    float glow = exp(-max(d, 0.0) * 3.0 / ar);

    // Derive two sibling hues from the seed accent
    vec3 colA = uAccent;
    vec3 colB = hueShift(uAccent,  1.15); // ~66 deg shift
    vec3 colC = hueShift(uAccent, -0.90); // ~-52 deg shift

    // On light theme, darken the blobs for contrast
    vec3 blobDark  = mix(mix(colA, colC, uv.x), colB, uv.y * 0.55);
    vec3 blobLight = mix(mix(colA * 0.55, colC * 0.55, uv.x), colB * 0.50, uv.y * 0.55);
    vec3 blob      = mix(blobLight, blobDark, uDark);

    // Background tinted with the accent color
    // Dark: very deep tint  |  Light: very pale tint
    vec3 bgDark  = uAccent * 0.055 + vec3(0.008, 0.010, 0.018);
    vec3 bgLight = uAccent * 0.10  + vec3(0.86,  0.88,  0.92);
    vec3 bg      = mix(bgLight, bgDark, uDark);

    float vig      = 1.0 - smoothstep(0.35, 1.3, length((uv - 0.5) * 1.5));
    float strength = mix(0.28, 0.55, uDark);
    float alpha    = glow * strength * vig;

    gl_FragColor = vec4(mix(bg, blob, clamp(alpha, 0.0, 0.90)), 1.0);
  }
`

// ---- Component ----------------------------------------------------------------

export default function SceneBackground({ isDark }: { isDark: boolean }) {
  const mountRef  = useRef<HTMLDivElement>(null)
  const isDarkRef = useRef(isDark)

  useEffect(() => { isDarkRef.current = isDark }, [isDark])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let W = mount.clientWidth  || window.innerWidth
    let H = mount.clientHeight || window.innerHeight

    // Renderer — one quad, no depth needed
    const renderer = new THREE.WebGLRenderer({
      antialias:       false,
      alpha:           false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(W, H)

    const canvas = renderer.domElement
    canvas.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:block'
    mount.appendChild(canvas)

    // Scene: one fullscreen quad, ortho camera
    const scene  = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uDark:       { value: isDarkRef.current ? 1.0 : 0.0 },
        uAccent:     { value: new THREE.Vector3(...SEED_COLOR) },
        uResolution: { value: new THREE.Vector2(W, H) },
      },
      vertexShader:   VERT,
      fragmentShader: FRAG,
      depthWrite: false,
      depthTest:  false,
    })

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat))

    // Resize — the only reliable sizing path
    const ro = new ResizeObserver(() => {
      W = mount.clientWidth  || window.innerWidth
      H = mount.clientHeight || window.innerHeight
      renderer.setSize(W, H)
      mat.uniforms.uResolution.value.set(W, H)
    })
    ro.observe(mount)

    // Animation loop
    let raf = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (document.visibilityState !== 'visible') return

      mat.uniforms.uTime.value = now * 0.001

      // Smooth theme crossfade (lerp ~5 % per frame → ~60 frames = ~1 s)
      const target = isDarkRef.current ? 1.0 : 0.0
      mat.uniforms.uDark.value += (target - mat.uniforms.uDark.value) * 0.05

      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      if (mount.contains(canvas)) mount.removeChild(canvas)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}
    />
  )
}
