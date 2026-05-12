import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' })
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmar) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setCargando(true)
    try {
      // 1. Registrar usuario
      await apiClient.post('/api/auth/registro', {
        nombre: form.nombre,
        email: form.email,
        password: form.password
      })
      // 2. Hacer login automático
      const loginRes = await apiClient.post('/api/auth/login', {
        email: form.email,
        password: form.password
      })
      login(loginRes.data)
      toast.success('Cuenta creada correctamente')
      navigate('/inventario')
    } catch (error) {
      const msg = error.response?.data || 'Error al registrar usuario'
      toast.error(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#f0f2f5' }}>
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '460px' }}>
        <div className="card-body p-4">
          <button className="btn btn-link p-0 mb-3 text-decoration-none"
            style={{ color: '#1a2a4a' }} onClick={() => navigate('/login')}>
            ← Volver al inicio de sesión
          </button>

          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: '#1a2a4a' }}>
              Smart<span style={{ color: '#c8a96e' }}>Logix</span>
            </h3>
            <p className="text-muted mb-0">Crea tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre completo</label>
              <input type="text" className="form-control" name="nombre"
                value={form.nombre} onChange={handleChange}
                placeholder="Juan Pérez" required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo electrónico</label>
              <input type="email" className="form-control" name="email"
                value={form.email} onChange={handleChange}
                placeholder="correo@ejemplo.com" required />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" name="password"
                value={form.password} onChange={handleChange}
                placeholder="Mínimo 6 caracteres" minLength={6} required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Confirmar contraseña</label>
              <input type="password" className="form-control" name="confirmar"
                value={form.confirmar} onChange={handleChange}
                placeholder="Repite tu contraseña" required />
            </div>
            <button type="submit" className="btn w-100"
              style={{ backgroundColor: '#1a2a4a', color: 'white' }}
              disabled={cargando}>
              {cargando ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <hr />
          <p className="text-center text-muted small mb-0">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#1a2a4a', fontWeight: 600 }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registro
