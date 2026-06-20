import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../config";
import { Shield, ShieldOff, Trash2, RefreshCw, AlertCircle, Users as UsersIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

const Users = ({ token, role: currentUserRole }) => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Get current user ID from JWT
  const getCurrentUserId = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  // ============================
  // 📦 FETCH ALL USERS
  // ============================
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  // ============================
  // 🔄 TOGGLE ROLE
  // ============================
  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const action = currentRole === "admin" ? "demote" : "promote";

    if (!window.confirm(`Are you sure you want to ${action} this user to "${newRole}"?`)) return;

    setActionLoading(userId);
    try {
      await axios.put(
        `${API}/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSuccess(`User ${action}d to ${newRole} successfully`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Role update failed");
    } finally {
      setActionLoading("");
    }
  };

  // ============================
  // 🗑 DELETE USER
  // ============================
  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`⚠️ Permanently delete user "${email}"?\nThis action cannot be undone.`)) return;

    setActionLoading(userId);
    try {
      await axios.delete(`${API}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSuccess(`User "${email}" deleted successfully`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed");
    } finally {
      setActionLoading("");
    }
  };

  // ============================
  // ✅ SUCCESS MESSAGE
  // ============================
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ============================
  // 🚫 ACCESS DENIED (non-admin)
  // ============================
  if (currentUserRole !== "admin") {
    return (
      <div style={styles.accessDenied}>
        <AlertCircle size={48} style={{ color: "var(--danger-color)", marginBottom: "1rem" }} />
        <h2 style={{ margin: 0, marginBottom: "0.5rem" }}>{t("users.accessDenied")}</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>{t("users.adminRequired")}</p>
      </div>
    );
  }

  // ============================
  // ⏳ LOADING
  // ============================
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={32} style={{ animation: "spin 1s linear infinite", color: "var(--primary-color)" }} />
        <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>Loading users...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ============================
  // ❌ ERROR
  // ============================
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={32} style={{ color: "var(--danger-color)" }} />
        <p style={{ color: "var(--danger-color)", marginTop: "0.5rem" }}>{error}</p>
        <button onClick={fetchUsers} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  // ============================
  // 📊 MAIN RENDER
  // ============================
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <UsersIcon size={28} />
          {t("users.title")}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={styles.userCount}>{users.length} {t("users.user")}{users.length !== 1 ? "s" : ""}</span>
          <button onClick={fetchUsers} className="btn btn-outline" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RefreshCw size={16} /> {t("users.refresh")}
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={styles.successAlert}>
          ✅ {successMsg}
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t("users.user")}</th>
              <th style={styles.th}>{t("users.role")}</th>
              <th style={styles.th}>{t("users.joined")}</th>
              <th style={{ ...styles.th, textAlign: "right" }}>{t("users.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user._id === currentUserId;
              const isBeingActioned = actionLoading === user._id;

              return (
                <tr key={user._id} style={styles.tr}>
                  {/* Email + Avatar */}
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        ...styles.tableAvatar,
                        backgroundColor: (user.role || "") === "admin" ? "var(--primary-color)" : "var(--text-muted)"
                      }}>
                        {(user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                          {user.email}
                          {isCurrentUser && <span style={styles.youBadge}>You</span>}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          ID: {user._id.slice(-6)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      backgroundColor: (user.role || "") === "admin" ? "rgba(99, 102, 241, 0.15)" : "rgba(107, 114, 128, 0.15)",
                      color: (user.role || "") === "admin" ? "var(--primary-color)" : "var(--text-secondary)"
                    }}>
                      {(user.role || "") === "admin" ? <Shield size={14} /> : <ShieldOff size={14} />}
                      {(user.role || "user").charAt(0).toUpperCase() + (user.role || "user").slice(1)}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td style={styles.td}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      {/* Promote/Demote Button */}
                      <button
                        onClick={() => handleToggleRole(user._id, user.role)}
                        disabled={isBeingActioned}
                        className="btn btn-outline"
                        style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                        title={user.role === "admin" ? t("users.demote") : t("users.promote")}
                      >
                        {user.role === "admin" ? <ShieldOff size={14} /> : <Shield size={14} />}
                        {user.role === "admin" ? t("users.demote") : t("users.promote")}
                      </button>

                      {/* Delete Button — hidden for current user */}
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDeleteUser(user._id, user.email)}
                          disabled={isBeingActioned}
                          className="btn btn-danger"
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                          title={t("users.delete")}
                        >
                          <Trash2 size={14} />
                          {t("users.delete")}
                        </button>
                      )}

                      {/* Self indicator */}
                      {isCurrentUser && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", alignSelf: "center" }}>
                          ({t("users.cannotDeleteSelf")})
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            {t("users.noUsers")}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================
// 🎨 INLINE STYLES
// ============================
const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.9rem",
  },
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
    padding: "0.875rem 1.25rem",
    borderBottom: "1px solid var(--border-color)",
  },
  tr: {
    transition: "background-color 0.15s ease",
  },
  tableAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.875rem",
    flexShrink: 0,
  },
  roleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  youBadge: {
    marginLeft: "0.5rem",
    fontSize: "0.65rem",
    fontWeight: 600,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    color: "var(--success-color)",
    padding: "0.1rem 0.4rem",
    borderRadius: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  userCount: {
    fontSize: "0.875rem",
    color: "var(--text-secondary)",
    backgroundColor: "var(--bg-tertiary)",
    padding: "0.375rem 0.75rem",
    borderRadius: "9999px",
  },
  successAlert: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    color: "var(--success-color)",
    padding: "0.75rem 1.25rem",
    borderRadius: "var(--radius-md)",
    marginBottom: "1.5rem",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
  },
  accessDenied: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    textAlign: "center",
  },
};

export default Users;