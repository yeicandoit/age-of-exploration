import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Globe from './components/Globe'
import Sidebar from './components/Sidebar'
import explorers from './data/explorers'

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    position: 'relative',
    background: '#0a0a1a',
    overflow: 'hidden',
  },
  canvasWrap: {
    position: 'absolute',
    top: 0,
    left: '320px',
    right: 0,
    bottom: 0,
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#4a5a8a',
    fontSize: '14px',
    fontFamily: 'sans-serif',
  },
  tooltip: (explorer) => ({
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(10,15,30,0.9)',
    border: `1px solid ${explorer?.color || '#333'}40`,
    borderRadius: '8px',
    padding: '12px 20px',
    color: '#c0c8d8',
    fontSize: '13px',
    fontFamily: "'Segoe UI', 'PingFang SC', sans-serif",
    textAlign: 'center',
    pointerEvents: 'none',
    zIndex: 5,
  }),
}

function LoadingFallback() {
  return <mesh><boxGeometry args={[0.1, 0.1, 0.1]} /><meshBasicMaterial color="#333" /></mesh>
}

export default function App() {
  const [selectedExplorer, setSelectedExplorer] = useState(null)

  const activeExplorer = selectedExplorer
    ? explorers.find(e => e.id === selectedExplorer)
    : null

  return (
    <div style={styles.container}>
      <Sidebar
        explorers={explorers}
        selectedExplorer={selectedExplorer}
        onSelectExplorer={setSelectedExplorer}
      />
      <div style={styles.canvasWrap}>
        <Canvas
          camera={{ position: [0, 1, 5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#0a0a1a' }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <Globe
              selectedExplorer={selectedExplorer}
              explorerData={explorers}
            />
          </Suspense>
        </Canvas>

        {activeExplorer && (
          <div style={styles.tooltip(activeExplorer)}>
            <span style={{ color: activeExplorer.color, fontWeight: 600 }}>
              {activeExplorer.name}
            </span>
            <span style={{ color: '#6a7a9a', margin: '0 8px' }}>·</span>
            <span>{activeExplorer.country}</span>
            <span style={{ color: '#6a7a9a', margin: '0 8px' }}>·</span>
            <span>{activeExplorer.routes.length} 个地点</span>
          </div>
        )}

        {!selectedExplorer && (
          <div style={styles.loading}>
            选择左侧航海家，点亮探索之路
          </div>
        )}
      </div>
    </div>
  )
}
