function MontoInput({ label, value, onChange, required = false, style = {} }) {
    function handleChange(e) {
      let raw = e.target.value
      // Permitir solo dígitos, punto y coma
      raw = raw.replace(/[^\d,.]/g, '')
      // Solo una coma permitida
      const partes = raw.split(',')
      if (partes.length > 2) return
      // Formatear la parte entera con puntos de miles
      const entera = partes[0].replace(/\./g, '')
      const formateada = entera ? Number(entera).toLocaleString('es-AR') : ''
      const resultado = partes.length === 2 ? `${formateada},${partes[1].slice(0, 2)}` : formateada
      onChange(resultado)
    }
  
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#555', ...style }}>
        <span>{label}{required && <span className="req"> *</span>}</span>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '14px' }}>$</span>
          <input
            value={value}
            onChange={handleChange}
            style={{ paddingLeft: '22px' }}
            inputMode="decimal"
            required={required}
          />
        </div>
      </label>
    )
  }
  
  export function parseMonto(value) {
    if (!value) return null
    const limpio = value.replace(/\./g, '').replace(',', '.')
    const n = parseFloat(limpio)
    return isNaN(n) ? null : n
  }
  
  export default MontoInput