import { useEffect, useState } from 'react'
import { libroDiario as libroDiarioApi, cuentas as cuentasApi, personas as personasApi, catalogos } from '../services/api'
import SelectorPersona from '../components/SelectorPersona'
import MontoInput, { parseMonto } from '../components/MontoInput'
import LoadingButton from '../components/LoadingButton'

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

const emptyForm = {
  Fecha: '',
  ID_cuenta: '',
  ID_persona_entidad: '',
  Detalle: '',
  Monto: '',
  esEgreso: false,
  ID_medio_pago: '',
  ID_subcategoria_flujo: '',
  Notas: '',
}

function LibroDiario() {
  const [movimientos, setMovimientos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [personas, setPersonas] = useState([])
  const [mediosPago, setMediosPago] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function loadAll() {
    const [m, c, p, mp, sc] = await Promise.all([
      libroDiarioApi.getAll(),
      cuentasApi.getAll(),
      personasApi.getAll(),
      catalogos.mediosPago(),
      catalogos.subcategoriasFlujo(),
    ])
    setMovimientos(m)
    setCuentas(c)
    setPersonas(p)
    setMediosPago(mp)
    setSubcategorias(sc)
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const montoRaw = parseMonto(form.Monto) || 0
    const monto = form.esEgreso ? -Math.abs(montoRaw) : Math.abs(montoRaw)
    await libroDiarioApi.crear({
      ID_movimiento: 'LD-' + Date.now(),
      Fecha: form.Fecha + 'T00:00:00.000Z',
      ID_cuenta: form.ID_cuenta,
      ID_persona_entidad: form.ID_persona_entidad || null,
      Detalle: form.Detalle,
      Monto: monto,
      ID_medio_pago: form.ID_medio_pago,
      ID_subcategoria_flujo: form.ID_subcategoria_flujo,
      Modulo_Origen: 'MANUAL',
      Conciliado: false,
      Notas: form.Notas || null,
    })
    setShowForm(false)
    setForm(emptyForm)
    loadAll()
  }

  async function handleDelete(id) {
    await libroDiarioApi.delete(id)
    setConfirmDelete(null)
    loadAll()
  }

  const totalIngresos = movimientos.filter((m) => Number(m.Monto) > 0).reduce((acc, m) => acc + Number(m.Monto), 0)
  const totalEgresos = movimientos.filter((m) => Number(m.Monto) < 0).reduce((acc, m) => acc + Number(m.Monto), 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Libro diario</h1>
        <button onClick={() => { setForm(emptyForm); setShowForm(true) }}>+ Nuevo movimiento</button>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', marginBottom: '1.5rem' }}>
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

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">Nuevo movimiento manual</p>
          <div className="form-grid">
            <label>
              Fecha
              <input type="date" value={form.Fecha} onChange={(e) => setForm({ ...form, Fecha: e.target.value })} required />
            </label>
            <label>
              Cuenta
              <select value={form.ID_cuenta} onChange={(e) => setForm({ ...form, ID_cuenta: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {cuentas.map((c) => <option key={c.ID_cuenta} value={c.ID_cuenta}>{c.Nombre_Cuenta}</option>)}
              </select>
            </label>
            <label>
              Tipo
              <select value={form.esEgreso} onChange={(e) => setForm({ ...form, esEgreso: e.target.value === 'true' })} required>
                <option value="false">Ingreso</option>
                <option value="true">Egreso</option>
              </select>
            </label>
            <MontoInput
              label="Monto"
              value={form.Monto}
              onChange={(v) => setForm({ ...form, Monto: v })}
              required
            />
            <label>
              Medio de pago
              <select value={form.ID_medio_pago} onChange={(e) => setForm({ ...form, ID_medio_pago: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {mediosPago.map((m) => <option key={m.ID_medio} value={m.ID_medio}>{m.Descripcion}</option>)}
              </select>
            </label>
            <label>
              Categoría
              <select value={form.ID_subcategoria_flujo} onChange={(e) => setForm({ ...form, ID_subcategoria_flujo: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {subcategorias.map((s) => <option key={s.ID_subcat} value={s.ID_subcat}>{s.Descripcion}</option>)}
              </select>
            </label>
            <SelectorPersona
              label="Persona / Entidad (opcional)"
              value={form.ID_persona_entidad}
              onChange={(v) => setForm({ ...form, ID_persona_entidad: v })}
              personas={personas}
              onPersonaCreada={loadAll}
              contexto="titular"
            />
          </div>
          <label style={{ display: 'block', marginTop: '12px' }}>
            Detalle
            <input value={form.Detalle} onChange={(e) => setForm({ ...form, Detalle: e.target.value })} required />
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <LoadingButton type="submit">Guardar movimiento</LoadingButton>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

{confirmDelete && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            maxWidth: '460px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
          }}>
            <p style={{ fontWeight: 500, fontSize: '15px', margin: '0 0 8px' }}>⚠️ Confirmar eliminación</p>
            <p style={{ fontSize: '14px', color: '#555', margin: '0 0 1.25rem' }}>
              Este movimiento fue generado automáticamente desde el módulo <strong>{confirmDelete.moduloOrigen}</strong>. Si lo eliminás, el registro original en ese módulo no se va a actualizar. ¿Querés eliminarlo igual?
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ background: '#c0392b', color: '#fff', border: 'none' }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <p className="card-title">Movimientos ({movimientos.length})</p>
        {movimientos.length === 0 ? (
          <p className="card-empty">No hay movimientos registrados todavía.</p>
        ) : (
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Detalle</th>
                <th>Cuenta</th>
                <th>Entidad</th>
                <th>Categoría</th>
                <th>Medio</th>
                <th>Origen</th>
                <th style={{ textAlign: 'right' }}>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.ID_movimiento}>
                  <td>{fmtDate(m.Fecha)}</td>
                  <td>{m.Detalle}</td>
                  <td>{m.cuenta?.Nombre_Cuenta}</td>
                  <td>{m.persona_entidad?.Nombre || '-'}</td>
                  <td>{m.subcategoria?.Descripcion}</td>
                  <td>{m.medio_pago?.Descripcion}</td>
                  <td><span className="badge badge-neutral">{m.Modulo_Origen}</span></td>
                  <td style={{ textAlign: 'right', color: Number(m.Monto) < 0 ? '#c0392b' : '#1e8a4c', fontWeight: 500 }}>
                    {fmtMoney(m.Monto)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={async () => {
                      const result = await libroDiarioApi.verificar(m.ID_movimiento)
                      if (result.tieneOrigen) {
                        setConfirmDelete({ id: m.ID_movimiento, tieneOrigen: true, moduloOrigen: result.moduloOrigen })
                      } else {
                        await libroDiarioApi.delete(m.ID_movimiento)
                        loadAll()
                      }
                    }}>Eliminar</button>
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

export default LibroDiario