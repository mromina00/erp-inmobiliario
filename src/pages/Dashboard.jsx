import { useEffect, useState } from 'react'
import { dashboard, vencimientos as vencimientosApi, unidades as unidadesApi } from '../services/api'

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
  const [tablero, setTablero] = useState([])

  useEffect(() => {
    Promise.all([
      dashboard.getMetrics(),
      vencimientosApi.getProximos(),
      unidadesApi.tablero(),
    ]).then(([m, v, t]) => {
      setMetrics(m)
      setProximos(v)
      setTablero(t)
    })
  }, [])

  const ocupadas = tablero.filter(u => u.ID_estado === 'OCUPADA')
  const pagadas = ocupadas.filter(u => u.estado_periodo === 'PAGADO')
  const pendientes = ocupadas.filter(u => u.estado_periodo === 'PENDIENTE')
  const enMora = ocupadas.filter(u => u.estado_periodo === 'EN_MORA')

  const cards = [
    { label: 'Cobros del mes', value: fmtMoney(metrics.totalCobros) },
    { label: 'Períodos pendientes del mes', value: metrics.pendientes },
    { label: 'Contratos vigentes', value: metrics.vigentes },
    { label: 'Vencimientos próximos', value: proximos.length },
  ]

  return (
    <div>
      <h1>Dashboard</h1>

      {/* MÉTRICAS */}
      <div className="metrics-grid">
        {cards.map((c) => (
          <div key={c.label} className="metric-card">
            <p className="metric-label">{c.label}</p>
            <p className="metric-value">{c.value}</p>
          </div>
        ))}
      </div>

      {/* RESUMEN DE COBROS DEL MES */}
      {ocupadas.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p className="card-title" style={{ margin: 0 }}>
              Estado de cobros del mes — {new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, background: '#e3f5e9', color: '#1e8a4c' }}>
                ✓ {pagadas.length} pagados
              </span>
              <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, background: '#fff8e1', color: '#8a6300' }}>
                ⏳ {pendientes.length} pendientes
              </span>
              {enMora.length > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, background: '#fbe5e3', color: '#c0392b' }}>
                  ⚠ {enMora.length} en mora
                </span>
              )}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unidad</th>
                  <th>Inquilino</th>
                  <th>Monto del mes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {ocupadas.map((u) => {
                  const pagado = u.estado_periodo === 'PAGADO'
                  const mora = u.estado_periodo === 'EN_MORA'
                  return (
                    <tr key={u.ID_unidad}>
                      <td style={{ fontWeight: 500 }}>{u.Nombre_Unidad}</td>
                      <td>{u.inquilino || '-'}</td>
                      <td>{u.monto_mes ? fmtMoney(u.monto_mes) : '-'}</td>
                      <td>
                        <span style={{
                          padding: '2px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                          background: pagado ? '#e3f5e9' : mora ? '#fbe5e3' : '#fff8e1',
                          color: pagado ? '#1e8a4c' : mora ? '#c0392b' : '#8a6300',
                        }}>
                          {pagado ? 'Pagado' : mora ? 'En mora' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRÓXIMOS VENCIMIENTOS */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <p className="card-title">Próximos vencimientos (30 días)</p>
        {proximos.length === 0 ? (
          <p className="card-empty">No hay vencimientos en los próximos 30 días.</p>
        ) : (
          <div className="table-wrapper">
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
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard