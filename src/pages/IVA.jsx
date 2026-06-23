import { useEffect, useState } from 'react'
import SelectorPersona from '../components/SelectorPersona'

function fmtMoney(n) {
  if (n === null || n === undefined) return '-'
  return '$' + Number(n).toLocaleString('es-AR')
}

function fmtDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('es-AR')
}

const emptyCompra = {
  ID_persona_empresa: '',
  ID_persona_proveedor: '',
  Fecha_Registro: '',
  Fecha_Factura: '',
  ID_tipo_comprobante: '',
  Factura_Numero: '',
  Neto_Gravado_21: '',
  IVA_21: '',
  Neto_Gravado_105: '',
  IVA_105: '',
  Monto_No_Gravado_Exento: '',
  Retencion_IVA: '',
  Retencion_Ganancias: '',
  Retencion_IIBB: '',
  Total_Facturado: '',
  Notas: '',
}

const emptyVenta = {
  ID_persona_empresa: '',
  ID_persona_cliente: '',
  Fecha_Registro: '',
  Fecha_Factura: '',
  ID_tipo_comprobante: '',
  Factura_Numero: '',
  Neto_Gravado_21: '',
  IVA_21: '',
  Neto_Gravado_105: '',
  IVA_105: '',
  Monto_No_Gravado_Exento: '',
  Total_Facturado: '',
  Notas: '',
}

function parseDecimal(v) {
  return v === '' || v === null || v === undefined ? null : parseFloat(v)
}

function IVA() {
  const [vista, setVista] = useState('compras')
  const [compras, setCompras] = useState([])
  const [ventas, setVentas] = useState([])
  const [personas, setPersonas] = useState([])
  const [tiposComprobante, setTiposComprobante] = useState([])

  const [formCompra, setFormCompra] = useState(emptyCompra)
  const [editingCompraId, setEditingCompraId] = useState(null)
  const [showFormCompra, setShowFormCompra] = useState(false)

  const [formVenta, setFormVenta] = useState(emptyVenta)
  const [editingVentaId, setEditingVentaId] = useState(null)
  const [showFormVenta, setShowFormVenta] = useState(false)

  async function loadAll() {
    const [c, v, p, tc] = await Promise.all([
      window.api.ivaCompras.getAll(),
      window.api.ivaVentas.getAll(),
      window.api.personas.getAll(),
      window.api.catalogos.tiposComprobante(),
    ])
    setCompras(c)
    setVentas(v)
    setPersonas(p)
    setTiposComprobante(tc)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function handleSubmitCompra(e) {
    e.preventDefault()
    const data = {
      ...formCompra,
      Fecha_Registro: formCompra.Fecha_Registro + 'T00:00:00.000Z',
      Fecha_Factura: formCompra.Fecha_Factura + 'T00:00:00.000Z',
      Neto_Gravado_21: parseDecimal(formCompra.Neto_Gravado_21),
      IVA_21: parseDecimal(formCompra.IVA_21),
      Neto_Gravado_105: parseDecimal(formCompra.Neto_Gravado_105),
      IVA_105: parseDecimal(formCompra.IVA_105),
      Monto_No_Gravado_Exento: parseDecimal(formCompra.Monto_No_Gravado_Exento),
      Retencion_IVA: parseDecimal(formCompra.Retencion_IVA),
      Retencion_Ganancias: parseDecimal(formCompra.Retencion_Ganancias),
      Retencion_IIBB: parseDecimal(formCompra.Retencion_IIBB),
      Total_Facturado: parseFloat(formCompra.Total_Facturado),
    }
    if (editingCompraId) {
      await window.api.ivaCompras.update(editingCompraId, data)
    } else {
      await window.api.ivaCompras.create({ ID_iva_compra: 'IVC-' + Date.now(), ...data })
    }
    setShowFormCompra(false)
    setFormCompra(emptyCompra)
    setEditingCompraId(null)
    loadAll()
  }

  async function handleSubmitVenta(e) {
    e.preventDefault()
    const data = {
      ...formVenta,
      Fecha_Registro: formVenta.Fecha_Registro + 'T00:00:00.000Z',
      Fecha_Factura: formVenta.Fecha_Factura + 'T00:00:00.000Z',
      Neto_Gravado_21: parseDecimal(formVenta.Neto_Gravado_21),
      IVA_21: parseDecimal(formVenta.IVA_21),
      Neto_Gravado_105: parseDecimal(formVenta.Neto_Gravado_105),
      IVA_105: parseDecimal(formVenta.IVA_105),
      Monto_No_Gravado_Exento: parseDecimal(formVenta.Monto_No_Gravado_Exento),
      Total_Facturado: parseFloat(formVenta.Total_Facturado),
    }
    if (editingVentaId) {
      await window.api.ivaVentas.update(editingVentaId, data)
    } else {
      await window.api.ivaVentas.create({ ID_iva_venta: 'IVV-' + Date.now(), ...data })
    }
    setShowFormVenta(false)
    setFormVenta(emptyVenta)
    setEditingVentaId(null)
    loadAll()
  }

  function startEditCompra(c) {
    setFormCompra({
      ID_persona_empresa: c.ID_persona_empresa || '',
      ID_persona_proveedor: c.ID_persona_proveedor || '',
      Fecha_Registro: c.Fecha_Registro?.substring(0, 10) || '',
      Fecha_Factura: c.Fecha_Factura?.substring(0, 10) || '',
      ID_tipo_comprobante: c.ID_tipo_comprobante || '',
      Factura_Numero: c.Factura_Numero || '',
      Neto_Gravado_21: c.Neto_Gravado_21 ?? '',
      IVA_21: c.IVA_21 ?? '',
      Neto_Gravado_105: c.Neto_Gravado_105 ?? '',
      IVA_105: c.IVA_105 ?? '',
      Monto_No_Gravado_Exento: c.Monto_No_Gravado_Exento ?? '',
      Retencion_IVA: c.Retencion_IVA ?? '',
      Retencion_Ganancias: c.Retencion_Ganancias ?? '',
      Retencion_IIBB: c.Retencion_IIBB ?? '',
      Total_Facturado: c.Total_Facturado ?? '',
      Notas: c.Notas || '',
    })
    setEditingCompraId(c.ID_iva_compra)
    setShowFormCompra(true)
  }

  function startEditVenta(v) {
    setFormVenta({
      ID_persona_empresa: v.ID_persona_empresa || '',
      ID_persona_cliente: v.ID_persona_cliente || '',
      Fecha_Registro: v.Fecha_Registro?.substring(0, 10) || '',
      Fecha_Factura: v.Fecha_Factura?.substring(0, 10) || '',
      ID_tipo_comprobante: v.ID_tipo_comprobante || '',
      Factura_Numero: v.Factura_Numero || '',
      Neto_Gravado_21: v.Neto_Gravado_21 ?? '',
      IVA_21: v.IVA_21 ?? '',
      Neto_Gravado_105: v.Neto_Gravado_105 ?? '',
      IVA_105: v.IVA_105 ?? '',
      Monto_No_Gravado_Exento: v.Monto_No_Gravado_Exento ?? '',
      Total_Facturado: v.Total_Facturado ?? '',
      Notas: v.Notas || '',
    })
    setEditingVentaId(v.ID_iva_venta)
    setShowFormVenta(true)
  }

  const totalIVACompras = compras.reduce((acc, c) => acc + Number(c.IVA_21 || 0) + Number(c.IVA_105 || 0), 0)
  const totalIVAVentas = ventas.reduce((acc, v) => acc + Number(v.IVA_21 || 0) + Number(v.IVA_105 || 0), 0)
  const saldoIVA = totalIVAVentas - totalIVACompras

  return (
    <div>
      <h1>IVA compras / ventas</h1>

      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <p className="metric-label">IVA compras (CF)</p>
          <p className="metric-value" style={{ color: '#c0392b' }}>{fmtMoney(totalIVACompras)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">IVA ventas (DB)</p>
          <p className="metric-value" style={{ color: '#1e8a4c' }}>{fmtMoney(totalIVAVentas)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Saldo IVA</p>
          <p className="metric-value" style={{ color: saldoIVA >= 0 ? '#1e8a4c' : '#c0392b' }}>{fmtMoney(saldoIVA)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
        <button onClick={() => setVista('compras')} style={{ fontWeight: vista === 'compras' ? 600 : 400 }}>
          Compras ({compras.length})
        </button>
        <button onClick={() => setVista('ventas')} style={{ fontWeight: vista === 'ventas' ? 600 : 400 }}>
          Ventas ({ventas.length})
        </button>
      </div>

      {vista === 'compras' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => { setFormCompra(emptyCompra); setEditingCompraId(null); setShowFormCompra(true) }}>
              + Nueva compra
            </button>
          </div>

          {showFormCompra && (
            <form onSubmit={handleSubmitCompra} className="card" style={{ marginBottom: '1.5rem' }}>
              <p className="card-title">{editingCompraId ? 'Editar compra' : 'Nueva compra'}</p>
              <div className="form-grid">
              <SelectorPersona
                  label="Empresa (nuestra S.A.)"
                  value={formCompra.ID_persona_empresa}
                  onChange={(v) => setFormCompra({ ...formCompra, ID_persona_empresa: v })}
                  personas={personas}
                  onPersonaCreada={loadAll}
                  contexto="empresa"
                  required
                />
                <SelectorPersona
                  label="Proveedor"
                  value={formCompra.ID_persona_proveedor}
                  onChange={(v) => setFormCompra({ ...formCompra, ID_persona_proveedor: v })}
                  personas={personas}
                  onPersonaCreada={loadAll}
                  contexto="proveedor"
                  required
                />
                <label>
                  Tipo de comprobante
                  <select value={formCompra.ID_tipo_comprobante} onChange={(e) => setFormCompra({ ...formCompra, ID_tipo_comprobante: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {tiposComprobante.map((t) => <option key={t.ID_tipo_comprobante} value={t.ID_tipo_comprobante}>{t.Descripcion}</option>)}
                  </select>
                </label>
                <label>
                  Número de factura
                  <input value={formCompra.Factura_Numero} onChange={(e) => setFormCompra({ ...formCompra, Factura_Numero: e.target.value })} required />
                </label>
                <label>
                  Fecha de factura
                  <input type="date" value={formCompra.Fecha_Factura} onChange={(e) => setFormCompra({ ...formCompra, Fecha_Factura: e.target.value })} required />
                </label>
                <label>
                  Fecha de registro
                  <input type="date" value={formCompra.Fecha_Registro} onChange={(e) => setFormCompra({ ...formCompra, Fecha_Registro: e.target.value })} required />
                </label>
                <label>
                  Neto gravado 21%
                  <input type="number" step="0.01" value={formCompra.Neto_Gravado_21} onChange={(e) => setFormCompra({ ...formCompra, Neto_Gravado_21: e.target.value })} />
                </label>
                <label>
                  IVA 21%
                  <input type="number" step="0.01" value={formCompra.IVA_21} onChange={(e) => setFormCompra({ ...formCompra, IVA_21: e.target.value })} />
                </label>
                <label>
                  Neto gravado 10.5%
                  <input type="number" step="0.01" value={formCompra.Neto_Gravado_105} onChange={(e) => setFormCompra({ ...formCompra, Neto_Gravado_105: e.target.value })} />
                </label>
                <label>
                  IVA 10.5%
                  <input type="number" step="0.01" value={formCompra.IVA_105} onChange={(e) => setFormCompra({ ...formCompra, IVA_105: e.target.value })} />
                </label>
                <label>
                  No gravado / Exento
                  <input type="number" step="0.01" value={formCompra.Monto_No_Gravado_Exento} onChange={(e) => setFormCompra({ ...formCompra, Monto_No_Gravado_Exento: e.target.value })} />
                </label>
                <label>
                  Retención IVA
                  <input type="number" step="0.01" value={formCompra.Retencion_IVA} onChange={(e) => setFormCompra({ ...formCompra, Retencion_IVA: e.target.value })} />
                </label>
                <label>
                  Retención Ganancias
                  <input type="number" step="0.01" value={formCompra.Retencion_Ganancias} onChange={(e) => setFormCompra({ ...formCompra, Retencion_Ganancias: e.target.value })} />
                </label>
                <label>
                  Retención IIBB
                  <input type="number" step="0.01" value={formCompra.Retencion_IIBB} onChange={(e) => setFormCompra({ ...formCompra, Retencion_IIBB: e.target.value })} />
                </label>
                <label>
                  Total facturado
                  <input type="number" step="0.01" value={formCompra.Total_Facturado} onChange={(e) => setFormCompra({ ...formCompra, Total_Facturado: e.target.value })} required />
                </label>
              </div>
              <label style={{ display: 'block', marginTop: '12px' }}>
                Notas
                <textarea value={formCompra.Notas} onChange={(e) => setFormCompra({ ...formCompra, Notas: e.target.value })} rows={2} />
              </label>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button type="submit">{editingCompraId ? 'Guardar cambios' : 'Registrar compra'}</button>
                <button type="button" onClick={() => setShowFormCompra(false)}>Cancelar</button>
              </div>
            </form>
          )}

          <div className="card">
            <p className="card-title">Libro IVA Compras ({compras.length})</p>
            {compras.length === 0 ? (
              <p className="card-empty">No hay compras registradas.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Nro.</th>
                    <th>Proveedor</th>
                    <th>Neto 21%</th>
                    <th>IVA 21%</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((c) => (
                    <tr key={c.ID_iva_compra}>
                      <td>{fmtDate(c.Fecha_Factura)}</td>
                      <td>{c.tipo_comprobante?.Descripcion}</td>
                      <td>{c.Factura_Numero}</td>
                      <td>{c.proveedor?.Nombre}</td>
                      <td>{fmtMoney(c.Neto_Gravado_21)}</td>
                      <td>{fmtMoney(c.IVA_21)}</td>
                      <td>{fmtMoney(c.Total_Facturado)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => startEditCompra(c)}>Editar</button>{' '}
                        <button onClick={async () => { if (!confirm('¿Eliminar?')) return; await window.api.ivaCompras.delete(c.ID_iva_compra); loadAll() }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {vista === 'ventas' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => { setFormVenta(emptyVenta); setEditingVentaId(null); setShowFormVenta(true) }}>
              + Nueva venta
            </button>
          </div>

          {showFormVenta && (
            <form onSubmit={handleSubmitVenta} className="card" style={{ marginBottom: '1.5rem' }}>
              <p className="card-title">{editingVentaId ? 'Editar venta' : 'Nueva venta'}</p>
              <div className="form-grid">
              <SelectorPersona
                  label="Empresa (nuestra S.A.)"
                  value={formVenta.ID_persona_empresa}
                  onChange={(v) => setFormVenta({ ...formVenta, ID_persona_empresa: v })}
                  personas={personas}
                  onPersonaCreada={loadAll}
                  contexto="empresa"
                  required
                />
                <SelectorPersona
                  label="Cliente"
                  value={formVenta.ID_persona_cliente}
                  onChange={(v) => setFormVenta({ ...formVenta, ID_persona_cliente: v })}
                  personas={personas}
                  onPersonaCreada={loadAll}
                  contexto="cliente"
                  required
                />
                <label>
                  Tipo de comprobante
                  <select value={formVenta.ID_tipo_comprobante} onChange={(e) => setFormVenta({ ...formVenta, ID_tipo_comprobante: e.target.value })} required>
                    <option value="">Seleccionar...</option>
                    {tiposComprobante.map((t) => <option key={t.ID_tipo_comprobante} value={t.ID_tipo_comprobante}>{t.Descripcion}</option>)}
                  </select>
                </label>
                <label>
                  Número de factura
                  <input value={formVenta.Factura_Numero} onChange={(e) => setFormVenta({ ...formVenta, Factura_Numero: e.target.value })} required />
                </label>
                <label>
                  Fecha de factura
                  <input type="date" value={formVenta.Fecha_Factura} onChange={(e) => setFormVenta({ ...formVenta, Fecha_Factura: e.target.value })} required />
                </label>
                <label>
                  Fecha de registro
                  <input type="date" value={formVenta.Fecha_Registro} onChange={(e) => setFormVenta({ ...formVenta, Fecha_Registro: e.target.value })} required />
                </label>
                <label>
                  Neto gravado 21%
                  <input type="number" step="0.01" value={formVenta.Neto_Gravado_21} onChange={(e) => setFormVenta({ ...formVenta, Neto_Gravado_21: e.target.value })} />
                </label>
                <label>
                  IVA 21%
                  <input type="number" step="0.01" value={formVenta.IVA_21} onChange={(e) => setFormVenta({ ...formVenta, IVA_21: e.target.value })} />
                </label>
                <label>
                  Neto gravado 10.5%
                  <input type="number" step="0.01" value={formVenta.Neto_Gravado_105} onChange={(e) => setFormVenta({ ...formVenta, Neto_Gravado_105: e.target.value })} />
                </label>
                <label>
                  IVA 10.5%
                  <input type="number" step="0.01" value={formVenta.IVA_105} onChange={(e) => setFormVenta({ ...formVenta, IVA_105: e.target.value })} />
                </label>
                <label>
                  No gravado / Exento
                  <input type="number" step="0.01" value={formVenta.Monto_No_Gravado_Exento} onChange={(e) => setFormVenta({ ...formVenta, Monto_No_Gravado_Exento: e.target.value })} />
                </label>
                <label>
                  Total facturado
                  <input type="number" step="0.01" value={formVenta.Total_Facturado} onChange={(e) => setFormVenta({ ...formVenta, Total_Facturado: e.target.value })} required />
                </label>
              </div>
              <label style={{ display: 'block', marginTop: '12px' }}>
                Notas
                <textarea value={formVenta.Notas} onChange={(e) => setFormVenta({ ...formVenta, Notas: e.target.value })} rows={2} />
              </label>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button type="submit">{editingVentaId ? 'Guardar cambios' : 'Registrar venta'}</button>
                <button type="button" onClick={() => setShowFormVenta(false)}>Cancelar</button>
              </div>
            </form>
          )}

          <div className="card">
            <p className="card-title">Libro IVA Ventas ({ventas.length})</p>
            {ventas.length === 0 ? (
              <p className="card-empty">No hay ventas registradas.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Comprobante</th>
                    <th>Nro.</th>
                    <th>Cliente</th>
                    <th>Neto 21%</th>
                    <th>IVA 21%</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr key={v.ID_iva_venta}>
                      <td>{fmtDate(v.Fecha_Factura)}</td>
                      <td>{v.tipo_comprobante?.Descripcion}</td>
                      <td>{v.Factura_Numero}</td>
                      <td>{v.cliente?.Nombre}</td>
                      <td>{fmtMoney(v.Neto_Gravado_21)}</td>
                      <td>{fmtMoney(v.IVA_21)}</td>
                      <td>{fmtMoney(v.Total_Facturado)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => startEditVenta(v)}>Editar</button>{' '}
                        <button onClick={async () => { if (!confirm('¿Eliminar?')) return; await window.api.ivaVentas.delete(v.ID_iva_venta); loadAll() }}>Eliminar</button>
                      </td>
                    </tr>
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

export default IVA