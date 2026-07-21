import { useState } from 'react'
import { personas as personasApi, catalogos } from '../services/api'

function SelectorPersona({ label, value, onChange, personas, onPersonaCreada, required }) {
  const [showModal, setShowModal] = useState(false)
  const [tiposDoc, setTiposDoc] = useState([])
  const [tiposPersona, setTiposPersona] = useState([])
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({
    Nombre: '', ID_tipo_doc: '', Documento: '', ID_tipo_persona: '',
    ID_rol_persona: '', Direccion: '', Localidad: '', Provincia: '',
    Telefono: '', Email: '', ID_estado_persona: 'ACTIVO', Notas: '',
  })

  async function abrirModal() {
    const [td, tp, r] = await Promise.all([
      catalogos.tiposDocumento(),
      catalogos.tiposPersona(),
      catalogos.rolesPersona(),
    ])
    setTiposDoc(td)
    setTiposPersona(tp)
    setRoles(r)
    setShowModal(true)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCrear() {
    if (!form.Nombre || !form.ID_tipo_doc || !form.ID_tipo_persona || !form.ID_rol_persona) {
      alert('Completá los campos obligatorios: Nombre, Tipo de documento, Tipo de persona y Rol')
      return
    }
    const nueva = await personasApi.create(form)
    await onPersonaCreada()
    onChange(nueva.ID_persona)
    setShowModal(false)
    setForm({
      Nombre: '', ID_tipo_doc: '', Documento: '', ID_tipo_persona: '',
      ID_rol_persona: '', Direccion: '', Localidad: '', Provincia: '',
      Telefono: '', Email: '', ID_estado_persona: 'ACTIVO', Notas: '',
    })
  }

  return (
    <label style={{ display: 'block' }}>
      <span>{label}{required && <span className="req"> *</span>}</span>
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={{ flex: 1 }}
        >
          <option value="">Seleccionar...</option>
          {personas.map(p => (
            <option key={p.ID_persona} value={p.ID_persona}>
              {p.Nombre}{p.Documento ? ` — ${p.Documento}` : ''}
            </option>
          ))}
        </select>
        <button type="button" onClick={abrirModal}>+ Nueva</button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '1.5rem',
            width: '100%', maxWidth: '600px', maxHeight: '90vh',
            overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '15px' }}>Nueva persona</p>
              <button type="button" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="form-grid">
              <label>
                Nombre completo / Razón social *
                <input name="Nombre" value={form.Nombre} onChange={handleChange} />
              </label>
              <label>
                Tipo de documento *
                <select name="ID_tipo_doc" value={form.ID_tipo_doc} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {tiposDoc.map(t => (
                    <option key={t.ID_tipo_doc} value={t.ID_tipo_doc}>{t.Descripcion}</option>
                  ))}
                </select>
              </label>
              <label>
                Número de documento
                <input name="Documento" value={form.Documento} onChange={handleChange} />
              </label>
              <label>
                Tipo de persona *
                <select name="ID_tipo_persona" value={form.ID_tipo_persona} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {tiposPersona.map(t => (
                    <option key={t.ID_tipo_persona} value={t.ID_tipo_persona}>{t.Descripcion}</option>
                  ))}
                </select>
              </label>
              <label>
                Rol *
                <select name="ID_rol_persona" value={form.ID_rol_persona} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  {roles.map(r => (
                    <option key={r.ID_rol} value={r.ID_rol}>{r.Descripcion}</option>
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

            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="button" onClick={handleCrear}>Crear persona</button>
            </div>
          </div>
        </div>
      )}
    </label>
  )
}

export default SelectorPersona