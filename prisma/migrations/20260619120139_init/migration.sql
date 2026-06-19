-- CreateTable
CREATE TABLE "tipos_unidad" (
    "ID_tipo" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "perfiles_cobro" (
    "ID_perfil" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_unidad" (
    "ID_estado_unidad" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "edificios" (
    "ID_edificio" TEXT NOT NULL PRIMARY KEY,
    "Nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "roles_persona" (
    "ID_rol" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "ID_tipo_doc" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_persona" (
    "ID_tipo_persona" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_persona" (
    "ID_estado_persona" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_cuenta" (
    "ID_tipo_cuenta" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "monedas" (
    "ID_moneda" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL,
    "Simbolo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "marcas_tarjeta" (
    "ID_marca" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_resumen" (
    "ID_estado_resumen" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_indice" (
    "ID_indice" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "periodicidades" (
    "ID_periodicidad" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_contrato" (
    "ID_estado_contrato" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_periodo" (
    "ID_estado_periodo" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "imputaciones" (
    "ID_imputacion" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_servicio" (
    "ID_tipo_serv" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_boleta" (
    "ID_estado_boleta" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "responsables_pago" (
    "ID_responsable" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "medios_pago" (
    "ID_medio" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "subcategorias_flujo" (
    "ID_subcat" TEXT NOT NULL PRIMARY KEY,
    "Tipo_Movimiento" TEXT NOT NULL,
    "Categoria_Padre" TEXT NOT NULL,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tipo_comprobante" (
    "ID_tipo_comprobante" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "estados_vencimiento" (
    "ID_estado_vencimiento" TEXT NOT NULL PRIMARY KEY,
    "Descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "personas" (
    "ID_persona" TEXT NOT NULL PRIMARY KEY,
    "Nombre" TEXT NOT NULL,
    "ID_tipo_doc" TEXT NOT NULL,
    "Documento" TEXT,
    "ID_tipo_persona" TEXT NOT NULL,
    "ID_rol_persona" TEXT NOT NULL,
    "Direccion" TEXT,
    "Localidad" TEXT,
    "Provincia" TEXT,
    "Telefono" TEXT,
    "Email" TEXT,
    "ID_estado_persona" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "personas_ID_tipo_doc_fkey" FOREIGN KEY ("ID_tipo_doc") REFERENCES "tipos_documento" ("ID_tipo_doc") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personas_ID_tipo_persona_fkey" FOREIGN KEY ("ID_tipo_persona") REFERENCES "tipos_persona" ("ID_tipo_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personas_ID_rol_persona_fkey" FOREIGN KEY ("ID_rol_persona") REFERENCES "roles_persona" ("ID_rol") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "personas_ID_estado_persona_fkey" FOREIGN KEY ("ID_estado_persona") REFERENCES "estados_persona" ("ID_estado_persona") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "datos_juridicos" (
    "ID_juridico" TEXT NOT NULL PRIMARY KEY,
    "ID_persona_empresa" TEXT NOT NULL,
    "Inscripcion_comercial" TEXT,
    "ID_persona_representante" TEXT NOT NULL,
    "Cargo_representante" TEXT,
    CONSTRAINT "datos_juridicos_ID_persona_empresa_fkey" FOREIGN KEY ("ID_persona_empresa") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "datos_juridicos_ID_persona_representante_fkey" FOREIGN KEY ("ID_persona_representante") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "unidades" (
    "ID_unidad" TEXT NOT NULL PRIMARY KEY,
    "Nombre_Unidad" TEXT NOT NULL,
    "ID_tipo" TEXT NOT NULL,
    "ID_perfil" TEXT NOT NULL,
    "ID_edificio" TEXT,
    "Piso" INTEGER,
    "Numero" INTEGER,
    "Dormitorios" INTEGER,
    "Direccion" TEXT NOT NULL,
    "ID_estado" TEXT NOT NULL,
    "Equipamiento" TEXT,
    "Notas" TEXT,
    CONSTRAINT "unidades_ID_tipo_fkey" FOREIGN KEY ("ID_tipo") REFERENCES "tipos_unidad" ("ID_tipo") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "unidades_ID_perfil_fkey" FOREIGN KEY ("ID_perfil") REFERENCES "perfiles_cobro" ("ID_perfil") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "unidades_ID_edificio_fkey" FOREIGN KEY ("ID_edificio") REFERENCES "edificios" ("ID_edificio") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "unidades_ID_estado_fkey" FOREIGN KEY ("ID_estado") REFERENCES "estados_unidad" ("ID_estado_unidad") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "contratos" (
    "ID_contrato" TEXT NOT NULL PRIMARY KEY,
    "ID_unidad" TEXT NOT NULL,
    "ID_persona_inquilino" TEXT NOT NULL,
    "ID_persona_firmante" TEXT,
    "Duracion_anos" INTEGER NOT NULL,
    "Fecha_Inicio" DATETIME NOT NULL,
    "Fecha_Vencimiento" DATETIME NOT NULL,
    "Monto_Alquiler_Inicial" DECIMAL NOT NULL,
    "ID_tipo_indice" TEXT,
    "ID_periodicidad" TEXT,
    "Monto_Expensas_Inicial" DECIMAL NOT NULL,
    "Monto_Cochera_Inicial" DECIMAL,
    "ID_contrato_anterior" TEXT,
    "ID_estado_contrato" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "contratos_ID_unidad_fkey" FOREIGN KEY ("ID_unidad") REFERENCES "unidades" ("ID_unidad") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_persona_inquilino_fkey" FOREIGN KEY ("ID_persona_inquilino") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_persona_firmante_fkey" FOREIGN KEY ("ID_persona_firmante") REFERENCES "personas" ("ID_persona") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_tipo_indice_fkey" FOREIGN KEY ("ID_tipo_indice") REFERENCES "tipos_indice" ("ID_indice") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_periodicidad_fkey" FOREIGN KEY ("ID_periodicidad") REFERENCES "periodicidades" ("ID_periodicidad") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_estado_contrato_fkey" FOREIGN KEY ("ID_estado_contrato") REFERENCES "estados_contrato" ("ID_estado_contrato") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "contratos_ID_contrato_anterior_fkey" FOREIGN KEY ("ID_contrato_anterior") REFERENCES "contratos" ("ID_contrato") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "garantes_contrato" (
    "ID_garante_contrato" TEXT NOT NULL PRIMARY KEY,
    "ID_contrato" TEXT NOT NULL,
    "ID_persona_garante" TEXT NOT NULL,
    CONSTRAINT "garantes_contrato_ID_contrato_fkey" FOREIGN KEY ("ID_contrato") REFERENCES "contratos" ("ID_contrato") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "garantes_contrato_ID_persona_garante_fkey" FOREIGN KEY ("ID_persona_garante") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "periodos_contrato" (
    "ID_periodo_contrato" TEXT NOT NULL PRIMARY KEY,
    "ID_contrato" TEXT NOT NULL,
    "Numero_Cuota" INTEGER NOT NULL,
    "Mes_Ano" TEXT NOT NULL,
    "Monto_Alquiler" DECIMAL NOT NULL,
    "Monto_Expensas" DECIMAL NOT NULL,
    "Monto_Cochera" DECIMAL NOT NULL,
    "Monto_Municipalidad" DECIMAL NOT NULL,
    "Monto_Otros" DECIMAL NOT NULL,
    "Porcentaje_Recargo" DECIMAL NOT NULL,
    "Monto_Recargo" DECIMAL NOT NULL,
    "ID_estado_periodo" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "periodos_contrato_ID_contrato_fkey" FOREIGN KEY ("ID_contrato") REFERENCES "contratos" ("ID_contrato") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "periodos_contrato_ID_estado_periodo_fkey" FOREIGN KEY ("ID_estado_periodo") REFERENCES "estados_periodo" ("ID_estado_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "periodos_comerciales" (
    "ID_periodo_comercial" TEXT NOT NULL PRIMARY KEY,
    "ID_contrato" TEXT NOT NULL,
    "Mes_Ano" TEXT NOT NULL,
    "Alquiler_Neto" DECIMAL NOT NULL,
    "IVA_21" DECIMAL NOT NULL,
    "Monto_Municipalidad" DECIMAL NOT NULL,
    "Monto_Agua" DECIMAL NOT NULL,
    "Compras_Deducir" DECIMAL NOT NULL,
    "Retencion_Ganancias" DECIMAL NOT NULL,
    "Nro_Factura_A" TEXT,
    "ID_estado_periodo" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "periodos_comerciales_ID_contrato_fkey" FOREIGN KEY ("ID_contrato") REFERENCES "contratos" ("ID_contrato") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "periodos_comerciales_ID_estado_periodo_fkey" FOREIGN KEY ("ID_estado_periodo") REFERENCES "estados_periodo" ("ID_estado_periodo") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cobros_alquiler" (
    "ID_cobro" TEXT NOT NULL PRIMARY KEY,
    "ID_periodo_contrato" TEXT,
    "ID_periodo_comercial" TEXT,
    "Fecha_Pago" DATETIME NOT NULL,
    "Monto_Pagado" DECIMAL NOT NULL,
    "Imputacion_Pago" TEXT NOT NULL,
    "ID_cuenta_destino" TEXT NOT NULL,
    "Nro_Recibo" TEXT,
    "Referencia_Pago" TEXT,
    "Notas" TEXT,
    CONSTRAINT "cobros_alquiler_ID_periodo_contrato_fkey" FOREIGN KEY ("ID_periodo_contrato") REFERENCES "periodos_contrato" ("ID_periodo_contrato") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cobros_alquiler_ID_periodo_comercial_fkey" FOREIGN KEY ("ID_periodo_comercial") REFERENCES "periodos_comerciales" ("ID_periodo_comercial") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cobros_alquiler_Imputacion_Pago_fkey" FOREIGN KEY ("Imputacion_Pago") REFERENCES "imputaciones" ("ID_imputacion") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cobros_alquiler_ID_cuenta_destino_fkey" FOREIGN KEY ("ID_cuenta_destino") REFERENCES "cuentas" ("ID_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "actualizaciones" (
    "ID_actualizacion" TEXT NOT NULL PRIMARY KEY,
    "ID_contrato" TEXT NOT NULL,
    "Fecha_Actualizacion" DATETIME NOT NULL,
    "Valor_Indice_Inicio" DECIMAL NOT NULL,
    "Valor_Indice_Actual" DECIMAL NOT NULL,
    "Porcentaje_Aplicado" DECIMAL NOT NULL,
    "Monto_Anterior" DECIMAL NOT NULL,
    "Monto_Calculado" DECIMAL NOT NULL,
    "Monto_Final_Redondeado" DECIMAL NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "actualizaciones_ID_contrato_fkey" FOREIGN KEY ("ID_contrato") REFERENCES "contratos" ("ID_contrato") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "servicios_propiedades" (
    "ID_servicio_prop" TEXT NOT NULL PRIMARY KEY,
    "ID_unidad" TEXT NOT NULL,
    "ID_tipo_servicio" TEXT NOT NULL,
    "Empresa_Prestadora" TEXT NOT NULL,
    "Numero_Cuenta" TEXT,
    "Numero_Medidor" TEXT,
    "ID_persona_titular" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "servicios_propiedades_ID_unidad_fkey" FOREIGN KEY ("ID_unidad") REFERENCES "unidades" ("ID_unidad") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "servicios_propiedades_ID_tipo_servicio_fkey" FOREIGN KEY ("ID_tipo_servicio") REFERENCES "tipos_servicio" ("ID_tipo_serv") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "servicios_propiedades_ID_persona_titular_fkey" FOREIGN KEY ("ID_persona_titular") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "boletas_servicios" (
    "ID_boleta" TEXT NOT NULL PRIMARY KEY,
    "ID_servicio_prop" TEXT NOT NULL,
    "Periodo" TEXT NOT NULL,
    "Numero_Liquidacion" INTEGER NOT NULL,
    "Lectura_Anterior" DECIMAL,
    "Lectura_Actual" DECIMAL,
    "Consumo_Monto" DECIMAL,
    "Fecha_Vencimiento" DATETIME NOT NULL,
    "Importe" DECIMAL NOT NULL,
    "Responsable_Pago" TEXT NOT NULL,
    "Fecha_Pago" DATETIME,
    "ID_cuenta_pago" TEXT,
    "ID_estado_boleta" TEXT NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "boletas_servicios_ID_servicio_prop_fkey" FOREIGN KEY ("ID_servicio_prop") REFERENCES "servicios_propiedades" ("ID_servicio_prop") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "boletas_servicios_Responsable_Pago_fkey" FOREIGN KEY ("Responsable_Pago") REFERENCES "responsables_pago" ("ID_responsable") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "boletas_servicios_ID_cuenta_pago_fkey" FOREIGN KEY ("ID_cuenta_pago") REFERENCES "cuentas" ("ID_cuenta") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "boletas_servicios_ID_estado_boleta_fkey" FOREIGN KEY ("ID_estado_boleta") REFERENCES "estados_boleta" ("ID_estado_boleta") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarjetas" (
    "ID_tarjeta" TEXT NOT NULL PRIMARY KEY,
    "ID_tarjeta_principal" TEXT,
    "Banco_Institucion" TEXT,
    "ID_marca_tarjeta" TEXT NOT NULL,
    "Nombre_Comercial" TEXT NOT NULL,
    "Ultimos_4_digitos" TEXT,
    "ID_persona_usuario" TEXT NOT NULL,
    "Limite_Credito" DECIMAL,
    "ID_cuenta_debito" TEXT,
    "Notas" TEXT,
    CONSTRAINT "tarjetas_ID_marca_tarjeta_fkey" FOREIGN KEY ("ID_marca_tarjeta") REFERENCES "marcas_tarjeta" ("ID_marca") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tarjetas_ID_persona_usuario_fkey" FOREIGN KEY ("ID_persona_usuario") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tarjetas_ID_tarjeta_principal_fkey" FOREIGN KEY ("ID_tarjeta_principal") REFERENCES "tarjetas" ("ID_tarjeta") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tarjetas_ID_cuenta_debito_fkey" FOREIGN KEY ("ID_cuenta_debito") REFERENCES "cuentas" ("ID_cuenta") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarjetas_gastos" (
    "ID_gasto" TEXT NOT NULL PRIMARY KEY,
    "ID_tarjeta" TEXT NOT NULL,
    "Fecha_Compra" DATETIME NOT NULL,
    "Detalle_Lugar" TEXT NOT NULL,
    "Monto_Total_Operacion" DECIMAL NOT NULL,
    "Cuotas_Totales" INTEGER NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "tarjetas_gastos_ID_tarjeta_fkey" FOREIGN KEY ("ID_tarjeta") REFERENCES "tarjetas" ("ID_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resumenes_tarjeta" (
    "ID_resumen" TEXT NOT NULL PRIMARY KEY,
    "ID_tarjeta_titular" TEXT NOT NULL,
    "Fecha_Cierre" DATETIME NOT NULL,
    "Fecha_Vencimiento" DATETIME NOT NULL,
    "Mantenimiento_Cuenta" DECIMAL,
    "IVA_Comisiones" DECIMAL,
    "Impuestos_Percepciones" DECIMAL,
    "Fecha_Pago" DATETIME,
    "Monto_Pagado_Real" DECIMAL,
    "ID_cuenta_pago" TEXT,
    "ID_estado_resumen" TEXT NOT NULL,
    "Fecha_Proximo_Cierre" DATETIME NOT NULL,
    "Fecha_Proximo_Vencimiento" DATETIME NOT NULL,
    "Conciliado" BOOLEAN NOT NULL,
    CONSTRAINT "resumenes_tarjeta_ID_tarjeta_titular_fkey" FOREIGN KEY ("ID_tarjeta_titular") REFERENCES "tarjetas" ("ID_tarjeta") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resumenes_tarjeta_ID_cuenta_pago_fkey" FOREIGN KEY ("ID_cuenta_pago") REFERENCES "cuentas" ("ID_cuenta") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "resumenes_tarjeta_ID_estado_resumen_fkey" FOREIGN KEY ("ID_estado_resumen") REFERENCES "estados_resumen" ("ID_estado_resumen") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tarjetas_cuotas_resumen" (
    "ID_cuota_resumen" TEXT NOT NULL PRIMARY KEY,
    "ID_gasto" TEXT NOT NULL,
    "Numero_Cuota_Actual" INTEGER NOT NULL,
    "ID_resumen_asociado" TEXT,
    "Monto_Cuota" DECIMAL NOT NULL,
    CONSTRAINT "tarjetas_cuotas_resumen_ID_gasto_fkey" FOREIGN KEY ("ID_gasto") REFERENCES "tarjetas_gastos" ("ID_gasto") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tarjetas_cuotas_resumen_ID_resumen_asociado_fkey" FOREIGN KEY ("ID_resumen_asociado") REFERENCES "resumenes_tarjeta" ("ID_resumen") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cuentas" (
    "ID_cuenta" TEXT NOT NULL PRIMARY KEY,
    "Nombre_Cuenta" TEXT NOT NULL,
    "ID_tipo_cuenta" TEXT NOT NULL,
    "ID_moneda" TEXT NOT NULL,
    "ID_persona_titular" TEXT NOT NULL,
    "Banco_Institucion" TEXT,
    "Sucursal" TEXT,
    "Numero_cuenta" TEXT,
    "CBU_CVU" TEXT,
    "Alias" TEXT,
    "Notas" TEXT,
    CONSTRAINT "cuentas_ID_tipo_cuenta_fkey" FOREIGN KEY ("ID_tipo_cuenta") REFERENCES "tipos_cuenta" ("ID_tipo_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cuentas_ID_moneda_fkey" FOREIGN KEY ("ID_moneda") REFERENCES "monedas" ("ID_moneda") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cuentas_ID_persona_titular_fkey" FOREIGN KEY ("ID_persona_titular") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "libro_diario" (
    "ID_movimiento" TEXT NOT NULL PRIMARY KEY,
    "Fecha" DATETIME NOT NULL,
    "ID_cuenta" TEXT NOT NULL,
    "ID_persona_entidad" TEXT NOT NULL,
    "ID_unidad" TEXT,
    "ID_resumen_tarjeta" TEXT,
    "Detalle" TEXT NOT NULL,
    "Monto" DECIMAL NOT NULL,
    "ID_medio_pago" TEXT NOT NULL,
    "ID_subcategoria_flujo" TEXT NOT NULL,
    "Modulo_Origen" TEXT NOT NULL,
    "ID_referencia_origen" TEXT,
    "Conciliado" BOOLEAN NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "libro_diario_ID_cuenta_fkey" FOREIGN KEY ("ID_cuenta") REFERENCES "cuentas" ("ID_cuenta") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_persona_entidad_fkey" FOREIGN KEY ("ID_persona_entidad") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_unidad_fkey" FOREIGN KEY ("ID_unidad") REFERENCES "unidades" ("ID_unidad") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_resumen_tarjeta_fkey" FOREIGN KEY ("ID_resumen_tarjeta") REFERENCES "resumenes_tarjeta" ("ID_resumen") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_medio_pago_fkey" FOREIGN KEY ("ID_medio_pago") REFERENCES "medios_pago" ("ID_medio") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_subcategoria_flujo_fkey" FOREIGN KEY ("ID_subcategoria_flujo") REFERENCES "subcategorias_flujo" ("ID_subcat") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "iva_compras" (
    "ID_iva_compra" TEXT NOT NULL PRIMARY KEY,
    "ID_persona_empresa" TEXT NOT NULL,
    "ID_persona_proveedor" TEXT NOT NULL,
    "Fecha_Registro" DATETIME NOT NULL,
    "Fecha_Factura" DATETIME NOT NULL,
    "ID_tipo_comprobante" TEXT NOT NULL,
    "Factura_Numero" TEXT NOT NULL,
    "Neto_Gravado_21" DECIMAL,
    "IVA_21" DECIMAL,
    "Neto_Gravado_105" DECIMAL,
    "IVA_105" DECIMAL,
    "Monto_No_Gravado_Exento" DECIMAL,
    "Retencion_IVA" DECIMAL,
    "Retencion_Ganancias" DECIMAL,
    "Retencion_IIBB" DECIMAL,
    "Total_Facturado" DECIMAL NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "iva_compras_ID_persona_empresa_fkey" FOREIGN KEY ("ID_persona_empresa") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "iva_compras_ID_persona_proveedor_fkey" FOREIGN KEY ("ID_persona_proveedor") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "iva_compras_ID_tipo_comprobante_fkey" FOREIGN KEY ("ID_tipo_comprobante") REFERENCES "tipo_comprobante" ("ID_tipo_comprobante") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "iva_ventas" (
    "ID_iva_venta" TEXT NOT NULL PRIMARY KEY,
    "ID_persona_empresa" TEXT NOT NULL,
    "ID_persona_cliente" TEXT NOT NULL,
    "Fecha_Registro" DATETIME NOT NULL,
    "Fecha_Factura" DATETIME NOT NULL,
    "ID_tipo_comprobante" TEXT NOT NULL,
    "Factura_Numero" TEXT NOT NULL,
    "Neto_Gravado_21" DECIMAL,
    "IVA_21" DECIMAL,
    "Neto_Gravado_105" DECIMAL,
    "IVA_105" DECIMAL,
    "Monto_No_Gravado_Exento" DECIMAL,
    "Total_Facturado" DECIMAL NOT NULL,
    "Notas" TEXT,
    CONSTRAINT "iva_ventas_ID_persona_empresa_fkey" FOREIGN KEY ("ID_persona_empresa") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "iva_ventas_ID_persona_cliente_fkey" FOREIGN KEY ("ID_persona_cliente") REFERENCES "personas" ("ID_persona") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "iva_ventas_ID_tipo_comprobante_fkey" FOREIGN KEY ("ID_tipo_comprobante") REFERENCES "tipo_comprobante" ("ID_tipo_comprobante") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vencimientos" (
    "ID_vencimiento" TEXT NOT NULL PRIMARY KEY,
    "Fecha_Vencimiento" DATETIME NOT NULL,
    "Detalle" TEXT NOT NULL,
    "Monto_Estimado" DECIMAL NOT NULL,
    "ID_estado_vencimiento" TEXT NOT NULL,
    "Origen_Modulo" TEXT NOT NULL,
    "ID_referencia_origen" TEXT,
    "Fecha_Pago_Real" DATETIME,
    "Notas" TEXT,
    CONSTRAINT "vencimientos_ID_estado_vencimiento_fkey" FOREIGN KEY ("ID_estado_vencimiento") REFERENCES "estados_vencimiento" ("ID_estado_vencimiento") ON DELETE RESTRICT ON UPDATE CASCADE
);
