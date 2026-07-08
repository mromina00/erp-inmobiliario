import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Personas from './pages/Personas'
import Unidades from './pages/Unidades'
import Edificios from './pages/Edificios'
import Contratos from './pages/Contratos'
import Cuentas from './pages/Cuentas'
import DetalleContrato from './pages/DetalleContrato'
import LibroDiario from './pages/LibroDiario'
import Servicios from './pages/Servicios'
import Tarjetas from './pages/Tarjetas'
import IVA from './pages/IVA'
import Vencimientos from './pages/Vencimientos'
import CobrosAlquiler from './pages/CobrosAlquiler'
import './App.css'
import { ToastContainer } from './components/Toast'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <HashRouter>
      <div className="app-layout">
        {/* Botón hamburguesa — solo visible en móvil */}
        <button
          className="hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/unidades" element={<Unidades />} />
            <Route path="/edificios" element={<Edificios />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/cobros" element={<CobrosAlquiler />} />
            <Route path="/boletas" element={<Servicios />} />
            <Route path="/tarjetas" element={<Tarjetas />} />
            <Route path="/libro-diario" element={<LibroDiario />} />
            <Route path="/iva" element={<IVA />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/vencimientos" element={<Vencimientos />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/contratos/:id" element={<DetalleContrato />} />
          </Routes>
        </div>
        <ToastContainer />
      </div>
    </HashRouter>
  )
}

export default App