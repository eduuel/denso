import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { API } from "./config";
import "./App.css";
import Users from "./pages/Users";
// Layout & Pages
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import SalesHistory from "./pages/SalesHistory";
import InvoiceModal from "./components/InvoiceModal";

// NOTE: getDate was previously defined but is no longer used. Keeping it for potential future utilities.
// const getDate = (s) => new Date(s.createdAt || s.date);

function App() {
  // 🔐 AUTH STATE
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("token") || "";
    } catch (e) {
      return "";
    }
  });
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Optionally extract from token

  // 📦 DATA STATE
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState(0);
  const [latestInvoice, setLatestInvoice] = useState(null);

  // ============================
  // 🔐 GET ROLE FROM TOKEN
  // ============================
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload?.role || "");
        setUserEmail(payload?.email || "");
      } catch (err) {
        setRole("");
        setUserEmail("");
      }
    }
  }, [token]);

  // ============================
  // 📦 LOAD DATA
  // ============================
  const loadProducts = () => {
    axios.get(`${API}/api/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const loadSales = () => {
    axios.get(`${API}/api/sales`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSales(res.data))
      .catch(err => console.log(err));
  };

  const loadProfit = () => {
    axios.get(`${API}/api/profit`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfit(res.data.totalProfit))
      .catch(err => console.log(err));
  };

  // ============================
  // 🔄 AUTO LOAD
  // ============================
  useEffect(() => {
    if (!token) return;
    loadProducts();
    loadSales();
    loadProfit();
    // eslint-disable-next-line
  }, [token]);

  // ============================
  // 🔐 LOGIN & REGISTER
  // ============================
  const handleLogin = (email, password) => {
    axios.post(`${API}/api/login`, { email, password })
      .then(res => {
        try { localStorage.setItem("token", res.data.token); } catch(e) {}
        setToken(res.data.token);
      })
      .catch(err => alert(err.response?.data?.message || "Login failed"));
  };

  const handleRegister = (email, password) => {
    axios.post(`${API}/api/register`, { email, password })
      .then(() => alert("User registered successfully. You can now log in."))
      .catch(err => alert(err.response?.data?.message || "Registration failed"));
  };

  // ============================
  // 🚪 LOGOUT
  // ============================
  const handleLogout = () => {
    try { localStorage.removeItem("token"); } catch(e) {}
    setToken("");
    setRole("");
    setUserEmail("");
  };

  // ============================
  // ➕/🗑 PRODUCT ACTIONS
  // ============================
  const addProduct = (productData) => {
    let payload = productData;
    let headers = { Authorization: `Bearer ${token}` };

    if (productData.image) {
      payload = new FormData();
      payload.append("name", productData.name);
      payload.append("price", productData.price);
      payload.append("quantity", productData.quantity);
      payload.append("image", productData.image);
      headers["Content-Type"] = "multipart/form-data";
    }

    axios.post(`${API}/api/products`, payload, { headers })
      .then(() => loadProducts())
      .catch(err => console.log(err));
  };

  const deleteProduct = (id) => {
    axios.delete(`${API}/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => loadProducts())
      .catch(err => console.log(err));
  };

  const editProduct = (id, productData) => {
    let payload = productData;
    let headers = { Authorization: `Bearer ${token}` };

    if (productData.image) {
      payload = new FormData();
      if (productData.name) payload.append("name", productData.name);
      if (productData.price !== undefined) payload.append("price", productData.price);
      if (productData.quantity !== undefined) payload.append("quantity", productData.quantity);
      payload.append("image", productData.image);
      headers["Content-Type"] = "multipart/form-data";
    }

    axios.put(`${API}/api/products/${id}`, payload, { headers })
      .then(() => loadProducts())
      .catch(err => console.log(err));
  };

  const sellProduct = (id, sellData) => {
    axios.post(`${API}/api/sell`, {
      productId: id,
      ...sellData
    }, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        loadProducts();
        loadSales();
        loadProfit();
        // Show invoice immediately after sale
        setLatestInvoice({
          ...res.data.sale,
          customerName: sellData.customerName // inject frontend-only customer name
        });
      })
      .catch(err => alert(err.response?.data?.error || "Sale failed"));
  };

  // ============================
  // 🔀 ROUTING
  // ============================
  if (!token) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout role={role} userEmail={userEmail} onLogout={handleLogout} />}>
          <Route path="/" element={<Dashboard products={products} sales={sales} profit={profit} />} />
          <Route 
            path="/products" 
            element={
              <Products 
                products={products} 
                role={role} 
                onAdd={addProduct}
                onEdit={editProduct}
                onDelete={deleteProduct}
                onSell={sellProduct}
              />
            } 
          />
          <Route path="/sales" element={<SalesHistory sales={sales} />} />
          <Route path="/users" element={<Users token={token} role={role} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      
      {/* 🧾 GLOBAL INVOICE MODAL FOR IMMEDIATE SALES */}
      <InvoiceModal 
        isOpen={!!latestInvoice} 
        onClose={() => setLatestInvoice(null)} 
        invoiceData={latestInvoice} 
      />
    </BrowserRouter>
  );
}

export default App;