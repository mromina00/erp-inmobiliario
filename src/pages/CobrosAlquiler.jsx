import { useEffect, useState } from 'react'
import { cobros as cobrosApi } from '../services/api'

function fmtMoney(n) {
  if (!n) return '-'
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

function CobrosAlquiler() {
  const [cobros, setCobros] = useState([])
  const [filtroUnidad, setFiltroUnidad] = useState('')
  const [filtroMes, setFiltroMes] = useState('')

  async function loadAll() {
    const data = await cobrosApi.getAll()
    setCobros(data)
  }

  useEffect(() => { loadAll() }, [])

  const unidades = [...new Set(cobros.map((c) => c.periodo_contrato?.contrato?.unidad?.Nombre_Unidad).filter(Boolean))]
  const meses = [...new Set(cobros.map((c) => c.periodo_contrato?.Mes_Ano).filter(Boolean))].sort().reverse()

  const filtrados = cobros.filter((c) => {
    const unidad = c.periodo_contrato?.contrato?.unidad?.Nombre_Unidad
    const mes = c.periodo_contrato?.Mes_Ano
    if (filtroUnidad && unidad !== filtroUnidad) return false
    if (filtroMes && mes !== filtroMes) return false
    return true
  })

  const totalFiltrado = filtrados.reduce((acc, c) => acc + Number(c.Monto_Pagado || 0), 0)

  return (
    <div>
      <h1>Cobros de alquiler</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: '13px', color: '#555' }}>
          Filtrar por unidad
          <select value={filtroUnidad} onChange={(e) => setFiltroUnidad(e.target.value)} style={{ display: 'block', marginTop: '4px' }}>
            <option value="">Todas</option>
            {unidades.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </label>
        <label style={{ fontSize: '13px', color: '#555' }}>
          Filtrar por mes
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} style={{ display: 'block', marginTop: '4px' }}>
            <option value="">Todos</option>
            {meses.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        {(filtroUnidad || filtroMes) && (
          <button onClick={() => { setFiltroUnidad(''); setFiltroMes('') }}>Limpiar filtros</button>
        )}
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Total filtrado</p>
          <p style={{ fontSize: '20px', fontWeight: 500, margin: 0, color: '#1e8a4c' }}>{fmtMoney(totalFiltrado)}</p>
        </div>
      </div>

      <div className="card">
        <p className="card-title">Cobros registrados ({filtrados.length})</p>
        {filtrados.length === 0 ? (
          <p className="card-empty">No hay cobros registrados todavía.</p>
        ) : (
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha de pago</th>
                <th>Unidad</th>
                <th>Inquilino</th>
                <th>Período</th>
                <th>Imputación</th>
                <th>Cuenta destino</th>
                <th>Nro. Recibo</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr key={c.ID_cobro}>
                  <td>{fmtDate(c.Fecha_Pago)}</td>
                  <td>{c.periodo_contrato?.contrato?.unidad?.Nombre_Unidad || '-'}</td>
                  <td>{c.periodo_contrato?.contrato?.inquilino?.Nombre || '-'}</td>
                  <td>{c.periodo_contrato?.Mes_Ano || '-'}</td>
                  <td>{c.imputacion?.Descripcion || '-'}</td>
                  <td>{c.cuenta_destino?.Nombre_Cuenta || '-'}</td>
                  <td>{c.Nro_Recibo || '-'}</td>
                  <td style={{ textAlign: 'right', color: '#1e8a4c', fontWeight: 500 }}>
                    {fmtMoney(c.Monto_Pagado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default CobrosAlquiler