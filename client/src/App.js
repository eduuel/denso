import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // 🔐 AUTH STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  // 📦 APP STATE
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [profit, setProfit] = useState(0);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // ✅ LOAD TOKEN FROM STORAGE (IMPORTANT FIX)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // 🔄 LOAD DATA AFTER LOGIN
  useEffect(() => {
    if (token) {
      loadProducts();
      loadProfit();
      loadSales();
    }
  }, [token]);

  // 🔐 LOGIN
  const login = () => {
  axios.post("http://localhost:5000/api/login", {
    email,
    password
  })
  .then(res => {
    setToken(res.data.token);                 // ✅ set state
    localStorage.setItem("token", res.data.token); // ✅ save
  })
  .catch(err => console.log(err));
};
const register = () => {
  axios.post("http://localhost:5000/api/register", {
    email,
    password
  })
  .then(() => alert("User registered! Now login"))
  .catch(err => console.log(err));
};
  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // 📦 LOAD DATA FUNCTIONS
  const loadProducts = () => {
    axios.get("http://localhost:5000/api/products")
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const loadProfit = () => {
    axios.get("http://localhost:5000/api/profit")
      .then(res => setProfit(res.data.totalProfit))
      .catch(err => console.log(err));
  };

  const loadSales = () => {
    axios.get("http://localhost:5000/api/sales")
      .then(res => setSales(res.data))
      .catch(err => console.log(err));
  };

  // ➕ ADD PRODUCT
  const addProduct = () => {
    axios.post("http://localhost:5000/api/products", {
      name,
      price: Number(price),
      quantity: Number(quantity)
    })
    .then(() => {
      setName("");
      setPrice("");
      setQuantity("");
      loadProducts();
      loadProfit();
    })
    .catch(err => console.log(err));
  };

  // 🗑 DELETE
  const deleteProduct = (id) => {
    axios.delete(`http://localhost:5000/api/products/${id}`)
      .then(() => {
        loadProducts();
        loadProfit();
      })
      .catch(err => console.log(err));
  };

  // 💸 SELL
  const sellProduct = (id) => {
    const quantitySold = prompt("Enter quantity to sell:");
    const sellingPrice = prompt("Enter selling price:");

    axios.post("http://localhost:5000/api/sell", {
      productId: id,
      quantitySold: Number(quantitySold),
      sellingPrice: Number(sellingPrice)
    })
    .then(() => {
      alert("Sale recorded");
      loadProducts();
      loadProfit();
      loadSales();
    })
    .catch(err => console.log(err));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Denso Tracker 🚗</h1>
<button onClick={logout}>Logout 🚪</button>
      {/* 🔐 LOGIN */}
      {!token && (
        <>
          <h2>Login 🔐</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <br /><br />
         <button onClick={login}>Login</button>
<button onClick={register}>Register</button>
        </>
      )}

      {/* 🟢 MAIN APP */}
      {token && (
        <>
          <button onClick={logout}>Logout</button>

          <h2 style={{ color: "green" }}>
            Total Profit: {profit} Birr 💰
          </h2>

          <hr />

          {/* ➕ ADD PRODUCT */}
          <h2>Add Product</h2>

          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            placeholder="Price"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />

          <input
            placeholder="Quantity"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <br /><br />
          <button onClick={addProduct}>Add Product</button>

          <hr />

          {/* 📊 SALES */}
          <h2>Sales History 📊</h2>

          {sales.map(s => (
            <div key={s._id} style={{ border: "1px solid green", margin: 10, padding: 10 }}>
              <p>Product: {s.productName}</p>
              <p>Quantity Sold: {s.quantitySold}</p>
              <p>Selling Price: {s.sellingPrice}</p>
              <p>Total: {s.totalAmount}</p>
              <p>Profit: {s.profit}</p>
            </div>
          ))}

          <hr />

          {/* 📦 PRODUCTS */}
          <h2>Products</h2>

          {products.map(p => (
            <div key={p._id} style={{ border: "1px solid black", margin: 10, padding: 10 }}>
              <h3>{p.name}</h3>
              <p>Price: {p.price}</p>
              <p>Quantity: {p.quantity}</p>

              <button onClick={() => deleteProduct(p._id)}>
                Delete
              </button>

              <button onClick={() => sellProduct(p._id)}>
                Sell
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;