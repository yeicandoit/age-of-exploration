import { useState, useMemo } from 'react'
import { countryColors } from '../data/explorers'

const styles = {
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '320px',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(8,12,28,0.95) 0%, rgba(5,8,20,0.98) 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    overflowY: 'auto',
    zIndex: 10,
    fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    color: '#c0c8d8',
  },
  header: {
    padding: '24px 20px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#e8ecf4',
    margin: 0,
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6a7a9a',
    marginTop: '4px',
  },
  countryGroup: {
    padding: '8px 0',
  },
  countryHeader: {
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#8a9aba',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  countryDot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 6px ${color}60`,
    flexShrink: 0,
  }),
  explorerItem: (isSelected, color) => ({
    padding: '10px 20px 10px 36px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: isSelected ? `${color}15` : 'transparent',
    borderLeft: isSelected ? `3px solid ${color}` : '3px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),
  explorerName: (isSelected, color) => ({
    fontSize: '14px',
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? color : '#b0b8c8',
  }),
  explorerNameEn: {
    fontSize: '11px',
    color: '#5a6a8a',
  },
  routeInfo: (color) => ({
    marginTop: '8px',
    padding: '12px 20px 12px 36px',
    borderTop: `1px solid ${color}20`,
  }),
  routeItem: {
    fontSize: '12px',
    padding: '4px 0',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#8a9aba',
  },
  routeYear: (color) => ({
    fontSize: '11px',
    color: color,
    fontWeight: 600,
  }),
}

export default function Sidebar({ explorers, selectedExplorer, onSelectExplorer }) {
  const grouped = useMemo(() => {
    const groups = {}
    explorers.forEach(e => {
      if (!groups[e.country]) groups[e.country] = []
      groups[e.country].push(e)
    })
    return groups
  }, [explorers])

  const selectedData = useMemo(() => {
    if (!selectedExplorer) return null
    return explorers.find(e => e.id === selectedExplorer)
  }, [selectedExplorer, explorers])

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h1 style={styles.title}>🧭 大航海时代</h1>
        <div style={styles.subtitle}>Age of Exploration · 1405-1779</div>
      </div>

      {Object.entries(grouped).map(([country, items]) => {
        const color = countryColors[country] || '#888'
        return (
          <div key={country} style={styles.countryGroup}>
            <div style={styles.countryHeader}>
              <div style={styles.countryDot(color)} />
              {country}
              <span style={{ fontSize: '11px', color: '#4a5a7a' }}>({items.length})</span>
            </div>
            {items.map(explorer => {
              const isSelected = selectedExplorer === explorer.id
              return (
                <div key={explorer.id}>
                  <div
                    style={styles.explorerItem(isSelected, explorer.color)}
                    onClick={() => onSelectExplorer(isSelected ? null : explorer.id)}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={styles.explorerName(isSelected, explorer.color)}>
                      {explorer.name}
                    </span>
                    <span style={styles.explorerNameEn}>{explorer.nameEn}</span>
                  </div>
                  {isSelected && selectedData && (
                    <div style={styles.routeInfo(explorer.color)}>
                      {selectedData.routes.map((r, i) => (
                        <div key={i} style={styles.routeItem}>
                          <span>{r.name}</span>
                          <span style={styles.routeYear(explorer.color)}>{r.year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
