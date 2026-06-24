-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_libro_diario" (
    "ID_movimiento" TEXT NOT NULL PRIMARY KEY,
    "Fecha" DATETIME NOT NULL,
    "ID_cuenta" TEXT NOT NULL,
    "ID_persona_entidad" TEXT,
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
    CONSTRAINT "libro_diario_ID_persona_entidad_fkey" FOREIGN KEY ("ID_persona_entidad") REFERENCES "personas" ("ID_persona") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_unidad_fkey" FOREIGN KEY ("ID_unidad") REFERENCES "unidades" ("ID_unidad") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_resumen_tarjeta_fkey" FOREIGN KEY ("ID_resumen_tarjeta") REFERENCES "resumenes_tarjeta" ("ID_resumen") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_medio_pago_fkey" FOREIGN KEY ("ID_medio_pago") REFERENCES "medios_pago" ("ID_medio") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "libro_diario_ID_subcategoria_flujo_fkey" FOREIGN KEY ("ID_subcategoria_flujo") REFERENCES "subcategorias_flujo" ("ID_subcat") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_libro_diario" ("Conciliado", "Detalle", "Fecha", "ID_cuenta", "ID_medio_pago", "ID_movimiento", "ID_persona_entidad", "ID_referencia_origen", "ID_resumen_tarjeta", "ID_subcategoria_flujo", "ID_unidad", "Modulo_Origen", "Monto", "Notas") SELECT "Conciliado", "Detalle", "Fecha", "ID_cuenta", "ID_medio_pago", "ID_movimiento", "ID_persona_entidad", "ID_referencia_origen", "ID_resumen_tarjeta", "ID_subcategoria_flujo", "ID_unidad", "Modulo_Origen", "Monto", "Notas" FROM "libro_diario";
DROP TABLE "libro_diario";
ALTER TABLE "new_libro_diario" RENAME TO "libro_diario";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
