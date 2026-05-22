import React, { useContext } from 'react';
import { Sun, Moon, User } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = ({ role, userEmail }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Can add a mobile sidebar toggle button here later */}
      </div>
      
      <div className="navbar-right">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          aria-label="Toggle dark mode"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className="user-profile">
          <div className="avatar">
            {userEmail ? userEmail.charAt(0).toUpperCase() : <User size={20} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{userEmail || 'User'}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role === 'admin' ? 'Administrator' : 'View Only'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
