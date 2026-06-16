import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import apiClient from '../../api/apiClient'
import Sidebar from '../../components/Sidebar'
import { IconPlus, IconRefresh, IconEdit, IconTrash } from '../../components/Icons'

const badgeTipo = (t) => t==='INGRESO' ? 'badge-green' : 'badge-red'

function ModalTx({ tx, onGuardar, onCerrar }) {
  const init = { concepto:'', monto:'', tipo:'INGRESO', referencia:'', descripcion:'' }
  const [form, setForm] = useState(tx ? {...tx} : init)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div><div className="modal-title">{tx?'Editar transacción':'Nueva transacción'}</div><div className="modal-subtitle">{tx?`N°: ${tx.numeroTransaccion}`:'Registra un movimiento'}</div></div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={e=>{e.preventDefault();onGuardar(form)}}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div><label className="form-label">Tipo *</label><select className="form-input" value={form.tipo} onChange={e=>set('tipo',e.target.value)}><option>INGRESO</option><option>EGRESO</option></select></div>
              <div><label className="form-label">Monto ($) *</label><input type="number" className="form-input" value={form.monto} onChange={e=>set('monto',e.target.value)} required min="0"/></div>
              <div style={{gridColumn:'1/-1'}}><label className="form-label">Concepto *</label><input className="form-input" value={form.concepto} onChange={e=>set('concepto',e.target.value)} required /></div>
              <div><label className="form-label">Referencia</label><input className="form-input" value={form.referencia} onChange={e=>set('referencia',e.target.value)} /></div>
              <div style={{gridColumn:'1/-1'}}><label className="form-label">Descripción</label><textarea className="form-input" value={form.descripcion} onChange={e=>set('descripcion',e.target.value)} rows={2}/></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{tx?'Guardar':'Registrar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TransaccionesPanel() {
  const [txs, setTxs] = useState([])
  const [resumen, setResumen] = useState({totalIngresos:0,totalEgresos:0,balance:0})
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  const cargar = async () => {
    setCargando(true)
    try {
      const [r1,r2] = await Promise.all([apiClient.get('/api/transacciones'), apiClient.get('/api/transacciones/resumen')])
      setTxs(r1.data||[]); setResumen(r2.data||{totalIngresos:0,totalEgresos:0,balance:0})
    } catch { toast.error('Error al cargar transacciones') }
    finally { setCargando(false) }
  }
  useEffect(()=>{cargar()},[])

  const guardar = async (datos) => {
    try {
      if (edit) { await apiClient.put(`/api/transacciones/${edit.id}`, datos); toast.success('Actualizada') }
      else { await apiClient.post('/api/transacciones', datos); toast.success('Registrada') }
      setModal(false); cargar()
    } catch { toast.error('Error') }
  }
  const eliminar = async (id) => {
    if (!confirm('¿Eliminar?')) return
    try { await apiClient.delete(`/api/transacciones/${id}`); toast.success('Eliminada'); cargar() }
    catch { toast.error('Error') }
  }

  const filtrados = txs.filter(t => {
    const matchTipo = filtroTipo==='TODOS' || t.tipo===filtroTipo
    const matchBusq = t.numeroTransaccion?.toLowerCase().includes(busqueda.toLowerCase()) || t.concepto?.toLowerCase().includes(busqueda.toLowerCase())
    return matchTipo && matchBusq
  })

  const balancePos = resumen.balance >= 0

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <main className="app-main">
          <div className="page-header">
            <div><div className="page-breadcrumb">SmartLogix / Transacciones</div><h1 className="page-title">Transacciones Financieras</h1></div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={cargar}><IconRefresh size={13}/> Actualizar</button>
              <button className="btn btn-primary btn-sm" onClick={()=>{setEdit(null);setModal(true)}}><IconPlus size={13}/> Nueva</button>
            </div>
          </div>
          <div className="stat-row" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:20}}>
            <div className="card" style={{padding:'16px 20px'}}><div className="stat-label">Ingresos</div><div className="stat-value" style={{color:'#16a34a',fontSize:26,fontWeight:700}}>${Number(resumen.totalIngresos||0).toLocaleString('es-CL')}</div></div>
            <div className="card" style={{padding:'16px 20px'}}><div className="stat-label">Egresos</div><div className="stat-value" style={{color:'#dc2626',fontSize:26,fontWeight:700}}>${Number(resumen.totalEgresos||0).toLocaleString('es-CL')}</div></div>
            <div className="card" style={{padding:'16px 20px',borderLeft:`3px solid ${balancePos?'#16a34a':'#dc2626'}`}}><div className="stat-label">Balance</div><div className="stat-value" style={{color:balancePos?'#16a34a':'#dc2626',fontSize:26,fontWeight:700}}>{balancePos?'+':''}{Number(resumen.balance||0).toLocaleString('es-CL')}</div></div>
          </div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Movimientos</div>
              <div style={{display:'flex',gap:8}}>
                <select className="form-input" style={{padding:'5px 10px',fontSize:12}} value={filtroTipo} onChange={e=>setFiltroTipo(e.target.value)}><option value="TODOS">Todos</option><option value="INGRESO">Ingresos</option><option value="EGRESO">Egresos</option></select>
                <input className="form-input" style={{width:200,padding:'5px 10px',fontSize:12}} placeholder="Buscar..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
              </div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table className="data-table">
                <thead><tr><th>N° Transacción</th><th>Tipo</th><th>Concepto</th><th>Referencia</th><th>Monto</th><th>Fecha</th><th>Acciones</th></tr></thead>
                <tbody>
                  {cargando ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Cargando...</td></tr>
                  : filtrados.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--c-text-3)'}}>Sin transacciones</td></tr>
                  : filtrados.map(t=>(
                    <tr key={t.id}>
                      <td><span className="cell-mono">{t.numeroTransaccion}</span></td>
                      <td><span className={`badge ${badgeTipo(t.tipo)}`}><span className="badge-dot"/>{t.tipo}</span></td>
                      <td><span className="cell-primary">{t.concepto}</span></td>
                      <td><span className="cell-muted">{t.referencia||'-'}</span></td>
                      <td><span style={{fontWeight:600,color:t.tipo==='INGRESO'?'#16a34a':'#dc2626'}}>{t.tipo==='INGRESO'?'+':'-'}${Number(t.monto||0).toLocaleString('es-CL')}</span></td>
                      <td><span className="cell-muted">{t.fechaTransaccion?new Date(t.fechaTransaccion).toLocaleDateString('es-CL'):'-'}</span></td>
                      <td><div style={{display:'flex',gap:4}}>
                        <button className="btn btn-secondary btn-xs" onClick={()=>{setEdit(t);setModal(true)}}><IconEdit/>Editar</button>
                        <button className="btn btn-danger-ghost btn-xs" onClick={()=>eliminar(t.id)}><IconTrash/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {modal && <ModalTx tx={edit} onGuardar={guardar} onCerrar={()=>setModal(false)} />}
    </div>
  )
}
