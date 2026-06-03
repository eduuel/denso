import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Users
} from "lucide-react";

const Sidebar = ({ role, onLogout }) => {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">DENSO TRACKER</div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard className="nav-icon" />
          <span>{t("sidebar.dashboard")}</span>
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Package className="nav-icon" />
          <span>{t("sidebar.products")}</span>
        </NavLink>

        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <ShoppingCart className="nav-icon" />
          <span>{t("sidebar.salesHistory")}</span>
        </NavLink>

        {/* ADMIN ONLY */}
        {role === "admin" && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Users className="nav-icon" />
            <span>{t("sidebar.users")}</span>
          </NavLink>
        )}
      </nav>

      <div
        className="sidebar-footer"
        style={{ marginTop: "auto", padding: "1.5rem 0" }}
      >
        <button
          onClick={onLogout}
          className="nav-item"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <LogOut className="nav-icon" />
          <span>{t("sidebar.logout")}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;