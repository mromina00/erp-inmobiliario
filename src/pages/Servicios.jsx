import React, { useEffect, useState } from "react";

const emptyServicio = {
  ID_unidad: "",
  ID_tipo_servicio: "",
  Empresa_Prestadora: "",
  Numero_Cuenta: "",
  Numero_Medidor: "",
  ID_persona_titular: "",
  Notas: "",
};

const emptyBoleta = {
  Periodo: "",
  Numero_Liquidacion: "",
  Lectura_Anterior: "",
  Lectura_Actual: "",
  Fecha_Vencimiento: "",
  Importe: "",
  Responsable_Pago: "",
  ID_estado_boleta: "PENDIENTE",
  Notas: "",
};

function fmtMoney(n) {
  if (!n) return "-";
  return "$" + Number(n).toLocaleString("es-AR");
}

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("es-AR");
}

const estadoBadge = {
  PENDIENTE: "badge-neutral",
  PAGADA: "badge-ok",
  VENCIDA: "badge-danger",
};

function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [estadosBoleta, setEstadosBoleta] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);

  const [formServicio, setFormServicio] = useState(emptyServicio);
  const [editingServicioId, setEditingServicioId] = useState(null);
  const [showFormServicio, setShowFormServicio] = useState(false);

  const [servicioActivo, setServicioActivo] = useState(null);
  const [boletas, setBoletas] = useState([]);
  const [formBoleta, setFormBoleta] = useState(emptyBoleta);
  const [editingBoletaId, setEditingBoletaId] = useState(null);
  const [showFormBoleta, setShowFormBoleta] = useState(false);

  const [pagandoId, setPagandoId] = useState(null);
  const [pagoForm, setPagoForm] = useState({
    cuentaId: "",
    fecha: "",
    medio: "",
  });

  async function loadServicios() {
    const [s, u, p, ts, eb, r, c, mp] = await Promise.all([
      window.api.servicios.getAll(),
      window.api.unidades.getAll(),
      window.api.personas.getAll(),
      window.api.catalogos.tiposServicio(),
      window.api.catalogos.estadosBoleta(),
      window.api.catalogos.responsablesPago(),
      window.api.cuentas.getAll(),
      window.api.catalogos.mediosPago(),
    ]);
    setServicios(s);
    setUnidades(u);
    setPersonas(p);
    setTiposServicio(ts);
    setEstadosBoleta(eb);
    setResponsables(r);
    setCuentas(c);
    setMediosPago(mp);
  }

  async function loadBoletas(servicioId) {
    const data = await window.api.boletas.getByServicio(servicioId);
    setBoletas(data);
  }

  useEffect(() => {
    loadServicios();
  }, []);

  function handleChangeServicio(e) {
    setFormServicio({ ...formServicio, [e.target.name]: e.target.value });
  }

  function handleChangeBoleta(e) {
    setFormBoleta({ ...formBoleta, [e.target.name]: e.target.value });
  }

  async function handleSubmitServicio(e) {
    e.preventDefault();
    if (editingServicioId) {
      await window.api.servicios.update(editingServicioId, formServicio);
    } else {
      const id = "SP-" + Date.now();
      await window.api.servicios.create({
        ID_servicio_prop: id,
        ...formServicio,
      });
    }
    setShowFormServicio(false);
    setFormServicio(emptyServicio);
    setEditingServicioId(null);
    loadServicios();
  }

  async function handleSubmitBoleta(e) {
    e.preventDefault();
    const data = {
      ...formBoleta,
      ID_servicio_prop: servicioActivo.ID_servicio_prop,
      Numero_Liquidacion: parseInt(formBoleta.Numero_Liquidacion) || 0,
      Lectura_Anterior: formBoleta.Lectura_Anterior
        ? parseFloat(formBoleta.Lectura_Anterior)
        : null,
      Lectura_Actual: formBoleta.Lectura_Actual
        ? parseFloat(formBoleta.Lectura_Actual)
        : null,
      Importe: parseFloat(formBoleta.Importe),
      Fecha_Vencimiento: formBoleta.Fecha_Vencimiento + "T00:00:00.000Z",
      ID_cuenta_pago: null,
      Fecha_Pago: null,
    };
    if (editingBoletaId) {
      await window.api.boletas.update(editingBoletaId, data);
    } else {
      const id = "BOL-" + Date.now();
      await window.api.boletas.create({ ID_boleta: id, ...data });
    }
    setShowFormBoleta(false);
    setFormBoleta(emptyBoleta);
    setEditingBoletaId(null);
    loadBoletas(servicioActivo.ID_servicio_prop);
  }

  async function handlePagar(boleta) {
    const esInquilino = boleta.Responsable_Pago === "INQUILINO";
    if (!pagoForm.fecha) {
      alert("Ingresá la fecha de pago");
      return;
    }
    if (!esInquilino && (!pagoForm.cuentaId || !pagoForm.medio)) {
      alert("Completá cuenta y medio de pago");
      return;
    }
    await window.api.boletas.pagar(
      boleta.ID_boleta,
      pagoForm.cuentaId || null,
      pagoForm.fecha + "T00:00:00.000Z",
      pagoForm.medio || null,
      boleta.Responsable_Pago
    );
    setPagandoId(null);
    setPagoForm({ cuentaId: "", fecha: "", medio: "" });
    loadBoletas(servicioActivo.ID_servicio_prop);
  }

  async function handleDeleteServicio(id) {
    if (!confirm("¿Eliminar este servicio?")) return;
    await window.api.servicios.delete(id);
    loadServicios();
  }

  async function handleDeleteBoleta(id) {
    if (!confirm("¿Eliminar esta boleta?")) return;
    await window.api.boletas.delete(id);
    loadBoletas(servicioActivo.ID_servicio_prop);
  }

  function abrirServicio(servicio) {
    setServicioActivo(servicio);
    loadBoletas(servicio.ID_servicio_prop);
  }

  if (servicioActivo) {
    return (
      <div>
        <button
          onClick={() => setServicioActivo(null)}
          style={{ marginBottom: "1rem" }}
        >
          ← Volver a Servicios
        </button>
        <h1 style={{ marginBottom: "4px" }}>
          {servicioActivo.tipo_servicio?.Descripcion} —{" "}
          {servicioActivo.unidad?.Nombre_Unidad}
        </h1>
        <p style={{ color: "#888", fontSize: "13px", marginBottom: "1.25rem" }}>
          {servicioActivo.Empresa_Prestadora} · Cuenta:{" "}
          {servicioActivo.Numero_Cuenta || "-"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={() => {
              setFormBoleta(emptyBoleta);
              setEditingBoletaId(null);
              setShowFormBoleta(true);
            }}
          >
            + Nueva boleta
          </button>
        </div>

        {showFormBoleta && (
          <form
            onSubmit={handleSubmitBoleta}
            className="card"
            style={{ marginBottom: "1.5rem" }}
          >
            <p className="card-title">
              {editingBoletaId ? "Editar boleta" : "Nueva boleta"}
            </p>
            <div className="form-grid">
              <label>
                Período (AAAA-MM)
                <input
                  name="Periodo"
                  value={formBoleta.Periodo}
                  onChange={handleChangeBoleta}
                  placeholder="2026-07"
                  required
                />
              </label>
              <label>
                Nro. Liquidación
                <input
                  name="Numero_Liquidacion"
                  type="number"
                  value={formBoleta.Numero_Liquidacion}
                  onChange={handleChangeBoleta}
                />
              </label>
              <label>
                Fecha vencimiento
                <input
                  name="Fecha_Vencimiento"
                  type="date"
                  value={formBoleta.Fecha_Vencimiento}
                  onChange={handleChangeBoleta}
                  required
                />
              </label>
              <label>
                Importe
                <input
                  name="Importe"
                  type="number"
                  step="0.01"
                  value={formBoleta.Importe}
                  onChange={handleChangeBoleta}
                  required
                />
              </label>
              <label>
                Lectura anterior
                <input
                  name="Lectura_Anterior"
                  type="number"
                  step="0.01"
                  value={formBoleta.Lectura_Anterior}
                  onChange={handleChangeBoleta}
                />
              </label>
              <label>
                Lectura actual
                <input
                  name="Lectura_Actual"
                  type="number"
                  step="0.01"
                  value={formBoleta.Lectura_Actual}
                  onChange={handleChangeBoleta}
                />
              </label>
              <label>
                Responsable de pago
                <select
                  name="Responsable_Pago"
                  value={formBoleta.Responsable_Pago}
                  onChange={handleChangeBoleta}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {responsables.map((r) => (
                    <option key={r.ID_responsable} value={r.ID_responsable}>
                      {r.Descripcion}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Estado
                <select
                  name="ID_estado_boleta"
                  value={formBoleta.ID_estado_boleta}
                  onChange={handleChangeBoleta}
                >
                  {estadosBoleta.map((e) => (
                    <option key={e.ID_estado_boleta} value={e.ID_estado_boleta}>
                      {e.Descripcion}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button type="submit">
                {editingBoletaId ? "Guardar cambios" : "Crear boleta"}
              </button>
              <button type="button" onClick={() => setShowFormBoleta(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="card">
          <p className="card-title">Boletas ({boletas.length})</p>
          {boletas.length === 0 ? (
            <p className="card-empty">No hay boletas cargadas todavía.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Vencimiento</th>
                  <th>Importe</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                  <th>Fecha pago</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {boletas.map((b) => (
                  <React.Fragment key={b.ID_boleta}>
                    <tr key={b.ID_boleta}>
                      <td>{b.Periodo}</td>
                      <td>{fmtDate(b.Fecha_Vencimiento)}</td>
                      <td>{fmtMoney(b.Importe)}</td>
                      <td>{b.responsable_pago?.Descripcion}</td>
                      <td>
                        <span
                          className={`badge ${
                            estadoBadge[b.ID_estado_boleta] || "badge-neutral"
                          }`}
                        >
                          {b.estado_boleta?.Descripcion}
                        </span>
                      </td>
                      <td>{fmtDate(b.Fecha_Pago)}</td>
                      <td style={{ textAlign: "right" }}>
                        {b.ID_estado_boleta !== "PAGADA" && (
                          <button
                            onClick={() => {
                              setPagandoId(b.ID_boleta);
                              setPagoForm({
                                cuentaId: "",
                                fecha: new Date()
                                  .toISOString()
                                  .substring(0, 10),
                                medio: "",
                              });
                            }}
                          >
                            Registrar pago
                          </button>
                        )}{" "}
                        <button onClick={() => handleDeleteBoleta(b.ID_boleta)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                    {pagandoId === b.ID_boleta && (
                      <tr>
                        <td colSpan={7}>
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "flex-end",
                              padding: "8px 0",
                              flexWrap: "wrap",
                            }}
                          >
                            <label style={{ minWidth: "130px" }}>
                              Fecha de pago
                              <input
                                type="date"
                                value={pagoForm.fecha}
                                onChange={(e) =>
                                  setPagoForm({
                                    ...pagoForm,
                                    fecha: e.target.value,
                                  })
                                }
                              />
                            </label>
                            {b.Responsable_Pago === "PROPIETARIO" && (
                              <>
                                <label style={{ minWidth: "140px" }}>
                                  Cuenta
                                  <select
                                    value={pagoForm.cuentaId}
                                    onChange={(e) =>
                                      setPagoForm({
                                        ...pagoForm,
                                        cuentaId: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="">Seleccionar...</option>
                                    {cuentas.map((c) => (
                                      <option
                                        key={c.ID_cuenta}
                                        value={c.ID_cuenta}
                                      >
                                        {c.Nombre_Cuenta}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                                <label style={{ minWidth: "140px" }}>
                                  Medio de pago
                                  <select
                                    value={pagoForm.medio}
                                    onChange={(e) =>
                                      setPagoForm({
                                        ...pagoForm,
                                        medio: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="">Seleccionar...</option>
                                    {mediosPago.map((m) => (
                                      <option
                                        key={m.ID_medio}
                                        value={m.ID_medio}
                                      >
                                        {m.Descripcion}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              </>
                            )}
                            <button onClick={() => handlePagar(b)}>
                              Confirmar pago
                            </button>
                            <button onClick={() => setPagandoId(null)}>
                              Cancelar
                            </button>
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
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Boletas y tasas</h1>
        <button
          onClick={() => {
            setFormServicio(emptyServicio);
            setEditingServicioId(null);
            setShowFormServicio(true);
          }}
        >
          + Nuevo servicio
        </button>
      </div>

      {showFormServicio && (
        <form
          onSubmit={handleSubmitServicio}
          className="card"
          style={{ marginBottom: "1.5rem" }}
        >
          <p className="card-title">
            {editingServicioId ? "Editar servicio" : "Nuevo servicio"}
          </p>
          <div className="form-grid">
            <label>
              Unidad
              <select
                name="ID_unidad"
                value={formServicio.ID_unidad}
                onChange={handleChangeServicio}
                required
              >
                <option value="">Seleccionar...</option>
                {unidades.map((u) => (
                  <option key={u.ID_unidad} value={u.ID_unidad}>
                    {u.Nombre_Unidad}{" "}
                    {u.edificio ? `(${u.edificio.Nombre})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tipo de servicio
              <select
                name="ID_tipo_servicio"
                value={formServicio.ID_tipo_servicio}
                onChange={handleChangeServicio}
                required
              >
                <option value="">Seleccionar...</option>
                {tiposServicio.map((t) => (
                  <option key={t.ID_tipo_serv} value={t.ID_tipo_serv}>
                    {t.Descripcion}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Empresa prestadora
              <input
                name="Empresa_Prestadora"
                value={formServicio.Empresa_Prestadora}
                onChange={handleChangeServicio}
                required
              />
            </label>
            <label>
              Número de cuenta
              <input
                name="Numero_Cuenta"
                value={formServicio.Numero_Cuenta}
                onChange={handleChangeServicio}
              />
            </label>
            <label>
              Número de medidor
              <input
                name="Numero_Medidor"
                value={formServicio.Numero_Medidor}
                onChange={handleChangeServicio}
              />
            </label>
            <label>
              Titular
              <select
                name="ID_persona_titular"
                value={formServicio.ID_persona_titular}
                onChange={handleChangeServicio}
                required
              >
                <option value="">Seleccionar...</option>
                {personas.map((p) => (
                  <option key={p.ID_persona} value={p.ID_persona}>
                    {p.Nombre}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button type="submit">
              {editingServicioId ? "Guardar cambios" : "Crear servicio"}
            </button>
            <button type="button" onClick={() => setShowFormServicio(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <p className="card-title">Servicios registrados ({servicios.length})</p>
        {servicios.length === 0 ? (
          <p className="card-empty">No hay servicios cargados todavía.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Empresa</th>
                <th>Nro. Cuenta</th>
                <th>Titular</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.ID_servicio_prop}>
                  <td>{s.tipo_servicio?.Descripcion}</td>
                  <td>{s.unidad?.Nombre_Unidad}</td>
                  <td>{s.Empresa_Prestadora}</td>
                  <td>{s.Numero_Cuenta || "-"}</td>
                  <td>{s.titular?.Nombre}</td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => abrirServicio(s)}>
                      Ver boletas
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteServicio(s.ID_servicio_prop)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Servicios;
