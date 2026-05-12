import React, { useState, useEffect } from 'react'

const CATEGORIAS = ['ELECTRONICO', 'ROPA', 'CALZADO', 'HOGAR', 'DEPORTES', 'ALIMENTOS', 'OTROS']

const emptyForm = {
  sku: '',
  nombre: '',
  descripcion: '',
  cantidad: '',
  precio: '',
  categoria: '',
  fotoUrl: ''
}

function InventarioForm({ producto, onGuardar, onCerrar }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (producto) {
      setForm({
        sku: producto.sku || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        cantidad: producto.cantidad || '',
        precio: producto.precio || '',
        categoria: producto.categoria || '',
        fotoUrl: producto.fotoUrl || ''
      })
    } else {
      setForm(emptyForm)
    }
  }, [producto])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGuardar({
      ...form,
      cantidad: parseInt(form.cantidad),
      precio: parseInt(form.precio)
    })
  }

  const esEdicion = !!producto

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header" style={{ backgroundColor: '#1a2a4a', color: 'white' }}>
            <h5 className="modal-title">
              {esEdicion ? 'Editar Producto' : 'Nuevo Producto'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCerrar} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">SKU *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    disabled={esEdicion}
                    required
                  />
                  {esEdicion && <small className="text-muted">El SKU no se puede modificar</small>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Cantidad *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Precio *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Categoría *</label>
                  <select
                    className="form-select"
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">URL de imagen</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fotoUrl"
                    value={form.fotoUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCerrar}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn"
                style={{ backgroundColor: '#1a2a4a', color: 'white' }}
              >
                {esEdicion ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InventarioForm
