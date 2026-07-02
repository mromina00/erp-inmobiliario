function ConfirmModal({ mensaje, onConfirmar, onCancelar, peligroso = false }) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '1.5rem',
          maxWidth: '420px', width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
        }}>
          <p style={{ fontWeight: 500, fontSize: '15px', margin: '0 0 8px' }}>Confirmar acción</p>
          <p style={{ fontSize: '14px', color: '#555', margin: '0 0 1.25rem' }}>{mensaje}</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={onCancelar}>Cancelar</button>
            <button
              onClick={onConfirmar}
              style={peligroso ? { background: '#c0392b', color: '#fff', border: 'none' } : {}}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  export default ConfirmModal