import React, { useContext } from 'react';
import { X, Printer, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { ThemeContext } from '../context/ThemeContext';

const InvoiceModal = ({ isOpen, onClose, invoiceData }) => {
  const { theme } = useContext(ThemeContext);

  if (!isOpen || !invoiceData) return null;

  const handleDownload = () => {
    const element = document.getElementById('invoice-content');
    const opt = {
      margin: 0.5,
      filename: `invoice-${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Temporarily force light mode for PDF generation if we are in dark mode
    // because printers and PDFs usually expect a white background
    const originalBackground = element.style.backgroundColor;
    const originalColor = element.style.color;
    
    if (theme === 'dark') {
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#000000';
      // We might need to adjust child elements too, but html2canvas usually captures the computed styles.
    }

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore styles
      if (theme === 'dark') {
        element.style.backgroundColor = originalBackground;
        element.style.color = originalColor;
      }
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore React state cleanly after DOM manipulation
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '2rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}>
        
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Receipt / Invoice</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* INVOICE CONTENT */}
        <div style={{ padding: '2rem', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }} id="invoice-content">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>DENSO TRACKER</h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>Official Sales Receipt</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Billed To:</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{invoiceData.customerName || 'Walk-in Customer'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Date:</p>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                {new Date(invoiceData.date || invoiceData.createdAt).toLocaleString()}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ref: {invoiceData.id || invoiceData._id || 'N/A'}
              </p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Price</th>
                <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem 0', color: 'var(--text-primary)' }}>{invoiceData.productName}</td>
                <td style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--text-primary)' }}>{invoiceData.quantitySold}</td>
                <td style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--text-primary)' }}>{Number(invoiceData.sellingPrice).toLocaleString()} Birr</td>
                <td style={{ textAlign: 'right', padding: '1rem 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {(Number(invoiceData.quantitySold) * Number(invoiceData.sellingPrice)).toLocaleString()} Birr
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                <span>Total:</span>
                <span>{(Number(invoiceData.quantitySold) * Number(invoiceData.sellingPrice)).toLocaleString()} Birr</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <p>Thank you for your business!</p>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handlePrint} className="btn btn-outline">
            <Printer size={18} /> Print
          </button>
          <button onClick={handleDownload} className="btn btn-primary">
            <Download size={18} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
