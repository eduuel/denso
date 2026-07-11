import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../config';

const SellModal = ({ isOpen, onClose, onSave, product }) => {
  const [customers, setCustomers] = useState([]);
  
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState(''); // For guest sales
  const [quantitySold, setQuantitySold] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Paid');
  const [amountPaid, setAmountPaid] = useState('');
  
  const [error, setError] = useState('');

  // Fetch customers for dropdown
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      axios.get(`${API}/api/customers`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCustomers(res.data))
        .catch(err => console.log(err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product) {
      setCustomerId('');
      setCustomerName('');
      setQuantitySold('');
      setSellingPrice(product.price || '');
      setPaymentMethod('Paid');
      setAmountPaid('');
      setError('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const totalAmount = Number(quantitySold) * Number(sellingPrice) || 0;
  let remainingBalance = 0;
  
  if (paymentMethod === 'Partial Payment') {
    remainingBalance = totalAmount - Number(amountPaid);
  } else if (paymentMethod === 'Credit') {
    remainingBalance = totalAmount;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantitySold);
    if (!qty || isNaN(qty) || qty <= 0) return setError('Quantity must be a valid positive number');

    const price = Number(sellingPrice);
    if (!price || isNaN(price) || price < 0) return setError('Price must be a valid number');

    if (qty > product.quantity) return setError(`Cannot sell more than available stock (${product.quantity})`);
    
    if (paymentMethod !== 'Paid' && !customerId) {
      return setError('A registered customer must be selected for Credit or Partial Payment.');
    }
    
    if (paymentMethod === 'Paid' && !customerId && !customerName.trim()) {
      return setError('Please enter a customer name or select a registered customer.');
    }

    if (paymentMethod === 'Partial Payment' && (Number(amountPaid) <= 0 || Number(amountPaid) >= totalAmount)) {
      return setError('Partial payment amount must be greater than 0 and less than total amount.');
    }

    const payload = {
      quantitySold: qty,
      sellingPrice: price,
      paymentMethod,
      amountPaid: paymentMethod === 'Paid' ? totalAmount : (paymentMethod === 'Credit' ? 0 : Number(amountPaid))
    };

    if (customerId) {
      payload.customerId = customerId;
      const cust = customers.find(c => c._id === customerId);
      payload.customerName = cust ? cust.name : "Unknown";
    } else {
      payload.customerName = customerName;
    }

    onSave(product._id, payload);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '0 1rem', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
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
              type="text" value={product.name} disabled
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Quantity *</label>
              <input 
                type="number" min="1" max={product.quantity} placeholder={`Available: ${product.quantity}`}
                value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (Birr) *</label>
              <input 
                type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--primary-color)' }}>{totalAmount.toFixed(2)} Birr</span>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Customer</label>
            <select 
              value={customerId} 
              onChange={(e) => {
                setCustomerId(e.target.value);
                if (e.target.value) setCustomerName(''); // Clear guest name if real customer chosen
              }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}
            >
              <option value="">-- Guest (Walk-in) --</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
            {!customerId && (
              <input 
                type="text" placeholder="Guest Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                required={!customerId}
              />
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Payment Method</label>
            <select 
              value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="Paid">Fully Paid (Cash/Bank)</option>
              <option value="Partial Payment">Partial Payment</option>
              <option value="Credit">Credit (Unpaid)</option>
            </select>
          </div>

          {paymentMethod === 'Partial Payment' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Amount Paid (Birr) *</label>
              <input 
                type="number" min="0" step="0.01" max={totalAmount - 0.01}
                value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          )}

          {(paymentMethod === 'Credit' || paymentMethod === 'Partial Payment') && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 600 }}>
              Balance to be added to Customer: {remainingBalance.toFixed(2)} Birr
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellModal;
