import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import ProtectedRoute from './components/ProtectedRoute'
import AdminGuard from './components/AdminGuard'
import Login from './pages/auth/Login'
import AdminPanel from './pages/admin/AdminPanel'
import OperadorPanel from './pages/operador/OperadorPanel'
import PedidosPanel from './pages/pedidos/PedidosPanel'
import EnviosPanel from './pages/envios/EnviosPanel'
import TransaccionesPanel from './pages/transacciones/TransaccionesPanel'

function App() {
  return (
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminGuard><AdminPanel /></AdminGuard>} />
          <Route path="/pedidos" element={<AdminGuard><PedidosPanel /></AdminGuard>} />
          <Route path="/envios" element={<AdminGuard><EnviosPanel /></AdminGuard>} />
          <Route path="/transacciones" element={<AdminGuard><TransaccionesPanel /></AdminGuard>} />
          <Route path="/operador" element={<ProtectedRoute><OperadorPanel /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </>
  )
}

export default App