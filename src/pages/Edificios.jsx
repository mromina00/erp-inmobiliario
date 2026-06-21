import { useEffect, useState } from 'react'

const emptyForm = { Nombre: '' }

function Edificios() {
  const [edificios, setEdificios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const data = await window.api.edificios.getAll()
    setEdificios(data)
  }

  useEffect(() => {
    load()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function startCreate() {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(edificio) {
    setForm({ Nombre: edificio.Nombre })
    setEditingId(edificio.ID_edificio)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await window.api.edificios.update(editingId, form)
    } else {
      const id = 'ED-' + Date.now()
      await window.api.edificios.create({ ID_edificio: id, ...form })
    }
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este edificio?')) return
    await window.api.edificios.delete(id)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Edificios</h1>
        <button onClick={startCreate}>+ Nuevo edificio</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar edificio' : 'Nuevo edificio'}</p>
          <label>
            Nombre
            <input name="Nombre" value={form.Nombre} onChange={handleChange} required />
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit">{editingId ? 'Guardar cambios' : 'Crear edificio'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({edificios.length})</p>
        {edificios.length === 0 ? (
          <p className="card-empty">No hay edificios cargados todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {edificios.map((ed) => (
                <tr key={ed.ID_edificio}>
                  <td>{ed.Nombre}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => startEdit(ed)}>Editar</button>{' '}
                    <button onClick={() => handleDelete(ed.ID_edificio)}>Eliminar</button>
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

export default Edificios