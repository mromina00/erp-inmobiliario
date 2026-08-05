import { useEffect, useState } from 'react'
import { unidades as unidadesApi, edificios as edificiosApi, catalogos, contratos as contratosApi, periodos as periodosApi, cuentas as cuentasApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import LoadingButton from '../components/LoadingButton'
import { toast } from '../components/Toast'
import { validarFormulario, validarRequerido } from '../utils/validaciones'

const emptyForm = {
  Nombre_Unidad: '',
  ID_tipo: '',
  ID_perfil: '',
  ID_edificio: '',
  Piso: '',
  Numero: '',
  Dormitorios: '',
  Direccion: '',
  ID_estado: '',
  Equipamiento: '',
  Notas: '',
}

function fmtMoney(n) {
  if (n === null || n === undefined) return null
  return '$' + Number(n).toLocaleString('es-AR')
}

function estadoBadge(unidad) {
  if (unidad.ID_estado === 'OCUPADA') return { label: 'Ocupada', color: '#1e8a4c', bg: '#e3f5e9' }
  if (unidad.ID_estado === 'LIBRE') return { label: 'Libre', color: '#888', bg: '#f0f0ee' }
  if (unidad.ID_estado === 'NO_DISPONIBLE') return { label: 'No disponible', color: '#c0392b', bg: '#fbe5e3' }
  if (unidad.ID_estado === 'USO_PROPIO') return { label: 'Uso propio', color: '#8a6300', bg: '#fff8e1' }
  return { label: unidad.ID_estado || 'Sin estado', color: '#888', bg: '#f0f0ee' }
}

function colorPeriodo(estado) {
  if (estado === 'PAGADO') return { color: '#1e8a4c', bg: '#e3f5e9' }
  if (estado === 'EN_MORA') return { color: '#c0392b', bg: '#fbe5e3' }
  return { color: '#8a6300', bg: '#fff8e1' }
}

// ============================================================
// VISTA DETALLE DE UNIDAD
// ============================================================
function DetalleUnidad({ unidad, onVolver, edificios }) {
  const [contrato, setContrato] = useState(null)
  const [periodos, setPeriodos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [todos, ctas] = await Promise.all([
          contratosApi.getAll(),
          cuentasApi.getAll(),
        ])
        const vigente = todos.find(c => c.ID_unidad === unidad.ID_unidad && c.ID_estado_contrato === 'VIGENTE')
        setCuentas(ctas)
        if (vigente) {
          setContrato(vigente)
          const ps = await periodosApi.getByContrato(vigente.ID_contrato)
          setPeriodos(ps)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [unidad.ID_unidad])

  const edificio = edificios.find(e => e.ID_edificio === unidad.ID_edificio)
  const badge = estadoBadge(unidad)

  const mesActual = new Date().toISOString().substring(0, 7)
  const periodoMes = periodos.find(p => p.Mes_Ano === mesActual)

  if (loading) return <div style={{ padding: '2rem' }}>Cargando...</div>

  return (
    <div>
      <button onClick={onVolver} style={{ marginBottom: '1rem' }}>← Volver al tablero</button>

      {/* ENCABEZADO */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: '22px' }}>{unidad.Nombre_Unidad}</h1>
            <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
              {edificio ? edificio.Nombre + ' · ' : ''}{unidad.Direccion}
            </p>
          </div>
          <span style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
            fontWeight: 600, background: badge.bg, color: badge.color,
          }}>
            {badge.label}
          </span>
        </div>

        {contrato ? (
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999' }}>Inquilino</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{contrato.inquilino?.Nombre || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999' }}>Inicio contrato</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{contrato.Fecha_Inicio?.substring(0, 10) || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999' }}>Vencimiento</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{contrato.Fecha_Vencimiento?.substring(0, 10) || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999' }}>Alquiler actual</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{fmtMoney(contrato.Monto_Alquiler_Inicial) || '-'}</p>
            </div>
            {periodoMes && (
              <div>
                <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#999' }}>Estado mes actual</p>
                <span style={{
                  padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                  ...colorPeriodo(periodoMes.ID_estado_periodo)
                }}>
                  {periodoMes.ID_estado_periodo === 'PAGADO' ? 'Pagado' : periodoMes.ID_estado_periodo === 'EN_MORA' ? 'En mora' : 'Pendiente'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p style={{ marginTop: '1rem', color: '#aaa', fontSize: '14px' }}>Sin contrato vigente</p>
        )}
      </div>

      {/* TABLA DE PERÍODOS */}
      {periodos.length > 0 && (
        <div className="card">
          <p className="card-title">Tabla de pagos del contrato ({periodos.length} períodos)</p>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Mes</th>
                  <th>Alquiler</th>
                  <th>Expensas</th>
                  <th>Cochera</th>
                  <th>Municipal.</th>
                  <th>Otros</th>
                  <th>Recargo</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => {
                  const total =
                    Number(p.Monto_Alquiler || 0) +
                    Number(p.Monto_Expensas || 0) +
                    Number(p.Monto_Cochera || 0) +
                    Number(p.Monto_Municipalidad || 0) +
                    Number(p.Monto_Otros || 0) +
                    Number(p.Monto_Recargo || 0)
                  const esMesActual = p.Mes_Ano === mesActual
                  const colores = colorPeriodo(p.ID_estado_periodo)
                  return (
                    <tr key={p.ID_periodo_contrato} style={esMesActual ? { background: '#fffbf0', fontWeight: 500 } : undefined}>
                      <td style={{ color: '#aaa', fontSize: '12px' }}>{p.Numero_Cuota}</td>
                      <td>{p.Mes_Ano}{esMesActual && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#8a6300' }}>◀ actual</span>}</td>
                      <td>{fmtMoney(p.Monto_Alquiler) || '-'}</td>
                      <td>{fmtMoney(p.Monto_Expensas) || '-'}</td>
                      <td>{Number(p.Monto_Cochera) > 0 ? fmtMoney(p.Monto_Cochera) : '-'}</td>
                      <td>{Number(p.Monto_Municipalidad) > 0 ? fmtMoney(p.Monto_Municipalidad) : '-'}</td>
                      <td>{Number(p.Monto_Otros) > 0 ? fmtMoney(p.Monto_Otros) : '-'}</td>
                      <td>{Number(p.Monto_Recargo) > 0 ? fmtMoney(p.Monto_Recargo) : '-'}</td>
                      <td style={{ fontWeight: 600 }}>{fmtMoney(total)}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px', fontSize: '12px',
                          fontWeight: 600, ...colores
                        }}>
                          {p.ID_estado_periodo === 'PAGADO' ? 'Pagado' : p.ID_estado_periodo === 'EN_MORA' ? 'En mora' : 'Pendiente'}
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
    </div>
  )
}

// ============================================================
// TABLERO PRINCIPAL
// ============================================================
function Tablero({ onSeleccionar }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await unidadesApi.tablero()
        setItems(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div style={{ padding: '2rem', color: '#aaa' }}>Cargando tablero...</div>

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '8px',
    }}>
      {items.map((u) => {
        const ocupada = u.ID_estado === 'OCUPADA'
        const pagado = u.estado_periodo === 'PAGADO'
        const mora = u.estado_periodo === 'EN_MORA'
        const pendiente = u.estado_periodo === 'PENDIENTE'
        const libre = !ocupada

        let bg = '#f0f0ee'
        let border = '#e0e0de'
        let colorMonto = '#1a1a1a'

        if (libre) { bg = '#f8f8f7'; border = '#e0e0de' }
        else if (pagado) { bg = '#e3f5e9'; border = '#b8e8c8' }
        else if (mora) { bg = '#fbe5e3'; border = '#f5c6c3' }
        else if (pendiente) { bg = '#fff8e1'; border = '#fde7b5' }

        return (
          <button
            key={u.ID_unidad}
            onClick={() => onSeleccionar(u)}
            style={{
              background: bg,
              border: `2px solid ${border}`,
              borderRadius: '10px',
              padding: '10px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>{u.Nombre_Unidad}</p>
            <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {u.inquilino || <span style={{ color: '#bbb' }}>Sin inquilino</span>}
            </p>
            {u.monto_mes !== null ? (
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: mora ? '#c0392b' : pagado ? '#1e8a4c' : '#8a6300' }}>
                {fmtMoney(u.monto_mes)}
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: '12px', color: '#bbb' }}>Sin período</p>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ============================================================
// PÁGINA PRINCIPAL — UNIDADES
// ============================================================
function Unidades() {
  const navigate = useNavigate()
  const [vista, setVista] = useState('tablero') // 'tablero' | 'form' | 'detalle'
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null)
  const [edificios, setEdificios] = useState([])
  const [unidades, setUnidades] = useState([])
  const [tipos, setTipos] = useState([])
  const [perfiles, setPerfiles] = useState([])
  const [estados, setEstados] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [confirmModal, setConfirmModal] = useState(null)

  async function loadCatalogos() {
    const [ed, t, p, e, u] = await Promise.all([
      edificiosApi.getAll(),
      catalogos.tiposUnidad(),
      catalogos.perfilesCobro(),
      catalogos.estadosUnidad(),
      unidadesApi.getAll(),
    ])
    setEdificios(ed)
    setTipos(t)
    setPerfiles(p)
    setEstados(e)
    setUnidades(u)
  }

  useEffect(() => { loadCatalogos() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    if (name === 'ID_edificio' && value) {
      const edificio = edificios.find(ed => ed.ID_edificio === value)
      if (edificio?.Direccion) updated.Direccion = edificio.Direccion
    }
    setForm(updated)
  }

  function startCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setVista('form')
  }

  function startEdit(unidad) {
    setForm({
      Nombre_Unidad: unidad.Nombre_Unidad || '',
      ID_tipo: unidad.ID_tipo || '',
      ID_perfil: unidad.ID_perfil || '',
      ID_edificio: unidad.ID_edificio || '',
      Piso: unidad.Piso ?? '',
      Numero: unidad.Numero ?? '',
      Dormitorios: unidad.Dormitorios ?? '',
      Direccion: unidad.Direccion || '',
      ID_estado: unidad.ID_estado || '',
      Equipamiento: unidad.Equipamiento || '',
      Notas: unidad.Notas || '',
    })
    setEditingId(unidad.ID_unidad)
    setVista('form')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errores = validarFormulario({
      Nombre_Unidad: validarRequerido(form.Nombre_Unidad, 'Nombre de la unidad'),
      ID_tipo: validarRequerido(form.ID_tipo, 'Tipo'),
      ID_perfil: validarRequerido(form.ID_perfil, 'Perfil de cobro'),
      ID_estado: validarRequerido(form.ID_estado, 'Estado'),
      Direccion: validarRequerido(form.Direccion, 'Dirección'),
    })
    if (Object.keys(errores).length > 0) {
      toast(Object.values(errores).join(' · '), 'error')
      return
    }
    const data = {
      ...form,
      ID_edificio: form.ID_edificio || null,
      Piso: form.Piso === '' ? null : parseInt(form.Piso, 10),
      Numero: form.Numero === '' ? null : parseInt(form.Numero, 10),
      Dormitorios: form.Dormitorios === '' ? null : parseInt(form.Dormitorios, 10),
    }
    try {
      if (editingId) {
        await unidadesApi.update(editingId, data)
        toast('Unidad actualizada correctamente')
      } else {
        await unidadesApi.create(data)
        toast('Unidad creada correctamente')
      }
      setVista('tablero')
      setForm(emptyForm)
      setEditingId(null)
      loadCatalogos()
    } catch (err) {
      toast(err.message || 'Error al guardar', 'error')
    }
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar esta unidad? Se eliminarán también todos sus contratos, períodos, cobros y servicios asociados.',
      onConfirmar: async () => {
        try {
          await unidadesApi.delete(id)
          toast('Unidad eliminada')
          setConfirmModal(null)
          loadCatalogos()
        } catch (err) {
          toast(err.message || 'Error al eliminar', 'error')
          setConfirmModal(null)
        }
      },
    })
  }

  // VISTA DETALLE
  if (vista === 'detalle' && unidadSeleccionada) {
    return (
      <div>
        <DetalleUnidad
          unidad={unidadSeleccionada}
          edificios={edificios}
          onVolver={() => setVista('tablero')}
        />
        <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
          <button onClick={() => startEdit(unidadSeleccionada)}>Editar unidad</button>
          <button onClick={() => handleDelete(unidadSeleccionada.ID_unidad)}>Eliminar unidad</button>
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

  // FORMULARIO
  if (vista === 'form') {
    return (
      <div>
        <button onClick={() => setVista('tablero')} style={{ marginBottom: '1rem' }}>← Volver al tablero</button>
        <form onSubmit={handleSubmit} className="card">
          <p className="card-title">{editingId ? 'Editar unidad' : 'Nueva unidad'}</p>
          <div className="form-grid">
            <label>
              <span>Nombre de la unidad <span className="req">*</span></span>
              <input name="Nombre_Unidad" value={form.Nombre_Unidad} onChange={handleChange} required />
            </label>
            <label>
              Edificio
              <select name="ID_edificio" value={form.ID_edificio} onChange={handleChange}>
                <option value="">Sin edificio (propiedad externa)</option>
                {edificios.map(ed => <option key={ed.ID_edificio} value={ed.ID_edificio}>{ed.Nombre}</option>)}
              </select>
            </label>
            <label>
              <span>Tipo <span className="req">*</span></span>
              <select name="ID_tipo" value={form.ID_tipo} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {tipos.map(t => <option key={t.ID_tipo} value={t.ID_tipo}>{t.Descripcion}</option>)}
              </select>
            </label>
            <label>
              <span>Perfil de cobro <span className="req">*</span></span>
              <select name="ID_perfil" value={form.ID_perfil} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {perfiles.map(p => <option key={p.ID_perfil} value={p.ID_perfil}>{p.Descripcion}</option>)}
              </select>
            </label>
            <label>
              <span>Estado <span className="req">*</span></span>
              <select name="ID_estado" value={form.ID_estado} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {estados.map(e => <option key={e.ID_estado_unidad} value={e.ID_estado_unidad}>{e.Descripcion}</option>)}
              </select>
            </label>
            <label>Piso<input name="Piso" type="number" value={form.Piso} onChange={handleChange} /></label>
            <label>Número<input name="Numero" type="number" value={form.Numero} onChange={handleChange} /></label>
            <label>Dormitorios<input name="Dormitorios" type="number" value={form.Dormitorios} onChange={handleChange} /></label>
            <label>
              <span>Dirección <span className="req">*</span></span>
              <input name="Direccion" value={form.Direccion} onChange={handleChange} required />
            </label>
          </div>
          <label style={{ display: 'block', marginTop: '12px' }}>
            Equipamiento<textarea name="Equipamiento" value={form.Equipamiento} onChange={handleChange} rows={2} />
          </label>
          <label style={{ display: 'block', marginTop: '12px' }}>
            Notas<textarea name="Notas" value={form.Notas} onChange={handleChange} rows={2} />
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <LoadingButton type="submit">{editingId ? 'Guardar cambios' : 'Crear unidad'}</LoadingButton>
            <button type="button" onClick={() => setVista('tablero')}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  // TABLERO
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Edificios y unidades</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/edificios')}>Gestionar edificios</button>
          <button onClick={startCreate}>+ Nueva unidad</button>
        </div>
      </div>

      {/* LEYENDA */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: '#1e8a4c', bg: '#e3f5e9', label: 'Pagado' },
          { color: '#8a6300', bg: '#fff8e1', label: 'Pendiente' },
          { color: '#c0392b', bg: '#fbe5e3', label: 'En mora' },
          { color: '#888', bg: '#f0f0ee', label: 'Libre / Sin período' },
        ].map(l => (
          <span key={l.label} style={{
            padding: '3px 10px', borderRadius: '10px', fontSize: '12px',
            fontWeight: 500, background: l.bg, color: l.color,
          }}>
            {l.label}
          </span>
        ))}
      </div>

      <Tablero onSeleccionar={(u) => { setUnidadSeleccionada(u); setVista('detalle') }} />

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

export default Unidades
