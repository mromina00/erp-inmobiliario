import { useEffect, useState } from 'react'
import { edificios as edificiosApi } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'
import { useNavigate } from 'react-router-dom'
import LoadingButton from '../components/LoadingButton'

const emptyForm = { Nombre: '', Direccion: '' }

function Edificios() {
  const [edificios, setEdificios] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
  const navigate = useNavigate()

  async function load() {
    const data = await edificiosApi.getAll()
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
    setForm({ Nombre: edificio.Nombre, Direccion: edificio.Direccion || '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await edificiosApi.update(editingId, form)
    } else {
      const id = 'ED-' + Date.now()
      await edificiosApi.create(form)
    }
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    load()
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar este edificio?',
      onConfirmar: async () => {
        await edificiosApi.delete(id)
        setConfirmModal(null)
        load()
      },
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/unidades')}>← Volver a Unidades</button>
          <h1 style={{ margin: 0 }}>Edificios</h1>
        </div>
        <button onClick={startCreate}>+ Nuevo edificio</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar edificio' : 'Nuevo edificio'}</p>
          <label>
            Nombre
            <input name="Nombre" value={form.Nombre} onChange={handleChange} required />
          </label>
          <label>
            Dirección del edificio
            <input name="Direccion" value={form.Direccion} onChange={handleChange} />
          </label>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <LoadingButton type="submit">{editingId ? 'Guardar cambios' : 'Crear edificio'}</LoadingButton>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({edificios.length})</p>
        {edificios.length === 0 ? (
          <p className="card-empty">No hay edificios cargados todavía.</p>
        ) : (
          <div className="table-wrapper">
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

export default Edificios