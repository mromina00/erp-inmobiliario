/**
 * Validaciones reutilizables para los formularios del ERP.
 * Cada función retorna null si es válido, o un string con el error.
 */

export function validarCUIT(valor) {
  const digits = valor.replace(/\D/g, '')
  if (digits.length !== 11) return 'El CUIT debe tener 11 dígitos'
  return null
}

export function validarDNI(valor) {
  const digits = valor.replace(/\D/g, '')
  if (digits.length < 7 || digits.length > 8) return 'El DNI debe tener 7 u 8 dígitos'
  return null
}

export function validarDocumento(valor, tipoDoc, tipoPersona) {
  if (!valor) return null
  if (tipoDoc === 'CUIT' && tipoPersona === 'FISICA') {
    return 'Las personas físicas deben usar DNI, no CUIT'
  }
  if (tipoDoc === 'DNI' && tipoPersona === 'JURIDICA') {
    return 'Las personas jurídicas deben usar CUIT, no DNI'
  }
  if (tipoDoc === 'CUIT') return validarCUIT(valor)
  if (tipoDoc === 'DNI') return validarDNI(valor)
  return null
}

export function validarMonto(valor, { requerido = false, label = 'Monto' } = {}) {
  if (!valor && requerido) return `${label} es obligatorio`
  if (!valor) return null
  const num = parseFloat(String(valor).replace(/\./g, '').replace(',', '.'))
  if (isNaN(num)) return `${label} debe ser un número válido`
  if (num < 0) return `${label} no puede ser negativo`
  if (num === 0 && requerido) return `${label} debe ser mayor a cero`
  return null
}

export function validarFecha(valor, { requerido = false, label = 'Fecha' } = {}) {
  if (!valor && requerido) return `${label} es obligatoria`
  if (!valor) return null
  const d = new Date(valor)
  if (isNaN(d.getTime())) return `${label} no es válida`
  return null
}

export function validarRequerido(valor, label) {
  if (!valor || String(valor).trim() === '') return `${label} es obligatorio`
  return null
}

export function validarEmail(valor) {
  if (!valor) return null
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(valor)) return 'El email no es válido'
  return null
}

/**
 * Ejecuta un objeto de validaciones y retorna los errores.
 * 
 * Uso:
 *   const errores = validarFormulario({
 *     Nombre: validarRequerido(form.Nombre, 'Nombre'),
 *     Documento: validarDocumento(form.Documento, form.ID_tipo_doc),
 *     Email: validarEmail(form.Email),
 *   })
 *   if (Object.keys(errores).length > 0) { mostrar errores }
 */
export function validarFormulario(reglas) {
  const errores = {}
  for (const [campo, error] of Object.entries(reglas)) {
    if (error) errores[campo] = error
  }
  return errores
}