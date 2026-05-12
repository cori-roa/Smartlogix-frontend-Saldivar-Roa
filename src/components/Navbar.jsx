import React from 'react'
import { useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()
  const esPanel = location.pathname === '/admin' || location.pathname === '/operador'

  if (esPanel) return null

  return (
    <nav className="navbar" style={{ backgroundColor: '#1a2a4a', height: '56px' }}>
      <div className="container-fluid px-4">
        <span className="navbar-brand fw-bold text-white fs-5 mb-0">
          Smart<span style={{ color: '#c8a96e' }}>Logix</span>
        </span>
      </div>
    </nav>
  )
}

export default Navbar
