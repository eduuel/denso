import React, { useContext } from 'react';
import { Sun, Moon, User, Globe } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = ({ role, userEmail }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Can add a mobile sidebar toggle button here later */}
      </div>
      
      <div className="navbar-right">
        <button 
          onClick={toggleLanguage} 
          className="theme-toggle-btn"
          title={i18n.language === 'en' ? 'ቀይር ወደ አማርኛ' : 'Switch to English'}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}
        >
          <Globe size={18} />
          {i18n.language === 'en' ? 'EN' : 'AM'}
        </button>

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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {role === 'admin' ? t("navbar.admin") : t("navbar.viewOnly")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
