import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminGuard({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol !== 'ADMIN') return <Navigate to="/login" replace />
  return children
}

export default AdminGuard
