
import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/products";
const AUTH_URL = "http://localhost:5000/api/auth/login";

const CLOUD_NAME = "rvcfhtxa";
const UPLOAD_PRESET = "rhotnokq";

function Admin() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("adminToken") || ""
  );

  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "Accessories",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ADMIN LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setMessage("");

    try {
      const response = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      sessionStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setPassword("");
      setMessage("Login successful!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setToken("");
    setProducts([]);
    setMessage("You have logged out.");
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load products.");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setMessage("Unable to load products.");
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // FORM INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SELECT IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // UPLOAD IMAGE TO CLOUDINARY
  const uploadImage = async () => {
    if (!imageFile) {
      throw new Error("Please select a product image.");
    }

    setUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", imageFile);
      uploadData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Image upload failed."
        );
      }

      return data.secure_url;
    } finally {
      setUploading(false);
    }
  };

  // ADD PRODUCT
  const addProduct = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setMessage("Please select a product image.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const imageURL = await uploadImage();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          image: imageURL,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save product.");
      }

      setMessage("Product added successfully!");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "Accessories",
      });

      setImageFile(null);
      setPreview("");

      await fetchProducts();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        throw new Error("Your session expired. Please log in again.");
      }

      if (!response.ok) {
        throw new Error("Unable to delete product.");
      }

      setMessage("Product deleted successfully!");
      await fetchProducts();
    } catch (error) {
      setMessage(error.message);
    }
  };

  // LOGIN SCREEN
  if (!token) {
    return (
      <div style={loginPage}>
        <form onSubmit={handleLogin} style={loginCard}>
          <h1>Mahima Crochets ♡</h1>
          <h2>Admin Login</h2>
          <p>Login to manage your crochet store.</p>

          <label>Admin Password</label>

          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loginLoading}
            style={buttonStyle}
          >
            {loginLoading ? "Logging in..." : "Login"}
          </button>

          {message && <p>{message}</p>}

          <a href="/" style={linkStyle}>
            Back to Store
          </a>
        </form>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div style={dashboardStyle}>
      <h1>Mahima Crochets ♡</h1>

      <div style={navStyle}>
        <a href="/" style={navLink}>View Store</a>
        <a href="/orders" style={navLink}>View Orders</a>

        <button onClick={handleLogout} style={logoutStyle}>
          Logout
        </button>
      </div>

      <p>Admin Dashboard | Manage your handmade collection</p>

      <hr />

      <h2>Add New Product</h2>

      <form onSubmit={addProduct}>
        <label>Product Name</label>
        <input
          name="name"
          placeholder="Enter product name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Description</label>
        <textarea
          name="description"
          placeholder="Describe your crochet product"
          value={form.description}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Price (NPR)</label>
        <input
          name="price"
          type="number"
          min="1"
          placeholder="Enter price"
          value={form.price}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={inputStyle}
        >
          <option>Accessories</option>
          <option>Bags</option>
          <option>Amigurumi</option>
          <option>Wearables</option>
          <option>Clothing</option>
          <option>Keychains</option>
        </select>

        <label>Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={inputStyle}
        />

        {preview && (
          <div style={{ margin: "20px 0" }}>
            <p>Image Preview</p>
            <img
              src={preview}
              alt="Product preview"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "12px",
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          style={buttonStyle}
        >
          {uploading
            ? "Uploading Image..."
            : saving
            ? "Saving Product..."
            : "Add Product"}
        </button>
      </form>

      {message && <p style={{ marginTop: "15px" }}>{message}</p>}

      <hr />

      <h2>Existing Products ({products.length})</h2>

      <div style={productGrid}>
        {products.map((product) => (
          <div key={product._id} style={productCard}>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={productImage}
              />
            )}

            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <strong>NPR {product.price}</strong>
            <p>{product.category}</p>

            <button
              onClick={() => deleteProduct(product._id)}
              style={{ ...buttonStyle, background: "#b83232" }}
            >
              Delete Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const loginPage = {
  minHeight: "100vh",
  background: "#f8f4f0",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
};

const loginCard = {
  width: "100%",
  maxWidth: "400px",
  padding: "30px",
  background: "white",
  borderRadius: "14px",
  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
  boxSizing: "border-box",
};

const dashboardStyle = {
  maxWidth: "1000px",
  margin: "40px auto",
  padding: "25px",
  fontFamily: "Arial, sans-serif",
};

const navStyle = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "20px",
};

const navLink = {
  textDecoration: "none",
  padding: "10px 16px",
  background: "#4b302b",
  color: "white",
  borderRadius: "6px",
};

const linkStyle = {
  display: "block",
  marginTop: "20px",
  color: "#70473e",
};

const logoutStyle = {
  padding: "10px 16px",
  background: "#b83232",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "10px 0 20px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const buttonStyle = {
  padding: "12px 22px",
  background: "#9b627b",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const productGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
};

const productCard = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "12px",
};

const productImage = {
  width: "100%",
  height: "180px",
  objectFit: "cover",
  borderRadius: "8px",
};

export default Admin;
