import { useEffect, useState } from 'react'

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  const num = Number(n)
  const sign = num < 0 ? '-' : ''
  return sign + '$' + Math.abs(num).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

function LibroDiario() {
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    window.api.libroDiario.getAll().then(setMovimientos)
  }, [])

  const totalIngresos = movimientos.filter((m) => Number(m.Monto) > 0).reduce((acc, m) => acc + Number(m.Monto), 0)
  const totalEgresos = movimientos.filter((m) => Number(m.Monto) < 0).reduce((acc, m) => acc + Number(m.Monto), 0)

  return (
    <div>
      <h1>Libro diario</h1>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
        <div className="metric-card">
          <p className="metric-label">Total ingresos</p>
          <p className="metric-value" style={{ color: '#1e8a4c' }}>{fmtMoney(totalIngresos)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total egresos</p>
          <p className="metric-value" style={{ color: '#c0392b' }}>{fmtMoney(totalEgresos)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Saldo neto</p>
          <p className="metric-value">{fmtMoney(totalIngresos + totalEgresos)}</p>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Movimientos ({movimientos.length})</p>
        {movimientos.length === 0 ? (
          <p className="card-empty">No hay movimientos registrados todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Cuenta</th>
                <th>Entidad</th>
                <th>Categoría</th>
                <th>Medio de pago</th>
                <th>Origen</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.ID_movimiento}>
                  <td>{fmtDate(m.Fecha)}</td>
                  <td>{m.Detalle}</td>
                  <td>{m.cuenta?.Nombre_Cuenta}</td>
                  <td>{m.persona_entidad?.Nombre}</td>
                  <td>{m.subcategoria?.Descripcion}</td>
                  <td>{m.medio_pago?.Descripcion}</td>
                  <td>
                    <span className="badge badge-neutral">{m.Modulo_Origen}</span>
                  </td>
                  <td style={{ textAlign: 'right', color: Number(m.Monto) < 0 ? '#c0392b' : '#1e8a4c', fontWeight: 500 }}>
                    {fmtMoney(m.Monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default LibroDiario