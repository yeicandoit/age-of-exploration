/**
 * 海洋路径规划 — A* 寻路绕过大陆
 */

const CONTINENTS = {
  africa: [
    [35.8,-5.9],[37,10],[33,30],[30,32],[22,36],[12,44],
    [2,45],[-3,40],[-6,39],[-12,40],[-15,40],[-25,35],
    [-34,26],[-34.8,20],[-33,18],[-29,16],[-22,14],
    [-17,12],[-12,13],[-6,12],[0,9],[4,7],[5,1],
    [6,1],[4,-7],[0,-10],[5,-10],[10,-15],[15,-17],
    [20,-17],[25,-15],[30,-10],[35.8,-5.9]
  ],
  europe: [
    [36,-6],[38,-9],[43,-9],[48,-5],[51,1],[54,8],
    [57,10],[60,5],[63,10],[65,14],[70,20],[70,30],
    [65,40],[60,30],[55,28],[50,30],[47,35],[45,30],
    [42,28],[40,26],[38,24],[36,28],[35,25],[37,15],
    [38,13],[40,15],[44,12],[44,8],[43,3],[42,3],[36,-6]
  ],
  asia: [
    [70,30],[72,60],[73,80],[72,100],[70,130],[65,140],
    [60,150],[55,140],[50,130],[45,135],[40,130],[35,129],
    [33,126],[30,122],[25,120],[22,114],[20,110],[10,106],
    [1,104],[-8,110],[-8,115],[-5,120],[0,128],[5,127],
    [10,125],[15,120],[22,114],[25,120],[30,122]
  ],
  india: [
    [30,68],[25,68],[23,70],[20,73],[15,74],[10,76],
    [8,77],[10,80],[15,80],[20,87],[22,89],[25,90],
    [28,88],[30,80],[30,68]
  ],
  northAmerica: [
    [70,-165],[65,-168],[60,-165],[55,-160],[60,-145],
    [58,-135],[50,-125],[40,-124],[30,-118],[25,-110],
    [20,-105],[15,-92],[10,-84],[8,-77],[10,-75],
    [18,-77],[20,-87],[25,-80],[30,-82],[35,-75],
    [40,-74],[45,-67],[47,-53],[52,-56],[55,-60],
    [60,-65],[63,-75],[70,-85],[72,-95],[70,-120],
    [70,-140],[70,-165]
  ],
  southAmerica: [
    [10,-75],[12,-72],[10,-62],[7,-60],[5,-52],[0,-50],
    [-5,-35],[-10,-37],[-15,-39],[-23,-43],[-30,-50],
    [-35,-57],[-40,-62],[-45,-66],[-50,-70],[-55,-68],
    [-53,-70],[-46,-75],[-40,-73],[-30,-71],[-20,-70],
    [-15,-75],[-5,-81],[0,-80],[5,-77],[8,-77],[10,-75]
  ],
  australia: [
    [-11,132],[-14,127],[-18,122],[-22,114],[-28,114],
    [-32,116],[-35,117],[-35,137],[-38,145],[-37,150],
    [-33,152],[-28,153],[-23,150],[-18,146],[-15,145],
    [-12,142],[-11,136],[-11,132]
  ],
}

function pointInPolygon(lat, lng, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i]
    const [yj, xj] = polygon[j]
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

function isLand(lat, lng) {
  for (const poly of Object.values(CONTINENTS)) {
    if (pointInPolygon(lat, lng, poly)) return true
  }
  return false
}

const GRID_STEP = 5
const LAT_MIN = -72
const LAT_MAX = 76
const LNG_MIN = -180
const LNG_MAX = 180

function snapToGrid(v) {
  return Math.round(v / GRID_STEP) * GRID_STEP
}

function nodeKey(lat, lng) {
  return `${lat},${lng}`
}

function haversine(lat1, lng1, lat2, lng2) {
  const toRad = Math.PI / 180
  const dLat = (lat2 - lat1) * toRad
  const dLng = (lng2 - lng1) * toRad
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 180 / Math.PI
}

function segmentCrossesLand(lat1, lng1, lat2, lng2) {
  const samples = 10
  for (let i = 1; i < samples; i++) {
    const t = i / samples
    const lat = lat1 + (lat2 - lat1) * t
    const lng = lng1 + (lng2 - lng1) * t
    if (isLand(lat, lng)) return true
  }
  return false
}

// 获取邻居 — allowedKeys 中的节点即使在陆地上也允许通行
function getNeighbors(lat, lng, allowedKeys) {
  const neighbors = []
  const dirs = [
    [GRID_STEP, 0], [-GRID_STEP, 0],
    [0, GRID_STEP], [0, -GRID_STEP],
    [GRID_STEP, GRID_STEP], [GRID_STEP, -GRID_STEP],
    [-GRID_STEP, GRID_STEP], [-GRID_STEP, -GRID_STEP],
  ]
  for (const [dlat, dlng] of dirs) {
    let nlat = lat + dlat
    let nlng = lng + dlng
    if (nlng > LNG_MAX) nlng -= 360
    if (nlng < LNG_MIN) nlng += 360
    if (nlat < LAT_MIN || nlat > LAT_MAX) continue
    const key = nodeKey(nlat, nlng)
    // 允许起点/终点所在的陆地节点通行
    if (!allowedKeys.has(key) && isLand(nlat, nlng)) continue
    neighbors.push([nlat, nlng])
  }
  return neighbors
}

function astar(startLat, startLng, endLat, endLng) {
  const sLat = snapToGrid(startLat)
  const sLng = snapToGrid(startLng)
  const eLat = snapToGrid(endLat)
  const eLng = snapToGrid(endLng)

  const startKey = nodeKey(sLat, sLng)
  const endKey = nodeKey(eLat, eLng)

  if (startKey === endKey) return [[startLat, startLng], [endLat, endLng]]

  // 起点和终点即使在陆地上也允许通行（港口在海岸线上）
  const allowedKeys = new Set([startKey, endKey])

  // 用 parentKey 回溯而不是对象引用
  const nodes = new Map()   // key -> { lat, lng, g, f, parentKey }
  const openKeys = new Set()
  const closedKeys = new Set()

  const h = (lat, lng) => haversine(lat, lng, eLat, eLng)

  nodes.set(startKey, { lat: sLat, lng: sLng, g: 0, f: h(sLat, sLng), parentKey: null })
  openKeys.add(startKey)

  let iterations = 0
  const MAX_ITER = 4000

  while (openKeys.size > 0 && iterations < MAX_ITER) {
    iterations++

    // 找 f 最小
    let bestKey = null, bestF = Infinity
    for (const key of openKeys) {
      const n = nodes.get(key)
      if (n.f < bestF) { bestF = n.f; bestKey = key }
    }

    openKeys.delete(bestKey)
    closedKeys.add(bestKey)
    const current = nodes.get(bestKey)

    // 到达终点
    if (bestKey === endKey) {
      const path = []
      let key = bestKey
      while (key !== null) {
        const n = nodes.get(key)
        path.unshift([n.lat, n.lng])
        key = n.parentKey
      }
      path[0] = [startLat, startLng]
      path[path.length - 1] = [endLat, endLng]
      return path
    }

    for (const [nlat, nlng] of getNeighbors(current.lat, current.lng, allowedKeys)) {
      const nKey = nodeKey(nlat, nlng)
      if (closedKeys.has(nKey)) continue

      const tentativeG = current.g + haversine(current.lat, current.lng, nlat, nlng)

      if (openKeys.has(nKey)) {
        const existing = nodes.get(nKey)
        if (tentativeG < existing.g) {
          existing.g = tentativeG
          existing.f = tentativeG + h(nlat, nlng)
          existing.parentKey = bestKey
        }
      } else {
        nodes.set(nKey, {
          lat: nlat, lng: nlng,
          g: tentativeG,
          f: tentativeG + h(nlat, nlng),
          parentKey: bestKey,
        })
        openKeys.add(nKey)
      }
    }
  }

  // 寻路失败，返回直线
  return [[startLat, startLng], [endLat, endLng]]
}

/**
 * 两点间海洋航线：直线不穿陆地就走直线，否则 A* 绕行
 */
export function findOceanRoute(lat1, lng1, lat2, lng2) {
  if (!segmentCrossesLand(lat1, lng1, lat2, lng2)) {
    return [[lat1, lng1], [lat2, lng2]]
  }
  return astar(lat1, lng1, lat2, lng2)
}

/**
 * 完整航线的海洋路径
 */
export function computeFullOceanRoute(routes) {
  if (!routes || routes.length < 2) {
    return routes ? routes.map(r => [r.lat, r.lng]) : []
  }

  const fullPath = [[routes[0].lat, routes[0].lng]]

  for (let i = 0; i < routes.length - 1; i++) {
    const segment = findOceanRoute(
      routes[i].lat, routes[i].lng,
      routes[i + 1].lat, routes[i + 1].lng
    )
    for (let j = 1; j < segment.length; j++) {
      fullPath.push(segment[j])
    }
  }

  return fullPath
}
