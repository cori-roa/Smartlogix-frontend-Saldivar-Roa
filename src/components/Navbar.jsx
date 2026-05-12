import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const esAdmin = location.pathname === '/admin'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#1a2a4a', height: '56px' }}>
      <div className="container-fluid px-4">
        <span
          className="navbar-brand fw-bold text-white fs-5 mb-0"
          style={{ cursor: 'pointer' }}
          onClick={() => usuario ? navigate(usuario.rol === 'ADMIN' ? '/admin' : '/inventario') : navigate('/login')}
        >
          Smart<span style={{ color: '#c8a96e' }}>Logix</span>
        </span>

        {usuario && !esAdmin && (
          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50 small">Hola, {usuario.nombre}</span>
            {usuario.rol === 'ADMIN' && (
              <button className="btn btn-sm btn-outline-light" onClick={() => navigate('/admin')}>
                Panel Admin
              </button>
            )}
            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
