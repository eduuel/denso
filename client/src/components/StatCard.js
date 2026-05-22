import React from 'react';

const StatCard = ({ title, value, icon, trend, trendLabel, color = 'var(--primary-color)' }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', margin: 0, marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {value}
          </p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
      </div>
      
      {(trend || trendLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          {trend && (
            <span style={{ color: trend > 0 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: '600' }}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span style={{ color: 'var(--text-muted)' }}>{trendLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default StatCard;
