import { NavLink } from 'react-router-dom'

const sections = [
  {
    items: [{ label: 'Dashboard', path: '/', icon: '\u25A3' }],
  },
  {
    title: 'Inmobiliario',
    items: [
      { label: 'Edificios y unidades', path: '/unidades', icon: '\u25A2' },
      { label: 'Contratos', path: '/contratos', icon: '\u25A2' },
      { label: 'Cobros de alquiler', path: '/cobros', icon: '\u25A2' },
    ],
  },
  {
    title: 'Servicios',
    items: [{ label: 'Boletas y tasas', path: '/boletas', icon: '\u25A2' }],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Tarjetas', path: '/tarjetas', icon: '\u25A2' },
      { label: 'Libro diario', path: '/libro-diario', icon: '\u25A2' },
      { label: 'IVA compras / ventas', path: '/iva', icon: '\u25A2' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Personas', path: '/personas', icon: '\u25A2' },
      { label: 'Vencimientos', path: '/vencimientos', icon: '\u25A2' },
    ],
  },
]

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-title">ERP Inmobiliario</div>
      {sections.map((section, i) => (
        <div key={i} className="sidebar-section">
          {section.title && <div className="sidebar-section-title">{section.title}</div>}
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Sidebar