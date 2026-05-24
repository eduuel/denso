import React, { useMemo } from 'react';
import StatCard from '../components/StatCard';
import ChartComponent from '../components/ChartComponent';
import { Package, DollarSign, AlertTriangle } from 'lucide-react';

const Dashboard = ({ products = [], sales = [], profit = 0 }) => {
  // Safe Date parsing
  const getDate = (s) => new Date(s.createdAt || s.date);
  
  // ============================
  // 📊 CALCULATIONS
  // ============================
  const stats = useMemo(() => {
    const now = new Date();
    
    // Daily
    const dailySales = sales.filter(s => {
      const d = getDate(s);
      return d.toDateString() === now.toDateString();
    });
    const dailyProfit = dailySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
    
    // Weekly
    const weeklySales = sales.filter(s => {
      const d = getDate(s);
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    });
    const weeklyProfit = weeklySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
    
    // Monthly
    const monthlySales = sales.filter(s => {
      const d = getDate(s);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthlyProfit = monthlySales.reduce((sum, s) => sum + Number(s.profit || 0), 0);
    
    // Low Stock
    const lowStockCount = products.filter(p => p.quantity <= 5).length;
    
    return {
      dailyProfit,
      weeklyProfit,
      monthlyProfit,
      totalSalesCount: sales.length,
      totalProductsCount: products.length,
      lowStockCount
    };
  }, [sales, products]);

  // ============================
  // 📈 CHART DATA
  // ============================
  const chartData = useMemo(() => {
    const grouped = {};
    const sortedSales = [...sales].sort((a, b) => getDate(a) - getDate(b));
    
    // Get last 7 days of sales for the chart
    sortedSales.forEach(s => {
      const dateStr = getDate(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!grouped[dateStr]) grouped[dateStr] = { profit: 0, revenue: 0 };
      grouped[dateStr].profit += Number(s.profit || 0);
      grouped[dateStr].revenue += Number(s.totalAmount || (s.quantitySold * s.sellingPrice) || 0);
    });

    const labels = Object.keys(grouped).slice(-7); // last 7 active days
    const profitData = labels.map(l => grouped[l].profit);
    const revenueData = labels.map(l => grouped[l].revenue);

    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Profit',
          data: profitData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [sales]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      {/* 🚀 STAT CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Profit (All Time)" 
          value={`${profit.toLocaleString()} Birr`} 
          icon={<DollarSign size={24} />} 
          color="var(--success-color)"
        />
        <StatCard 
          title="Today's Profit" 
          value={`${stats.dailyProfit.toLocaleString()} Birr`} 
          icon={<DollarSign size={24} />} 
          color="var(--primary-color)"
          trend={12} // Mock trend for UI
        />
        <StatCard 
          title="Total Products" 
          value={stats.totalProductsCount} 
          icon={<Package size={24} />} 
          color="var(--info-color)"
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStockCount} 
          icon={<AlertTriangle size={24} />} 
          color={stats.lowStockCount > 0 ? "var(--danger-color)" : "var(--success-color)"}
          trendLabel={stats.lowStockCount > 0 ? 'Requires attention' : 'All stock healthy'}
        />
      </div>

      {/* 📈 CHARTS & ANALYTICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', height: '400px' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Revenue vs Profit (Last 7 Days)</h2>
          {sales.length > 0 ? (
            <ChartComponent type="line" data={chartData} />
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Not enough data to display chart
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Quick Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Weekly Profit</span>
              <span style={{ fontWeight: '600' }}>{stats.weeklyProfit.toLocaleString()} Birr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Monthly Profit</span>
              <span style={{ fontWeight: '600' }}>{stats.monthlyProfit.toLocaleString()} Birr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Sales Transactions</span>
              <span style={{ fontWeight: '600' }}>{stats.totalSalesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
