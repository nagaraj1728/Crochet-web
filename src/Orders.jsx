
import React, { useEffect, useState } from "react";

const API_URL = "https://crochet-web-s2p7.onrender.com/api/orders";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState("");

  const getToken = () => sessionStorage.getItem("adminToken");

  // FETCH ORDERS
  const fetchOrders = async () => {
    const token = getToken();

    if (!token) {
      setMessage("Please log in through the Admin Dashboard first.");
      setError(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError(false);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        setMessage("Admin session expired or invalid. Please log in again.");
        setError(true);
        setOrders([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch orders.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from orders API.");
      }

      setOrders(data);
    } catch (err) {
      setMessage(err.message || "Failed to load orders.");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const updateStatus = async (orderId, status) => {
    const token = getToken();

    if (!token) {
      setMessage("Please log in again.");
      setError(true);
      return;
    }

    try {
      setUpdatingId(orderId);
      setMessage("");
      setError(false);

      const response = await fetch(`${API_URL}/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("adminToken");
        setMessage("Admin session expired. Please log in again.");
        setError(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );

      setMessage("Order status updated successfully!");
    } catch (err) {
      setMessage(err.message || "Status update failed.");
      setError(true);
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1>Mahima Crochets ♡</h1>
          <p>Customer Orders Dashboard</p>
        </div>

        <div style={styles.navigation}>
          <a href="/" style={styles.navLink}>View Store</a>
          <a href="/admin" style={styles.navLink}>Admin Dashboard</a>
          <button onClick={fetchOrders} style={styles.refreshButton}>
            Refresh
          </button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.summary}>
          <h2>All Customer Orders</h2>
          <span>Total Orders: {orders.length}</span>
        </div>

        {message && (
          <div style={error ? styles.errorBox : styles.successBox}>
            {message}
          </div>
        )}

        {loading && <p>Loading orders...</p>}

        {!loading && !error && orders.length === 0 && (
          <div style={styles.empty}>
            <h3>No orders found</h3>
            <p>Customer orders will appear here after checkout.</p>
          </div>
        )}

        {!loading && orders.map((order) => (
          <div key={order._id} style={styles.card}>
            <div style={styles.orderHeader}>
              <div>
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <small>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "Date unavailable"}
                </small>
              </div>

              <strong style={styles.total}>
                NPR {Number(order.totalAmount || 0).toLocaleString()}
              </strong>
            </div>

            <div style={styles.customerDetails}>
              <h4>Customer Details</h4>
              <p><b>Name:</b> {order.customer?.name || "—"}</p>
              <p><b>Phone:</b> {order.customer?.phone || "—"}</p>
              <p><b>Address:</b> {order.customer?.address || "—"}</p>
              <p><b>Payment:</b> {order.paymentMethod || "—"}</p>
            </div>

            <div style={styles.products}>
              <h4>Products Ordered</h4>

              {order.items?.map((item, index) => (
                <div key={index} style={styles.productRow}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>
                    NPR {(Number(item.price || 0) *
                      Number(item.quantity || 0)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.statusRow}>
              <label><b>Order Status:</b></label>

              <select
                value={order.status || "Pending"}
                disabled={updatingId === order._id}
                onChange={(e) =>
                  updateStatus(order._id, e.target.value)
                }
                style={styles.select}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              {updatingId === order._id && <span>Updating...</span>}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8f4f0",
    color: "#33251f",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#4b302b",
    color: "white",
    padding: "22px 6%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  navigation: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
  },
  navLink: {
    textDecoration: "none",
    padding: "10px 14px",
    background: "#76534a",
    color: "white",
    borderRadius: "6px",
  },
  refreshButton: {
    padding: "10px 14px",
    background: "#f0d7c5",
    color: "#3b2822",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  container: {
    maxWidth: "950px",
    margin: "30px auto",
    padding: "0 18px 40px",
  },
  summary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "20px",
    boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  total: {
    color: "#8a4c36",
    fontSize: "18px",
  },
  customerDetails: {
    lineHeight: 1.5,
    padding: "10px 0",
  },
  products: {
    background: "#faf6f2",
    padding: "12px",
    borderRadius: "8px",
  },
  productRow: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    padding: "7px 0",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #c9b8ad",
    borderRadius: "6px",
    background: "white",
  },
  empty: {
    textAlign: "center",
    background: "white",
    padding: "45px 20px",
    borderRadius: "12px",
  },
  errorBox: {
    background: "#fff0ef",
    color: "#a32929",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  successBox: {
    background: "#edf7ed",
    color: "#286b35",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
};

export default Orders;
