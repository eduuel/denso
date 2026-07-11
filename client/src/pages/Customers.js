import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../config";
import { Users as UsersIcon, Plus, Search, Filter, Download, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { exportCustomersPDF, exportToExcel } from "../utils/reportGenerator";

const Customers = ({ token, role }) => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "", company: "", notes: "", status: "Active" });
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
    // eslint-disable-next-line
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/api/customers/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API}/api/customers`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || "Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`${API}/api/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    }
  };

  const openModal = (customer = null) => {
    if (customer) {
      setEditingId(customer._id);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({ name: "", phone: "", email: "", address: "", company: "", notes: "", status: "Active" });
    }
    setShowModal(true);
  };

  // Derived state
  const totalCustomers = customers.length;
  const creditCustomers = customers.filter(c => c.balance > 0).length;
  const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

  const filteredCustomers = customers.filter(c => {
    // Unicode-safe search: works with Amharic (Ethiopic), English, or mixed names
    const q = search.toLowerCase();
    const matchSearch = !q
      || (c.name || "").toLowerCase().includes(q)
      || (c.phone || "").includes(search)
      || (c.company || "").toLowerCase().includes(q)
      || (c.notes || "").toLowerCase().includes(q);
    let matchFilter = true;
    if (filter === "Credit") matchFilter = c.balance > 0;
    if (filter === "Fully Paid") matchFilter = c.balance === 0;
    if (filter === "Active") matchFilter = c.status === "Active";
    if (filter === "Inactive") matchFilter = c.status === "Inactive";
    return matchSearch && matchFilter;
  });

  const handleExportPDF = () => {
    exportCustomersPDF({
      customers: filteredCustomers,
      totalCustomers,
      creditCustomers,
      totalOutstanding,
      filename: "customers_report"
    });
  };

  const handleExportExcel = () => {
    const data = filteredCustomers.map(c => ({
      Name: c.name,
      Phone: c.phone,
      Company: c.company || "N/A",
      Balance: c.balance,
      Status: c.status,
      Notes: c.notes || ""
    }));
    exportToExcel(data, "customers_report");
  };

  if (loading) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>{t("customers.loading")}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <UsersIcon size={28} /> {t("customers.title")}
        </h1>
        <button onClick={() => openModal()} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> {t("customers.addCustomer")}
        </button>
      </div>

      {/* Dashboard Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>{t("customers.totalCustomers")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>{totalCustomers}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>{t("customers.customersWithDebt")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger-color)" }}>{creditCustomers}</div>
        </div>
        <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 600 }}>{t("customers.totalOutstanding")}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger-color)" }}>{totalOutstanding.toFixed(2)} Birr</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "1rem", flex: 1, minWidth: "300px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="input-field"
              placeholder={t("customers.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
          <div style={{ position: "relative", minWidth: "150px" }}>
            <Filter size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <select className="input-field" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ paddingLeft: "2.5rem" }}>
              <option value="All">{t("customers.allCustomers")}</option>
              <option value="Credit">{t("customers.creditCustomers")}</option>
              <option value="Fully Paid">{t("customers.fullyPaid")}</option>
              <option value="Active">{t("customers.active")}</option>
              <option value="Inactive">{t("customers.inactive")}</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handleExportPDF} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> {t("customers.pdf")}
          </button>
          <button onClick={handleExportExcel} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> {t("customers.excel")}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr>
              <th style={styles.th}>{t("customers.name")}</th>
              <th style={styles.th}>{t("customers.contact")}</th>
              <th style={styles.th}>{t("customers.company")}</th>
              <th style={styles.th}>{t("customers.balance")}</th>
              <th style={styles.th}>{t("customers.status")}</th>
              <th style={{ ...styles.th, textAlign: "right" }}>{t("customers.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
              <tr key={c._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                </td>
                <td style={styles.td}>
                  <div style={{ color: "var(--text-secondary)" }}>{c.phone}</div>
                  {c.email && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.email}</div>}
                </td>
                <td style={styles.td}>{c.company || "-"}</td>
                <td style={styles.td}>
                  <span style={{ color: c.balance > 0 ? "var(--danger-color)" : "var(--success-color)", fontWeight: 600 }}>
                    {c.balance.toFixed(2)}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    padding: "0.25rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600,
                    backgroundColor: c.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                    color: c.status === "Active" ? "var(--success-color)" : "var(--text-muted)"
                  }}>
                    {c.status === "Active" ? t("customers.active") : t("customers.inactive")}
                  </span>
                </td>
                <td style={{ ...styles.td, textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button onClick={() => navigate(`/customers/${c._id}`)} className="btn btn-outline" style={{ padding: "0.4rem" }} title={t("customers.viewDetails")}>
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openModal(c)} className="btn btn-outline" style={{ padding: "0.4rem" }} title={t("customers.edit")}>
                      <Edit size={14} />
                    </button>
                    {role === "admin" && (
                      <button onClick={() => handleDelete(c._id)} className="btn btn-danger" style={{ padding: "0.4rem" }} title={t("customers.delete")}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>{t("customers.noCustomers")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "var(--text-primary)" }}>
              {editingId ? t("customers.editCustomer") : t("customers.addCustomer")}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>{t("customers.name")} *</label>
                  <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>{t("customers.phone")} *</label>
                  <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>{t("customers.email")}</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>{t("customers.company")}</label>
                  <input type="text" className="input-field" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={styles.label}>{t("customers.address")}</label>
                <input type="text" className="input-field" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label style={styles.label}>{t("customers.notes")}</label>
                <textarea className="input-field" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>
              <div>
                <label style={styles.label}>{t("customers.status")}</label>
                <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">{t("customers.active")}</option>
                  <option value="Inactive">{t("customers.inactive")}</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">{t("customers.cancel")}</button>
                <button type="submit" className="btn btn-primary">{t("customers.save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  th: {
    padding: "1rem 1.25rem",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--text-muted)",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-tertiary)",
  },
  td: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    transition: "background-color 0.15s ease",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: "0.5rem"
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem"
  },
  modalContent: {
    backgroundColor: "var(--bg-secondary)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    width: "100%",
    maxWidth: "600px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }
};

export default Customers;
