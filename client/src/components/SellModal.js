import React, { useState, useEffect } from 'react';

const SellModal = ({ isOpen, onClose, onSave, product }) => {
  const [customerName, setCustomerName] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setCustomerName('');
      setQuantitySold('');
      setSellingPrice(product.price || '');
      setError('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      return setError('Customer Name is required');
    }
    
    const qty = Number(quantitySold);
    if (!quantitySold || isNaN(qty) || qty <= 0) {
      return setError('Quantity must be a valid positive number');
    }

    const price = Number(sellingPrice);
    if (!sellingPrice || isNaN(price) || price < 0) {
      return setError('Price must be a valid number');
    }

    if (qty > product.quantity) {
      return setError(`Cannot sell more than available stock (${product.quantity})`);
    }

    onSave(product._id, {
      customerName,
      quantitySold: qty,
      sellingPrice: price
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '0 1rem', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Sell Product
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product</label>
            <input 
              type="text" 
              value={product.name}
              disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer Name *</label>
            <input 
              type="text" 
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity *</label>
            <input 
              type="number" 
              min="1"
              max={product.quantity}
              placeholder={`Available: ${product.quantity}`}
              value={quantitySold}
              onChange={(e) => setQuantitySold(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price per Item (Birr) *</label>
            <input 
              type="number" 
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Sell</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
