import React, { useEffect, useState } from 'react'
import AccionesMenu from '../components/AccionesMenu'
import SelectorPersona from '../components/SelectorPersona'
import ConfirmModal from '../components/ConfirmModal'

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

const estadoBadge = {
  PENDIENTE: 'badge-neutral',
  PAGADO: 'badge-ok',
  VENCIDO: 'badge-danger',
}

const emptyTarjeta = {
  Nombre_Comercial: '',
  ID_marca_tarjeta: '',
  ID_persona_usuario: '',
  ID_tarjeta_principal: '',
  Banco_Institucion: '',
  Ultimos_4_digitos: '',
  Limite_Credito: '',
  ID_cuenta_debito: '',
  Notas: '',
}

const emptyGasto = {
  Fecha_Compra: '',
  Detalle_Lugar: '',
  Monto_Total_Operacion: '',
  Cuotas_Totales: 1,
  Notas: '',
}

const emptyResumen = {
  Fecha_Cierre: '',
  Fecha_Vencimiento: '',
  Fecha_Proximo_Cierre: '',
  Fecha_Proximo_Vencimiento: '',
  Mantenimiento_Cuenta: '',
  IVA_Comisiones: '',
  Impuestos_Percepciones: '',
  ID_estado_resumen: 'PENDIENTE',
  Conciliado: false,
}

function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([])
  const [personas, setPersonas] = useState([])
  const [marcas, setMarcas] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [mediosPago, setMediosPago] = useState([])
  const [estadosResumen, setEstadosResumen] = useState([])

  const [formTarjeta, setFormTarjeta] = useState(emptyTarjeta)
  const [editingTarjetaId, setEditingTarjetaId] = useState(null)
  const [showFormTarjeta, setShowFormTarjeta] = useState(false)

  const [tarjetaActiva, setTarjetaActiva] = useState(null)
  const [gastos, setGastos] = useState([])
  const [resumenes, setResumenes] = useState([])
  const [vista, setVista] = useState('gastos') // 'gastos' o 'resumenes'

  const [formGasto, setFormGasto] = useState(emptyGasto)
  const [showFormGasto, setShowFormGasto] = useState(false)

  const [formResumen, setFormResumen] = useState(emptyResumen)
  const [showFormResumen, setShowFormResumen] = useState(false)

  const [pagandoResumenId, setPagandoResumenId] = useState(null)
  const [pagoForm, setPagoForm] = useState({ cuentaId: '', fecha: '', monto: '', medio: '' })

  const [confirmModal, setConfirmModal] = useState(null)

  async function loadTarjetas() {
    const [t, p, m, c, mp, er] = await Promise.all([
      window.api.tarjetas.getAll(),
      window.api.personas.getAll(),
      window.api.catalogos.marcasTarjeta(),
      window.api.cuentas.getAll(),
      window.api.catalogos.mediosPago(),
      window.api.catalogos.estadosResumen(),
    ])
    setTarjetas(t)
    setPersonas(p)
    setMarcas(m)
    setCuentas(c)
    setMediosPago(mp)
    setEstadosResumen(er)
  }

  async function loadDetalle(tarjetaId) {
    const [g, r] = await Promise.all([
      window.api.gastos.getByTarjeta(tarjetaId),
      window.api.resumenes.getByTarjeta(tarjetaId),
    ])
    setGastos(g)
    setResumenes(r)
  }

  useEffect(() => {
    loadTarjetas()
  }, [])

  async function handleSubmitTarjeta(e) {
    e.preventDefault()
    const data = {
      ...formTarjeta,
      ID_tarjeta_principal: formTarjeta.ID_tarjeta_principal || null,
      Limite_Credito: formTarjeta.Limite_Credito ? parseFloat(formTarjeta.Limite_Credito) : null,
      ID_cuenta_debito: formTarjeta.ID_cuenta_debito || null,
    }
    if (editingTarjetaId) {
      await window.api.tarjetas.update(editingTarjetaId, data)
    } else {
      await window.api.tarjetas.create({ ID_tarjeta: 'TAR-' + Date.now(), ...data })
    }
    setShowFormTarjeta(false)
    setFormTarjeta(emptyTarjeta)
    setEditingTarjetaId(null)
    loadTarjetas()
  }

  async function handleSubmitGasto(e) {
    e.preventDefault()
    const monto = parseFloat(formGasto.Monto_Total_Operacion)
    const cuotas = parseInt(formGasto.Cuotas_Totales)
    const data = {
      ID_gasto: 'GAS-' + Date.now(),
      ID_tarjeta: tarjetaActiva.ID_tarjeta,
      Fecha_Compra: formGasto.Fecha_Compra + 'T00:00:00.000Z',
      Detalle_Lugar: formGasto.Detalle_Lugar,
      Monto_Total_Operacion: monto,
      Cuotas_Totales: cuotas,
      Notas: formGasto.Notas || null,
    }
    await window.api.gastos.create(data, Math.round((monto / cuotas) * 100) / 100)
    setShowFormGasto(false)
    setFormGasto(emptyGasto)
    loadDetalle(tarjetaActiva.ID_tarjeta)
  }

  async function handleSubmitResumen(e) {
    e.preventDefault()
    const data = {
      ID_resumen: 'RES-' + Date.now(),
      ID_tarjeta_titular: tarjetaActiva.ID_tarjeta,
      Fecha_Cierre: formResumen.Fecha_Cierre + 'T00:00:00.000Z',
      Fecha_Vencimiento: formResumen.Fecha_Vencimiento + 'T00:00:00.000Z',
      Fecha_Proximo_Cierre: formResumen.Fecha_Proximo_Cierre + 'T00:00:00.000Z',
      Fecha_Proximo_Vencimiento: formResumen.Fecha_Proximo_Vencimiento + 'T00:00:00.000Z',
      Mantenimiento_Cuenta: formResumen.Mantenimiento_Cuenta ? parseFloat(formResumen.Mantenimiento_Cuenta) : null,
      IVA_Comisiones: formResumen.IVA_Comisiones ? parseFloat(formResumen.IVA_Comisiones) : null,
      Impuestos_Percepciones: formResumen.Impuestos_Percepciones ? parseFloat(formResumen.Impuestos_Percepciones) : null,
      ID_estado_resumen: formResumen.ID_estado_resumen,
      Conciliado: false,
    }
    await window.api.resumenes.create(data)
    setShowFormResumen(false)
    setFormResumen(emptyResumen)
    loadDetalle(tarjetaActiva.ID_tarjeta)
  }

  async function handlePagarResumen(resumenId) {
    if (!pagoForm.cuentaId || !pagoForm.fecha || !pagoForm.monto || !pagoForm.medio) {
      alert('Completá todos los campos de pago')
      return
    }
    await window.api.resumenes.pagar(
      resumenId,
      pagoForm.cuentaId,
      pagoForm.fecha + 'T00:00:00.000Z',
      parseFloat(pagoForm.monto),
      pagoForm.medio
    )
    setPagandoResumenId(null)
    setPagoForm({ cuentaId: '', fecha: '', monto: '', medio: '' })
    loadDetalle(tarjetaActiva.ID_tarjeta)
  }

async function handleDeleteTarjeta(id) {
    setConfirmModal({
      mensaje: '¿Eliminar esta tarjeta? Se eliminarán también todos sus gastos, cuotas y resúmenes.',
      onConfirmar: async () => {
        await window.api.tarjetas.delete(id)
        setConfirmModal(null)
        loadTarjetas()
      },
    })
  }

  async function handleDeleteGasto(id) {
    setConfirmModal({
      mensaje: '¿Eliminar este gasto y todas sus cuotas?',
      onConfirmar: async () => {
        await window.api.gastos.delete(id)
        setConfirmModal(null)
        loadDetalle(tarjetaActiva.ID_tarjeta)
      },
    })
  }

  async function handleDeleteResumen(id) {
    if (!confirm('¿Eliminar este resumen?')) return
    await window.api.resumenes.delete(id)
    loadDetalle(tarjetaActiva.ID_tarjeta)
  }

  function abrirTarjeta(tarjeta) {
    setTarjetaActiva(tarjeta)
    setVista('gastos')
    loadDetalle(tarjeta.ID_tarjeta)
  }

  // VISTA DETALLE
  if (tarjetaActiva) {
    return (
      <div>
        <button onClick={() => setTarjetaActiva(null)} style={{ marginBottom: '1rem' }}>← Volver a Tarjetas</button>
        <h1 style={{ marginBottom: '4px' }}>{tarjetaActiva.Nombre_Comercial}</h1>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '1.25rem' }}>
          {tarjetaActiva.marca_tarjeta?.Descripcion} · {tarjetaActiva.persona_usuario?.Nombre}
          {tarjetaActiva.Ultimos_4_digitos ? ` · **** ${tarjetaActiva.Ultimos_4_digitos}` : ''}
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
          <button onClick={() => setVista('gastos')} style={{ fontWeight: vista === 'gastos' ? 600 : 400 }}>
            Gastos ({gastos.length})
          </button>
          <button onClick={() => setVista('resumenes')} style={{ fontWeight: vista === 'resumenes' ? 600 : 400 }}>
            Resúmenes ({resumenes.length})
          </button>
        </div>

        {vista === 'gastos' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={() => { setFormGasto(emptyGasto); setShowFormGasto(true) }}>+ Nuevo gasto</button>
            </div>

            {showFormGasto && (
              <form onSubmit={handleSubmitGasto} className="card" style={{ marginBottom: '1.5rem' }}>
                <p className="card-title">Nuevo gasto</p>
                <div className="form-grid">
                  <label>
                    Fecha de compra
                    <input type="date" value={formGasto.Fecha_Compra} onChange={(e) => setFormGasto({ ...formGasto, Fecha_Compra: e.target.value })} required />
                  </label>
                  <label>
                    Detalle / Lugar
                    <input value={formGasto.Detalle_Lugar} onChange={(e) => setFormGasto({ ...formGasto, Detalle_Lugar: e.target.value })} required />
                  </label>
                  <label>
                    Monto total
                    <input type="number" step="0.01" value={formGasto.Monto_Total_Operacion} onChange={(e) => setFormGasto({ ...formGasto, Monto_Total_Operacion: e.target.value })} required />
                  </label>
                  <label>
                    Cuotas
                    <input type="number" min="1" value={formGasto.Cuotas_Totales} onChange={(e) => setFormGasto({ ...formGasto, Cuotas_Totales: e.target.value })} required />
                  </label>
                  <label>
                    Notas
                    <input value={formGasto.Notas} onChange={(e) => setFormGasto({ ...formGasto, Notas: e.target.value })} />
                  </label>
                </div>
                {formGasto.Monto_Total_Operacion && formGasto.Cuotas_Totales && (
                  <p style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                    Cuota estimada: {fmtMoney(Math.round(parseFloat(formGasto.Monto_Total_Operacion) / parseInt(formGasto.Cuotas_Totales) * 100) / 100)}
                  </p>
                )}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button type="submit">Crear gasto</button>
                  <button type="button" onClick={() => setShowFormGasto(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className="card">
              <p className="card-title">Gastos</p>
              {gastos.length === 0 ? (
                <p className="card-empty">No hay gastos cargados.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Detalle</th>
                      <th>Monto total</th>
                      <th>Cuotas</th>
                      <th>Cuota</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map((g) => (
                      <tr key={g.ID_gasto}>
                        <td>{fmtDate(g.Fecha_Compra)}</td>
                        <td>{g.Detalle_Lugar}</td>
                        <td>{fmtMoney(g.Monto_Total_Operacion)}</td>
                        <td>{g.Cuotas_Totales}</td>
                        <td>{fmtMoney(g.cuotas?.[0]?.Monto_Cuota)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => handleDeleteGasto(g.ID_gasto)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {vista === 'resumenes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={() => { setFormResumen(emptyResumen); setShowFormResumen(true) }}>+ Nuevo resumen</button>
            </div>

            {showFormResumen && (
              <form onSubmit={handleSubmitResumen} className="card" style={{ marginBottom: '1.5rem' }}>
                <p className="card-title">Nuevo resumen</p>
                <div className="form-grid">
                  <label>
                    Fecha de cierre
                    <input type="date" value={formResumen.Fecha_Cierre} onChange={(e) => setFormResumen({ ...formResumen, Fecha_Cierre: e.target.value })} required />
                  </label>
                  <label>
                    Fecha de vencimiento
                    <input type="date" value={formResumen.Fecha_Vencimiento} onChange={(e) => setFormResumen({ ...formResumen, Fecha_Vencimiento: e.target.value })} required />
                  </label>
                  <label>
                    Próximo cierre
                    <input type="date" value={formResumen.Fecha_Proximo_Cierre} onChange={(e) => setFormResumen({ ...formResumen, Fecha_Proximo_Cierre: e.target.value })} required />
                  </label>
                  <label>
                    Próximo vencimiento
                    <input type="date" value={formResumen.Fecha_Proximo_Vencimiento} onChange={(e) => setFormResumen({ ...formResumen, Fecha_Proximo_Vencimiento: e.target.value })} required />
                  </label>
                  <label>
                    Mantenimiento de cuenta
                    <input type="number" step="0.01" value={formResumen.Mantenimiento_Cuenta} onChange={(e) => setFormResumen({ ...formResumen, Mantenimiento_Cuenta: e.target.value })} />
                  </label>
                  <label>
                    IVA / Comisiones
                    <input type="number" step="0.01" value={formResumen.IVA_Comisiones} onChange={(e) => setFormResumen({ ...formResumen, IVA_Comisiones: e.target.value })} />
                  </label>
                  <label>
                    Impuestos / Percepciones
                    <input type="number" step="0.01" value={formResumen.Impuestos_Percepciones} onChange={(e) => setFormResumen({ ...formResumen, Impuestos_Percepciones: e.target.value })} />
                  </label>
                  <label>
                    Estado
                    <select value={formResumen.ID_estado_resumen} onChange={(e) => setFormResumen({ ...formResumen, ID_estado_resumen: e.target.value })}>
                      {estadosResumen.map((e) => (
                        <option key={e.ID_estado_resumen} value={e.ID_estado_resumen}>{e.Descripcion}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button type="submit">Crear resumen</button>
                  <button type="button" onClick={() => setShowFormResumen(false)}>Cancelar</button>
                </div>
              </form>
            )}

            <div className="card">
              <p className="card-title">Resúmenes</p>
              {resumenes.length === 0 ? (
                <p className="card-empty">No hay resúmenes cargados.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cierre</th>
                      <th>Vencimiento</th>
                      <th>Mantenimiento</th>
                      <th>IVA/Com.</th>
                      <th>Impuestos</th>
                      <th>Estado</th>
                      <th>Monto pagado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenes.map((r) => (
                      <React.Fragment key={r.ID_resumen}>
                        <tr>
                          <td>{fmtDate(r.Fecha_Cierre)}</td>
                          <td>{fmtDate(r.Fecha_Vencimiento)}</td>
                          <td>{fmtMoney(r.Mantenimiento_Cuenta)}</td>
                          <td>{fmtMoney(r.IVA_Comisiones)}</td>
                          <td>{fmtMoney(r.Impuestos_Percepciones)}</td>
                          <td>
                            <span className={`badge ${estadoBadge[r.ID_estado_resumen] || 'badge-neutral'}`}>
                              {r.estado_resumen?.Descripcion}
                            </span>
                          </td>
                          <td>{fmtMoney(r.Monto_Pagado_Real)}</td>
                          <td style={{ textAlign: 'right' }}>
                            {r.ID_estado_resumen !== 'PAGADO' && (
                              <button onClick={() => {
                                setPagandoResumenId(r.ID_resumen)
                                setPagoForm({ cuentaId: '', fecha: new Date().toISOString().substring(0, 10), monto: '', medio: '' })
                              }}>
                                Registrar pago
                              </button>
                            )}{' '}
                            <button onClick={() => handleDeleteResumen(r.ID_resumen)}>Eliminar</button>
                          </td>
                        </tr>
                        {pagandoResumenId === r.ID_resumen && (
                          <tr>
                            <td colSpan={8}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '8px 0', flexWrap: 'wrap' }}>
                                <label style={{ minWidth: '130px' }}>
                                  Fecha de pago
                                  <input type="date" value={pagoForm.fecha} onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })} />
                                </label>
                                <label style={{ minWidth: '120px' }}>
                                  Monto pagado
                                  <input type="number" step="0.01" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: e.target.value })} />
                                </label>
                                <label style={{ minWidth: '140px' }}>
                                  Cuenta
                                  <select value={pagoForm.cuentaId} onChange={(e) => setPagoForm({ ...pagoForm, cuentaId: e.target.value })}>
                                    <option value="">Seleccionar...</option>
                                    {cuentas.map((c) => (
                                      <option key={c.ID_cuenta} value={c.ID_cuenta}>{c.Nombre_Cuenta}</option>
                                    ))}
                                  </select>
                                </label>
                                <label style={{ minWidth: '140px' }}>
                                  Medio de pago
                                  <select value={pagoForm.medio} onChange={(e) => setPagoForm({ ...pagoForm, medio: e.target.value })}>
                                    <option value="">Seleccionar...</option>
                                    {mediosPago.map((m) => (
                                      <option key={m.ID_medio} value={m.ID_medio}>{m.Descripcion}</option>
                                    ))}
                                  </select>
                                </label>
                                <button onClick={() => handlePagarResumen(r.ID_resumen)}>Confirmar pago</button>
                                <button onClick={() => setPagandoResumenId(null)}>Cancelar</button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // VISTA LISTA DE TARJETAS
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Tarjetas</h1>
        <button onClick={() => { setFormTarjeta(emptyTarjeta); setEditingTarjetaId(null); setShowFormTarjeta(true) }}>
          + Nueva tarjeta
        </button>
      </div>

      {showFormTarjeta && (
        <form onSubmit={handleSubmitTarjeta} className="card" style={{ marginBottom: '1.5rem' }}>
          <p className="card-title">{editingTarjetaId ? 'Editar tarjeta' : 'Nueva tarjeta'}</p>
          <div className="form-grid">
            <label>
              Nombre comercial
              <input value={formTarjeta.Nombre_Comercial} onChange={(e) => setFormTarjeta({ ...formTarjeta, Nombre_Comercial: e.target.value })} required />
            </label>
            <label>
              Marca
              <select value={formTarjeta.ID_marca_tarjeta} onChange={(e) => setFormTarjeta({ ...formTarjeta, ID_marca_tarjeta: e.target.value })} required>
                <option value="">Seleccionar...</option>
                {marcas.map((m) => (
                  <option key={m.ID_marca} value={m.ID_marca}>{m.Descripcion}</option>
                ))}
              </select>
            </label>
            <SelectorPersona
              label="Usuario / Titular"
              value={formTarjeta.ID_persona_usuario}
              onChange={(v) => setFormTarjeta({ ...formTarjeta, ID_persona_usuario: v })}
              personas={personas}
              onPersonaCreada={loadTarjetas}
              contexto="titular"
              required
            />
            <label>
              Banco / Institución
              <input value={formTarjeta.Banco_Institucion} onChange={(e) => setFormTarjeta({ ...formTarjeta, Banco_Institucion: e.target.value })} />
            </label>
            <label>
              Últimos 4 dígitos
              <input value={formTarjeta.Ultimos_4_digitos} onChange={(e) => setFormTarjeta({ ...formTarjeta, Ultimos_4_digitos: e.target.value })} maxLength={4} />
            </label>
            <label>
              Límite de crédito
              <input type="number" step="0.01" value={formTarjeta.Limite_Credito} onChange={(e) => setFormTarjeta({ ...formTarjeta, Limite_Credito: e.target.value })} />
            </label>
            <label>
              Tarjeta principal (si es adicional)
              <select value={formTarjeta.ID_tarjeta_principal} onChange={(e) => setFormTarjeta({ ...formTarjeta, ID_tarjeta_principal: e.target.value })}>
                <option value="">No es adicional</option>
                {tarjetas.map((t) => (
                  <option key={t.ID_tarjeta} value={t.ID_tarjeta}>{t.Nombre_Comercial}</option>
                ))}
              </select>
            </label>
            <label>
              Cuenta de débito asociada
              <select value={formTarjeta.ID_cuenta_debito} onChange={(e) => setFormTarjeta({ ...formTarjeta, ID_cuenta_debito: e.target.value })}>
                <option value="">Sin cuenta asociada</option>
                {cuentas.map((c) => (
                  <option key={c.ID_cuenta} value={c.ID_cuenta}>{c.Nombre_Cuenta}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button type="submit">{editingTarjetaId ? 'Guardar cambios' : 'Crear tarjeta'}</button>
            <button type="button" onClick={() => setShowFormTarjeta(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Tarjetas ({tarjetas.length})</p>
        {tarjetas.length === 0 ? (
          <p className="card-empty">No hay tarjetas cargadas todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Usuario</th>
                <th>Banco</th>
                <th>Últimos 4</th>
                <th>Límite</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tarjetas.map((t) => (
                <tr key={t.ID_tarjeta}>
                  <td>{t.Nombre_Comercial}</td>
                  <td>{t.marca_tarjeta?.Descripcion}</td>
                  <td>{t.persona_usuario?.Nombre}</td>
                  <td>{t.Banco_Institucion || '-'}</td>
                  <td>{t.Ultimos_4_digitos ? `**** ${t.Ultimos_4_digitos}` : '-'}</td>
                  <td>{fmtMoney(t.Limite_Credito)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <AccionesMenu acciones={[
                      { label: 'Ver detalle', onClick: () => abrirTarjeta(t) },
                      {
                        label: 'Editar', onClick: () => {
                          setFormTarjeta({
                            Nombre_Comercial: t.Nombre_Comercial || '',
                            ID_marca_tarjeta: t.ID_marca_tarjeta || '',
                            ID_persona_usuario: t.ID_persona_usuario || '',
                            ID_tarjeta_principal: t.ID_tarjeta_principal || '',
                            Banco_Institucion: t.Banco_Institucion || '',
                            Ultimos_4_digitos: t.Ultimos_4_digitos || '',
                            Limite_Credito: t.Limite_Credito ?? '',
                            ID_cuenta_debito: t.ID_cuenta_debito || '',
                            Notas: t.Notas || '',
                          })
                          setEditingTarjetaId(t.ID_tarjeta)
                          setShowFormTarjeta(true)
                        }
                      },
                      { label: 'Eliminar', onClick: () => handleDeleteTarjeta(t.ID_tarjeta) },
                    ]} />
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

export default Tarjetas