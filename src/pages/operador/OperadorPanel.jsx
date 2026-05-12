import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import InventarioForm from '../inventario/InventarioForm'
import { IconGrid, IconBox, IconUser, IconLogout, IconPlus, IconRefresh, IconEdit, IconTrash, IconMapPin, IconSearch, IconWarning, IconBuilding } from '../../components/Icons'

const CATS = ['TODAS', 'ELECTRONICO', 'ROPA', 'CALZADO', 'HOGAR', 'DEPORTES', 'ALIMENTOS', 'OTROS']

function ModalStockEdit({ sucursal, productos, stockActual, onGuardar, onCerrar }) {
  const [stocks, setStocks] = useState(productos.map(p => { const s = stockActual.find(s => s.producto?.id === p.id); return { productoId: p.id, nombre: p.nombre, sku: p.sku, cantidad: s?.cantidad ?? 0 } }))
  const set = (id, val) => setStocks(st => st.map(s => s.productoId === id ? { ...s, cantidad: parseInt(val) || 0 } : s))
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">Gestión de stock</div>
            <div className="modal-subtitle">{sucursal.nombre} — ajusta las cantidades por producto</div>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <table className="data-table">
          <thead><tr><th>SKU</th><th>Producto</th><th style={{ width: 170 }}>Cantidad</th></tr></thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.productoId}>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-accent)' }}>{s.sku}</span></td>
                <td className="cell-primary">{s.nombre}</td>
                <td><input type="number" className="form-input" value={s.cantidad} min="0" onChange={e => set(s.productoId, e.target.value)} style={{ padding: '5px 9px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onGuardar(stocks)}>Guardar cambios</button>
        </div>
      </div>
    </div>
  )
}

function ModalStockVer({ producto, sucursales, onCerrar }) {
  const [stocks, setStocks] = useState([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    apiClient.get(`/api/sucursales/producto/${producto.id}`).then(r => setStocks(r.data)).catch(() => toast.error('Error')).finally(() => setCargando(false))
  }, [producto.id])
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">Stock por sucursal</div>
            <div className="modal-subtitle">{producto.nombre} · Stock total: {producto.cantidad} uds</div>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        {cargando ? <div className="loading-state"><span className="spinner" /></div> : (
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
                        : cant <= 5 ? <span className="badge badge-yellow"><span className="badge-dot" />Bajo</span>
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

export default function OperadorPanel() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState('dashboard')
  const [productos, setProductos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [stockSuc, setStockSuc] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [cat, setCat] = useState('TODAS')
  const [sucFiltro, setSucFiltro] = useState('TODAS')
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS')
  const [modalInv, setModalInv] = useState(false)
  const [prodEdit, setProdEdit] = useState(null)
  const [modalStockEdit, setModalStockEdit] = useState(false)
  const [modalStockVer, setModalStockVer] = useState(false)
  const [prodStock, setProdStock] = useState(null)

  const sucursalAsignada = usuario?.sucursalId ? sucursales.find(s => s.id === usuario.sucursalId) : null

  const cargar = async () => {
    setCargando(true)
    try {
      const [rp, rs] = await Promise.all([apiClient.get('/api/inventario'), apiClient.get('/api/sucursales')])
      setProductos(rp.data); setSucursales(rs.data)
      if (usuario?.sucursalId) {
        const rStock = await apiClient.get(`/api/sucursales/${usuario.sucursalId}/stock`)
        setStockSuc(rStock.data); setSucFiltro(String(usuario.sucursalId))
      } else if (sucFiltro !== 'TODAS') {
        const rStock = await apiClient.get(`/api/sucursales/${sucFiltro}/stock`)
        setStockSuc(rStock.data)
      }
    } catch { toast.error('Error al cargar') } finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const cargarStock = async (id) => { try { const r = await apiClient.get(`/api/sucursales/${id}/stock`); setStockSuc(r.data) } catch { toast.error('Error') } }

  const handleSucFiltro = (val) => { setSucFiltro(val); if (val !== 'TODAS') cargarStock(parseInt(val)); else setStockSuc([]) }

  const prodsFiltrados = useMemo(() => {
    return productos.map(p => {
      if (sucFiltro !== 'TODAS') { const s = stockSuc.find(s => s.producto?.id === p.id); return { ...p, cantMostrada: s?.cantidad ?? 0 } }
      return { ...p, cantMostrada: p.cantidad }
    }).filter(p => {
      const b = p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.sku?.toLowerCase().includes(busqueda.toLowerCase())
      const c = cat === 'TODAS' || p.categoria === cat
      const cant = p.cantMostrada
      const e = estadoFiltro === 'TODOS' || (estadoFiltro === 'OK' && cant > 5) || (estadoFiltro === 'BAJO' && cant > 0 && cant <= 5) || (estadoFiltro === 'SIN' && cant === 0)
      return b && c && e
    })
  }, [productos, busqueda, cat, estadoFiltro, sucFiltro, stockSuc])

  const guardar = async (datos) => {
    try {
      if (prodEdit) { await apiClient.put(`/api/inventario/${prodEdit.id}`, datos); toast.success('Producto actualizado') }
      else { await apiClient.post('/api/inventario', datos); toast.success('Producto registrado') }
      setModalInv(false); setProdEdit(null); cargar()
    } catch (e) { toast.error(e.response?.data || 'Error') }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Confirmas eliminar este producto?')) return
    try { await apiClient.delete(`/api/inventario/${id}`); toast.success('Producto eliminado'); cargar() } catch { toast.error('Error al eliminar') }
  }

  const guardarStock = async (stocks) => {
    const sucId = sucursalAsignada?.id || parseInt(sucFiltro)
    try {
      await Promise.all(stocks.map(s => apiClient.put(`/api/sucursales/${sucId}/stock/${s.productoId}`, { cantidad: s.cantidad })))
      toast.success('Stock actualizado'); setModalStockEdit(false)
      const [rp, rStock] = await Promise.all([apiClient.get('/api/inventario'), apiClient.get(`/api/sucursales/${sucId}/stock`)])
      setProductos(rp.data); setStockSuc(rStock.data)
    } catch { toast.error('Error') }
  }

  const sBajo = productos.filter(p => p.cantidad > 0 && p.cantidad <= 5).length
  const sSin = productos.filter(p => p.cantidad === 0).length

  const getBadge = (c) => {
    if (c === 0) return <span className="badge badge-red"><span className="badge-dot" />Sin stock</span>
    if (c <= 5) return <span className="badge badge-yellow"><span className="badge-dot" />Bajo</span>
    return <span className="badge badge-green"><span className="badge-dot" />Normal</span>
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <IconGrid /> },
    { key: 'inventario', label: 'Inventario', icon: <IconBox /> },
    { key: 'perfil', label: 'Mi perfil', icon: <IconUser /> }
  ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">SL</div>
            SmartLogix
          </div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{usuario?.nombre}</div>
          <div className="sidebar-user-meta">{usuario?.cargo || usuario?.email}</div>
          <div className="sidebar-user-pill">OPERADOR</div>
          {sucursalAsignada && (
            <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconBuilding size={11} /> {sucursalAsignada.nombre.replace('Sucursal ', '')}
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Navegación</div>
          {navItems.map(item => (
            <button key={item.key} className={`sidebar-item ${seccion === item.key ? 'active' : ''}`} onClick={() => setSeccion(item.key)}>
              <span className="sidebar-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
          {sucursalAsignada && (
            <>
              <div className="sidebar-divider" />
              <div className="sidebar-section">Sucursal</div>
              <button className="sidebar-item" onClick={() => setModalStockEdit(true)}>
                <span className="sidebar-item-icon"><IconBuilding /></span>
                Gestionar mi sucursal
              </button>
            </>
          )}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/login') }}>
            <IconLogout size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="app-content">
        <div className="topbar">
          <div className="topbar-breadcrumb">
            <span>SmartLogix</span>
            <span>/</span>
            <span className="topbar-breadcrumb-active">{navItems.find(n => n.key === seccion)?.label}</span>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={cargar} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconRefresh size={13} /> Actualizar
            </button>
          </div>
        </div>

        <main className="app-main">
          {cargando ? <div className="loading-state"><span className="spinner spinner-lg" /><span>Cargando datos...</span></div> : (
            <>
              {/* DASHBOARD */}
              {seccion === 'dashboard' && (
                <div>
                  <div className="page-header">
                    <div className="page-title">Dashboard</div>
                    <div className="page-desc">Estado actual del inventario y sucursales</div>
                  </div>
                  {sucursalAsignada && (
                    <div className="alert alert-blue mb-4" style={{ marginBottom: 20 }}>
                      <IconBuilding size={14} style={{ flexShrink: 0 }} />
                      <span><strong>Sucursal asignada:</strong> {sucursalAsignada.nombre} — {sucursalAsignada.ciudad} · {sucursalAsignada.telefono}</span>
                    </div>
                  )}
                  <div className="stat-row mb-6" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    <div className="stat-cell"><div className="stat-label">Productos</div><div className="stat-value">{productos.length}</div></div>
                    <div className="stat-cell"><div className="stat-label">Con stock</div><div className="stat-value green">{productos.filter(p => p.cantidad > 5).length}</div></div>
                    <div className="stat-cell"><div className="stat-label">Stock bajo</div><div className="stat-value yellow">{sBajo}</div></div>
                    <div className="stat-cell"><div className="stat-label">Sin stock</div><div className="stat-value red">{sSin}</div></div>
                    <div className="stat-cell"><div className="stat-label">Sucursales</div><div className="stat-value accent">{sucursales.filter(s => s.activa).length}</div></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="card">
                      <div className="card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <IconWarning size={14} style={{ color: 'var(--c-red)' }} />
                          <span className="card-title">Alertas de stock</span>
                        </div>
                        <button className="btn btn-secondary btn-xs" onClick={() => setSeccion('inventario')}>Ver inventario</button>
                      </div>
                      {productos.filter(p => p.cantidad <= 5).length === 0
                        ? <div style={{ padding: '20px 18px', fontSize: 13, color: 'var(--c-text-3)' }}>Sin alertas — todo el inventario está en orden</div>
                        : productos.filter(p => p.cantidad <= 5).slice(0, 5).map(p => (
                          <div key={p.id} className="list-item">
                            <div>
                              <div className="list-item-primary">{p.nombre}</div>
                              <div className="list-item-secondary" style={{ fontFamily: 'monospace', color: 'var(--c-accent)', fontSize: 11 }}>{p.sku}</div>
                            </div>
                            {getBadge(p.cantidad)}
                          </div>
                        ))}
                    </div>
                    <div className="card">
                      <div className="card-header"><span className="card-title">Sucursales activas</span></div>
                      {sucursales.filter(s => s.activa).map(s => (
                        <div key={s.id} className="list-item">
                          <div>
                            <div className="list-item-primary">{s.nombre}</div>
                            <div className="list-item-secondary">{s.ciudad}</div>
                          </div>
                          {s.id === usuario?.sucursalId
                            ? <span className="badge badge-blue">Mi sucursal</span>
                            : <span className="badge badge-green"><span className="badge-dot" />Activa</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* INVENTARIO */}
              {seccion === 'inventario' && (
                <div>
                  <div className="page-header flex justify-between items-center">
                    <div>
                      <div className="page-title">Inventario</div>
                      <div className="page-desc">{prodsFiltrados.length} de {productos.length} producto(s)</div>
                    </div>
                    <div className="flex gap-2">
                      {sucursalAsignada && (
                        <button className="btn btn-secondary" onClick={() => setModalStockEdit(true)}>
                          <IconBuilding size={14} /> Gestionar mi sucursal
                        </button>
                      )}
                      <button className="btn btn-primary" onClick={() => { setProdEdit(null); setModalInv(true) }}>
                        <IconPlus size={14} /> Nuevo producto
                      </button>
                    </div>
                  </div>

                  <div className="filter-bar mb-4">
                    <div className="filter-bar-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                      <div>
                        <label className="form-label">Buscar</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)', display: 'flex' }}>
                            <IconSearch size={13} />
                          </span>
                          <input className="form-input" placeholder="Nombre o SKU..." value={busqueda}
                            onChange={e => setBusqueda(e.target.value)} style={{ paddingLeft: 30 }} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label">Categoría</label>
                        <select className="form-input" value={cat} onChange={e => setCat(e.target.value)}>
                          {CATS.map(c => <option key={c} value={c}>{c === 'TODAS' ? 'Todas' : c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">
                          Sucursal {sucursalAsignada && <span style={{ color: 'var(--c-accent)', fontSize: 10 }}>· asignada</span>}
                        </label>
                        <select className="form-input" value={sucFiltro} onChange={e => handleSucFiltro(e.target.value)}>
                          <option value="TODAS">Todas</option>
                          {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre.replace('Sucursal ', '')}{s.id === usuario?.sucursalId ? ' ★' : ''}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="form-label">Estado</label>
                        <select className="form-input" value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
                          <option value="TODOS">Todos</option>
                          <option value="OK">Con stock</option>
                          <option value="BAJO">Stock bajo</option>
                          <option value="SIN">Sin stock</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th>
                          <th>Cantidad {sucFiltro !== 'TODAS' && <span style={{ color: 'var(--c-accent)', fontStyle: 'italic', textTransform: 'none' }}>sucursal</span>}</th>
                          <th>Estado</th><th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prodsFiltrados.length === 0
                          ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--c-text-3)' }}>No se encontraron productos con los filtros aplicados</td></tr>
                          : prodsFiltrados.map(p => (
                            <tr key={p.id}>
                              <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-accent)' }}>{p.sku}</span></td>
                              <td>
                                <div className="cell-primary">{p.nombre}</div>
                                {p.descripcion && <div style={{ fontSize: 11, color: 'var(--c-text-4)', marginTop: 2 }}>{p.descripcion.slice(0, 45)}{p.descripcion.length > 45 ? '...' : ''}</div>}
                              </td>
                              <td><span className="badge badge-gray">{p.categoria}</span></td>
                              <td style={{ fontWeight: 500 }}>${p.precio?.toLocaleString('es-CL')}</td>
                              <td style={{ fontWeight: 700 }}>{p.cantMostrada}</td>
                              <td>{getBadge(p.cantMostrada)}</td>
                              <td>
                                <div className="flex gap-2">
                                  <button className="btn btn-secondary btn-sm" onClick={() => { setProdEdit(p); setModalInv(true) }}>
                                    <IconEdit /> Editar
                                  </button>
                                  <button className="btn btn-danger-ghost btn-sm" onClick={() => eliminar(p.id)}>
                                    <IconTrash /> Eliminar
                                  </button>
                                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setProdStock(p); setModalStockVer(true) }} title="Ver stock por sucursal">
                                    <IconMapPin size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PERFIL */}
              {seccion === 'perfil' && (
                <div>
                  <div className="page-header">
                    <div className="page-title">Mi perfil</div>
                    <div className="page-desc">Información de tu cuenta en SmartLogix</div>
                  </div>
                  <div className="card" style={{ maxWidth: 540 }}>
                    <div className="card-body">
                      <div className="flex items-center gap-3" style={{ marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid var(--c-border)' }}>
                        <div className="profile-avatar">{usuario?.nombre?.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-text)' }}>{usuario?.nombre}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                            <span className="badge badge-gray">OPERADOR</span>
                            {sucursalAsignada && <span className="badge badge-blue"><IconBuilding size={10} /> {sucursalAsignada.nombre.replace('Sucursal ', '')}</span>}
                          </div>
                        </div>
                      </div>
                      {[
                        { key: 'Correo electrónico', val: usuario?.email },
                        { key: 'Cargo', val: usuario?.cargo },
                        { key: 'Teléfono', val: usuario?.telefono },
                        { key: 'RUT', val: usuario?.rut },
                        { key: 'Dirección', val: usuario?.direccion },
                        { key: 'Sucursal asignada', val: usuario?.sucursalNombre }
                      ].map((item, i) => (
                        <div key={i} className="profile-field">
                          <span className="profile-field-key">{item.key}</span>
                          <span className="profile-field-val">{item.val || <span style={{ color: 'var(--c-text-4)' }}>No especificado</span>}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: 14, fontSize: 12, color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Para actualizar tu información, contacta al administrador.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {modalInv && <InventarioForm producto={prodEdit} onGuardar={guardar} onCerrar={() => { setModalInv(false); setProdEdit(null) }} />}
      {modalStockEdit && sucursalAsignada && <ModalStockEdit sucursal={sucursalAsignada} productos={productos} stockActual={stockSuc} onGuardar={guardarStock} onCerrar={() => setModalStockEdit(false)} />}
      {modalStockVer && prodStock && <ModalStockVer producto={prodStock} sucursales={sucursales} onCerrar={() => { setModalStockVer(false); setProdStock(null) }} />}
    </div>
  )
}
