import React, { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import ProductModal from '../components/ProductModal';
import { Search, Plus, Edit2, Trash2, ShoppingBag } from 'lucide-react';

const Products = ({ products = [], role, onAdd, onEdit, onDelete, onSell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'low-stock', 'in-stock'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingProduct, setEditingProduct] = useState(null);

  // ============================
  // 🔍 FILTER & SEARCH LOGIC
  // ============================
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Type filter
      let matchesType = true;
      if (filterType === 'low-stock') {
        matchesType = product.quantity <= 5;
      } else if (filterType === 'in-stock') {
        matchesType = product.quantity > 5;
      }

      return matchesSearch && matchesType;
    });
  }, [products, searchTerm, filterType]);

  // ============================
  // 📝 MODAL HANDLERS
  // ============================
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data) => {
    if (modalMode === 'add') {
      onAdd(data);
    } else if (modalMode === 'edit' && editingProduct) {
      onEdit(editingProduct._id, data);
    }
    setIsModalOpen(false);
  };

  // ============================
  // 🛒 SELL HANDLER
  // ============================
  const handleSellClick = (id) => {
    const customerName = prompt("Customer Name:");
    if (!customerName) return;
    const quantitySold = prompt("Quantity:");
    if (!quantitySold) return;
    const sellingPrice = prompt("Price per item:");
    if (!sellingPrice) return;

    onSell(id, {
      customerName,
      quantitySold: Number(quantitySold),
      sellingPrice: Number(sellingPrice)
    });
  };

  // ============================
  // 📊 TABLE COLUMNS
  // ============================
  const columns = [
    { field: 'name', header: 'Product Name' },
    { 
      field: 'price', 
      header: 'Price',
      render: (row) => `${row.price.toLocaleString()} Birr`
    },
    { 
      field: 'quantity', 
      header: 'Stock',
      render: (row) => (
        <span style={{ color: row.quantity <= 5 ? 'var(--danger-color)' : 'inherit', fontWeight: row.quantity <= 5 ? 'bold' : 'normal' }}>
          {row.quantity} {row.quantity <= 5 && '⚠'}
        </span>
      )
    },
    {
      field: 'actions',
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {role === 'admin' ? (
            <>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSellClick(row._id)} title="Sell">
                <ShoppingBag size={16} />
              </button>
              <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleOpenEdit(row)} title="Edit">
                <Edit2 size={16} />
              </button>
              <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => {
                if (window.confirm('Are you sure you want to delete this product?')) {
                  onDelete(row._id);
                }
              }} title="Delete">
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🔒 View Only</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h1 className="page-title">Inventory Management</h1>
        {role === 'admin' && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={20} /> Add Product
          </button>
        )}
      </div>

      {/* 🔍 FILTER & SEARCH BAR */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <option value="all">All Products</option>
          <option value="in-stock">In Stock (&gt;5)</option>
          <option value="low-stock">Low Stock (≤5)</option>
        </select>
      </div>

      {/* 📋 DATA TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable 
          columns={columns} 
          data={filteredProducts} 
          keyField="_id"
          emptyMessage={products.length === 0 ? "No products found. Add one to get started." : "No products match your search/filter criteria."}
        />
      </div>

      {/* ✏️ MODAL */}
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialData={editingProduct}
        mode={modalMode}
      />
    </div>
  );
};

export default Products;
