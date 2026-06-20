import { useEffect, useState } from 'react'

const emptyForm = {
  ID_persona: '',
  Nombre: '',
  ID_tipo_doc: '',
  Documento: '',
  ID_tipo_persona: '',
  ID_rol_persona: '',
  Direccion: '',
  Localidad: '',
  Provincia: '',
  Telefono: '',
  Email: '',
  ID_estado_persona: '',
  Notas: '',
}

function Personas() {
  const [personas, setPersonas] = useState([])
  const [tiposDoc, setTiposDoc] = useState([])
  const [tiposPersona, setTiposPersona] = useState([])
  const [roles, setRoles] = useState([])
  const [estados, setEstados] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function loadAll() {
    const [p, td, tp, r, e] = await Promise.all([
      window.api.personas.getAll(),
      window.api.catalogos.tiposDocumento(),
      window.api.catalogos.tiposPersona(),
      window.api.catalogos.rolesPersona(),
      window.api.catalogos.estadosPersona(),
    ])
    setPersonas(p)
    setTiposDoc(td)
    setTiposPersona(tp)
    setRoles(r)
    setEstados(e)
  }

  useEffect(() => {
    loadAll()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function startCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(persona) {
    setForm({
      ID_persona: persona.ID_persona,
      Nombre: persona.Nombre || '',
      ID_tipo_doc: persona.ID_tipo_doc || '',
      Documento: persona.Documento || '',
      ID_tipo_persona: persona.ID_tipo_persona || '',
      ID_rol_persona: persona.ID_rol_persona || '',
      Direccion: persona.Direccion || '',
      Localidad: persona.Localidad || '',
      Provincia: persona.Provincia || '',
      Telefono: persona.Telefono || '',
      Email: persona.Email || '',
      ID_estado_persona: persona.ID_estado_persona || '',
      Notas: persona.Notas || '',
    })
    setEditingId(persona.ID_persona)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { ...form }
    delete data.ID_persona

    if (editingId) {
      await window.api.personas.update(editingId, data)
    } else {
      const id = 'P-' + Date.now()
      await window.api.personas.create({ ID_persona: id, ...data })
    }

    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    loadAll()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta persona?')) return
    await window.api.personas.delete(id)
    loadAll()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Personas</h1>
        <button onClick={startCreate}>+ Nueva persona</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar persona' : 'Nueva persona'}</p>

          <div className="form-grid">
            <label>
              Nombre
              <input name="Nombre" value={form.Nombre} onChange={handleChange} required />
            </label>

            <label>
              Tipo de documento
              <select name="ID_tipo_doc" value={form.ID_tipo_doc} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {tiposDoc.map((t) => (
                  <option key={t.ID_tipo_doc} value={t.ID_tipo_doc}>{t.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Número de documento
              <input name="Documento" value={form.Documento} onChange={handleChange} />
            </label>

            <label>
              Tipo de persona
              <select name="ID_tipo_persona" value={form.ID_tipo_persona} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {tiposPersona.map((t) => (
                  <option key={t.ID_tipo_persona} value={t.ID_tipo_persona}>{t.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Rol
              <select name="ID_rol_persona" value={form.ID_rol_persona} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {roles.map((r) => (
                  <option key={r.ID_rol} value={r.ID_rol}>{r.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Estado
              <select name="ID_estado_persona" value={form.ID_estado_persona} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {estados.map((e) => (
                  <option key={e.ID_estado_persona} value={e.ID_estado_persona}>{e.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              Teléfono
              <input name="Telefono" value={form.Telefono} onChange={handleChange} />
            </label>

            <label>
              Email
              <input name="Email" type="email" value={form.Email} onChange={handleChange} />
            </label>

            <label>
              Dirección
              <input name="Direccion" value={form.Direccion} onChange={handleChange} />
            </label>

            <label>
              Localidad
              <input name="Localidad" value={form.Localidad} onChange={handleChange} />
            </label>

            <label>
              Provincia
              <input name="Provincia" value={form.Provincia} onChange={handleChange} />
            </label>
          </div>

          <label style={{ display: 'block', marginTop: '12px' }}>
            Notas
            <textarea name="Notas" value={form.Notas} onChange={handleChange} rows={2} />
          </label>

          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit">{editingId ? 'Guardar cambios' : 'Crear persona'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({personas.length})</p>
        {personas.length === 0 ? (
          <p className="card-empty">No hay personas cargadas todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.ID_persona}>
                  <td>{p.Nombre}</td>
                  <td>{p.tipo_doc?.Descripcion} {p.Documento}</td>
                  <td>{p.rol_persona?.Descripcion}</td>
                  <td>{p.estado_persona?.Descripcion}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => startEdit(p)}>Editar</button>{' '}
                    <button onClick={() => handleDelete(p.ID_persona)}>Eliminar</button>
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

export default Personas