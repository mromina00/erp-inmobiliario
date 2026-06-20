import { useState, useEffect } from 'react'

function App() {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.personas.getAll().then((data) => {
      console.log('Personas:', data)
      setPersonas(data)
      setLoading(false)
    })
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ERP Inmobiliario</h1>
      <h2>Prueba de conexión Prisma + Electron</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <p>Personas encontradas: {personas.length}</p>
      )}
    </div>
  )
}

export default App