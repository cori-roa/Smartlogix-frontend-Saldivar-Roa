import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../api/apiClient'
import Sidebar from '../../components/Sidebar'
import { IconPlus, IconRefresh, IconEdit, IconTrash } from '../../components/Icons'

const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const badgeEstado = (e) => ({ PENDIENTE:'badge-yellow', CONFIRMADO:'badge-blue', EN_PROCESO:'badge-blue', ENVIADO:'badge-blue', ENTREGADO:'badge-green', CANCELADO:'badge-red' }[e] || 'badge-gray')

function ModalPedido({ pedido, onGuardar, onCerrar }) {
  const init = { clienteNombre:'', clienteEmail:'', clienteTelefono:'', direccionEntrega:'', total:'', estado:'PENDIENTE', notas:'' }
  const [form, setForm] = useState(pedido ? { ...pedido } : init)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">{pedido ? 'Editar pedido' : 'Nuevo pedido'}</div>
            <div className="modal-subtitle">{pedido ? `N°: ${pedido.numeroPedido}` : 'Completa los datos'}</div>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onGuardar(form) }}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div><label className="form-label">Nombre cliente *</label><input className="form-input" value={form.clienteNombre} onChange={e=>set('clienteNombre',e.target.value)} required /></div>
              <div><label className="form-label">Email</label><input type="email" className="form-input" value={form.clienteEmail} onChange={e=>set('clienteEmail',e.target.value)} /></div>
              <div><label className="form-label">Teléfono</label><input className="form-input" value={form.clienteTelefono} onChange={e=>set('clienteTelefono',e.target.value)} /></div>
              <div><label className="form-label">Total ($) *</label><input type="number" className="form-input" value={form.total} onChange={e=>set('total',e.target.value)} required min="0" /></div>
              <div style={{gridColumn:'1/-1'}}><label className="form-label">Dirección entrega *</label><input className="form-input" value={form.direccionEntrega} onChange={e=>set('direccionEntrega',e.target.value)} required /></div>
              {pedido && <div><label className="form-label">Estado</label><select className="form-input" value={form.estado} onChange={e=>set('estado',e.target.value)}>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'1/-1'}}><label className="form-label">Notas</label><textarea className="form-input" value={form.notas} onChange={e=>set('notas',e.target.value)} rows={2} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{pedido ? 'Guardar' : 'Crear pedido'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PedidosPanel() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setCargando(true)
    try { const r = await apiClient.get('/api/pedidos'); setPedidos(r.data || []) }
    catch { toast.error('Error al cargar pedidos') }
    finally { setCargando(false) }
  }
  useEffect(() => { cargar() }, [])

  const guardar = async (datos) => {
    try {
      if (edit) { await apiClient.put(`/api/pedidos/${edit.id}`, datos); toast.success('Pedido actualizado') }
      else { await apiClient.post('/api/pedidos', datos); toast.success('Pedido creado') }
      setModal(false); cargar()
    } catch { toast.error('Error al guardar') }
  }
  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este pedido?')) return
    try { await apiClient.delete(`/api/pedidos/${id}`); toast.success('Eliminado'); cargar() }
    catch { toast.error('Error') }
  }

  const filtrados = pedidos.filter(p =>
    p.numeroPedido?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.estado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = [
    { label:'Total pedidos', value: pedidos.length, color:'var(--c-accent)' },
    { label:'Pendientes', value: pedidos.filter(p=>p.estado==='PENDIENTE').length, color:'#b45309' },
    { label:'Entregados', value: pedidos.filter(p=>p.estado==='ENTREGADO').length, color:'#16a34a' },
    { label:'Cancelados', value: pedidos.filter(p=>p.estado==='CANCELADO').length, color:'#dc2626' },
  ]

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <main className="app-main">
          <div className="page-header">
            <div>
              <div className="page-breadcrumb">SmartLogix / Pedidos</div>
              <h1 className="page-title">Gestión de Pedidos</h1>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={cargar}><IconRefresh size={13}/> Actualizar</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{setEdit(null);setModal(true)}}><IconPlus size={13}/> Nuevo pedido</button>
            </div>
          </div>
          <div className="stat-row" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:20}}>
            {stats.map((s,i)=>(
              <div key={i} className="card" style={{padding:'16px 20px'}}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{color:s.color,fontSize:28,fontWeight:700}}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Lista de pedidos</div>
              <input className="form-input" style={{width:220,padding:'5px 10px',fontSize:12}} placeholder="Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="data-table">
                <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Dirección</th><th>Total</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cargando ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Cargando...</td></tr>
                  : filtrados.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin pedidos</td></tr>
                  : filtrados.map(p=>(
                    <tr key={p.id}>
                      <td><span className="cell-mono">{p.numeroPedido}</span></td>
                      <td><div className="cell-primary">{p.clienteNombre}</div><div className="cell-muted">{p.clienteEmail}</div></td>
                      <td><div className="cell-muted" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.direccionEntrega}</div></td>
                      <td><span className="cell-primary">${Number(p.total||0).toLocaleString('es-CL')}</span></td>
                      <td><span className={`badge ${badgeEstado(p.estado)}`}><span className="badge-dot"/>{p.estado}</span></td>
                      <td><span className="cell-muted">{p.fechaPedido?new Date(p.fechaPedido).toLocaleDateString('es-CL'):'-'}</span></td>
                      <td><div style={{display:'flex',gap:4}}>
                        <button className="btn btn-secondary btn-xs" onClick={()=>{setEdit(p);setModal(true)}}><IconEdit/>Editar</button>
                        <button className="btn btn-danger-ghost btn-xs" onClick={()=>eliminar(p.id)}><IconTrash/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {modal && <ModalPedido pedido={edit} onGuardar={guardar} onCerrar={()=>setModal(false)} />}
    </div>
  )
}
