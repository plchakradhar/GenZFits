import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages_css/adminpage.css";
import { 
  FaUsers, FaBox, FaChartBar, FaCog, FaSignOutAlt, 
  FaEdit, FaTrash, FaPlus, FaSearch, FaTimes 
} from "react-icons/fa";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: "",
    stock: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const userData = raw ? JSON.parse(raw) : null;
    if (!userData || !userData.isAdmin) {
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersRes = await axios.get("http://localhost:8085/api/admin/users");
      setUsers(usersRes.data || []);
      const productsRes = await axios.get("http://localhost:8085/api/admin/products");
      setProducts(productsRes.data || []);
      const ordersRes = await axios.get("http://localhost:8085/api/admin/orders");
      setOrders(ordersRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price || 0),
        stock: parseInt(newProduct.stock || "0", 10)
      };
      await axios.post("http://localhost:8085/api/admin/products", payload);
      setShowAddModal(false);
      setNewProduct({ name: "", price: "", category: "", description: "", image: "", stock: "" });
      fetchData();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axios.delete(`http://localhost:8085/api/admin/${type}/${id}`);
      fetchData();
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-logo"><h2>GenZFits Admin</h2></div>
        <div className="admin-menu">
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}><FaChartBar /> Dashboard</button>
          <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}><FaUsers /> Users</button>
          <button className={activeTab === "products" ? "active" : ""} onClick={() => setActiveTab("products")}><FaBox /> Products</button>
          <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}><FaBox /> Orders</button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}><FaCog /> Settings</button>
        </div>
        <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "users" && "User Management"}
            {activeTab === "products" && "Product Management"}
            {activeTab === "orders" && "Order Management"}
            {activeTab === "settings" && "Settings"}
          </h1>
          <div className="search-box">
            <FaSearch />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {searchTerm && (<button onClick={() => setSearchTerm("")}><FaTimes /></button>)}
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card"><h3>Total Users</h3><p>{users.length}</p></div>
              <div className="stat-card"><h3>Total Products</h3><p>{products.length}</p></div>
              <div className="stat-card"><h3>Total Orders</h3><p>{orders.length}</p></div>
              <div className="stat-card"><h3>Revenue</h3><p>${orders.reduce((total, order) => total + (order.total || 0), 0).toFixed(2)}</p></div>
            </div>

            <div className="recent-activity">
              <h2>Recent Orders</h2>
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {orders.slice(0,5).map(order => (
                    <tr key={order.id}>
                      <td>#{(order.id || "").toString().slice(-6)}</td>
                      <td>{order.user?.username || "Guest"}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>${(order.total || 0).toFixed(2)}</td>
                      <td><span className={`status ${order.status}`}>{order.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="users-management">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>ID</th><th>Username</th><th>Full Name</th><th>Mobile</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>#{(user.id || "").toString().slice(-6)}</td>
                      <td>{user.username}</td>
                      <td>{user.fullName}</td>
                      <td>{user.mobile}</td>
                      <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td>
                        <button className="action-btn edit"><FaEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDelete("users", user.id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="products-management">
            <div className="section-header">
              <h2>Products</h2>
              <button className="add-btn" onClick={() => setShowAddModal(true)}><FaPlus /> Add Product</button>
            </div>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image"><img src={product.image || "/placeholder.jpg"} alt={product.name} /></div>
                  <div className="product-info"><h3>{product.name}</h3><p className="category">{product.category}</p><p className="price">${product.price}</p><p className="stock">Stock: {product.stock}</p></div>
                  <div className="product-actions">
                    <button className="action-btn edit"><FaEdit /></button>
                    <button className="action-btn delete" onClick={() => handleDelete("products", product.id)}><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-management">
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{(order.id || "").toString().slice(-6)}</td>
                      <td>{order.user?.username || "Guest"}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{(order.items || []).length} items</td>
                      <td>${(order.total || 0).toFixed(2)}</td>
                      <td>
                        <select defaultValue={order.status}>
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td><button className="action-btn edit"><FaEdit /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="settings">
            <h2>Admin Settings</h2>
            <div className="settings-card">
              <h3>System Information</h3>
              <div className="info-item"><span>Version:</span><span>1.0.0</span></div>
              <div className="info-item"><span>Users:</span><span>{users.length}</span></div>
              <div className="info-item"><span>Products:</span><span>{products.length}</span></div>
              <div className="info-item"><span>Orders:</span><span>{orders.length}</span></div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header"><h2>Add New Product</h2><button onClick={() => setShowAddModal(false)}><FaTimes /></button></div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group"><label>Product Name</label><input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required /></div>
              <div className="form-group"><label>Price</label><input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required /></div>
              <div className="form-group"><label>Category</label><input type="text" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} required /></div>
              <div className="form-group"><label>Stock</label><input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} required /></div>
              <div className="form-group"><label>Image URL</label><input type="text" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} /></div>
              <div className="form-group"><label>Description</label><textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} /></div>
              <div className="modal-actions"><button type="button" onClick={() => setShowAddModal(false)}>Cancel</button><button type="submit">Add Product</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
