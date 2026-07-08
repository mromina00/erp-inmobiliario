import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const sections = [
  {
    items: [{ label: 'Dashboard', path: '/' }],
  },
  {
    title: 'Inmobiliario',
    items: [
      { label: 'Edificios y unidades', path: '/unidades' },
      { label: 'Contratos', path: '/contratos' },
      { label: 'Cobros de alquiler', path: '/cobros' },
    ],
  },
  {
    title: 'Servicios',
    items: [{ label: 'Boletas y tasas', path: '/boletas' }],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Cuentas', path: '/cuentas' },
      { label: 'Tarjetas', path: '/tarjetas' },
      { label: 'Libro diario', path: '/libro-diario' },
      { label: 'IVA compras / ventas', path: '/iva' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Personas', path: '/personas' },
      { label: 'Vencimientos', path: '/vencimientos' },
    ],
  },
]

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay en móvil */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
        />
      )}

      <div className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">ERP Inmobiliario</div>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        {sections.map((section, i) => (
          <div key={i} className="sidebar-section">
            {section.title && (
              <div className="sidebar-section-title">{section.title}</div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  'sidebar-link' + (isActive ? ' active' : '')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default Sidebar