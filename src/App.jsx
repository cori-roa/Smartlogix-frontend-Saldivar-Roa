import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminGuard from './components/AdminGuard'
import Login from './pages/auth/Login'
import AdminPanel from './pages/admin/AdminPanel'
import OperadorPanel from './pages/operador/OperadorPanel'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <AdminGuard>
            <AdminPanel />
          </AdminGuard>
        } />
        <Route path="/operador" element={
          <ProtectedRoute>
            <OperadorPanel />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
}

export default App
