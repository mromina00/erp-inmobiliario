import { useEffect, useState } from 'react'
import { contratos as contratosApi, unidades as unidadesApi, personas as personasApi, catalogos } from '../services/api'
import { useNavigate } from 'react-router-dom'
import SelectorPersona from '../components/SelectorPersona'
import ConfirmModal from '../components/ConfirmModal'
import MontoInput, { parseMonto } from '../components/MontoInput'
import LoadingButton from '../components/LoadingButton'
import { toast } from '../components/Toast'

const emptyForm = {
  ID_unidad: '',
  ID_persona_inquilino: '',
  ID_persona_firmante: '',
  Fecha_Inicio: '',
  Duracion_anos: '',
  Fecha_Vencimiento: '',
  Monto_Alquiler_Inicial: '',
  ID_tipo_indice: '',
  ID_periodicidad: '',
  Monto_Expensas_Inicial: '',
  Monto_Cochera_Inicial: '',
  ID_estado_contrato: '',
  Notas: '',
}

function calcularVencimiento(fechaInicio, duracionAnos) {
  if (!fechaInicio || !duracionAnos) return ''
  const inicio = new Date(fechaInicio)
  const venc = new Date(inicio)
  venc.setFullYear(venc.getFullYear() + parseInt(duracionAnos))
  venc.setDate(venc.getDate() - 1)
  return venc.toISOString().substring(0, 10)
}

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  const num = Number(n)
  return '$' + num.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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
  const [confirmModal, setConfirmModal] = useState(null)

  async function loadAll() {
    const [c, u, p, e, ti, pe] = await Promise.all([
      contratosApi.getAll(),
      unidadesApi.getAll(),
      personasApi.getAll(),
      catalogos.estadosContrato(),
      catalogos.tiposIndice(),
      catalogos.periodicidades(),
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
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    if (name === 'Fecha_Inicio' || name === 'Duracion_anos') {
      updated.Fecha_Vencimiento = calcularVencimiento(
        name === 'Fecha_Inicio' ? value : form.Fecha_Inicio,
        name === 'Duracion_anos' ? value : form.Duracion_anos
      )
    }
    setForm(updated)
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
      Fecha_Inicio: contrato.Fecha_Inicio ? contrato.Fecha_Inicio.substring(0, 10) : '',
      Duracion_anos: contrato.Duracion_anos ?? '',
      Fecha_Vencimiento: contrato.Fecha_Vencimiento ? contrato.Fecha_Vencimiento.substring(0, 10) : '',
      Monto_Alquiler_Inicial: parseMonto(form.Monto_Alquiler_Inicial),
      ID_tipo_indice: contrato.ID_tipo_indice || '',
      ID_periodicidad: contrato.ID_periodicidad || '',
      Monto_Expensas_Inicial: parseMonto(form.Monto_Expensas_Inicial) || 0,
      Monto_Cochera_Inicial: form.Monto_Cochera_Inicial === '' ? null : parseMonto(form.Monto_Cochera_Inicial),
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
      Fecha_Inicio: form.Fecha_Inicio + 'T00:00:00.000Z',
      Duracion_anos: parseInt(form.Duracion_anos, 10),
      Fecha_Vencimiento: form.Fecha_Vencimiento + 'T00:00:00.000Z',
      Monto_Alquiler_Inicial: parseFloat(form.Monto_Alquiler_Inicial),
      ID_tipo_indice: form.ID_tipo_indice || null,
      ID_periodicidad: form.ID_periodicidad || null,
      Monto_Expensas_Inicial: parseFloat(form.Monto_Expensas_Inicial || 0),
      Monto_Cochera_Inicial: form.Monto_Cochera_Inicial === '' ? null : parseFloat(form.Monto_Cochera_Inicial),
      ID_estado_contrato: form.ID_estado_contrato,
      Notas: form.Notas || null,
    }
    try {
      if (editingId) {
        await contratosApi.update(editingId, data, garantesSeleccionados)
        toast('Contrato actualizado correctamente')
      } else {
        await contratosApi.create(data, garantesSeleccionados)
        toast('Contrato creado correctamente')
      }
      setShowForm(false)
      setForm(emptyForm)
      setGarantesSeleccionados([])
      setEditingId(null)
      loadAll()
    } catch (err) {
      toast(err.message || 'Error al guardar el contrato', 'error')
    }
  }

  async function handleDelete(id) {
    setConfirmModal({
      mensaje: '¿Eliminar este contrato? Se eliminarán también todos sus períodos y garantes asociados.',
      onConfirmar: async () => {
        try {
          await contratosApi.delete(id)
          toast('Contrato eliminado')
          setConfirmModal(null)
          loadAll()
        } catch (err) {
          toast(err.message || 'Error al eliminar', 'error')
          setConfirmModal(null)
        }
      },
    })
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
              <span>Unidad <span className="req">*</span></span>
              <select name="ID_unidad" value={form.ID_unidad} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {[...unidades].sort((a, b) => a.Nombre_Unidad.localeCompare(b.Nombre_Unidad, 'es')).map((u) => (
                  <option key={u.ID_unidad} value={u.ID_unidad}>
                    {u.Nombre_Unidad} {u.edificio ? `(${u.edificio.Nombre})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <SelectorPersona
              label="Inquilino"
              value={form.ID_persona_inquilino}
              onChange={(v) => setForm({ ...form, ID_persona_inquilino: v })}
              personas={personas}
              onPersonaCreada={loadAll}
              contexto="inquilino"
              required
            />

            <SelectorPersona
              label="Firmante (si es distinto al inquilino)"
              value={form.ID_persona_firmante}
              onChange={(v) => setForm({ ...form, ID_persona_firmante: v })}
              personas={personas}
              onPersonaCreada={loadAll}
              contexto="firmante"
            />

            <label>
              <span>Fecha de inicio <span className="req">*</span></span>
              <input name="Fecha_Inicio" type="date" value={form.Fecha_Inicio} onChange={handleChange} required />
            </label>

            <label>
              <span>Duración (años) <span className="req">*</span></span>
              <input name="Duracion_anos" type="number" value={form.Duracion_anos} onChange={handleChange} required />
            </label>

            <label>
              Fecha de vencimiento (calculada)
              <input
                value={form.Fecha_Vencimiento
                  ? form.Fecha_Vencimiento.split('-').reverse().join('/')
                  : ''}
                readOnly
                style={{ background: '#f5f5f3', cursor: 'not-allowed' }}
              />
            </label>

            <MontoInput
              label="Monto alquiler inicial"
              value={form.Monto_Alquiler_Inicial}
              onChange={(v) => setForm({ ...form, Monto_Alquiler_Inicial: v })}
              required
            />

            <MontoInput
              label="Monto expensas inicial"
              value={form.Monto_Expensas_Inicial}
              onChange={(v) => setForm({ ...form, Monto_Expensas_Inicial: v })}
              required
            />

            <MontoInput
              label="Monto cochera inicial"
              value={form.Monto_Cochera_Inicial}
              onChange={(v) => setForm({ ...form, Monto_Cochera_Inicial: v })}
            />

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
              <span>Periodicidad de actualización <span className="req">*</span></span>
              <select name="ID_periodicidad" value={form.ID_periodicidad} onChange={handleChange}>
                <option value="">Sin definir</option>
                {periodicidades.map((p) => (
                  <option key={p.ID_periodicidad} value={p.ID_periodicidad}>{p.Descripcion}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Estado del contrato <span className="req">*</span></span>
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
            <LoadingButton type="submit">{editingId ? 'Guardar cambios' : 'Crear contrato'}</LoadingButton>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Listado ({contratos.length})</p>
        {contratos.length === 0 ? (
          <p className="card-empty">No hay contratos cargados todavía.</p>
        ) : (
          <div className="table-wrapper">
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
                  <td>{unidades.find(u => u.ID_unidad === c.ID_unidad)?.Nombre_Unidad || '-'}</td>
                  <td>{personas.find(p => p.ID_persona === c.ID_persona_inquilino)?.Nombre || '-'}</td>
                  <td>{fmtDate(c.Fecha_Inicio)}</td>
                  <td>{fmtDate(c.Fecha_Vencimiento)}</td>
                  <td>{fmtMoney(c.Monto_Alquiler_Inicial)}</td>
                  <td>{estados.find(e => e.ID_estado_contrato === c.ID_estado_contrato)?.Descripcion || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => navigate(`/contratos/${c.ID_contrato}`)}>Ver períodos</button>{' '}
                    <button onClick={() => startEdit(c)}>Editar</button>{' '}
                    <button onClick={() => handleDelete(c.ID_contrato)}>Eliminar</button>
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

export default Contratos