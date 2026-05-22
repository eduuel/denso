import React from 'react';

const SalesHistory = ({ sales }) => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sales History</h1>
      </div>
      <div className="card">
        <p>Sales History component (Under construction)</p>
        <p>Total Sales Records: {sales.length}</p>
      </div>
    </div>
  );
};

export default SalesHistory;
