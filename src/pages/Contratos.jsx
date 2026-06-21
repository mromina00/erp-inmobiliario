import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const emptyForm = {
  ID_unidad: '',
  ID_persona_inquilino: '',
  ID_persona_firmante: '',
  Duracion_anos: '',
  Fecha_Inicio: '',
  Fecha_Vencimiento: '',
  Monto_Alquiler_Inicial: '',
  ID_tipo_indice: '',
  ID_periodicidad: '',
  Monto_Expensas_Inicial: '',
  Monto_Cochera_Inicial: '',
  ID_estado_contrato: '',
  Notas: '',
}

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

function Contratos() {
  const navigate = useNavigate()  
  const [contratos, setContratos] = useState([])
  const [unidades, setUnidades] = useState([])
  const [personas, setPersonas] = useState([])
  const [estados, setEstados] = useState([])
  const [indices, setIndices] = useState([])
  const [periodicidades, setPeriodicidades] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [garantesSeleccionados, setGarantesSeleccionados] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function loadAll() {
    const [c, u, p, e, ti, pe] = await Promise.all([
      window.api.contratos.getAll(),
      window.api.unidades.getAll(),
      window.api.personas.getAll(),
      window.api.catalogos.estadosContrato(),
      window.api.catalogos.tiposIndice(),
      window.api.catalogos.periodicidades(),
    ])
    setContratos(c)
    setUnidades(u)
    setPersonas(p)
    setEstados(e)
    setIndices(ti)
    setPeriodicidades(pe)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function toggleGarante(personaId) {
    setGarantesSeleccionados((prev) =>
      prev.includes(personaId) ? prev.filter((id) => id !== personaId) : [...prev, personaId]
    )
  }

  function startCreate() {
    setForm(emptyForm)
    setGarantesSeleccionados([])
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(contrato) {
    setForm({
      ID_unidad: contrato.ID_unidad || '',
      ID_persona_inquilino: contrato.ID_persona_inquilino || '',
      ID_persona_firmante: contrato.ID_persona_firmante || '',
      Duracion_anos: contrato.Duracion_anos ?? '',
      Fecha_Inicio: contrato.Fecha_Inicio ? contrato.Fecha_Inicio.substring(0, 10) : '',
      Fecha_Vencimiento: contrato.Fecha_Vencimiento ? contrato.Fecha_Vencimiento.substring(0, 10) : '',
      Monto_Alquiler_Inicial: contrato.Monto_Alquiler_Inicial ?? '',
      ID_tipo_indice: contrato.ID_tipo_indice || '',
      ID_periodicidad: contrato.ID_periodicidad || '',
      Monto_Expensas_Inicial: contrato.Monto_Expensas_Inicial ?? '',
      Monto_Cochera_Inicial: contrato.Monto_Cochera_Inicial ?? '',
      ID_estado_contrato: contrato.ID_estado_contrato || '',
      Notas: contrato.Notas || '',
    })
    setGarantesSeleccionados((contrato.garantes || []).map((g) => g.ID_persona_garante))
    setEditingId(contrato.ID_contrato)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = {
      ID_unidad: form.ID_unidad,
      ID_persona_inquilino: form.ID_persona_inquilino,
      ID_persona_firmante: form.ID_persona_firmante || null,
      Duracion_anos: parseInt(form.Duracion_anos, 10),
      Fecha_Inicio: form.Fecha_Inicio + 'T00:00:00.000Z',
      Fecha_Vencimiento: form.Fecha_Vencimiento + 'T00:00:00.000Z',
      Monto_Alquiler_Inicial: parseFloat(form.Monto_Alquiler_Inicial),
      ID_tipo_indice: form.ID_tipo_indice || null,
      ID_periodicidad: form.ID_periodicidad || null,
      Monto_Expensas_Inicial: parseFloat(form.Monto_Expensas_Inicial || 0),
      Monto_Cochera_Inicial: form.Monto_Cochera_Inicial === '' ? null : parseFloat(form.Monto_Cochera_Inicial),
      ID_estado_contrato: form.ID_estado_contrato,
      Notas: form.Notas || null,
    }

    if (editingId) {
      await window.api.contratos.update(editingId, data, garantesSeleccionados)
    } else {
      const id = 'C-' + Date.now()
      await window.api.contratos.create({ ID_contrato: id, ...data }, garantesSeleccionados)
    }

    setShowForm(false)
    setForm(emptyForm)
    setGarantesSeleccionados([])
    setEditingId(null)
    loadAll()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este contrato?')) return
    await window.api.contratos.delete(id)
    loadAll()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Contratos</h1>
        <button onClick={startCreate}>+ Nuevo contrato</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar contrato' : 'Nuevo contrato'}</p>

          <div className="form-grid">
            <label>
              Unidad
              <select name="ID_unidad" value={form.ID_unidad} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {unidades.map((u) => (
                  <option key={u.ID_unidad} value={u.ID_unidad}>
                    {u.Nombre_Unidad} {u.edificio ? `(${u.edificio.Nombre})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Inquilino
              <select name="ID_persona_inquilino" value={form.ID_persona_inquilino} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {personas.map((p) => (
                  <option key={p.ID_persona} value={p.ID_persona}>{p.Nombre}</option>
                ))}
              </select>
            </label>

            <label>
              Firmante (si es distinto al inquilino)
              <select name="ID_persona_firmante" value={form.ID_persona_firmante} onChange={handleChange}>
                <option value="">Mismo que inquilino</option>
                {personas.map((p) => (
                  <option key={p.ID_persona} value={p.ID_persona}>{p.Nombre}</option>
                ))}
              </select>
            </label>

            <label>
              Duración (años)
              <input name="Duracion_anos" type="number" value={form.Duracion_anos} onChange={handleChange} required />
            </label>

            <label>
              Fecha de inicio
              <input name="Fecha_Inicio" type="date" value={form.Fecha_Inicio} onChange={handleChange} required />
            </label>

            <label>
              Fecha de vencimiento
              <input name="Fecha_Vencimiento" type="date" value={form.Fecha_Vencimiento} onChange={handleChange} required />
            </label>

            <label>
              Monto alquiler inicial
              <input name="Monto_Alquiler_Inicial" type="number" step="0.01" value={form.Monto_Alquiler_Inicial} onChange={handleChange} required />
            </label>

            <label>
              Monto expensas inicial
              <input name="Monto_Expensas_Inicial" type="number" step="0.01" value={form.Monto_Expensas_Inicial} onChange={handleChange} required />
            </label>

            <label>
              Monto cochera inicial
              <input name="Monto_Cochera_Inicial" type="number" step="0.01" value={form.Monto_Cochera_Inicial} onChange={handleChange} />
            </label>

            <label>
              Índice de actualización
              <select name="ID_tipo_indice" value={form.ID_tipo_indice} onChange={handleChange}>
                <option value="">Sin definir</option>
                {indices.map((i) => (
                  <option key={i.ID_indice} value={i.ID_indice}>{i.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Periodicidad de actualización
              <select name="ID_periodicidad" value={form.ID_periodicidad} onChange={handleChange}>
                <option value="">Sin definir</option>
                {periodicidades.map((p) => (
                  <option key={p.ID_periodicidad} value={p.ID_periodicidad}>{p.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Estado del contrato
              <select name="ID_estado_contrato" value={form.ID_estado_contrato} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {estados.map((e) => (
                  <option key={e.ID_estado_contrato} value={e.ID_estado_contrato}>{e.Descripcion}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: '#555', margin: '0 0 6px' }}>Garantes (opcional, podés elegir varios)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {personas.map((p) => (
                <label
                  key={p.ID_persona}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '4px',
                    border: '1px solid #d8d8d5',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={garantesSeleccionados.includes(p.ID_persona)}
                    onChange={() => toggleGarante(p.ID_persona)}
                    style={{ width: 'auto' }}
                  />
                  {p.Nombre}
                </label>
              ))}
            </div>
          </div>

          <label style={{ display: 'block', marginTop: '12px' }}>
            Notas
            <textarea name="Notas" value={form.Notas} onChange={handleChange} rows={2} />
          </label>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit">{editingId ? 'Guardar cambios' : 'Crear contrato'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({contratos.length})</p>
        {contratos.length === 0 ? (
          <p className="card-empty">No hay contratos cargados todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Inquilino</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Alquiler inicial</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.ID_contrato}>
                  <td>{c.unidad?.Nombre_Unidad}</td>
                  <td>{c.inquilino?.Nombre}</td>
                  <td>{fmtDate(c.Fecha_Inicio)}</td>
                  <td>{fmtDate(c.Fecha_Vencimiento)}</td>
                  <td>{fmtMoney(c.Monto_Alquiler_Inicial)}</td>
                  <td>{c.estado_contrato?.Descripcion}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => navigate(`/contratos/${c.ID_contrato}`)}>Ver períodos</button>{' '}
                    <button onClick={() => startEdit(c)}>Editar</button>{' '}
                    <button onClick={() => handleDelete(c.ID_contrato)}>Eliminar</button>
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

export default Contratos