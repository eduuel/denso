import React, { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import InvoiceModal from '../components/InvoiceModal';
import { Search, FileText, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useTranslation } from 'react-i18next';

const SalesHistory = ({ sales = [] }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Helper to safely parse dates
  const getDate = (s) => new Date(s.createdAt || s.date);

  // ============================
  // 🔍 FILTER & SEARCH LOGIC
  // ============================
  const filteredSales = useMemo(() => {
    const now = new Date();
    
    // Sort by newest first
    let result = [...sales].sort((a, b) => getDate(b) - getDate(a));

    result = result.filter(sale => {
      // 1. Search filter (by product name)
      const matchesSearch = (sale.productName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Date filter
      let matchesDate = true;
      const saleDate = getDate(sale);
      
      if (dateFilter === 'today') {
        matchesDate = saleDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const diff = (now - saleDate) / (1000 * 60 * 60 * 24);
        matchesDate = diff <= 7;
      } else if (dateFilter === 'month') {
        matchesDate = saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesDate;
    });

    return result;
  }, [sales, searchTerm, dateFilter]);

  // ============================
  // 📊 CALCULATIONS FOR SUMMARY
  // ============================
  const totals = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      acc.revenue += Number(sale.totalAmount || (sale.quantitySold * sale.sellingPrice) || 0);
      acc.profit += Number(sale.profit || 0);
      return acc;
    }, { revenue: 0, profit: 0 });
  }, [filteredSales]);

  // ============================
  // 📋 TABLE COLUMNS
  // ============================
  const columns = [
    { 
      field: 'date', 
      header: t("sales.date"),
      render: (row) => getDate(row).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    { field: 'productName', header: t("sales.product") },
    { field: 'quantitySold', header: t("sales.qty") },
    { 
      field: 'sellingPrice', 
      header: t("products.price"),
      render: (row) => `${Number(row.sellingPrice).toLocaleString()} Birr`
    },
    { 
      field: 'totalAmount', 
      header: t("sales.amount"),
      render: (row) => {
        const total = Number(row.totalAmount || (row.quantitySold * row.sellingPrice) || 0);
        return <span style={{ fontWeight: '500' }}>{total.toLocaleString()} Birr</span>;
      }
    },
    { 
      field: 'profit', 
      header: t("sales.profit"),
      render: (row) => <span style={{ color: 'var(--success-color)', fontWeight: '500' }}>+{Number(row.profit || 0).toLocaleString()} Birr</span>
    },
    {
      field: 'actions',
      header: 'Receipt',
      render: (row) => (
        <button 
          className="btn btn-outline" 
          style={{ padding: '0.25rem 0.5rem' }} 
          onClick={() => setSelectedInvoice(row)} 
          title="View Receipt"
        >
          <FileText size={16} />
        </button>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t("sales.title")}</h1>
      </div>

      {/* 🚀 STAT CARDS (Reflects Filtered Data) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Filtered Transactions" 
          value={filteredSales.length} 
          icon={<Activity size={24} />} 
          color="var(--info-color)"
        />
        <StatCard 
          title="Filtered Revenue" 
          value={`${totals.revenue.toLocaleString()} Birr`} 
          icon={<DollarSign size={24} />} 
          color="var(--primary-color)"
        />
        <StatCard 
          title="Filtered Profit" 
          value={`${totals.profit.toLocaleString()} Birr`} 
          icon={<DollarSign size={24} />} 
          color="var(--success-color)"
        />
      </div>

      {/* 🔍 FILTER & SEARCH BAR */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder={t("products.search")} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </div>
        <select 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
        >
          <option value="all">{t("sales.dateRange")}</option>
          <option value="today">{t("sales.today")}</option>
          <option value="week">{t("sales.last7Days")}</option>
          <option value="month">{t("sales.last30Days")}</option>
        </select>
      </div>

      {/* 📋 DATA TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable 
          columns={columns} 
          data={filteredSales} 
          keyField="_id"
          emptyMessage={sales.length === 0 ? t("sales.noSales") : t("sales.noSales")}
        />
      </div>

      {/* 🧾 INVOICE MODAL */}
      <InvoiceModal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        invoiceData={selectedInvoice} 
      />
    </div>
  );
};

export default SalesHistory;
