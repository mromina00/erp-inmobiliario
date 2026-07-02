import { useEffect, useState } from 'react'
import { dashboard, vencimientos as vencimientosApi } from '../services/api'

function fmtMoney(n) {
  if (!n) return '$0'
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

function diasRestantes(fecha) {
  const hoy = new Date()
  const venc = new Date(fecha)
  return Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24))
}

function Dashboard() {
  const [metrics, setMetrics] = useState({ totalCobros: 0, pendientes: 0, vigentes: 0 })
  const [proximos, setProximos] = useState([])

  useEffect(() => {
    Promise.all([
      dashboard.getMetrics(),
      vencimientosApi.getProximos(),
    ]).then(([m, v]) => {
      setMetrics(m)
      setProximos(v)
    })
  }, [])

  const cards = [
    { label: 'Cobros del mes', value: fmtMoney(metrics.totalCobros) },
    { label: 'Períodos pendientes del mes', value: metrics.pendientes },
    { label: 'Contratos vigentes', value: metrics.vigentes },
    { label: 'Vencimientos próximos', value: proximos.length },
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
        <p className="card-title">Próximos vencimientos (30 días)</p>
        {proximos.length === 0 ? (
          <p className="card-empty">No hay vencimientos en los próximos 30 días.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vencimiento</th>
                <th>Detalle</th>
                <th>Monto</th>
                <th>Días</th>
              </tr>
            </thead>
            <tbody>
              {proximos.map((v) => {
                const dias = diasRestantes(v.Fecha_Vencimiento)
                return (
                  <tr key={v.ID_vencimiento}>
                    <td>{fmtDate(v.Fecha_Vencimiento)}</td>
                    <td>{v.Detalle}</td>
                    <td>{fmtMoney(v.Monto_Estimado)}</td>
                    <td style={{ color: dias <= 7 ? '#e67e22' : '#1e8a4c', fontWeight: 500 }}>
                      {dias === 0 ? 'Hoy' : `${dias}d`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Dashboard