import { useState, useEffect, useCallback } from 'react'

let _addToast = null

export function toast(mensaje, tipo = 'ok') {
  if (_addToast) _addToast(mensaje, tipo)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((mensaje, tipo) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  useEffect(() => {
    _addToast = addToast
    return () => { _addToast = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          background: t.tipo === 'error' ? '#fbe5e3' : t.tipo === 'warn' ? '#fff8e1' : '#e3f5e9',
          color: t.tipo === 'error' ? '#c0392b' : t.tipo === 'warn' ? '#8a6300' : '#1e8a4c',
          border: `1px solid ${t.tipo === 'error' ? '#f5c6c3' : t.tipo === 'warn' ? '#fde7b5' : '#b8e8c8'}`,
          minWidth: '260px',
          maxWidth: '400px',
          animation: 'slideIn 0.2s ease',
        }}>
          {t.tipo === 'error' ? '✕ ' : t.tipo === 'warn' ? '⚠ ' : '✓ '}{t.mensaje}
        </div>
      ))}
    </div>
  )
}