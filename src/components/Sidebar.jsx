import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconGrid, IconUsers, IconBox, IconLogout,
  IconShoppingCart, IconTruck, IconDollar, IconBuilding
} from './Icons'

const NAV_ITEMS = [
  { path: '/admin',         label: 'Resumen',       icon: <IconGrid size={15} />,         tab: 'dashboard' },
  { path: '/pedidos',       label: 'Pedidos',        icon: <IconShoppingCart size={15} /> },
  { path: '/envios',        label: 'Envíos',         icon: <IconTruck size={15} /> },
  { path: '/transacciones', label: 'Transacciones',  icon: <IconDollar size={15} /> },
  { path: '/admin',         label: 'Usuarios',       icon: <IconUsers size={15} />,        tab: 'usuarios' },
  { path: '/admin',         label: 'Inventario',     icon: <IconBox size={15} />,          tab: 'inventario' },
  { path: '/admin',         label: 'Sucursales',     icon: <IconBuilding size={15} />,     tab: 'sucursales' },
]

export default function Sidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  const handleClick = (item) => {
    if (item.tab) {
      if (onTabChange) {
        onTabChange(item.tab)
      } else {
        navigate('/admin', { state: { tab: item.tab } })
      }
      navigate('/admin')
    } else {
      navigate(item.path)
    }
  }

  const isActive = (item) => {
    if (item.tab) return location.pathname === '/admin' && activeTab === item.tab
    return location.pathname === item.path && !item.tab
  }

  return (
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{usuario?.nombre || 'Administrador'}</div>
          <div className="sidebar-user-meta">{usuario?.email}</div>
          <span className="sidebar-user-pill">ADMINISTRADOR</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Gestión</div>
          {NAV_ITEMS.map((item, i) => (
              <button
                  key={i}
                  className={`sidebar-item${isActive(item) ? ' sidebar-item-active' : ''}`}
                  onClick={() => handleClick(item)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
              </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-item" onClick={() => navigate('/operador')}>
            <span className="sidebar-item-icon"><IconUsers size={15} /></span>
            <span className="sidebar-item-label">Vista operador</span>
          </button>
          <button className="sidebar-item" onClick={() => { logout(); navigate('/login') }}>
            <span className="sidebar-item-icon"><IconLogout size={15} /></span>
            <span className="sidebar-item-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>
  )
}