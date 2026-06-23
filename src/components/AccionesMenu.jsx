import { useState, useRef, useEffect } from 'react'

function AccionesMenu({ acciones }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCollapsed(entry.contentRect.width < 800)
      }
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!collapsed) {
    return (
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
        {acciones.map((a) => (
          <button key={a.label} onClick={a.onClick}>{a.label}</button>
        ))}
      </div>
    )
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(!open)} style={{ fontWeight: 700, letterSpacing: '2px' }}>···</button>
      {open && (
        <div className="acciones-dropdown">
          {acciones.map((a) => (
            <button key={a.label} onClick={() => { a.onClick(); setOpen(false) }}>{a.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccionesMenu