import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'

const SECCIONES = ['dashboard', 'usuarios', 'inventario']

function AdminPanel() {
  const { usuario, logout } = useAuth()
  const [seccion, setSeccion] = useState('dashboard')
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resU, resP] = await Promise.all([
        apiClient.get('/api/auth/usuarios'),
        apiClient.get('/api/inventario')
      ])
      setUsuarios(resU.data)
      setProductos(resP.data)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargarDatos() }, [])

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Confirmas eliminar este usuario?')) return
    try {
      await apiClient.delete(`/api/auth/usuarios/${id}`)
      toast.success('Usuario eliminado')
      cargarDatos()
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  const stockBajo = productos.filter(p => p.cantidad > 0 && p.cantidad <= 5).length
  const sinStock = productos.filter(p => p.cantidad === 0).length
  const totalProductos = productos.length

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>

      {/* Sidebar */}
      <div style={{
        width: '220px',
        backgroundColor: '#1a2a4a',
        padding: '1.5rem 0',
        flexShrink: 0
      }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: '#c8a96e', fontSize: '11px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Admin
          </p>
          <p style={{ color: 'white', fontSize: '14px', margin: '4px 0 0', fontWeight: 500 }}>
            {usuario?.nombre}
          </p>
        </div>

        <nav style={{ marginTop: '1rem' }}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '▪' },
            { key: 'usuarios', label: 'Usuarios', icon: '▪' },
            { key: 'inventario', label: 'Inventario', icon: '▪' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setSeccion(item.key)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1.25rem',
                background: seccion === item.key ? 'rgba(200,169,110,0.15)' : 'transparent',
                border: 'none',
                borderLeft: seccion === item.key ? '3px solid #c8a96e' : '3px solid transparent',
                color: seccion === item.key ? '#c8a96e' : 'rgba(255,255,255,0.65)',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: seccion === item.key ? 600 : 400,
                transition: 'all 0.15s'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: '1.5rem', padding: '0 1.25rem', width: '220px' }}>
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, backgroundColor: '#f5f6fa', padding: '2rem' }}>

        {cargando ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#1a2a4a' }} />
            <p className="mt-2 text-muted">Cargando...</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {seccion === 'dashboard' && (
              <div>
                <h5 className="fw-bold mb-4" style={{ color: '#1a2a4a' }}>Dashboard</h5>

                <div className="row g-3 mb-4">
                  {[
                    { label: 'Usuarios registrados', valor: usuarios.length, color: '#1a2a4a' },
                    { label: 'Productos en inventario', valor: totalProductos, color: '#1a2a4a' },
                    { label: 'Stock bajo', valor: stockBajo, color: '#c8a96e' },
                    { label: 'Sin stock', valor: sinStock, color: '#dc3545' }
                  ].map((stat, i) => (
                    <div className="col-md-3" key={i}>
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center py-4">
                          <h2 className="fw-bold mb-1" style={{ color: stat.color }}>{stat.valor}</h2>
                          <p className="text-muted small mb-0">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header fw-semibold" style={{ backgroundColor: '#1a2a4a', color: 'white', fontSize: '14px' }}>
                        Últimos usuarios
                      </div>
                      <div className="card-body p-0">
                        {usuarios.slice(-5).reverse().map(u => (
                          <div key={u.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{u.nombre}</p>
                              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{u.email}</p>
                            </div>
                            <span className="badge" style={{ backgroundColor: u.rol === 'ADMIN' ? '#1a2a4a' : '#c8a96e', color: u.rol === 'ADMIN' ? 'white' : '#1a2a4a', fontSize: '11px' }}>
                              {u.rol}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-header fw-semibold" style={{ backgroundColor: '#1a2a4a', color: 'white', fontSize: '14px' }}>
                        Productos con stock crítico
                      </div>
                      <div className="card-body p-0">
                        {productos.filter(p => p.cantidad <= 5).slice(0, 5).map(p => (
                          <div key={p.id} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{p.nombre}</p>
                              <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{p.sku}</p>
                            </div>
                            <span className={`badge ${p.cantidad === 0 ? 'bg-danger' : 'bg-warning text-dark'}`} style={{ fontSize: '11px' }}>
                              {p.cantidad === 0 ? 'Sin stock' : `${p.cantidad} uds`}
                            </span>
                          </div>
                        ))}
                        {productos.filter(p => p.cantidad <= 5).length === 0 && (
                          <p className="text-muted text-center py-3 small">Todo el inventario tiene stock suficiente</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USUARIOS */}
            {seccion === 'usuarios' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: '#1a2a4a' }}>Gestión de Usuarios</h5>
                  <button className="btn btn-sm" style={{ backgroundColor: '#1a2a4a', color: 'white' }} onClick={cargarDatos}>
                    Actualizar
                  </button>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: '#1a2a4a', color: 'white' }}>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.length > 0 ? usuarios.map(u => (
                          <tr key={u.id}>
                            <td className="text-muted small">{u.id}</td>
                            <td className="fw-semibold">{u.nombre}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className="badge" style={{ backgroundColor: u.rol === 'ADMIN' ? '#1a2a4a' : '#c8a96e', color: u.rol === 'ADMIN' ? 'white' : '#1a2a4a' }}>
                                {u.rol}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => eliminarUsuario(u.id)}
                                disabled={u.rol === 'ADMIN'}
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="text-center text-muted py-4">No hay usuarios registrados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* INVENTARIO */}
            {seccion === 'inventario' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: '#1a2a4a' }}>Resumen de Inventario</h5>
                  <button className="btn btn-sm" style={{ backgroundColor: '#1a2a4a', color: 'white' }} onClick={cargarDatos}>
                    Actualizar
                  </button>
                </div>

                <div className="card border-0 shadow-sm">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: '#1a2a4a', color: 'white' }}>
                        <tr>
                          <th>SKU</th>
                          <th>Nombre</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.length > 0 ? productos.map(p => (
                          <tr key={p.id}>
                            <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                            <td className="fw-semibold">{p.nombre}</td>
                            <td>
                              <span className="badge" style={{ backgroundColor: '#c8a96e', color: '#1a2a4a' }}>{p.categoria}</span>
                            </td>
                            <td>${p.precio?.toLocaleString('es-CL')}</td>
                            <td>{p.cantidad}</td>
                            <td>
                              {p.cantidad === 0
                                ? <span className="badge bg-danger">Sin stock</span>
                                : p.cantidad <= 5
                                  ? <span className="badge bg-warning text-dark">Stock bajo</span>
                                  : <span className="badge bg-success">OK</span>}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center text-muted py-4">No hay productos registrados</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminPanel
