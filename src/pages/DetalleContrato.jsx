import React, { useEffect, useState } from 'react'
import { contratos as contratosApi, periodos as periodosApi, cuentas as cuentasApi, catalogos, cobros as cobrosApi } from '../services/api'
import { useParams, useNavigate } from 'react-router-dom'

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  return '$' + Number(n).toLocaleString('es-AR')
}

const estadoClass = {
  PENDIENTE: 'badge-neutral',
  PAGADO: 'badge-ok',
  EN_MORA: 'badge-danger',
}

function DetalleContrato() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contrato, setContrato] = useState(null)
  const [periodos, setPeriodos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [imputaciones, setImputaciones] = useState([])
  const [mediosPago, setMediosPago] = useState([])
  const [editandoPeriodo, setEditandoPeriodo] = useState(null)
  const [montoEdit, setMontoEdit] = useState({ Monto_Alquiler: '', Monto_Expensas: '', Monto_Cochera: '' })
  const [cobrando, setCobrando] = useState(null)
  const [cobroForm, setCobroForm] = useState({ Monto_Pagado: '', ID_cuenta_destino: '', Imputacion_Pago: '', Fecha_Pago: '', ID_medio_pago: '' })

  async function loadAll() {
    const [c, p, cu, imp, mp] = await Promise.all([
      contratosApi.getById(id),
      periodosApi.getByContrato(id),
      cuentasApi.getAll(),
      catalogos.imputaciones(),
      catalogos.mediosPago(),
    ])
    setContrato(c)
    setPeriodos(p)
    setCuentas(cu)
    setImputaciones(imp)
    setMediosPago(mp)
  }

  useEffect(() => {
    loadAll()
  }, [id])

  function startEditPeriodo(periodo) {
    setMontoEdit({
      Monto_Alquiler: periodo.Monto_Alquiler,
      Monto_Expensas: periodo.Monto_Expensas,
      Monto_Cochera: periodo.Monto_Cochera,
    })
    setEditandoPeriodo(periodo.ID_periodo_contrato)
  }

  async function guardarMontoPeriodo(periodoId) {
    await periodosApi.updateConContrato(id, periodoId, {
      Monto_Alquiler: parseFloat(montoEdit.Monto_Alquiler),
      Monto_Expensas: parseFloat(montoEdit.Monto_Expensas),
      Monto_Cochera: parseFloat(montoEdit.Monto_Cochera || 0),
    })
    setEditandoPeriodo(null)
    loadAll()
  }

  function startCobro(periodo) {
    const total =
      Number(periodo.Monto_Alquiler) +
      Number(periodo.Monto_Expensas) +
      Number(periodo.Monto_Cochera) +
      Number(periodo.Monto_Municipalidad) +
      Number(periodo.Monto_Otros) +
      Number(periodo.Monto_Recargo)
    setCobroForm({
      Monto_Pagado: total,
      ID_cuenta_destino: '',
      Imputacion_Pago: 'ALQUILER',
      Fecha_Pago: new Date().toISOString().substring(0, 10),
      ID_medio_pago: '',
    })
    setCobrando(periodo.ID_periodo_contrato)
  }
  
  function mesesPorPeriodicidad(id) {
    if (id === 'CUATRIMESTRAL') return 4
    if (id === 'SEMESTRAL') return 6
    return null
  }

  async function confirmarCobro(periodoId) {
    if (!cobroForm.ID_cuenta_destino) {
      alert('Elegí una cuenta destino')
      return
    }
    if (!cobroForm.ID_medio_pago) {
      alert('Elegí un medio de pago')
      return
    }
    await cobrosApi.create({
      ID_periodo_contrato: periodoId,
      Fecha_Pago: cobroForm.Fecha_Pago + 'T00:00:00.000Z',
      Monto_Pagado: parseFloat(cobroForm.Monto_Pagado),
      Imputacion_Pago: cobroForm.Imputacion_Pago,
      ID_cuenta_destino: cobroForm.ID_cuenta_destino,
    })
    setCobrando(null)
    loadAll()
  }

  if (!contrato) return <div>Cargando...</div>

  const intervaloAumento = mesesPorPeriodicidad(contrato.ID_periodicidad)

  return (
    <div>
      <button onClick={() => navigate('/contratos')} style={{ marginBottom: '1rem' }}>← Volver a Contratos</button>

      <h1 style={{ marginBottom: '4px' }}>
        {contrato.unidad?.Nombre_Unidad} — {contrato.inquilino?.Nombre}
      </h1>
      <p style={{ color: '#888', fontSize: '13px', marginBottom: '1.25rem' }}>
        Contrato desde {contrato.Fecha_Inicio?.substring(0, 10)} hasta {contrato.Fecha_Vencimiento?.substring(0, 10)}
      </p>

      <div className="card">
        <p className="card-title">Períodos del contrato ({periodos.length})</p>
        <div className="table-wrapper">
          <table className="data-table">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Alquiler</th>
              <th>Expensas</th>
              <th>Cochera</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((p) => (
                <React.Fragment key={p.ID_periodo_contrato}>
                    <tr key={p.ID_periodo_contrato} style={intervaloAumento && p.Numero_Cuota % intervaloAumento === 1 && p.Numero_Cuota > 1 ? { background: '#fff8e1' } : undefined}>
                  <td>
                    {p.Mes_Ano}
                    {intervaloAumento && p.Numero_Cuota % intervaloAumento === 1 && p.Numero_Cuota > 1 && (
                      <span className="badge" style={{ background: '#fde7b5', color: '#8a6300', marginLeft: '6px' }}>
                        Corresponde aumento
                      </span>
                    )}
                  </td>
                  <td>{fmtMoney(p.Monto_Alquiler)}</td>
                  <td>{fmtMoney(p.Monto_Expensas)}</td>
                  <td>{fmtMoney(p.Monto_Cochera)}</td>
                  <td>
                    <span className={`badge ${estadoClass[p.ID_estado_periodo] || 'badge-neutral'}`}>
                      {p.ID_estado_periodo === 'PENDIENTE' ? 'Pendiente' : p.ID_estado_periodo === 'PAGADO' ? 'Pagado' : p.ID_estado_periodo === 'EN_MORA' ? 'En mora' : p.ID_estado_periodo}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => startEditPeriodo(p)}>Editar montos</button>{' '}
                    {p.ID_estado_periodo !== 'PAGADO' && (
                      <button onClick={() => startCobro(p)}>Registrar cobro</button>
                    )}
                  </td>
                </tr>

                {editandoPeriodo === p.ID_periodo_contrato && (
                  <tr>
                    <td colSpan={6}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '8px 0' }}>
                        <label>
                          Alquiler
                          <input
                            type="number"
                            step="0.01"
                            value={montoEdit.Monto_Alquiler}
                            onChange={(e) => setMontoEdit({ ...montoEdit, Monto_Alquiler: e.target.value })}
                          />
                        </label>
                        <label>
                          Expensas
                          <input
                            type="number"
                            step="0.01"
                            value={montoEdit.Monto_Expensas}
                            onChange={(e) => setMontoEdit({ ...montoEdit, Monto_Expensas: e.target.value })}
                          />
                        </label>
                        <label>
                          Cochera
                          <input
                            type="number"
                            step="0.01"
                            value={montoEdit.Monto_Cochera}
                            onChange={(e) => setMontoEdit({ ...montoEdit, Monto_Cochera: e.target.value })}
                          />
                        </label>
                        <button onClick={() => guardarMontoPeriodo(p.ID_periodo_contrato)}>Guardar</button>
                        <button onClick={() => setEditandoPeriodo(null)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                )}

                {cobrando === p.ID_periodo_contrato && (
                  <tr>
                    <td colSpan={6}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: '8px 0', flexWrap: 'wrap' }}>
                        <label style={{ minWidth: '110px' }}>
                          Monto pagado
                          <input
                            type="number"
                            step="0.01"
                            value={cobroForm.Monto_Pagado}
                            onChange={(e) => setCobroForm({ ...cobroForm, Monto_Pagado: e.target.value })}
                          />
                        </label>
                        <label style={{ minWidth: '130px' }}>
                          Fecha de pago
                          <input
                            type="date"
                            value={cobroForm.Fecha_Pago}
                            onChange={(e) => setCobroForm({ ...cobroForm, Fecha_Pago: e.target.value })}
                          />
                        </label>
                        <label style={{ minWidth: '140px' }}>
                          Cuenta destino
                          <select
                            value={cobroForm.ID_cuenta_destino}
                            onChange={(e) => setCobroForm({ ...cobroForm, ID_cuenta_destino: e.target.value })}
                          >
                            <option value="">Seleccionar...</option>
                            {cuentas.map((c) => (
                              <option key={c.ID_cuenta} value={c.ID_cuenta}>{c.Nombre_Cuenta}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ minWidth: '120px' }}>
                          Imputación
                          <select
                            value={cobroForm.Imputacion_Pago}
                            onChange={(e) => setCobroForm({ ...cobroForm, Imputacion_Pago: e.target.value })}
                          >
                            {imputaciones.map((i) => (
                              <option key={i.ID_imputacion} value={i.ID_imputacion}>{i.Descripcion}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ minWidth: '140px' }}>
                          Medio de pago
                          <select
                            value={cobroForm.ID_medio_pago}
                            onChange={(e) => setCobroForm({ ...cobroForm, ID_medio_pago: e.target.value })}
                          >
                            <option value="">Seleccionar...</option>
                            {mediosPago.map((m) => (
                              <option key={m.ID_medio} value={m.ID_medio}>{m.Descripcion}</option>
                            ))}
                          </select>
                        </label>
                        <button onClick={() => confirmarCobro(p.ID_periodo_contrato)}>Confirmar cobro</button>
                        <button onClick={() => setCobrando(null)}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DetalleContrato