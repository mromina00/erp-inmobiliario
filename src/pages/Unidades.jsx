import { useEffect, useState } from 'react'
import { unidades as unidadesApi, edificios as edificiosApi, catalogos } from '../services/api'
import { useNavigate } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'
import LoadingButton from '../components/LoadingButton'

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

function estadoBadge(unidad) {
  if (unidad.ID_estado === 'OCUPADA') {
    return { label: 'Ocupada', className: 'badge-ok' }
  }
  if (unidad.ID_estado === 'LIBRE') {
    return { label: 'Vacante', className: 'badge-neutral' }
  }
  if (unidad.ID_estado === 'NO_DISPONIBLE') {
    return { label: 'No disponible', className: 'badge-danger' }
  }
  if (unidad.ID_estado === 'USO_PROPIO') {
    return { label: 'Uso propio', className: 'badge-neutral' }
  }
  return { label: unidad.ID_estado || 'Sin estado', className: 'badge-neutral' }
}

function Unidades() {
  const navigate = useNavigate()
  const [unidades, setUnidades] = useState([])
  const [edificios, setEdificios] = useState([])
  const [tipos, setTipos] = useState([])
  const [perfiles, setPerfiles] = useState([])
  const [estados, setEstados] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)

  async function loadAll() {
    const [u, ed, t, p, e] = await Promise.all([
      unidadesApi.getAll(),
      edificiosApi.getAll(),
      catalogos.tiposUnidad(),
      catalogos.perfilesCobro(),
      catalogos.estadosUnidad(),
    ])
    setUnidades(u)
    setEdificios(ed)
    setTipos(t)
    setPerfiles(p)
    setEstados(e)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    if (name === 'ID_edificio' && value) {
      const edificio = edificios.find(ed => ed.ID_edificio === value)
      if (edificio?.Direccion) {
        updated.Direccion = edificio.Direccion
      }
    }
    setForm(updated)
  }

  function startCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
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
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ...form,
      ID_edificio: form.ID_edificio || null,
      Piso: form.Piso === '' ? null : parseInt(form.Piso, 10),
      Numero: form.Numero === '' ? null : parseInt(form.Numero, 10),
      Dormitorios: form.Dormitorios === '' ? null : parseInt(form.Dormitorios, 10),
    }

    if (editingId) {
      await unidadesApi.update(editingId, data)
    } else {
      const id = 'U-' + Date.now()
      await unidadesApi.create(data)
    }

    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    loadAll()
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar esta unidad? Se eliminarán también todos sus contratos, períodos, cobros y servicios asociados. Esta acción no se puede deshacer.',
      onConfirmar: async () => {
        await unidadesApi.delete(id)
        setConfirmModal(null)
        loadAll()
      },
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Edificios y unidades</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => navigate('/edificios')}>Gestionar edificios</button>
          <button onClick={startCreate}>+ Nueva unidad</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar unidad' : 'Nueva unidad'}</p>

          <div className="form-grid">
            <label>
              Nombre de la unidad
              <input name="Nombre_Unidad" value={form.Nombre_Unidad} onChange={handleChange} required />
            </label>

            <label>
              Edificio
              <select name="ID_edificio" value={form.ID_edificio} onChange={handleChange}>
                <option value="">Sin edificio (propiedad externa)</option>
                {edificios.map((ed) => (
                  <option key={ed.ID_edificio} value={ed.ID_edificio}>{ed.Nombre}</option>
                ))}
              </select>
            </label>

            <label>
              Tipo
              <select name="ID_tipo" value={form.ID_tipo} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {tipos.map((t) => (
                  <option key={t.ID_tipo} value={t.ID_tipo}>{t.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Perfil de cobro
              <select name="ID_perfil" value={form.ID_perfil} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {perfiles.map((p) => (
                  <option key={p.ID_perfil} value={p.ID_perfil}>{p.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Estado
              <select name="ID_estado" value={form.ID_estado} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {estados.map((e) => (
                  <option key={e.ID_estado_unidad} value={e.ID_estado_unidad}>{e.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Piso
              <input name="Piso" type="number" value={form.Piso} onChange={handleChange} />
            </label>

            <label>
              Número
              <input name="Numero" type="number" value={form.Numero} onChange={handleChange} />
            </label>

            <label>
              Dormitorios
              <input name="Dormitorios" type="number" value={form.Dormitorios} onChange={handleChange} />
            </label>

            <label>
              Dirección
              <input name="Direccion" value={form.Direccion} onChange={handleChange} required />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: '12px' }}>
            Equipamiento
            <textarea name="Equipamiento" value={form.Equipamiento} onChange={handleChange} rows={2} />
          </label>

          <label style={{ display: 'block', marginTop: '12px' }}>
            Notas
            <textarea name="Notas" value={form.Notas} onChange={handleChange} rows={2} />
          </label>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <LoadingButton type="submit">{editingId ? 'Guardar cambios' : 'Crear unidad'}</LoadingButton>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      {unidades.length === 0 ? (
        <div className="card">
          <p className="card-empty">No hay unidades cargadas todavía.</p>
        </div>
      ) : (
        <div className="units-grid">
          {unidades.map((u) => {
            const badge = estadoBadge(u)
            const inquilino = u.contratos?.[0]?.inquilino?.Nombre
            return (
              <div key={u.ID_unidad} className="unit-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p className="unit-name">{u.Nombre_Unidad}</p>
                    <p className="unit-sub">{edificios.find(ed => ed.ID_edificio === u.ID_edificio)?.Nombre || 'Propiedad externa'}</p>
                  </div>
                  <span className={`badge ${badge.className}`}>{badge.label}</span>
                </div>
                <p className="unit-sub" style={{ margin: '8px 0 12px' }}>
                  {inquilino ? `Inquilino: ${inquilino}` : 'Sin inquilino'}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ flex: 1 }} onClick={() => startEdit(u)}>Editar</button>
                  <button style={{ flex: 1 }} onClick={() => handleDelete(u.ID_unidad)}>Eliminar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
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