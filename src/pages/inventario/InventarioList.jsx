import React, { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import apiClient from '../../api/apiClient'
import InventarioForm from './InventarioForm'

const CATEGORIAS = ['TODAS', 'ELECTRONICO', 'ROPA', 'CALZADO', 'HOGAR', 'DEPORTES', 'ALIMENTOS', 'OTROS']

function InventarioList() {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS')
  const [stockFiltro, setStockFiltro] = useState('TODOS')

  useEffect(() => { cargarProductos() }, [])

  const cargarProductos = async () => {
    try {
      setCargando(true)
      const res = await apiClient.get('/api/inventario')
      setProductos(res.data)
    } catch {
      toast.error('Error al cargar el inventario')
    } finally {
      setCargando(false)
    }
  }

  const productosFiltrados = useMemo(() => {
    return productos.filter(p => {
      const coincideBusqueda =
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku?.toLowerCase().includes(busqueda.toLowerCase())
      const coincideCategoria = categoriaFiltro === 'TODAS' || p.categoria === categoriaFiltro
      const coincideStock =
        stockFiltro === 'TODOS' ||
        (stockFiltro === 'OK' && p.cantidad > 5) ||
        (stockFiltro === 'BAJO' && p.cantidad > 0 && p.cantidad <= 5) ||
        (stockFiltro === 'SIN' && p.cantidad === 0)
      return coincideBusqueda && coincideCategoria && coincideStock
    })
  }, [productos, busqueda, categoriaFiltro, stockFiltro])

  const abrirCrear = () => { setProductoSeleccionado(null); setModalAbierto(true) }
  const abrirEditar = (p) => { setProductoSeleccionado(p); setModalAbierto(true) }
  const cerrarModal = () => { setModalAbierto(false); setProductoSeleccionado(null) }

  const guardar = async (datos) => {
    try {
      if (productoSeleccionado) {
        await apiClient.put(`/api/inventario/${productoSeleccionado.id}`, datos)
        toast.success('Producto actualizado')
      } else {
        await apiClient.post('/api/inventario', datos)
        toast.success('Producto creado')
      }
      cerrarModal()
      cargarProductos()
    } catch (error) {
      toast.error(error.response?.data || 'Error al guardar')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Confirmas eliminar este producto?')) return
    try {
      await apiClient.delete(`/api/inventario/${id}`)
      toast.success('Producto eliminado')
      cargarProductos()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const getBadgeStock = (cantidad) => {
    if (cantidad === 0) return <span className="badge bg-danger">Sin stock</span>
    if (cantidad <= 5) return <span className="badge bg-warning text-dark">Stock bajo</span>
    return <span className="badge bg-success">En stock</span>
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriaFiltro('TODAS')
    setStockFiltro('TODOS')
  }

  const hayFiltros = busqueda || categoriaFiltro !== 'TODAS' || stockFiltro !== 'TODOS'

  return (
    <div className="container-fluid py-4 px-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0 fw-bold" style={{ color: '#1a2a4a' }}>Gestión de Inventario</h4>
          <small className="text-muted">
            {productosFiltrados.length} de {productos.length} producto(s)
          </small>
        </div>
        <button
          className="btn fw-semibold"
          style={{ backgroundColor: '#1a2a4a', color: 'white' }}
          onClick={abrirCrear}
        >
          + Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">Buscar</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre o SKU..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: '14px' }}>
                  🔍
                </span>
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">Categoría</label>
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={e => setCategoriaFiltro(e.target.value)}
              >
                {CATEGORIAS.map(c => (
                  <option key={c} value={c}>{c === 'TODAS' ? 'Todas las categorías' : c}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold text-muted mb-1">Estado de stock</label>
              <select
                className="form-select"
                value={stockFiltro}
                onChange={e => setStockFiltro(e.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="OK">En stock</option>
                <option value="BAJO">Stock bajo</option>
                <option value="SIN">Sin stock</option>
              </select>
            </div>

            <div className="col-md-2">
              {hayFiltros && (
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="row g-2 mb-4">
        {[
          { label: 'Total productos', valor: productos.length, color: '#1a2a4a' },
          { label: 'En stock', valor: productos.filter(p => p.cantidad > 5).length, color: '#198754' },
          { label: 'Stock bajo', valor: productos.filter(p => p.cantidad > 0 && p.cantidad <= 5).length, color: '#ffc107' },
          { label: 'Sin stock', valor: productos.filter(p => p.cantidad === 0).length, color: '#dc3545' }
        ].map((s, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
              <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                <span className="small text-muted">{s.label}</span>
                <span className="fw-bold fs-5" style={{ color: s.color }}>{s.valor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#1a2a4a' }} />
          <p className="mt-2 text-muted">Cargando inventario...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 text-muted">
            {hayFiltros ? 'No se encontraron productos con esos filtros.' : 'No hay productos registrados.'}
          </p>
          {hayFiltros ? (
            <button className="btn btn-outline-secondary" onClick={limpiarFiltros}>Limpiar filtros</button>
          ) : (
            <button className="btn" style={{ backgroundColor: '#1a2a4a', color: 'white' }} onClick={abrirCrear}>
              Agregar el primero
            </button>
          )}
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: '#1a2a4a', color: 'white' }}>
                <tr>
                  <th style={{ width: '100px' }}>SKU</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th style={{ width: '80px' }}>Cantidad</th>
                  <th style={{ width: '120px' }}>Stock</th>
                  <th className="text-center" style={{ width: '140px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td>
                      <code style={{ fontSize: '12px', color: '#c8a96e' }}>{p.sku}</code>
                    </td>
                    <td>
                      <span className="fw-semibold">{p.nombre}</span>
                      {p.descripcion && (
                        <p className="text-muted small mb-0" style={{ fontSize: '12px' }}>
                          {p.descripcion.length > 40 ? p.descripcion.slice(0, 40) + '...' : p.descripcion}
                        </p>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#c8a96e', color: '#1a2a4a' }}>
                        {p.categoria}
                      </span>
                    </td>
                    <td className="fw-semibold">${p.precio?.toLocaleString('es-CL')}</td>
                    <td className="text-center">{p.cantidad}</td>
                    <td>{getBadgeStock(p.cantidad)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => abrirEditar(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminar(p.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAbierto && (
        <InventarioForm
          producto={productoSeleccionado}
          onGuardar={guardar}
          onCerrar={cerrarModal}
        />
      )}
    </div>
  )
}

export default InventarioList
