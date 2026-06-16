import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import Sidebar from '../../components/Sidebar'
import {
  IconGrid, IconUsers, IconBox, IconMapPin, IconLogout,
  IconPlus, IconRefresh, IconEdit, IconTrash, IconBuilding, IconWarning,
  IconShoppingCart, IconTruck, IconDollar
} from '../../components/Icons'

const validarPass = (p) => {
  if (p.length < 6) return 'Mínimo 6 caracteres'
  if (!/[A-Za-z]/.test(p)) return 'Debe contener al menos una letra'
  if (!/[0-9]/.test(p)) return 'Debe contener al menos un número'
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p)) return 'Requiere un carácter especial'
  return null
}

const validarNombre = (n) => {
  if (n.trim().length < 3) return 'Mínimo 3 caracteres'
  if (n.trim().split(' ').filter(Boolean).length < 2) return 'Ingresa nombre y apellido'
  return null
}

function ModalUsuario({ usuario, sucursales, onGuardar, onCerrar }) {
  const esEdicion = !!usuario
  const init = { nombre: '', email: '', password: '', rol: 'OPERADOR', rut: '', telefono: '', cargo: '', direccion: '', sucursalId: '', sucursalNombre: '' }
  const [form, setForm] = useState(esEdicion ? { ...usuario, password: '', sucursalId: usuario.sucursalId || '' } : init)
  const [err, setErr] = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(e => ({ ...e, [k]: null })) }

  const handleSucursal = (id) => {
    const suc = sucursales.find(s => s.id === parseInt(id))
    setForm(f => ({ ...f, sucursalId: id, sucursalNombre: suc?.nombre || '' }))
  }

  const validar = () => {
    const e = {}
    const en = validarNombre(form.nombre); if (en) e.nombre = en
    if (!esEdicion || form.password) { const ep = validarPass(form.password); if (ep) e.password = ep }
    if (!esEdicion && !form.email) e.email = 'El correo es obligatorio'
    setErr(e); return !Object.keys(e).length
  }

  const submit = (ev) => { ev.preventDefault(); if (validar()) onGuardar(form) }

  return (
      <div className="modal-overlay">
        <div className="modal modal-lg">
          <div className="modal-header">
            <div>
              <div className="modal-title">{esEdicion ? 'Editar usuario' : 'Nuevo usuario'}</div>
              <div className="modal-subtitle">{esEdicion ? `Editando: ${usuario.email}` : 'Completa los datos para crear la cuenta'}</div>
            </div>
            <button className="modal-close" onClick={onCerrar}>✕</button>
          </div>
          <form onSubmit={submit}>
            <div className="modal-body">
              <div className="form-grid form-grid-2">
                <div>
                  <label className="form-label">Nombre completo *</label>
                  <input className={`form-input ${err.nombre ? 'is-error' : ''}`} value={form.nombre}
                         onChange={e => set('nombre', e.target.value)} placeholder="Juan Pérez" />
                  {err.nombre && <div className="form-error">{err.nombre}</div>}
                </div>
                <div>
                  <label className="form-label">Correo electrónico *</label>
                  <input type="email" className={`form-input ${err.email ? 'is-error' : ''}`} value={form.email}
                         onChange={e => set('email', e.target.value)} disabled={esEdicion} placeholder="usuario@smartlogix.cl" />
                  {err.email && <div className="form-error">{err.email}</div>}
                  {esEdicion && <div className="form-hint">El correo no puede modificarse</div>}
                </div>
                <div>
                  <label className="form-label">{esEdicion ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
                  <input type="password" className={`form-input ${err.password ? 'is-error' : ''}`} value={form.password}
                         onChange={e => set('password', e.target.value)} placeholder="Mín. 6 car., letra, número y símbolo" />
                  {err.password ? <div className="form-error">{err.password}</div> : <div className="form-hint">Ej: Logix@2026</div>}
                </div>
                <div>
                  <label className="form-label">Rol *</label>
                  <select className="form-input" value={form.rol} onChange={e => set('rol', e.target.value)}>
                    <option value="OPERADOR">Operador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="form-divider" />
                <div className="form-section-label">Información adicional</div>
                <div>
                  <label className="form-label">RUT</label>
                  <input className="form-input" value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="12.345.678-9" />
                </div>
                <div>
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" />
                </div>
                <div>
                  <label className="form-label">Cargo</label>
                  <input className="form-input" value={form.cargo} onChange={e => set('cargo', e.target.value)} placeholder="Jefe de bodega" />
                </div>
                <div>
                  <label className="form-label">Sucursal asignada</label>
                  <select className="form-input" value={form.sucursalId} onChange={e => handleSucursal(e.target.value)}>
                    <option value="">Sin asignar</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-full">
                  <label className="form-label">Dirección</label>
                  <input className="form-input" value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Ejemplo 1234, Santiago" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{esEdicion ? 'Guardar cambios' : 'Crear usuario'}</button>
            </div>
          </form>
        </div>
      </div>
  )
}

function ModalStock({ sucursal, productos, stockActual, onGuardar, onCerrar }) {
  const [stocks, setStocks] = useState(
      productos.map(p => { const s = stockActual.find(s => s.producto?.id === p.id); return { productoId: p.id, nombre: p.nombre, sku: p.sku, cantidad: s?.cantidad ?? 0 } })
  )
  const set = (id, val) => setStocks(st => st.map(s => s.productoId === id ? { ...s, cantidad: parseInt(val) || 0 } : s))

  return (
      <div className="modal-overlay">
        <div className="modal modal-lg">
          <div className="modal-header">
            <div>
              <div className="modal-title">Gestión de stock</div>
              <div className="modal-subtitle">{sucursal.nombre} — {sucursal.ciudad}</div>
            </div>
            <button className="modal-close" onClick={onCerrar}>✕</button>
          </div>
          <table className="data-table">
            <thead><tr><th>SKU</th><th>Producto</th><th style={{ width: 160 }}>Cantidad en sucursal</th></tr></thead>
            <tbody>
            {stocks.map(s => (
                <tr key={s.productoId}>
                  <td><span className="cell-mono font-mono">{s.sku}</span></td>
                  <td className="cell-primary">{s.nombre}</td>
                  <td><input type="number" className="form-input" value={s.cantidad} min="0"
                             onChange={e => set(s.productoId, e.target.value)} style={{ padding: '5px 9px', fontSize: 13 }} /></td>
                </tr>
            ))}
            </tbody>
          </table>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => onGuardar(stocks)}>Guardar stock</button>
          </div>
        </div>
      </div>
  )
}

function ModalStockProducto({ producto, sucursales, onCerrar }) {
  const [stocks, setStocks] = useState([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    apiClient.get(`/api/sucursales/producto/${producto.id}`)
        .then(r => setStocks(r.data)).catch(() => toast.error('Error')).finally(() => setCargando(false))
  }, [producto.id])

  return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <div>
              <div className="modal-title">Stock por sucursal</div>
              <div className="modal-subtitle">{producto.nombre} — Total global: {producto.cantidad} uds</div>
            </div>
            <button className="modal-close" onClick={onCerrar}>✕</button>
          </div>
          {cargando ? (
              <div className="loading-state"><span className="spinner" /></div>
          ) : (
              <table className="data-table">
                <thead><tr><th>Sucursal</th><th>Ciudad</th><th>Cantidad</th><th>Estado</th></tr></thead>
                <tbody>
                {sucursales.map(suc => {
                  const s = stocks.find(st => st.sucursal?.id === suc.id)
                  const cant = s?.cantidad ?? 0
                  return (
                      <tr key={suc.id}>
                        <td className="cell-primary">{suc.nombre}</td>
                        <td className="cell-muted">{suc.ciudad}</td>
                        <td style={{ fontWeight: 600 }}>{cant}</td>
                        <td>
                          {cant === 0 ? <span className="badge badge-red"><span className="badge-dot" />Sin stock</span>
                              : cant <= 5 ? <span className="badge badge-yellow"><span className="badge-dot" />Stock bajo</span>
                                  : <span className="badge badge-green"><span className="badge-dot" />Normal</span>}
                        </td>
                      </tr>
                  )
                })}
                </tbody>
              </table>
          )}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
          </div>
        </div>
      </div>
  )
}

export default function AdminPanel() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const [seccion, setSeccion] = useState(loc.state?.tab || 'dashboard')
  const [usuarios, setUsuarios] = useState([])
  const [productos, setProductos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalU, setModalU] = useState(false)
  const [uEdit, setUEdit] = useState(null)
  const [modalStock, setModalStock] = useState(false)
  const [sucEdit, setSucEdit] = useState(null)
  const [stockSuc, setStockSuc] = useState([])
  const [modalStockProd, setModalStockProd] = useState(false)
  const [prodStock, setProdStock] = useState(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const [ru, rp, rs] = await Promise.all([apiClient.get('/api/auth/usuarios'), apiClient.get('/api/inventario'), apiClient.get('/api/sucursales')])
      setUsuarios(ru.data); setProductos(rp.data); setSucursales(rs.data)
    } catch { toast.error('Error al cargar datos') } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const guardarUsuario = async (datos) => {
    try {
      if (uEdit) {
        const p = { nombre: datos.nombre, rol: datos.rol, rut: datos.rut, telefono: datos.telefono, cargo: datos.cargo, direccion: datos.direccion, sucursalId: datos.sucursalId || null, sucursalNombre: datos.sucursalNombre || null }
        if (datos.password) p.password = datos.password
        await apiClient.put(`/api/auth/usuarios/${uEdit.id}`, p)
        toast.success('Usuario actualizado')
      } else {
        await apiClient.post('/api/auth/registro', datos)
        toast.success('Usuario registrado')
      }
      setModalU(false); setUEdit(null); cargar()
    } catch (e) { toast.error(e.response?.data || 'Error') }
  }

  const eliminarUsuario = async (id) => {
    if (!confirm('¿Confirmas eliminar este usuario?')) return
    try { await apiClient.delete(`/api/auth/usuarios/${id}`); toast.success('Usuario eliminado'); cargar() } catch { toast.error('Error') }
  }

  const abrirStockSucursal = async (s) => {
    try { const r = await apiClient.get(`/api/sucursales/${s.id}/stock`); setStockSuc(r.data); setSucEdit(s); setModalStock(true) } catch { toast.error('Error') }
  }

  const guardarStock = async (stocks) => {
    try {
      await Promise.all(stocks.map(s => apiClient.put(`/api/sucursales/${sucEdit.id}/stock/${s.productoId}`, { cantidad: s.cantidad })))
      toast.success('Stock actualizado'); setModalStock(false); setSucEdit(null); cargar()
    } catch { toast.error('Error') }
  }

  const sBajo = productos.filter(p => p.cantidad > 0 && p.cantidad <= 5).length
  const sSin = productos.filter(p => p.cantidad === 0).length

  const navItems = [
    { key: 'dashboard', label: 'Resumen', icon: <IconGrid /> },
    { key: 'usuarios', label: 'Usuarios', icon: <IconUsers /> },
    { key: 'inventario', label: 'Inventario', icon: <IconBox /> },
    { key: 'sucursales', label: 'Sucursales', icon: <IconBuilding /> }
  ]

  const getBadgeStock = (c) => {
    if (c === 0) return <span className="badge badge-red"><span className="badge-dot" />Sin stock</span>
    if (c <= 5) return <span className="badge badge-yellow"><span className="badge-dot" />Bajo</span>
    return <span className="badge badge-green"><span className="badge-dot" />Normal</span>
  }

  return (
      <div className="app-layout">
        <Sidebar activeTab={seccion} onTabChange={setSeccion} />

        <div className="app-content">
          <div className="topbar">
            <div className="topbar-breadcrumb">
              <span>SmartLogix</span>
              <span>/</span>
              <span className="topbar-breadcrumb-active">
              {navItems.find(n => n.key === seccion)?.label || seccion}
            </span>
            </div>
            <div className="topbar-actions">
              <button className="btn btn-secondary btn-sm" onClick={cargar} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconRefresh size={13} /> Actualizar
              </button>
            </div>
          </div>

          <main className="app-main">
            {cargando ? (
                <div className="loading-state"><span className="spinner spinner-lg" /><span>Cargando datos...</span></div>
            ) : (
                <>
                  {seccion === 'dashboard' && (
                      <div>
                        <div className="page-header">
                          <div className="page-title">Resumen general</div>
                          <div className="page-desc">Vista general del estado de la plataforma</div>
                        </div>
                        <div className="stat-row mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                          <div className="stat-cell"><div className="stat-label">Usuarios</div><div className="stat-value accent">{usuarios.length}</div></div>
                          <div className="stat-cell"><div className="stat-label">Productos</div><div className="stat-value">{productos.length}</div></div>
                          <div className="stat-cell"><div className="stat-label">Sucursales</div><div className="stat-value">{sucursales.length}</div></div>
                          <div className="stat-cell"><div className="stat-label">Stock bajo</div><div className="stat-value yellow">{sBajo}</div></div>
                          <div className="stat-cell"><div className="stat-label">Sin stock</div><div className="stat-value red">{sSin}</div></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div className="card">
                            <div className="card-header">
                              <span className="card-title">Usuarios recientes</span>
                              <button className="btn btn-secondary btn-xs" onClick={() => setSeccion('usuarios')}>Ver todos</button>
                            </div>
                            {usuarios.slice(-5).reverse().map(u => (
                                <div key={u.id} className="list-item">
                                  <div>
                                    <div className="list-item-primary">{u.nombre}</div>
                                    <div className="list-item-secondary">{u.sucursalNombre || u.cargo || u.email}</div>
                                  </div>
                                  <span className={`badge ${u.rol === 'ADMIN' ? 'badge-blue' : 'badge-gray'}`}>{u.rol}</span>
                                </div>
                            ))}
                          </div>
                          <div className="card">
                            <div className="card-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                <IconWarning size={14} style={{ color: 'var(--c-red)' }} />
                                <span className="card-title">Alertas de stock</span>
                              </div>
                              <button className="btn btn-secondary btn-xs" onClick={() => setSeccion('inventario')}>Ver todo</button>
                            </div>
                            {productos.filter(p => p.cantidad <= 5).length === 0
                                ? <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--c-text-3)' }}>Sin alertas activas — todo en stock</div>
                                : productos.filter(p => p.cantidad <= 5).slice(0, 5).map(p => (
                                    <div key={p.id} className="list-item">
                                      <div>
                                        <div className="list-item-primary">{p.nombre}</div>
                                        <div className="list-item-secondary" style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--c-accent)' }}>{p.sku}</div>
                                      </div>
                                      {getBadgeStock(p.cantidad)}
                                    </div>
                                ))}
                          </div>
                        </div>
                      </div>
                  )}

                  {seccion === 'usuarios' && (
                      <div>
                        <div className="page-header flex justify-between items-center">
                          <div>
                            <div className="page-title">Usuarios</div>
                            <div className="page-desc">{usuarios.length} cuenta(s) registrada(s)</div>
                          </div>
                          <button className="btn btn-primary" onClick={() => { setUEdit(null); setModalU(true) }}>
                            <IconPlus size={14} /> Nuevo usuario
                          </button>
                        </div>
                        <div className="card">
                          <table className="data-table">
                            <thead><tr><th>Nombre</th><th>Correo</th><th>Cargo</th><th>Sucursal</th><th>Rol</th><th>Acciones</th></tr></thead>
                            <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                  <td className="cell-primary">{u.nombre}</td>
                                  <td className="cell-muted">{u.email}</td>
                                  <td className="cell-muted">{u.cargo || '—'}</td>
                                  <td>{u.sucursalNombre ? <span className="badge badge-blue">{u.sucursalNombre.replace('Sucursal ', '')}</span> : <span style={{ color: 'var(--c-text-4)', fontSize: 12 }}>—</span>}</td>
                                  <td><span className={`badge ${u.rol === 'ADMIN' ? 'badge-blue' : 'badge-gray'}`}>{u.rol}</span></td>
                                  <td>
                                    <div className="flex gap-2">
                                      <button className="btn btn-secondary btn-sm" onClick={() => { setUEdit(u); setModalU(true) }}><IconEdit /> Editar</button>
                                      {u.email === usuario?.email
                                          ? <span className="badge badge-gray">Tu cuenta</span>
                                          : <button className="btn btn-danger-ghost btn-sm" onClick={() => eliminarUsuario(u.id)}><IconTrash /> Eliminar</button>}
                                    </div>
                                  </td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                  )}

                  {seccion === 'inventario' && (
                      <div>
                        <div className="page-header">
                          <div className="page-title">Inventario</div>
                          <div className="page-desc">{productos.length} producto(s) · {sBajo} con stock bajo · {sSin} sin stock</div>
                        </div>
                        <div className="card">
                          <table className="data-table">
                            <thead><tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock global</th><th>Estado</th><th>Sucursales</th></tr></thead>
                            <tbody>
                            {productos.map(p => (
                                <tr key={p.id}>
                                  <td><span style={{ fontSize: 12, color: 'var(--c-accent)', fontFamily: 'monospace' }}>{p.sku}</span></td>
                                  <td className="cell-primary">{p.nombre}</td>
                                  <td><span className="badge badge-gray">{p.categoria}</span></td>
                                  <td style={{ fontWeight: 500 }}>${p.precio?.toLocaleString('es-CL')}</td>
                                  <td style={{ fontWeight: 700 }}>{p.cantidad}</td>
                                  <td>{getBadgeStock(p.cantidad)}</td>
                                  <td><button className="btn btn-secondary btn-sm" onClick={() => { setProdStock(p); setModalStockProd(true) }}><IconMapPin size={12} /> Ver</button></td>
                                </tr>
                            ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                  )}

                  {seccion === 'sucursales' && (
                      <div>
                        <div className="page-header">
                          <div className="page-title">Sucursales</div>
                          <div className="page-desc">Administración de stock por punto de distribución</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                          {sucursales.map(s => {
                            const operadoresSuc = usuarios.filter(u => u.sucursalId === s.id)
                            return (
                                <div key={s.id} className="card">
                                  <div className="card-header">
                                    <span className="card-title">{s.nombre}</span>
                                    <span className={`badge ${s.activa ? 'badge-green' : 'badge-gray'}`}><span className="badge-dot" />{s.activa ? 'Activa' : 'Inactiva'}</span>
                                  </div>
                                  <div className="card-body">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--c-text-3)' }}>
                                      <div style={{ display: 'flex', gap: 8 }}><IconMapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} /><span>{s.direccion}</span></div>
                                      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span style={{ width: 13, flexShrink: 0 }} /><span style={{ color: 'var(--c-text-4)', fontSize: 12 }}>{s.ciudad} · {s.telefono}</span></div>
                                    </div>
                                    {operadoresSuc.length > 0 && (
                                        <div style={{ marginBottom: 12, padding: '8px 10px', background: 'var(--c-surface-2)', borderRadius: 'var(--radius-sm)', fontSize: 12 }}>
                                          <div style={{ color: 'var(--c-text-3)', marginBottom: 4, fontWeight: 600 }}>OPERADORES</div>
                                          {operadoresSuc.map(u => <div key={u.id} style={{ color: 'var(--c-text-2)' }}>{u.nombre}</div>)}
                                        </div>
                                    )}
                                    <button className="btn btn-primary w-full" style={{ justifyContent: 'center', width: '100%' }} onClick={() => abrirStockSucursal(s)}>
                                      Gestionar stock
                                    </button>
                                  </div>
                                </div>
                            )
                          })}
                        </div>
                      </div>
                  )}
                </>
            )}
          </main>
        </div>

        {modalU && <ModalUsuario usuario={uEdit} sucursales={sucursales} onGuardar={guardarUsuario} onCerrar={() => { setModalU(false); setUEdit(null) }} />}
        {modalStock && sucEdit && <ModalStock sucursal={sucEdit} productos={productos} stockActual={stockSuc} onGuardar={guardarStock} onCerrar={() => { setModalStock(false); setSucEdit(null) }} />}
        {modalStockProd && prodStock && <ModalStockProducto producto={prodStock} sucursales={sucursales} onCerrar={() => { setModalStockProd(false); setProdStock(null) }} />}
      </div>
  )
}