import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Placeholder from './pages/Placeholder'
import Personas from './pages/Personas'
import Unidades from './pages/Unidades'
import Edificios from './pages/Edificios'
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
            <Route path="/contratos" element={<Placeholder title="Contratos" />} />
            <Route path="/cobros" element={<Placeholder title="Cobros de alquiler" />} />
            <Route path="/boletas" element={<Placeholder title="Boletas y tasas" />} />
            <Route path="/tarjetas" element={<Placeholder title="Tarjetas" />} />
            <Route path="/libro-diario" element={<Placeholder title="Libro diario" />} />
            <Route path="/iva" element={<Placeholder title="IVA compras / ventas" />} />
            <Route path="/personas" element={<Personas />} />
            <Route path="/vencimientos" element={<Placeholder title="Vencimientos" />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  )
}

export default App