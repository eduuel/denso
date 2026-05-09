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
  <div>
    <h1>Denso Tracker Working</h1>
  </div>
);
  ;
}

export default App;