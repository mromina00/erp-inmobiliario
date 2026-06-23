import { useState } from 'react'

const rolDefaults = {
  proveedor: { ID_rol: 'PROVEEDOR', ID_tipo_persona: 'JURIDICA', ID_tipo_doc: 'CUIT' },
  cliente: { ID_rol: 'INQUILINO', ID_tipo_persona: 'FISICA', ID_tipo_doc: 'DNI' },
  inquilino: { ID_rol: 'INQUILINO', ID_tipo_persona: 'FISICA', ID_tipo_doc: 'DNI' },
  firmante: { ID_rol: 'FIRMANTE', ID_tipo_persona: 'FISICA', ID_tipo_doc: 'DNI' },
  garante: { ID_rol: 'GARANTE', ID_tipo_persona: 'FISICA', ID_tipo_doc: 'DNI' },
  titular: { ID_rol: 'PROPIETARIO', ID_tipo_persona: 'FISICA', ID_tipo_doc: 'DNI' },
  empresa: { ID_rol: 'SOCIEDAD', ID_tipo_persona: 'JURIDICA', ID_tipo_doc: 'CUIT' },
}

function formatDocumento(value, tipo) {
  const digits = value.replace(/\D/g, '')
  if (tipo === 'CUIT') {
    if (digits.length <= 2) return digits
    if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
    return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10, 11)}`
  } else {
    // DNI: XX.XXX.XXX
    if (digits.length <= 2) return digits
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`
  }
}

function SelectorPersona({ value, onChange, personas, onPersonaCreada, contexto = 'titular', label = 'Persona', required = false }) {
  const [showMini, setShowMini] = useState(false)
  const [busquedaCuit, setBusquedaCuit] = useState('')
  const [miniForm, setMiniForm] = useState({ Nombre: '', Documento: '', ID_tipo_doc: 'CUIT' })
  const [cuitEncontrado, setCuitEncontrado] = useState(null)
  const [cuitBuscado, setCuitBuscado] = useState(false)

  const defaults = rolDefaults[contexto] || rolDefaults.titular

  async function buscarPorCuit(cuit) {
    const digits = cuit.replace(/\D/g, '')
    if (digits.length < 11) return
    const encontrada = personas.find((p) => p.Documento?.replace(/\D/g, '') === digits)
    if (encontrada) {
      setCuitEncontrado(encontrada)
      onChange(encontrada.ID_persona)
      setShowMini(false)
    } else {
      setCuitEncontrado(null)
      setCuitBuscado(true)
      setMiniForm({ ...miniForm, Documento: cuit })
    }
  }

  async function crearPersona() {
    if (!miniForm.Nombre) { alert('Ingresá el nombre o razón social'); return }
    const id = 'P-' + Date.now()
    const nueva = {
      ID_persona: id,
      Nombre: miniForm.Nombre,
      Documento: miniForm.Documento,
      ID_tipo_doc: defaults.ID_tipo_doc,
      ID_tipo_persona: defaults.ID_tipo_persona,
      ID_rol_persona: defaults.ID_rol,
      ID_estado_persona: 'ACTIVO',
    }
    await window.api.personas.create(nueva)
    await onPersonaCreada()
    onChange(id)
    setShowMini(false)
    setBusquedaCuit('')
    setMiniForm({ Nombre: '', Documento: '', ID_tipo_doc: 'CUIT' })
    setCuitBuscado(false)
    setCuitEncontrado(null)
  }

  return (
    <div>
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#555' }}>
        {label}
        <div style={{ display: 'flex', gap: '6px' }}>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            style={{ flex: 1 }}
          >
            <option value="">Seleccionar...</option>
            {personas.map((p) => (
              <option key={p.ID_persona} value={p.ID_persona}>{p.Nombre}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => { setShowMini(!showMini); setCuitBuscado(false); setCuitEncontrado(null) }}
            style={{ padding: '6px 10px', fontSize: '16px', lineHeight: 1 }}
            title="Agregar nueva persona"
          >
            +
          </button>
        </div>
      </label>

      {showMini && (
        <div style={{ border: '1px solid #e5e5e3', borderRadius: '8px', padding: '12px', marginTop: '8px', background: '#fafafa' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, margin: '0 0 8px' }}>Buscar por CUIT o crear nuevo</p>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <input
              placeholder="Ingresá el CUIT (XX-XXXXXXXX-X)"
              value={busquedaCuit}
              onChange={(e) => {
                const formatted = formatDocumento(e.target.value, 'CUIT')
                setBusquedaCuit(formatted)
                setCuitBuscado(false)
                setCuitEncontrado(null)
              }}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={() => buscarPorCuit(busquedaCuit)}>Buscar</button>
          </div>

          {cuitEncontrado && (
            <p style={{ fontSize: '13px', color: '#1e8a4c' }}>
              ✓ Encontrado: {cuitEncontrado.Nombre} — seleccionado automáticamente.
            </p>
          )}

          {cuitBuscado && !cuitEncontrado && (
            <div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                No se encontró ninguna persona con ese CUIT. Completá el nombre para crearla:
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  placeholder="Nombre / Razón social"
                  value={miniForm.Nombre}
                  onChange={(e) => setMiniForm({ ...miniForm, Nombre: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={crearPersona}>Crear y seleccionar</button>
                <button type="button" onClick={() => { setShowMini(false); setCuitBuscado(false) }}>Cancelar</button>
              </div>
            </div>
          )}

          {!cuitBuscado && !cuitEncontrado && (
            <div>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                O creá directamente sin buscar por CUIT:
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  placeholder="Nombre / Razón social"
                  value={miniForm.Nombre}
                  onChange={(e) => setMiniForm({ ...miniForm, Nombre: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={crearPersona}>Crear y seleccionar</button>
                <button type="button" onClick={() => setShowMini(false)}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SelectorPersona