import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const GLOBE_RADIUS = 2
const DEG2RAD = Math.PI / 180
const ILLUMINATE_RADIUS = 0.9
const POINT_DELAY = 800
const MAX_LIGHTS = 64

function latLngToVector3(lat, lng, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * DEG2RAD
  const theta = (lng + 180) * DEG2RAD
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// 从3D坐标反算球面角度（用于相机定位）
function vector3ToSpherical(v) {
  const r = v.length()
  const phi = Math.acos(THREE.MathUtils.clamp(v.y / r, -1, 1)) // polar
  const theta = Math.atan2(v.z, v.x) // azimuthal
  return { phi, theta }
}

// ============================================================
// 地球 Shader
// ============================================================
const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vLocalPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vLocalPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const earthFragmentShader = `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uBumpMap;
  uniform vec3 uLightPoints[${MAX_LIGHTS}];
  uniform vec3 uLightColor;
  uniform int uLightCount;
  uniform float uIlluminateRadius;
  uniform float uDarkness;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  varying vec3 vNormal;

  void main() {
    vec4 dayColor = texture2D(uDayMap, vUv);
    vec4 nightColor = texture2D(uNightMap, vUv);
    float totalInfluence = 0.0;
    for (int i = 0; i < ${MAX_LIGHTS}; i++) {
      if (i >= uLightCount) break;
      float dist = distance(vLocalPos, uLightPoints[i]);
      float influence = 1.0 - smoothstep(0.0, uIlluminateRadius, dist);
      totalInfluence = max(totalInfluence, influence);
    }
    vec3 darkBase = nightColor.rgb * uDarkness;
    vec3 litBase = dayColor.rgb * 1.1;
    vec3 glowTint = uLightColor * 0.15;
    vec3 litColor = litBase + glowTint * totalInfluence;
    float t = totalInfluence * totalInfluence * (3.0 - 2.0 * totalInfluence);
    vec3 finalColor = mix(darkBase, litColor, t);
    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    rim = pow(rim, 3.0);
    finalColor += vec3(0.03, 0.06, 0.12) * rim;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// ============================================================
// 地球球体组件
// ============================================================
function EarthSphere({ activePointsLocal, explorerColor }) {
  const matRef = useRef()
  const [dayMap, nightMap, bumpMap] = useLoader(THREE.TextureLoader, [
    '/earth_day.jpg',
    '/earth_night.jpg',
    '/earth_bump.jpg',
  ])

  const uniforms = useMemo(() => ({
    uDayMap: { value: null },
    uNightMap: { value: null },
    uBumpMap: { value: null },
    uLightPoints: { value: new Array(MAX_LIGHTS).fill(null).map(() => new THREE.Vector3()) },
    uLightColor: { value: new THREE.Color('#ffaa44') },
    uLightCount: { value: 0 },
    uIlluminateRadius: { value: ILLUMINATE_RADIUS },
    uDarkness: { value: 0.3 },
    uTime: { value: 0 },
  }), [])

  useEffect(() => {
    if (dayMap && matRef.current) matRef.current.uniforms.uDayMap.value = dayMap
    if (nightMap && matRef.current) matRef.current.uniforms.uNightMap.value = nightMap
    if (bumpMap && matRef.current) matRef.current.uniforms.uBumpMap.value = bumpMap
  }, [dayMap, nightMap, bumpMap])

  useFrame((state) => {
    if (!matRef.current) return
    const u = matRef.current.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uLightCount.value = Math.min(activePointsLocal.length, MAX_LIGHTS)
    for (let i = 0; i < MAX_LIGHTS; i++) {
      if (i < activePointsLocal.length) {
        u.uLightPoints.value[i].copy(activePointsLocal[i])
      }
    }
    if (explorerColor) u.uLightColor.value.set(explorerColor)
  })

  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={earthVertexShader}
        fragmentShader={earthFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

// ============================================================
// 经纬网格
// ============================================================
function GlobeGrid() {
  const lines = useMemo(() => {
    const result = []
    for (let lat = -60; lat <= 60; lat += 30) {
      const points = []
      for (let lng = 0; lng <= 360; lng += 5) {
        points.push(latLngToVector3(lat, lng, GLOBE_RADIUS + 0.003))
      }
      result.push(points)
    }
    for (let lng = 0; lng < 360; lng += 30) {
      const points = []
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToVector3(lat, lng, GLOBE_RADIUS + 0.003))
      }
      result.push(points)
    }
    return result
  }, [])

  return (
    <group>
      {lines.map((points, i) => {
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        return (
          <line key={i} geometry={geometry}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.06} />
          </line>
        )
      })}
    </group>
  )
}

// ============================================================
// 发光点
// ============================================================
function GlowPoint({ position, color, size = 0.04, delay = 0, isActive, onActivate }) {
  const meshRef = useRef()
  const outerRef = useRef()
  const pulseRef = useRef()
  const [visible, setVisible] = useState(false)
  const scaleRef = useRef(0)
  const pulsePhaseRef = useRef(0)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setVisible(true)
        if (onActivate) onActivate()
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
      scaleRef.current = 0
      pulsePhaseRef.current = 0
    }
  }, [isActive, delay])

  useFrame((state, delta) => {
    if (!visible) {
      if (meshRef.current) meshRef.current.scale.setScalar(0)
      if (outerRef.current) outerRef.current.scale.setScalar(0)
      if (pulseRef.current) pulseRef.current.scale.setScalar(0)
      return
    }
    if (scaleRef.current < 1) scaleRef.current = Math.min(scaleRef.current + delta * 3, 1)
    const s = scaleRef.current
    if (meshRef.current) meshRef.current.scale.setScalar(s)
    if (outerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2
      outerRef.current.scale.setScalar(s * pulse)
    }
    if (pulseRef.current) {
      pulsePhaseRef.current += delta * 1.2
      if (pulsePhaseRef.current > 3) pulsePhaseRef.current = 0
      const ps = 1 + pulsePhaseRef.current * 0.8
      pulseRef.current.scale.setScalar(s * ps)
      pulseRef.current.material.opacity = 0.3 * Math.max(0, 1 - pulsePhaseRef.current / 3)
    }
  })

  if (!visible && scaleRef.current === 0) return null

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={outerRef}>
        <sphereGeometry args={[size * 3, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 1.5, size * 2.2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh scale={0.6}>
        <sphereGeometry args={[size * 0.5, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

// ============================================================
// 航线 — 使用海洋寻路绕过大陆
// ============================================================
function RouteLine({ routes, color, isActive }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => { if (!isActive) setProgress(0) }, [isActive])
  useFrame((_, delta) => {
    if (isActive && progress < 1) setProgress(prev => Math.min(prev + delta * 0.4, 1))
  })

  const curvePoints = useMemo(() => {
    if (!routes || routes.length < 2) return []

    const R = GLOBE_RADIUS + 0.012
    const allPoints = []

    // 展开所有路径点（包括 waypoints）
    const expandedPath = []
    for (let i = 0; i < routes.length; i++) {
      expandedPath.push([routes[i].lat, routes[i].lng])
      // 如果有 waypoints，插入到当前点和下一个点之间
      if (routes[i].waypoints && i < routes.length - 1) {
        for (const wp of routes[i].waypoints) {
          expandedPath.push(wp)
        }
      }
    }

    // 将展开的路径转为3D弧线
    for (let i = 0; i < expandedPath.length - 1; i++) {
      const [lat1, lng1] = expandedPath[i]
      const [lat2, lng2] = expandedPath[i + 1]
      const start = latLngToVector3(lat1, lng1, R)
      const end = latLngToVector3(lat2, lng2, R)
      const dist = start.distanceTo(end)

      if (dist < 0.3) {
        const steps = 4
        for (let j = 0; j <= steps; j++) {
          const t = j / steps
          const p = new THREE.Vector3().lerpVectors(start, end, t)
          p.normalize().multiplyScalar(R)
          allPoints.push(p)
        }
      } else {
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
        mid.normalize().multiplyScalar(R + dist * 0.05)
        const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
        allPoints.push(...curve.getPoints(12))
      }
    }

    return allPoints
  }, [routes])

  if (curvePoints.length === 0 || !isActive) return null
  const visibleCount = Math.floor(curvePoints.length * progress)
  const visiblePoints = curvePoints.slice(0, Math.max(visibleCount, 2))
  const geometry = new THREE.BufferGeometry().setFromPoints(visiblePoints)

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.7} linewidth={2} />
    </line>
  )
}


// ============================================================
// 相机自动跟踪控制器
// ============================================================
function CameraTracker({ controlsRef, targetPoint, isTracking }) {
  const targetSpherical = useRef(new THREE.Spherical())
  const isAnimating = useRef(false)

  useEffect(() => {
    if (targetPoint && controlsRef.current && isTracking) {
      // 计算目标点在球面上的方向，相机应该从对面看过来
      const dir = targetPoint.clone().normalize()
      // 相机位置 = 目标方向 * 距离
      const camDist = controlsRef.current.getDistance()
      const targetCamPos = dir.clone().multiplyScalar(camDist)
      targetSpherical.current.setFromVector3(targetCamPos)
      isAnimating.current = true
    }
  }, [targetPoint, isTracking])

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return
    const controls = controlsRef.current
    const cam = controls.object

    // 当前相机球面坐标
    const currentSpherical = new THREE.Spherical().setFromVector3(cam.position)
    const target = targetSpherical.current

    // 平滑插值角度
    const lerpSpeed = 0.03

    // 处理 theta 的环绕（-PI 到 PI）
    let dTheta = target.theta - currentSpherical.theta
    if (dTheta > Math.PI) dTheta -= Math.PI * 2
    if (dTheta < -Math.PI) dTheta += Math.PI * 2

    const newTheta = currentSpherical.theta + dTheta * lerpSpeed
    const newPhi = THREE.MathUtils.lerp(currentSpherical.phi, target.phi, lerpSpeed)
    const newRadius = currentSpherical.radius // 保持距离不变

    // 检查是否接近目标
    if (Math.abs(dTheta) < 0.005 && Math.abs(target.phi - currentSpherical.phi) < 0.005) {
      isAnimating.current = false
    }

    const newPos = new THREE.Vector3().setFromSpherical(
      new THREE.Spherical(newRadius, newPhi, newTheta)
    )
    cam.position.copy(newPos)
    cam.lookAt(0, 0, 0)
    controls.update()
  })

  return null
}

// ============================================================
// 主 Globe 组件
// ============================================================
export default function Globe({ selectedExplorer, explorerData }) {
  const controlsRef = useRef()
  const [activatedIndices, setActivatedIndices] = useState(new Set())
  const [currentTrackPoint, setCurrentTrackPoint] = useState(null)
  // 累积所有历史点亮的坐标（不随航海家切换清空）
  const [historyPoints, setHistoryPoints] = useState([])
  const prevExplorerRef = useRef(null)

  const activeExplorer = useMemo(() => {
    if (!selectedExplorer || !explorerData) return null
    return explorerData.find(e => e.id === selectedExplorer)
  }, [selectedExplorer, explorerData])

  // 切换航海家时：把前一个航海家已激活的点存入历史
  useEffect(() => {
    const prevExplorer = prevExplorerRef.current
    if (prevExplorer && prevExplorer.id !== selectedExplorer) {
      // 把前一个航海家的已激活点加入历史
      setHistoryPoints(prev => {
        const newPoints = [...prev]
        prevExplorer.routes.forEach((route) => {
          newPoints.push(latLngToVector3(route.lat, route.lng, GLOBE_RADIUS))
        })
        return newPoints
      })
    }
    setActivatedIndices(new Set())
    setCurrentTrackPoint(null)
    prevExplorerRef.current = activeExplorer
  }, [selectedExplorer, activeExplorer])

  const handlePointActivate = useCallback((index) => {
    setActivatedIndices(prev => {
      const next = new Set(prev)
      next.add(index)
      return next
    })
    if (activeExplorer) {
      const route = activeExplorer.routes[index]
      if (route) {
        setCurrentTrackPoint(latLngToVector3(route.lat, route.lng, GLOBE_RADIUS))
      }
    }
  }, [activeExplorer])

  // 选择航海家时，先转到第一个点
  useEffect(() => {
    if (activeExplorer && activeExplorer.routes.length > 0) {
      const first = activeExplorer.routes[0]
      setCurrentTrackPoint(latLngToVector3(first.lat, first.lng, GLOBE_RADIUS))
    }
  }, [activeExplorer])

  // 当前航海家已激活的点
  const currentActivePoints = useMemo(() => {
    if (!activeExplorer) return []
    const pts = []
    activeExplorer.routes.forEach((route, i) => {
      if (activatedIndices.has(i)) {
        pts.push(latLngToVector3(route.lat, route.lng, GLOBE_RADIUS))
      }
    })
    return pts
  }, [activeExplorer, activatedIndices])

  // 传给 shader 的全部点亮坐标 = 历史 + 当前
  const allLitPoints = useMemo(() => {
    return [...historyPoints, ...currentActivePoints]
  }, [historyPoints, currentActivePoints])

  const routePoints = useMemo(() => {
    if (!activeExplorer) return []
    return activeExplorer.routes
  }, [activeExplorer])

  // 无选中时缓慢自转
  useFrame((_, delta) => {
    if (!selectedExplorer && controlsRef.current) {
      const controls = controlsRef.current
      const cam = controls.object
      const spherical = new THREE.Spherical().setFromVector3(cam.position)
      spherical.theta += delta * 0.1
      cam.position.setFromSpherical(spherical)
      cam.lookAt(0, 0, 0)
      controls.update()
    }
  })

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
      />
      <ambientLight intensity={0.05} />

      <CameraTracker
        controlsRef={controlsRef}
        targetPoint={currentTrackPoint}
        isTracking={!!selectedExplorer}
      />

      <group>
        <EarthSphere
          activePointsLocal={allLitPoints}
          explorerColor={activeExplorer?.color}
        />
        <GlobeGrid />

        {activeExplorer && (
          <RouteLine
            routes={routePoints}
            color={activeExplorer.color}
            isActive={!!selectedExplorer}
          />
        )}

        {activeExplorer && activeExplorer.routes.map((route, i) => {
          const pos = latLngToVector3(route.lat, route.lng, GLOBE_RADIUS + 0.015)
          return (
            <GlowPoint
              key={`${activeExplorer.id}-${i}`}
              position={[pos.x, pos.y, pos.z]}
              color={activeExplorer.color}
              size={0.035}
              delay={i * POINT_DELAY}
              isActive={!!selectedExplorer}
              onActivate={() => handlePointActivate(i)}
            />
          )
        })}
      </group>
    </>
  )
}

