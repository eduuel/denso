import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ role, userEmail, onLogout }) => {
  return (
    <div className="app-container">
      <Sidebar role={role} onLogout={onLogout} />
      <div className="main-wrapper">
        <Navbar role={role} userEmail={userEmail} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
