import React, { useEffect, useState, useMemo } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import apiClient from '../../api/apiClient'
import InventarioForm from '../inventario/InventarioForm'
import {
  IconGrid, IconBox, IconUser, IconLogout, IconPlus,
  IconRefresh, IconEdit, IconTrash, IconMapPin, IconSearch,
  IconWarning, IconBuilding, IconShoppingCart, IconTruck
} from '../../components/Icons'

const CATS = ['TODAS','ELECTRONICO','ROPA','CALZADO','HOGAR','DEPORTES','ALIMENTOS','OTROS']

const badgeEstadoPedido = (e) => ({
  PENDIENTE:'badge-yellow', CONFIRMADO:'badge-blue', EN_PROCESO:'badge-blue',
  ENVIADO:'badge-blue', ENTREGADO:'badge-green', CANCELADO:'badge-red'
}[e] || 'badge-gray')

const badgeEstadoEnvio = (e) => ({
  PREPARANDO:'badge-yellow', EN_TRANSITO:'badge-blue', EN_DESTINO:'badge-blue',
  ENTREGADO:'badge-green', FALLIDO:'badge-red'
}[e] || 'badge-gray')

function ModalStockEdit({ sucursal, productos, stockActual, onGuardar, onCerrar }) {
  const [stocks, setStocks] = useState(
      productos.map(p => {
        const s = stockActual.find(s => s.producto?.id === p.id)
        return { productoId: p.id, nombre: p.nombre, sku: p.sku, cantidad: s?.cantidad ?? 0 }
      })
  )
  const set = (id, val) => setStocks(st => st.map(s => s.productoId === id ? { ...s, cantidad: parseInt(val) || 0 } : s))
  return (
      <div className="modal-overlay">
        <div className="modal modal-lg">
          <div className="modal-header">
            <div>
              <div className="modal-title">Gestión de stock</div>
              <div className="modal-subtitle">{sucursal.nombre} — ajusta las cantidades</div>
            </div>
            <button className="modal-close" onClick={onCerrar}>✕</button>
          </div>
          <table className="data-table">
            <thead><tr><th>SKU</th><th>Producto</th><th style={{width:170}}>Cantidad</th></tr></thead>
            <tbody>
            {stocks.map(s => (
                <tr key={s.productoId}>
                  <td><span style={{fontFamily:'monospace',fontSize:12,color:'var(--c-accent)'}}>{s.sku}</span></td>
                  <td className="cell-primary">{s.nombre}</td>
                  <td><input type="number" className="form-input" value={s.cantidad} min="0" onChange={e => set(s.productoId, e.target.value)} style={{padding:'5px 9px'}} /></td>
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

export default function OperadorPanel() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState('dashboard')
  const [productos, setProductos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [stockSuc, setStockSuc] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [cat, setCat] = useState('TODAS')
  const [sucFiltro, setSucFiltro] = useState('TODAS')
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS')
  const [modalInv, setModalInv] = useState(false)
  const [prodEdit, setProdEdit] = useState(null)
  const [modalStockEdit, setModalStockEdit] = useState(false)

  const sucursalAsignada = usuario?.sucursalId ? sucursales.find(s => s.id === usuario.sucursalId) : null

  const cargar = async () => {
    setCargando(true)
    try {
      const [rp, rs, rpd, re] = await Promise.all([
        apiClient.get('/api/inventario'),
        apiClient.get('/api/sucursales'),
        apiClient.get('/api/pedidos'),
        apiClient.get('/api/envios'),
      ])
      setProductos(rp.data)
      setSucursales(rs.data)
      setPedidos(rpd.data || [])
      setEnvios(re.data || [])
      if (usuario?.sucursalId) {
        const rStock = await apiClient.get(`/api/sucursales/${usuario.sucursalId}/stock`)
        setStockSuc(rStock.data)
        setSucFiltro(String(usuario.sucursalId))
      }
    } catch { toast.error('Error al cargar datos') }
    finally { setCargando(false) }
  }

  useEffect(() => { cargar() }, [])

  const cargarStock = async (id) => {
    try { const r = await apiClient.get(`/api/sucursales/${id}/stock`); setStockSuc(r.data) }
    catch { toast.error('Error al cargar stock') }
  }

  const handleSucFiltro = (val) => {
    setSucFiltro(val)
    if (val !== 'TODAS') cargarStock(parseInt(val))
    else setStockSuc([])
  }

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
    try { await apiClient.delete(`/api/inventario/${id}`); toast.success('Eliminado'); cargar() }
    catch { toast.error('Error') }
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
    if (c === 0) return <span className="badge badge-red"><span className="badge-dot"/>Sin stock</span>
    if (c <= 5) return <span className="badge badge-yellow"><span className="badge-dot"/>Bajo</span>
    return <span className="badge badge-green"><span className="badge-dot"/>Normal</span>
  }

  const navItems = [
    { key: 'dashboard',   label: 'Dashboard',     icon: <IconGrid size={15}/> },
    { key: 'inventario',  label: 'Inventario',     icon: <IconBox size={15}/> },
    { key: 'pedidos',     label: 'Pedidos',        icon: <IconShoppingCart size={15}/> },
    { key: 'envios',      label: 'Envíos',         icon: <IconTruck size={15}/> },
    { key: 'sucursal',    label: 'Mi sucursal',    icon: <IconBuilding size={15}/> },
    { key: 'perfil',      label: 'Mi perfil',      icon: <IconUser size={15}/> },
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
                <div style={{marginTop:6,fontSize:11,color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:5}}>
                  <IconBuilding size={11}/> {sucursalAsignada.nombre}
                </div>
            )}
          </div>
          <nav className="sidebar-nav">
            <div className="sidebar-section">Navegación</div>
            {navItems.map(item => (
                <button
                    key={item.key}
                    className={`sidebar-item${seccion === item.key ? ' sidebar-item-active' : ''}`}
                    onClick={() => setSeccion(item.key)}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  <span className="sidebar-item-label">{item.label}</span>
                </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="sidebar-item" onClick={() => navigate('/admin')}>
              <span className="sidebar-item-icon"><IconGrid size={15}/></span>
              <span className="sidebar-item-label">Volver al admin</span>
            </button>
            <button className="sidebar-item" onClick={() => { logout(); navigate('/login') }}>
              <span className="sidebar-item-icon"><IconLogout size={15}/></span>
              <span className="sidebar-item-label">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <div className="app-content">
          <main className="app-main">
            <div className="page-header">
              <div>
                <div className="page-breadcrumb">SmartLogix / {navItems.find(n => n.key === seccion)?.label}</div>
                <h1 className="page-title">{navItems.find(n => n.key === seccion)?.label}</h1>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={cargar}><IconRefresh size={13}/> Actualizar</button>
            </div>

            {cargando ? (
                <div style={{textAlign:'center',padding:60,color:'var(--c-text-3)'}}>Cargando...</div>
            ) : (
                <>
                  {/* ── DASHBOARD ── */}
                  {seccion === 'dashboard' && (
                      <div>
                        {sucursalAsignada && (
                            <div style={{background:'var(--c-accent-muted)',border:'1px solid var(--c-accent)',borderRadius:8,padding:'10px 14px',marginBottom:20,fontSize:13,color:'var(--c-accent)',display:'flex',alignItems:'center',gap:8}}>
                              <IconBuilding size={14}/> <strong>Sucursal asignada:</strong> {sucursalAsignada.nombre} — {sucursalAsignada.ciudad}
                            </div>
                        )}
                        <div className="stat-row" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:20}}>
                          {[
                            {label:'Productos',value:productos.length,color:'var(--c-accent)'},
                            {label:'Stock bajo',value:sBajo,color:'#b45309'},
                            {label:'Sin stock',value:sSin,color:'#dc2626'},
                            {label:'Pedidos activos',value:pedidos.filter(p=>['PENDIENTE','CONFIRMADO','EN_PROCESO'].includes(p.estado)).length,color:'#2563eb'},
                          ].map((s,i)=>(
                              <div key={i} className="card" style={{padding:'16px 20px'}}>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value" style={{color:s.color,fontSize:28,fontWeight:700}}>{s.value}</div>
                              </div>
                          ))}
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                          <div className="card">
                            <div className="card-header">
                              <div className="card-title">⚠ Alertas de stock</div>
                              <button className="btn btn-secondary btn-xs" onClick={()=>setSeccion('inventario')}>Ver inventario</button>
                            </div>
                            {productos.filter(p=>p.cantidad<=5).length===0
                                ? <div style={{padding:'20px 18px',fontSize:13,color:'var(--c-text-3)'}}>Sin alertas activas — todo en stock</div>
                                : productos.filter(p=>p.cantidad<=5).slice(0,6).map(p=>(
                                    <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 18px',borderBottom:'1px solid var(--c-border)'}}>
                                      <div>
                                        <div style={{fontWeight:600,fontSize:13}}>{p.nombre}</div>
                                        <div style={{fontFamily:'monospace',fontSize:11,color:'var(--c-accent)'}}>{p.sku}</div>
                                      </div>
                                      {getBadge(p.cantidad)}
                                    </div>
                                ))
                            }
                          </div>
                          <div className="card">
                            <div className="card-header">
                              <div className="card-title">Pedidos recientes</div>
                              <button className="btn btn-secondary btn-xs" onClick={()=>setSeccion('pedidos')}>Ver todos</button>
                            </div>
                            {pedidos.slice(0,5).map(p=>(
                                <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 18px',borderBottom:'1px solid var(--c-border)'}}>
                                  <div>
                                    <div style={{fontWeight:600,fontSize:13}}>{p.clienteNombre}</div>
                                    <div style={{fontFamily:'monospace',fontSize:11,color:'var(--c-accent)'}}>{p.numeroPedido}</div>
                                  </div>
                                  <span className={`badge ${badgeEstadoPedido(p.estado)}`}><span className="badge-dot"/>{p.estado}</span>
                                </div>
                            ))}
                            {pedidos.length===0 && <div style={{padding:'20px 18px',fontSize:13,color:'var(--c-text-3)'}}>Sin pedidos registrados</div>}
                          </div>
                        </div>
                      </div>
                  )}

                  {/* ── INVENTARIO ── */}
                  {seccion === 'inventario' && (
                      <div>
                        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
                          <input className="form-input" style={{width:200,padding:'6px 10px',fontSize:12}} placeholder="Buscar nombre o SKU..." value={busqueda} onChange={e=>setBusqueda(e.target.value)}/>
                          <select className="form-input" style={{padding:'6px 10px',fontSize:12}} value={cat} onChange={e=>setCat(e.target.value)}>
                            {CATS.map(c=><option key={c} value={c}>{c==='TODAS'?'Todas categorías':c.charAt(0)+c.slice(1).toLowerCase()}</option>)}
                          </select>
                          <select className="form-input" style={{padding:'6px 10px',fontSize:12}} value={sucFiltro} onChange={e=>handleSucFiltro(e.target.value)}>
                            <option value="TODAS">Todas las sucursales</option>
                            {sucursales.map(s=><option key={s.id} value={s.id}>{s.nombre}{s.id===usuario?.sucursalId?' ★':''}</option>)}
                          </select>
                          <select className="form-input" style={{padding:'6px 10px',fontSize:12}} value={estadoFiltro} onChange={e=>setEstadoFiltro(e.target.value)}>
                            <option value="TODOS">Todo el stock</option>
                            <option value="OK">Con stock</option>
                            <option value="BAJO">Stock bajo</option>
                            <option value="SIN">Sin stock</option>
                          </select>
                          <button className="btn btn-primary btn-sm" onClick={()=>{setProdEdit(null);setModalInv(true)}}><IconPlus size={13}/> Nuevo producto</button>
                        </div>
                        <div className="card">
                          <table className="data-table">
                            <thead><tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Cantidad</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                            {prodsFiltrados.length===0
                                ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin resultados</td></tr>
                                : prodsFiltrados.map(p=>(
                                    <tr key={p.id}>
                                      <td><span style={{fontFamily:'monospace',fontSize:12,color:'var(--c-accent)'}}>{p.sku}</span></td>
                                      <td><div className="cell-primary">{p.nombre}</div></td>
                                      <td><span className="badge badge-gray">{p.categoria}</span></td>
                                      <td>${p.precio?.toLocaleString('es-CL')}</td>
                                      <td style={{fontWeight:700}}>{p.cantMostrada}</td>
                                      <td>{getBadge(p.cantMostrada)}</td>
                                      <td><div style={{display:'flex',gap:4}}>
                                        <button className="btn btn-secondary btn-xs" onClick={()=>{setProdEdit(p);setModalInv(true)}}><IconEdit/>Editar</button>
                                        <button className="btn btn-danger-ghost btn-xs" onClick={()=>eliminar(p.id)}><IconTrash/></button>
                                      </div></td>
                                    </tr>
                                ))
                            }
                            </tbody>
                          </table>
                        </div>
                      </div>
                  )}

                  {/* ── PEDIDOS ── */}
                  {seccion === 'pedidos' && (
                      <div className="card">
                        <table className="data-table">
                          <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Dirección</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
                          <tbody>
                          {pedidos.length===0
                              ? <tr><td colSpan={6} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin pedidos</td></tr>
                              : pedidos.map(p=>(
                                  <tr key={p.id}>
                                    <td><span className="cell-mono">{p.numeroPedido}</span></td>
                                    <td><div className="cell-primary">{p.clienteNombre}</div><div className="cell-muted">{p.clienteEmail}</div></td>
                                    <td><div className="cell-muted" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.direccionEntrega}</div></td>
                                    <td><span className="cell-primary">${Number(p.total||0).toLocaleString('es-CL')}</span></td>
                                    <td><span className={`badge ${badgeEstadoPedido(p.estado)}`}><span className="badge-dot"/>{p.estado}</span></td>
                                    <td><span className="cell-muted">{p.fechaPedido?new Date(p.fechaPedido).toLocaleDateString('es-CL'):'-'}</span></td>
                                  </tr>
                              ))
                          }
                          </tbody>
                        </table>
                      </div>
                  )}

                  {/* ── ENVÍOS ── */}
                  {seccion === 'envios' && (
                      <div className="card">
                        <table className="data-table">
                          <thead><tr><th>Código</th><th>Transportista</th><th>Destino</th><th>Estado</th><th>F. Estimada</th></tr></thead>
                          <tbody>
                          {envios.length===0
                              ? <tr><td colSpan={5} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin envíos</td></tr>
                              : envios.map(e=>(
                                  <tr key={e.id}>
                                    <td><span className="cell-mono">{e.codigoSeguimiento}</span></td>
                                    <td>{e.transportista}</td>
                                    <td><div className="cell-muted" style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.direccionDestino}</div></td>
                                    <td><span className={`badge ${badgeEstadoEnvio(e.estado)}`}><span className="badge-dot"/>{e.estado}</span></td>
                                    <td><span className="cell-muted">{e.fechaEntregaEstimada?new Date(e.fechaEntregaEstimada).toLocaleDateString('es-CL'):'-'}</span></td>
                                  </tr>
                              ))
                          }
                          </tbody>
                        </table>
                      </div>
                  )}

                  {/* ── MI SUCURSAL ── */}
                  {seccion === 'sucursal' && (
                      <div>
                        {!sucursalAsignada
                            ? <div className="card" style={{padding:32,textAlign:'center',color:'var(--c-text-3)'}}>No tienes una sucursal asignada. Contacta al administrador.</div>
                            : (
                                <>
                                  <div className="card" style={{padding:'20px 24px',marginBottom:16}}>
                                    <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>{sucursalAsignada.nombre}</div>
                                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:13,color:'var(--c-text-2)'}}>
                                      <div><strong>Ciudad:</strong> {sucursalAsignada.ciudad}</div>
                                      <div><strong>Teléfono:</strong> {sucursalAsignada.telefono}</div>
                                      <div><strong>Dirección:</strong> {sucursalAsignada.direccion}</div>
                                      <div><strong>Estado:</strong> {sucursalAsignada.activa ? '✅ Activa' : '❌ Inactiva'}</div>
                                    </div>
                                    <button className="btn btn-primary btn-sm" style={{marginTop:16}} onClick={()=>setModalStockEdit(true)}>
                                      <IconBox size={13}/> Gestionar stock
                                    </button>
                                  </div>
                                  <div className="card">
                                    <div className="card-header"><div className="card-title">Stock actual</div></div>
                                    <table className="data-table">
                                      <thead><tr><th>SKU</th><th>Producto</th><th>Cantidad</th><th>Estado</th></tr></thead>
                                      <tbody>
                                      {stockSuc.length===0
                                          ? <tr><td colSpan={4} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin stock registrado</td></tr>
                                          : stockSuc.map(s=>(
                                              <tr key={s.producto?.id}>
                                                <td><span style={{fontFamily:'monospace',fontSize:12,color:'var(--c-accent)'}}>{s.producto?.sku}</span></td>
                                                <td className="cell-primary">{s.producto?.nombre}</td>
                                                <td style={{fontWeight:700}}>{s.cantidad}</td>
                                                <td>{getBadge(s.cantidad)}</td>
                                              </tr>
                                          ))
                                      }
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                            )
                        }
                      </div>
                  )}

                  {/* ── PERFIL ── */}
                  {seccion === 'perfil' && (
                      <div className="card" style={{maxWidth:500,padding:'24px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,paddingBottom:20,borderBottom:'1px solid var(--c-border)'}}>
                          <div style={{width:56,height:56,borderRadius:'50%',background:'var(--c-accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'#fff'}}>
                            {usuario?.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{fontWeight:700,fontSize:16}}>{usuario?.nombre}</div>
                            <span className="badge badge-gray" style={{marginTop:4}}>OPERADOR</span>
                            {sucursalAsignada && <span className="badge badge-blue" style={{marginLeft:6}}>{sucursalAsignada.nombre}</span>}
                          </div>
                        </div>
                        {[
                          {label:'Correo electrónico', value:usuario?.email},
                          {label:'Cargo',              value:usuario?.cargo},
                          {label:'Teléfono',           value:usuario?.telefono},
                          {label:'RUT',                value:usuario?.rut},
                          {label:'Dirección',          value:usuario?.direccion},
                          {label:'Sucursal asignada',  value:sucursalAsignada?.nombre},
                        ].map((item,i)=>(
                            <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--c-border)',fontSize:13}}>
                              <span style={{color:'var(--c-text-3)',fontWeight:500}}>{item.label}</span>
                              <span style={{color:'var(--c-text)',fontWeight:600}}>{item.value || <span style={{color:'var(--c-text-4)'}}>No especificado</span>}</span>
                            </div>
                        ))}
                        <div style={{marginTop:16,fontSize:12,color:'var(--c-text-3)'}}>
                          Para actualizar tu información, contacta al administrador.
                        </div>
                      </div>
                  )}
                </>
            )}
          </main>
        </div>

        {modalInv && <InventarioForm producto={prodEdit} onGuardar={guardar} onCerrar={()=>{setModalInv(false);setProdEdit(null)}} />}
        {modalStockEdit && sucursalAsignada && (
            <ModalStockEdit sucursal={sucursalAsignada} productos={productos} stockActual={stockSuc} onGuardar={guardarStock} onCerrar={()=>setModalStockEdit(false)} />
        )}
      </div>
  )
}
