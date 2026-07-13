import React, { useEffect, useState } from 'react'
import { vencimientos as vencimientosApi, cuentas as cuentasApi, catalogos, libroDiario as libroDiarioApi } from '../services/api'
import MontoInput, { parseMonto } from '../components/MontoInput'
import ConfirmModal from '../components/ConfirmModal'
import LoadingButton from '../components/LoadingButton'
import { toast } from '../components/Toast'

function fmtMoney(n) {
  if (!n) return '-'
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

function estadoCalculado(v) {
  if (v.ID_estado_vencimiento === 'PAGADO') return 'PAGADO'
  const dias = diasRestantes(v.Fecha_Vencimiento)
  return dias < 0 ? 'VENCIDO' : 'PENDIENTE'
}

const estadoBadge = {
  PENDIENTE: 'badge-neutral',
  PAGADO: 'badge-ok',
  VENCIDO: 'badge-danger',
}

const emptyForm = {
  Fecha_Vencimiento: '',
  Detalle: '',
  Monto_Estimado: '',
  Notas: '',
}

function Vencimientos() {
  const [vencimientos, setVencimientos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [mediosPago, setMediosPago] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [pagandoId, setPagandoId] = useState(null)
  const [pagoForm, setPagoForm] = useState({ fecha: '', cuentaId: '', medio: '' })
  const [filtro, setFiltro] = useState('PENDIENTE')
  const [confirmModal, setConfirmModal] = useState(null)

  async function loadAll() {
    const [v, c, mp] = await Promise.all([
      vencimientosApi.getAll(),
      cuentasApi.getAll(),
      catalogos.mediosPago(),
    ])
    setVencimientos(v)
    setCuentas(c)
    setMediosPago(mp)
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const data = {
      Fecha_Vencimiento: form.Fecha_Vencimiento + 'T00:00:00.000Z',
      Detalle: form.Detalle,
      Monto_Estimado: parseMonto(form.Monto_Estimado) || 0,
      ID_estado_vencimiento: 'PENDIENTE',
      Origen_Modulo: 'FIJO_MANUAL',
      Notas: form.Notas || null,
    }
    try {
      if (editingId) {
        await vencimientosApi.update(editingId, data)
        toast('Vencimiento actualizado correctamente')
      } else {
        await vencimientosApi.create(data)
        toast('Vencimiento creado correctamente')
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      loadAll()
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    }
  }

  async function handleMarcarPagado(v) {
    if (!pagoForm.fecha) { toast('Ingresá la fecha de pago', 'warn'); return }
    if (!pagoForm.cuentaId) { toast('Elegí una cuenta', 'warn'); return }
    if (!pagoForm.medio) { toast('Elegí un medio de pago', 'warn'); return }
    try {
      await vencimientosApi.marcarPagado(v.ID_vencimiento, pagoForm.fecha + 'T00:00:00.000Z')
      await libroDiarioApi.crear({
        Fecha: pagoForm.fecha + 'T00:00:00.000Z',
        ID_cuenta: pagoForm.cuentaId,
        ID_persona_entidad: null,
        Detalle: `Pago vencimiento - ${v.Detalle}`,
        Monto: -(Number(v.Monto_Estimado) || 0),
        ID_medio_pago: pagoForm.medio,
        ID_subcategoria_flujo: 'OTROS_INGRESOS',
        Modulo_Origen: 'VENCIMIENTOS',
        ID_referencia_origen: v.ID_vencimiento,
        Conciliado: false,
      })
      toast('Vencimiento marcado como pagado')
      setPagandoId(null)
      setPagoForm({ fecha: '', cuentaId: '', medio: '' })
      loadAll()
    } catch (err) {
      toast(err.message || 'Error al registrar el pago', 'error')
    }
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar este vencimiento?',
      onConfirmar: async () => {
        try {
          await vencimientosApi.delete(id)
          toast('Vencimiento eliminado')
          setConfirmModal(null)
          loadAll()
        } catch (err) {
          toast(err.message || 'Error al eliminar', 'error')
          setConfirmModal(null)
        }
      },
    })
  }

  const vencimientosConEstado = vencimientos.map((v) => ({ ...v, _estado: estadoCalculado(v) }))
  const filtrados = vencimientosConEstado.filter((v) =>
    filtro === 'TODOS' ? true : v._estado === filtro
  )
  const pendientes = vencimientosConEstado.filter((v) => v._estado === 'PENDIENTE')
  const proximos30 = pendientes.filter((v) => diasRestantes(v.Fecha_Vencimiento) <= 30)
  const vencidos = vencimientosConEstado.filter((v) => v._estado === 'VENCIDO')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Vencimientos</h1>
        <button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true) }}>+ Nuevo vencimiento</button>
      </div>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <p className="metric-label">Pendientes totales</p>
          <p className="metric-value">{pendientes.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Próximos 30 días</p>
          <p className="metric-value" style={{ color: proximos30.length > 0 ? '#e67e22' : '#1e8a4c' }}>{proximos30.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Vencidos sin pagar</p>
          <p className="metric-value" style={{ color: vencidos.length > 0 ? '#c0392b' : '#1e8a4c' }}>{vencidos.length}</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar vencimiento' : 'Nuevo vencimiento'}</p>
          <div className="form-grid">
            <label>
              Fecha de vencimiento
              <input type="date" value={form.Fecha_Vencimiento} onChange={(e) => setForm({ ...form, Fecha_Vencimiento: e.target.value })} required />
            </label>
            <label>
              Detalle
              <input value={form.Detalle} onChange={(e) => setForm({ ...form, Detalle: e.target.value })} required />
            </label>
            <MontoInput
              label="Monto estimado"
              value={form.Monto_Estimado}
              onChange={(v) => setForm({ ...form, Monto_Estimado: v })}
            />
          </div>
          <label style={{ display: 'block', marginTop: '12px' }}>
            Notas
            <textarea value={form.Notas} onChange={(e) => setForm({ ...form, Notas: e.target.value })} rows={2} />
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <LoadingButton type="submit">{editingId ? 'Guardar cambios' : 'Crear vencimiento'}</LoadingButton>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        {[
          { key: 'PENDIENTE', label: 'Pendientes' },
          { key: 'VENCIDO', label: 'Vencidos' },
          { key: 'PAGADO', label: 'Pagados' },
          { key: 'TODOS', label: 'Todos' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{ fontWeight: filtro === f.key ? 600 : 400 }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <p className="card-title">
          {filtro === 'TODOS' ? 'Todos' : filtro === 'PENDIENTE' ? 'Pendientes' : filtro === 'PAGADO' ? 'Pagados' : 'Vencidos'} ({filtrados.length})
        </p>
        {filtrados.length === 0 ? (
          <p className="card-empty">No hay vencimientos en esta categoría.</p>
        ) : (
          <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vencimiento</th>
                <th>Detalle</th>
                <th>Monto</th>
                <th>Origen</th>
                <th>Estado</th>
                <th>Días</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((v) => {
                const dias = diasRestantes(v.Fecha_Vencimiento)
                const est = v._estado
                return (
                  <React.Fragment key={v.ID_vencimiento}>
                    <tr style={est === 'VENCIDO' ? { background: '#fff5f5' } : dias <= 7 && est === 'PENDIENTE' ? { background: '#fffbf0' } : undefined}>
                      <td>{fmtDate(v.Fecha_Vencimiento)}</td>
                      <td>{v.Detalle}</td>
                      <td>{fmtMoney(v.Monto_Estimado)}</td>
                      <td><span className="badge badge-neutral">{v.Origen_Modulo}</span></td>
                      <td><span className={`badge ${estadoBadge[est]}`}>{est === 'VENCIDO' ? 'Vencido' : est === 'PAGADO' ? 'Pagado' : 'Pendiente'}</span></td>
                      <td style={{ color: est === 'VENCIDO' ? '#c0392b' : dias <= 7 ? '#e67e22' : '#1e8a4c', fontWeight: 500 }}>
                        {est === 'PAGADO' ? '—' : est === 'VENCIDO' ? `${Math.abs(dias)}d vencido` : dias === 0 ? 'Hoy' : `${dias}d`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {est !== 'PAGADO' && (
                          <button onClick={() => {
                            setPagandoId(v.ID_vencimiento)
                            setPagoForm({ fecha: new Date().toISOString().substring(0, 10), cuentaId: '', medio: '' })
                          }}>
                            Marcar pagado
                          </button>
                        )}{' '}
                        <button onClick={() => handleDelete(v.ID_vencimiento)}>Eliminar</button>
                      </td>
                    </tr>
                    {pagandoId === v.ID_vencimiento && (
                      <tr>
                        <td colSpan={7}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '8px 0', flexWrap: 'wrap' }}>
                            <label style={{ minWidth: '140px' }}>
                              Fecha de pago
                              <input type="date" value={pagoForm.fecha} onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })} />
                            </label>
                            <label style={{ minWidth: '150px' }}>
                              Cuenta
                              <select value={pagoForm.cuentaId} onChange={(e) => setPagoForm({ ...pagoForm, cuentaId: e.target.value })}>
                                <option value="">Seleccionar...</option>
                                {cuentas.map((c) => (
                                  <option key={c.ID_cuenta} value={c.ID_cuenta}>{c.Nombre_Cuenta}</option>
                                ))}
                              </select>
                            </label>
                            <label style={{ minWidth: '150px' }}>
                              Medio de pago
                              <select value={pagoForm.medio} onChange={(e) => setPagoForm({ ...pagoForm, medio: e.target.value })}>
                                <option value="">Seleccionar...</option>
                                {mediosPago.map((m) => (
                                  <option key={m.ID_medio} value={m.ID_medio}>{m.Descripcion}</option>
                                ))}
                              </select>
                            </label>
                            <button onClick={() => handleMarcarPagado(v)}>Confirmar pago</button>
                            <button onClick={() => setPagandoId(null)}>Cancelar</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {confirmModal && (
        <ConfirmModal
          mensaje={confirmModal.mensaje}
          onConfirmar={confirmModal.onConfirmar}
          onCancelar={() => setConfirmModal(null)}
          peligroso
        />
      )}
    </div>
  )
}

export default Vencimientos