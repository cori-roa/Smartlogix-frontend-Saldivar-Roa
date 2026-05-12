import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await apiClient.post('/api/auth/login', form)
      login(res.data)
      toast.success(`Bienvenido/a, ${res.data.nombre}`)
      if (res.data.rol === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/inventario')
      }
    } catch (error) {
      toast.error('Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: '#f0f2f5' }}>
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h3 className="fw-bold" style={{ color: '#1a2a4a' }}>
              Smart<span style={{ color: '#c8a96e' }}>Logix</span>
            </h3>
            <p className="text-muted mb-0">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Correo electrónico</label>
              <input type="email" className="form-control" name="email"
                value={form.email} onChange={handleChange}
                placeholder="correo@ejemplo.com" required />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Contraseña</label>
              <input type="password" className="form-control" name="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn w-100"
              style={{ backgroundColor: '#1a2a4a', color: 'white' }}
              disabled={cargando}>
              {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <hr />
          <p className="text-center text-muted small mb-0">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={{ color: '#1a2a4a', fontWeight: 600 }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
