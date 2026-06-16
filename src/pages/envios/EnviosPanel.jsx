import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import apiClient from '../../api/apiClient'
import Sidebar from '../../components/Sidebar'
import { IconPlus, IconRefresh, IconEdit, IconTrash } from '../../components/Icons'

const ESTADOS = ['PREPARANDO','EN_TRANSITO','EN_DESTINO','ENTREGADO','FALLIDO']
const badgeEstado = (e) => ({PREPARANDO:'badge-yellow',EN_TRANSITO:'badge-blue',EN_DESTINO:'badge-blue',ENTREGADO:'badge-green',FALLIDO:'badge-red'}[e]||'badge-gray')

function ModalEnvio({ envio, onGuardar, onCerrar }) {
  const init = { pedidoId:'', transportista:'', direccionOrigen:'', direccionDestino:'', estado:'PREPARANDO', observaciones:'' }
  const [form, setForm] = useState(envio ? {...envio} : init)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div><div className="modal-title">{envio?'Editar envío':'Nuevo envío'}</div><div className="modal-subtitle">{envio?`Código: ${envio.codigoSeguimiento}`:'Registra un envío'}</div></div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={e=>{e.preventDefault();onGuardar(form)}}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div><label className="form-label">ID Pedido</label><input type="number" className="form-input" value={form.pedidoId} onChange={e=>set('pedidoId',e.target.value)} disabled={!!envio} /></div>
              <div><label className="form-label">Transportista *</label><input className="form-input" value={form.transportista} onChange={e=>set('transportista',e.target.value)} required /></div>
              <div><label className="form-label">Origen *</label><input className="form-input" value={form.direccionOrigen} onChange={e=>set('direccionOrigen',e.target.value)} required /></div>
              <div><label className="form-label">Destino *</label><input className="form-input" value={form.direccionDestino} onChange={e=>set('direccionDestino',e.target.value)} required /></div>
              {envio && <div><label className="form-label">Estado</label><select className="form-input" value={form.estado} onChange={e=>set('estado',e.target.value)}>{ESTADOS.map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'1/-1'}}><label className="form-label">Observaciones</label><textarea className="form-input" value={form.observaciones} onChange={e=>set('observaciones',e.target.value)} rows={2}/></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{envio?'Guardar':'Crear envío'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EnviosPanel() {
  const [envios, setEnvios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const cargar = async () => {
    setCargando(true)
    try { const r = await apiClient.get('/api/envios'); setEnvios(r.data||[]) }
    catch { toast.error('Error al cargar envíos') }
    finally { setCargando(false) }
  }
  useEffect(()=>{cargar()},[])

  const guardar = async (datos) => {
    try {
      if (edit) { await apiClient.put(`/api/envios/${edit.id}`, datos); toast.success('Envío actualizado') }
      else { await apiClient.post('/api/envios', datos); toast.success('Envío creado') }
      setModal(false); cargar()
    } catch { toast.error('Error al guardar') }
  }
  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este envío?')) return
    try { await apiClient.delete(`/api/envios/${id}`); toast.success('Eliminado'); cargar() }
    catch { toast.error('Error') }
  }

  const filtrados = envios.filter(e =>
    e.codigoSeguimiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.transportista?.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.estado?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const stats = [
    {label:'Total envíos',value:envios.length,color:'var(--c-accent)'},
    {label:'En tránsito',value:envios.filter(e=>e.estado==='EN_TRANSITO').length,color:'#b45309'},
    {label:'Entregados',value:envios.filter(e=>e.estado==='ENTREGADO').length,color:'#16a34a'},
    {label:'Fallidos',value:envios.filter(e=>e.estado==='FALLIDO').length,color:'#dc2626'},
  ]

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <main className="app-main">
          <div className="page-header">
            <div><div className="page-breadcrumb">SmartLogix / Envíos</div><h1 className="page-title">Gestión de Envíos</h1></div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={cargar}><IconRefresh size={13}/> Actualizar</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{setEdit(null);setModal(true)}}><IconPlus size={13}/> Nuevo envío</button>
            </div>
          </div>
          <div className="stat-row" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:20}}>
            {stats.map((s,i)=><div key={i} className="card" style={{padding:'16px 20px'}}><div className="stat-label">{s.label}</div><div className="stat-value" style={{color:s.color,fontSize:28,fontWeight:700}}>{s.value}</div></div>)}
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Lista de envíos</div>
              <input className="form-input" style={{width:220,padding:'5px 10px',fontSize:12}} placeholder="Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="data-table">
                <thead><tr><th>Código</th><th>Pedido</th><th>Transportista</th><th>Destino</th><th>Estado</th><th>F. Estimada</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cargando ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Cargando...</td></tr>
                  : filtrados.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin envíos</td></tr>
                  : filtrados.map(e=>(
                    <tr key={e.id}>
                      <td><span className="cell-mono">{e.codigoSeguimiento}</span></td>
                      <td><span className="cell-primary">#{e.pedidoId||'-'}</span></td>
                      <td>{e.transportista}</td>
                      <td><div className="cell-muted" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.direccionDestino}</div></td>
                      <td><span className={`badge ${badgeEstado(e.estado)}`}><span className="badge-dot"/>{e.estado}</span></td>
                      <td><span className="cell-muted">{e.fechaEntregaEstimada?new Date(e.fechaEntregaEstimada).toLocaleDateString('es-CL'):'-'}</span></td>
                      <td><div style={{display:'flex',gap:4}}>
                        <button className="btn btn-secondary btn-xs" onClick={()=>{setEdit(e);setModal(true)}}><IconEdit/>Editar</button>
                        <button className="btn btn-danger-ghost btn-xs" onClick={()=>eliminar(e.id)}><IconTrash/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {modal && <ModalEnvio envio={edit} onGuardar={guardar} onCerrar={()=>setModal(false)} />}
    </div>
  )
}
