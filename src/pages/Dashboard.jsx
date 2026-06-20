import { useEffect, useState } from 'react'

function Dashboard() {
  const [personasCount, setPersonasCount] = useState(0)

  useEffect(() => {
    window.api.personas.getAll().then((data) => setPersonasCount(data.length))
  }, [])

  const metrics = [
    { label: 'Cobros del mes', value: '$0' },
    { label: 'Vencimientos próximos', value: '0' },
    { label: 'Contratos vigentes', value: '0' },
    { label: 'Resúmenes pendientes', value: '0' },
  ]

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="metrics-grid">
        {metrics.map((m) => (
          <div key={m.label} className="metric-card">
            <p className="metric-label">{m.label}</p>
            <p className="metric-value">{m.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <p className="card-title">Próximos vencimientos</p>
        <p className="card-empty">Sin datos cargados todavía.</p>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '13px', color: '#888' }}>
        (Debug: personas en base de datos: {personasCount})
      </p>
    </div>
  )
}

export default Dashboard