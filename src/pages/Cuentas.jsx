import { useEffect, useState } from 'react'
import { cuentas as cuentasApi, personas as personasApi, catalogos } from '../services/api'
import SelectorPersona from '../components/SelectorPersona'
import ConfirmModal from '../components/ConfirmModal'

const emptyForm = {
  Nombre_Cuenta: '',
  ID_tipo_cuenta: '',
  ID_moneda: '',
  ID_persona_titular: '',
  Banco_Institucion: '',
  Sucursal: '',
  Numero_cuenta: '',
  CBU_CVU: '',
  Alias: '',
  Notas: '',
}

function Cuentas() {
  const [cuentas, setCuentas] = useState([])
  const [tipos, setTipos] = useState([])
  const [monedas, setMonedas] = useState([])
  const [personas, setPersonas] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)

  async function loadAll() {
    const [c, t, m, p] = await Promise.all([
      cuentasApi.getAll(),
      catalogos.tiposCuenta(),
      catalogos.monedas(),
      personasApi.getAll(),
    ])
    setCuentas(c)
    setTipos(t)
    setMonedas(m)
    setPersonas(p)
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

  function startEdit(c) {
    setForm({
      Nombre_Cuenta: c.Nombre_Cuenta || '',
      ID_tipo_cuenta: c.ID_tipo_cuenta || '',
      ID_moneda: c.ID_moneda || '',
      ID_persona_titular: c.ID_persona_titular || '',
      Banco_Institucion: c.Banco_Institucion || '',
      Sucursal: c.Sucursal || '',
      Numero_cuenta: c.Numero_cuenta || '',
      CBU_CVU: c.CBU_CVU || '',
      Alias: c.Alias || '',
      Notas: c.Notas || '',
    })
    setEditingId(c.ID_cuenta)
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (editingId) {
      await cuentasApi.update(editingId, form)
    } else {
      const id = 'CTA-' + Date.now()
      await cuentasApi.create(form)
    }
    setShowForm(false)
    setForm(emptyForm)
    setEditingId(null)
    loadAll()
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar esta cuenta?',
      onConfirmar: async () => {
        await cuentasApi.delete(id)
        setConfirmModal(null)
        loadAll()
      },
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Cuentas</h1>
        <button onClick={startCreate}>+ Nueva cuenta</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingId ? 'Editar cuenta' : 'Nueva cuenta'}</p>
          <div className="form-grid">
            <label>
              Nombre de la cuenta
              <input name="Nombre_Cuenta" value={form.Nombre_Cuenta} onChange={handleChange} required />
            </label>
            <label>
              Tipo
              <select name="ID_tipo_cuenta" value={form.ID_tipo_cuenta} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {tipos.map((t) => (
                  <option key={t.ID_tipo_cuenta} value={t.ID_tipo_cuenta}>{t.Descripcion}</option>
                ))}
              </select>
            </label>
            <label>
              Moneda
              <select name="ID_moneda" value={form.ID_moneda} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {monedas.map((m) => (
                  <option key={m.ID_moneda} value={m.ID_moneda}>{m.Descripcion}</option>
                ))}
              </select>
            </label>
            <SelectorPersona
              label="Titular"
              value={form.ID_persona_titular}
              onChange={(v) => setForm({ ...form, ID_persona_titular: v })}
              personas={personas}
              onPersonaCreada={loadAll}
              contexto="titular"
              required
            />
            <label>
              Banco / Institución
              <input name="Banco_Institucion" value={form.Banco_Institucion} onChange={handleChange} />
            </label>
            <label>
              Sucursal
              <input name="Sucursal" value={form.Sucursal} onChange={handleChange} />
            </label>
            <label>
              Número de cuenta
              <input name="Numero_cuenta" value={form.Numero_cuenta} onChange={handleChange} />
            </label>
            <label>
              CBU/CVU
              <input name="CBU_CVU" value={form.CBU_CVU} onChange={handleChange} />
            </label>
            <label>
              Alias
              <input name="Alias" value={form.Alias} onChange={handleChange} />
            </label>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit">{editingId ? 'Guardar cambios' : 'Crear cuenta'}</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({cuentas.length})</p>
        {cuentas.length === 0 ? (
          <p className="card-empty">No hay cuentas cargadas todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Titular</th>
                <th>Banco</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cuentas.map((c) => (
                <tr key={c.ID_cuenta}>
                  <td>{c.Nombre_Cuenta}</td>
                  <td>{c.tipo_cuenta?.Descripcion}</td>
                  <td>{c.titular?.Nombre}</td>
                  <td>{c.Banco_Institucion}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => startEdit(c)}>Editar</button>{' '}
                    <button onClick={() => handleDelete(c.ID_cuenta)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default Cuentas