import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { API } from "./config";
const getDate = (s) => new Date(s.createdAt || s.date);

function App() {
  // ✅ SAFE DATE HANDLER (VERY IMPORTANT)
// 🔐 AUTH
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState("");
const [invoice, setInvoice] = useState(null);
  // 📦 DATA
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState(0);

  // ➕ PRODUCT INPUTS
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");


  // ============================
  // 🔐 GET ROLE FROM TOKEN
  // ============================
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
      } catch (err) {
        setRole("");
      }
    }
  }, [token]);


  // ============================
  // 📦 LOAD DATA
  // ============================
const loadProducts = () => {
  axios.get(`${API}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => setProducts(res.data))
  .catch(err => console.log(err));
};

const loadSales = () => {
  axios.get(`${API}/api/sales`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => setSales(res.data))
  .catch(err => console.log(err));
};

const loadProfit = () => {
  axios.get(`${API}/api/profit`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
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
  // 🔐 LOGIN
  // ============================
 const login = () => {
  axios.post(`${API}/api/login`, {
    email,
    password
  })
  .then(res => {
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
  })
  .catch(err => console.log(err));
};


  // ============================
  // 📝 REGISTER
  // ============================
const register = () => {
  axios.post(`${API}/api/register`, {
    email,
    password
  })
  .then(() => alert("User registered"))
  .catch(err => console.log(err));
};


  // ============================
  // 🚪 LOGOUT
  // ============================
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setRole("");
  };


  // ============================
  // ➕ ADD PRODUCT (ADMIN)
  // ============================
const addProduct = () => {
  axios.post(`${API}/api/products`, {
    name,
    price: Number(price),
    quantity: Number(quantity)
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      setName("");
      setPrice("");
      setQuantity("");
      loadProducts();
    })
    .catch(err => console.log(err));
};


  // ============================
  // 🗑 DELETE
  // ============================
  const deleteProduct = (id) => {
  axios.delete(`${API}/api/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => loadProducts())
    .catch(err => console.log(err));
};

  // ============================
  // 💸 SELL
  // ============================
  const sellProduct = (id) => {
   const customerName = prompt("Customer Name:");
const quantitySold = prompt("Quantity:");
const sellingPrice = prompt("Price:");

if (!customerName || !quantitySold || !sellingPrice) return;

axios.post(`${API}/api/sell`, {
  productId: id,
  quantitySold: Number(quantitySold),
  sellingPrice: Number(sellingPrice)
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
    .then(() => {
      setInvoice({
  customerName,
  productId: id,
  quantitySold,
  sellingPrice,
  total: quantitySold * sellingPrice,
  date: new Date().toLocaleString()
});
      loadProducts();
      loadSales();
      loadProfit();
    })
    .catch(err => console.log(err));
  };
// 🕒 TIME ANALYTICS
const now = new Date();

const dailySales = sales.filter(s => {
  const d = getDate(s);
  return d.toDateString() === now.toDateString();
});

const weeklySales = sales.filter(s => {
  const d = getDate(s);
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff <= 7;
});

const monthlySales = sales.filter(s => {
  const d = getDate(s);
  return d.getMonth() === now.getMonth() &&
         d.getFullYear() === now.getFullYear();
});

// 💰 TOTALS
const dailyTotal = dailySales.reduce((a, b) => a + b.profit, 0);
const weeklyTotal = weeklySales.reduce((a, b) => a + b.profit, 0);
const monthlyTotal = monthlySales.reduce((a, b) => a + b.profit, 0);
const lowStock = products.filter(p => p.quantity <= 5);
// 📊 SIMPLE CHART DATA (SAFE)
const grouped = {};

(sales || []).forEach(s => {
  const d = getDate(s).toLocaleDateString();

  if (!grouped[d]) grouped[d] = 0;

  grouped[d] += Number(s.profit || 0);
});

const chartData = Object.keys(grouped).map(date => ({
  date,
  profit: grouped[date]
}));
const cardStyle = {
  background: "white",
  padding: 15,
  marginBottom: 15,
  borderRadius: 10,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const miniCard = {
  border: "1px solid #ddd",
  padding: 10,
  borderRadius: 8,
  flex: 1,
  textAlign: "center"
};

const inputGroup = {
  display: "flex",
  gap: 10,
  marginBottom: 10
};
  return (
    <div style={{
    padding: 20,
    fontFamily: "Arial",
    background: "#f4f6f9",
    minHeight: "100vh"
  }}>

    {/* 🚗 HEADER */}
    <h1 style={{
      textAlign: "center",
      marginBottom: 20
    }}>
      🚗 Denso Tracker
    </h1>

    {/* 🔐 LOGIN */}
    {!token && (
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        <div style={inputGroup}>
          <input placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} />

          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} />
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={login}>Login</button>
          <button onClick={register}>Register</button>
        </div>
      </div>
    )}

    {/* 🟢 DASHBOARD */}
    {token && (
      <>
        <div style={{ textAlign: "right" }}>
          <button onClick={logout}>Logout 🚪</button>
        </div>

        {/* 👤 ROLE */}
        <div style={cardStyle}>
          <h3>👤 Role: {role}</h3>
          <h2 style={{ color: "green" }}>
            💰 Total Profit: {profit} Birr
          </h2>

          {role !== "admin" && (
            <p style={{ color: "orange" }}>
              ⚠ View Only Mode
            </p>
          )}
        </div>

        {/* 📅 SALES OVERVIEW */}
        <div style={cardStyle}>
          <h2>📅 Sales Overview</h2>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={miniCard}>📆 Today: {dailyTotal}</div>
            <div style={miniCard}>📅 Week: {weeklyTotal}</div>
            <div style={miniCard}>🗓 Month: {monthlyTotal}</div>
          </div>
        </div>
{/* 📈 CHART */}
<div style={cardStyle}>
  <h2>📈 Profit Chart</h2>

  {chartData.length === 0 ? (
    <p>No data yet</p>
  ) : (
    <div style={{
      display: "flex",
      alignItems: "flex-end",
      gap: 10,
      height: 200
    }}>
      {chartData.map((c, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          
          <div style={{
            width: 30,
            height: Math.max(c.profit / 10, 10),
            backgroundColor: "#4CAF50",
            borderRadius: 4
          }}></div>

          <small>{c.date}</small>
        </div>
      ))}
    </div>
  )}
</div>
        {/* ⚠ LOW STOCK */}
        <div style={cardStyle}>
          <h2>⚠ Low Stock Alerts</h2>

          {lowStock.length === 0 ? (
            <p>All stock is healthy 👍</p>
          ) : (
            lowStock.map(p => (
              <p key={p._id} style={{ color: "red" }}>
                ⚠ {p.name} ({p.quantity} left)
              </p>
            ))
          )}
        </div>

        {/* ➕ ADD PRODUCT */}
        <div style={cardStyle}>
          <h2>➕ Add Product</h2>

          {role === "admin" ? (
            <>
              <div style={inputGroup}>
                <input placeholder="Name" value={name}
                  onChange={e => setName(e.target.value)} />

                <input placeholder="Price" value={price}
                  onChange={e => setPrice(e.target.value)} />

                <input placeholder="Quantity" value={quantity}
                  onChange={e => setQuantity(e.target.value)} />
              </div>

              <button onClick={addProduct}>Add</button>
            </>
          ) : (
            <p>🔒 Admin only can add products</p>
          )}
        </div>
{/* 🧾 INVOICE */}
{invoice && (
  <div style={{
    background: "white",
    padding: 20,
    marginTop: 20,
    border: "2px solid black"
  }}>
    <h2>🧾 Invoice</h2>

    <p><strong>Customer:</strong> {invoice.customerName}</p>
    <p><strong>Quantity:</strong> {invoice.quantitySold}</p>
    <p><strong>Price:</strong> {invoice.sellingPrice}</p>
    <p><strong>Total:</strong> {invoice.total} Birr</p>
    <p><strong>Date:</strong> {invoice.date}</p>

    <button onClick={() => window.print()}>
      🖨 Print Invoice
    </button>
  </div>
)}
        {/* 📊 SALES */}
        <h2>📊 Sales History</h2>
        {sales.map(s => (
          <div key={s._id} style={cardStyle}>
            <p>📦 {s.productName}</p>
            <p>🔢 Qty: {s.quantitySold}</p>
            <p>💰 Profit: {s.profit}</p>
          </div>
        ))}

        {/* 📦 PRODUCTS */}
        <h2>📦 Products</h2>
        {products.map(p => (
          <div key={p._id} style={cardStyle}>
            <h3>{p.name}</h3>
            <p>💰 {p.price}</p>
            <p>📦 {p.quantity}</p>

            {role === "admin" ? (
              <>
                <button onClick={() => sellProduct(p._id)}>Sell</button>
                <button onClick={() => deleteProduct(p._id)}>Delete</button>
              </>
            ) : (
              <p style={{ fontSize: 12 }}>🔒 Locked</p>
            )}
          </div>
        ))}
      </>
    )}
  </div>
);
  ;
}

export default App;