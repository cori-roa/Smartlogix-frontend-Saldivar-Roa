import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminGuard from './components/AdminGuard'
import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'
import InventarioList from './pages/inventario/InventarioList'
import AdminPanel from './pages/admin/AdminPanel'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/inventario" element={
          <AdminGuard>
            <InventarioList />
          </AdminGuard>
        } />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPanel />
          </AdminGuard>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
