import React, { useState, useEffect } from 'react'

const CATEGORIAS = ['ELECTRONICO', 'ROPA', 'CALZADO', 'HOGAR', 'DEPORTES', 'ALIMENTOS', 'OTROS']
const empty = { sku: '', nombre: '', descripcion: '', cantidad: '', precio: '', categoria: 'OTROS', fotoUrl: '' }

export default function InventarioForm({ producto, onGuardar, onCerrar }) {
  const [form, setForm] = useState(empty)

  useEffect(() => {
    setForm(producto ? { sku: producto.sku || '', nombre: producto.nombre || '', descripcion: producto.descripcion || '', cantidad: producto.cantidad ?? '', precio: producto.precio ?? '', categoria: producto.categoria || 'OTROS', fotoUrl: producto.fotoUrl || '' } : empty)
  }, [producto])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({ ...form, cantidad: parseInt(form.cantidad) || 0, precio: parseInt(form.precio) || 0 })
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <div>
            <div className="modal-title">{producto ? 'Editar producto' : 'Registrar producto'}</div>
            <div className="modal-subtitle">{producto ? `SKU: ${producto.sku}` : 'Completa los datos del nuevo producto'}</div>
          </div>
          <button className="modal-close" onClick={onCerrar}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid form-grid-2">
              <div>
                <label className="form-label">SKU *</label>
                <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)}
                  disabled={!!producto} placeholder="Ej: PROD-001" required />
                {producto && <div className="form-hint">El SKU no puede modificarse</div>}
              </div>
              <div>
                <label className="form-label">Nombre del producto *</label>
                <input className="form-input" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  placeholder="Ej: Laptop Pro 15" required />
              </div>
              <div>
                <label className="form-label">Precio (CLP) *</label>
                <input type="number" className="form-input" value={form.precio} onChange={e => set('precio', e.target.value)}
                  placeholder="0" min="0" required />
              </div>
              <div>
                <label className="form-label">Cantidad en stock *</label>
                <input type="number" className="form-input" value={form.cantidad} onChange={e => set('cantidad', e.target.value)}
                  placeholder="0" min="0" required />
              </div>
              <div>
                <label className="form-label">Categoría *</label>
                <select className="form-input" value={form.categoria} onChange={e => set('categoria', e.target.value)} required>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">URL imagen</label>
                <input className="form-input" value={form.fotoUrl} onChange={e => set('fotoUrl', e.target.value)}
                  placeholder="https://..." />
              </div>
              <div className="form-full">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                  placeholder="Descripción breve del producto..." rows="3" style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{producto ? 'Guardar cambios' : 'Registrar producto'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
