import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../config";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Phone, Mail, Building, MapPin, CreditCard, Download, FileText } from "lucide-react";
import { exportLedgerPDF } from "../utils/reportGenerator";

const CustomerDetails = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDesc, setPaymentDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [custRes, ledgerRes] = await Promise.all([
        axios.get(`${API}/api/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/api/customers/${id}/ledger`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCustomer(custRes.data);
      setLedger(ledgerRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchData();
    // eslint-disable-next-line
  }, [token, id]);

  // Reset description default when modal opens (after t() is available)
  useEffect(() => {
    if (showPaymentModal) {
      setPaymentDesc(t("customers.paymentReceived"));
    }
    // eslint-disable-next-line
  }, [showPaymentModal]);

  const handleReceivePayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      return alert("Please enter a valid positive amount.");
    }

    try {
      await axios.post(`${API}/api/customers/${id}/payment`, {
        amount: Number(paymentAmount),
        description: paymentDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPaymentModal(false);
      setPaymentAmount("");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Payment failed");
    }
  };

  const handleExportLedger = () => {
    if (!customer || !ledger) return;
    exportLedgerPDF({
      customer,
      ledger,
      filename: `ledger_${customer.name.replace(/\s+/g, '_')}`
    });
  };

  if (loading || !customer) return <div style={{ padding: "2rem", color: "var(--text-secondary)" }}>{t("customers.loadingProfile")}</div>;

  const totalPurchases = ledger.reduce((sum, l) => sum + l.debit, 0);
  const totalPayments = ledger.reduce((sum, l) => sum + l.credit, 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/customers")} className="btn btn-outline" style={{ padding: "0.5rem" }}>
            <ArrowLeft size={18} />
          </button>
          <h1 className="page-title" style={{ margin: 0 }}>{t("customers.profile")}</h1>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={handleExportLedger} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> {t("customers.exportLedger")}
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={16} /> {t("customers.receivePayment")}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Left Column: Profile Info & Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--primary-color)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700 }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-primary)" }}>{customer.name}</h2>
                <span style={{
                  display: "inline-block", marginTop: "0.25rem", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600,
                  backgroundColor: customer.status === "Active" ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
                  color: customer.status === "Active" ? "var(--success-color)" : "var(--text-muted)"
                }}>
                  {customer.status === "Active" ? t("customers.active") : t("customers.inactive")}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Phone size={16} /> {customer.phone}</div>
              {customer.email && <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Mail size={16} /> {customer.email}</div>}
              {customer.company && <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><Building size={16} /> {customer.company}</div>}
              {customer.address && <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}><MapPin size={16} /> {customer.address}</div>}
              {customer.notes && (
                <div style={{ marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", fontStyle: "italic" }}>
                  "{customer.notes}"
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", color: "var(--text-primary)", fontSize: "1.1rem" }}>{t("customers.financialSummary")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>{t("customers.totalPurchases")}</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{totalPurchases.toFixed(2)} Birr</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
                <span>{t("customers.totalPayments")}</span>
                <span style={{ fontWeight: 600, color: "var(--success-color)" }}>{totalPayments.toFixed(2)} Birr</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "var(--border-color)" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700 }}>
                <span style={{ color: "var(--text-primary)" }}>{t("customers.currentBalance")}</span>
                <span style={{ color: customer.balance > 0 ? "var(--danger-color)" : "var(--success-color)" }}>
                  {customer.balance.toFixed(2)} Birr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ledger Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileText size={20} color="var(--primary-color)" />
            <h3 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.1rem" }}>{t("customers.transactionLedger")}</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("customers.date")}</th>
                  <th style={styles.th}>{t("customers.type")}</th>
                  <th style={styles.th}>{t("customers.notes")}</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>{t("customers.debit")}</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>{t("customers.credit")}</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>{t("customers.balance")}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry._id} style={styles.tr}>
                    <td style={styles.td}>
                      {new Date(entry.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 600,
                        backgroundColor: entry.type === "SALE" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                        color: entry.type === "SALE" ? "var(--danger-color)" : "var(--success-color)"
                      }}>
                        {entry.type}
                      </span>
                    </td>
                    <td style={styles.td}>{entry.description}</td>
                    <td style={{ ...styles.td, textAlign: "right", color: "var(--danger-color)" }}>
                      {entry.debit > 0 ? entry.debit.toFixed(2) : "-"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", color: "var(--success-color)" }}>
                      {entry.credit > 0 ? entry.credit.toFixed(2) : "-"}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                      {entry.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>{t("customers.noTransactions")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Receive Payment Modal */}
      {showPaymentModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ margin: "0 0 1.5rem 0", color: "var(--text-primary)" }}>{t("customers.receivePayment")}</h2>
            <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{t("customers.outstandingBalance")}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--danger-color)" }}>{customer.balance.toFixed(2)} Birr</div>
            </div>

            <form onSubmit={handleReceivePayment} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={styles.label}>{t("customers.paymentAmount")} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>{t("customers.description")}</label>
                <input
                  type="text"
                  className="input-field"
                  value={paymentDesc}
                  onChange={e => setPaymentDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-outline">{t("customers.cancel")}</button>
                <button type="submit" className="btn btn-primary">{t("customers.confirmPayment")}</button>
              </div>
              {customer.balance <= 0 && (
                <div style={{ color: "var(--success-color)", fontSize: "0.85rem", textAlign: "right" }}>
                  {t("customers.noBalance")}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const styles = {
  th: {
    padding: "0.875rem 1.25rem",
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
    maxWidth: "500px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  }
};

export default CustomerDetails;
