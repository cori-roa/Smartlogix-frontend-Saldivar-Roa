import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const res = await apiClient.post('/api/auth/login', form)
      login(res.data)
      navigate(res.data.rol === 'ADMIN' ? '/admin' : '/operador')
    } catch {
      toast.error('Correo o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">
            <div className="login-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span className="login-logo-text">SmartLogix</span>
          </div>
          <div className="login-heading">Iniciar sesión</div>
          <div className="login-subheading">Plataforma de gestión logística</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="login-label">Correo electrónico</label>
            <input
              type="email"
              className="login-input"
              placeholder="usuario@smartlogix.cl"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="login-label">Contraseña</label>
            <input
              type="password"
              className="login-input"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div style={{ marginTop: '4px' }}>
            <button type="submit" className="login-btn" disabled={cargando}>
              {cargando && <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', width: 14, height: 14 }} />}
              {cargando ? 'Verificando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <div className="login-footer">Acceso restringido — contacta al administrador si tienes problemas.</div>
      </div>
    </div>
  )
}
