import { useEffect, useState } from 'react'

function fmtMoney(n) {
  if (!n) return '$0'
  return '$' + Number(n).toLocaleString('es-AR')
}

function Dashboard() {
  const [metrics, setMetrics] = useState({ totalCobros: 0, pendientes: 0, vigentes: 0 })

  useEffect(() => {
    window.api.dashboard.getMetrics().then(setMetrics)
  }, [])

  const cards = [
    { label: 'Cobros del mes', value: fmtMoney(metrics.totalCobros) },
    { label: 'Períodos pendientes', value: metrics.pendientes },
    { label: 'Contratos vigentes', value: metrics.vigentes },
    { label: 'Resúmenes pendientes', value: '—' },
  ]

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        {cards.map((c) => (
          <div key={c.label} className="metric-card">
            <p className="metric-label">{c.label}</p>
            <p className="metric-value">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <p className="card-title">Próximos vencimientos</p>
        <p className="card-empty">Esta sección se completará cuando implementemos el módulo de Vencimientos.</p>
      </div>
    </div>
  )
}

export default Dashboard