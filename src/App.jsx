import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Placeholder from './pages/Placeholder'
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
import './App.css'

function App() {
  return (
    <HashRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/unidades" element={<Unidades />} />
            <Route path="/edificios" element={<Edificios />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/cobros" element={<Placeholder title="Cobros de alquiler" />} />
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
      </div>
    </HashRouter>
  )
}

export default App