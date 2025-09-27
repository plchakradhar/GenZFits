import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages_css/adminpage.css";
import { 
  FaUsers, FaBox, FaChartBar, FaCog, FaSignOutAlt, 
  FaEdit, FaTrash, FaPlus, FaSearch, FaTimes, FaUserCircle,
  FaShoppingCart, FaRupeeSign, FaEye, FaEyeSlash, FaUpload,
  FaCheck, FaTimesCircle, FaFilter, FaSort
} from "react-icons/fa";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Data states
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    images: [],
    stock: "",
    originalPrice: "",
    discount: "",
    assured: false,
    brand: "",
    sizes: ""
  });
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [imageFiles, setImageFiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Filter and sort states
  const [userFilter, setUserFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const sessionResponse = await axios.get("http://localhost:8085/api/users/check-session", {
        withCredentials: true
      });
      
      if (sessionResponse.data.status === "active" && sessionResponse.data.user.isAdmin) {
        setCurrentUser(sessionResponse.data.user);
        fetchData();
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Session check failed:", error);
      window.location.href = "/";
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:8085/api/admin/users", { withCredentials: true }).catch(() => ({ data: [] })),
        axios.get("http://localhost:8085/api/admin/products").catch(() => ({ data: [] })),
        axios.get("http://localhost:8085/api/admin/orders", { withCredentials: true }).catch(() => ({ data: [] }))
      ]);

      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8085/api/users/logout", {}, { 
        withCredentials: true 
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter(file => 
      validTypes.includes(file.type) && file.size <= maxSize
    );

    if (validFiles.length !== files.length) {
      alert("Some files were invalid. Only JPEG, PNG, GIF images under 5MB are allowed.");
    }

    setImageFiles(validFiles);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = [];
      
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append("files", file));
        
        const uploadResponse = await axios.post(
          "http://localhost:8085/api/admin/products/upload-images",
          formData,
          { 
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
          }
        );
        imageUrls = uploadResponse.data;
      }

      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        originalPrice: parseFloat(newProduct.originalPrice || newProduct.price),
        discount: parseInt(newProduct.discount || "0"),
        images: imageUrls,
        sizes: newProduct.sizes.split(",").map(s => s.trim()).filter(s => s),
        assured: Boolean(newProduct.assured)
      };

      await axios.post("http://localhost:8085/api/admin/products", payload, {
        withCredentials: true
      });
      
      setShowAddModal(false);
      resetProductForm();
      fetchData();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock),
        originalPrice: parseFloat(editingProduct.originalPrice),
        discount: parseInt(editingProduct.discount || "0"),
        sizes: Array.isArray(editingProduct.sizes) ? editingProduct.sizes : editingProduct.sizes.split(",").map(s => s.trim()).filter(s => s),
        assured: Boolean(editingProduct.assured)
      };

      await axios.put(`http://localhost:8085/api/admin/products/${editingProduct.id}`, payload, {
        withCredentials: true
      });
      
      setShowEditModal(false);
      setEditingProduct(null);
      fetchData();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8085/api/admin/users/${editingUser.id}`, editingUser, {
        withCredentials: true
      });
      
      setShowUserModal(false);
      setEditingUser(null);
      fetchData();
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      await axios.delete(`http://localhost:8085/api/admin/${type}/${id}`, {
        withCredentials: true
      });
      fetchData();
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8085/api/admin/orders/${orderId}`, 
        { status: newStatus },
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8085/api/admin/users/${userId}/status`, 
        { active: !currentStatus },
        { withCredentials: true }
      );
      fetchData();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const resetProductForm = () => {
    setNewProduct({
      name: "",
      price: "",
      category: "",
      description: "",
      images: [],
      stock: "",
      originalPrice: "",
      discount: "",
      assured: false,
      brand: "",
      sizes: ""
    });
    setImageFiles([]);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      userFilter === "all" || 
      (userFilter === "admin" && user.isAdmin) ||
      (userFilter === "active" && user.active) ||
      (userFilter === "inactive" && !user.active);
    
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      productFilter === "all" ||
      (productFilter === "inStock" && product.stock > 0) ||
      (productFilter === "outOfStock" && product.stock <= 0) ||
      (productFilter === "assured" && product.assured);
    
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.user?.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id?.toString() || "").includes(searchTerm);
    
    const matchesFilter = 
      orderFilter === "all" || 
      (order.status || "").toLowerCase() === orderFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Statistics calculations
  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: orders.reduce((total, order) => total + (order.total || 0), 0),
    pendingOrders: orders.filter(order => order.status === 'pending').length,
    lowStockProducts: products.filter(product => product.stock > 0 && product.stock <= 10).length,
    activeUsers: users.filter(user => user.active).length,
    monthlyRevenue: orders
      .filter(order => new Date(order.createdAt).getMonth() === new Date().getMonth())
      .reduce((total, order) => total + (order.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
          <div className="admin-user">
            <FaUserCircle />
            <span>{currentUser?.username || 'Admin'}</span>
          </div>
        </div>
        
        <div className="admin-menu">
          {[
            { key: "dashboard", icon: FaChartBar, label: "Dashboard", count: null },
            { key: "users", icon: FaUsers, label: "Users", count: users.length },
            { key: "products", icon: FaBox, label: "Products", count: products.length },
            { key: "orders", icon: FaShoppingCart, label: "Orders", count: orders.length },
            { key: "settings", icon: FaCog, label: "Settings", count: null }
          ].map(item => (
            <button 
              key={item.key}
              className={activeTab === item.key ? "active" : ""} 
              onClick={() => setActiveTab(item.key)}
            >
              <item.icon /> 
              {item.label}
              {item.count !== null && <span className="menu-count">{item.count}</span>}
            </button>
          ))}
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "users" && `User Management (${users.length} users)`}
            {activeTab === "products" && `Product Management (${products.length} products)`}
            {activeTab === "orders" && `Order Management (${orders.length} orders)`}
            {activeTab === "settings" && "Settings"}
          </h1>
          
          <div className="header-controls">
            <div className="search-box">
              <FaSearch />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <FaTimes />
                </button>
              )}
            </div>
            
            {activeTab === "products" && (
              <button className="add-btn" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Add Product
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="dashboard">
            <div className="stats-grid">
              {[
                { icon: FaUsers, label: "Total Users", value: stats.totalUsers, color: "#4e73df" },
                { icon: FaBox, label: "Total Products", value: stats.totalProducts, color: "#1cc88a" },
                { icon: FaShoppingCart, label: "Total Orders", value: stats.totalOrders, color: "#36b9cc" },
                { icon: FaRupeeSign, label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: "#f6c23e" },
                { icon: FaChartBar, label: "Pending Orders", value: stats.pendingOrders, color: "#e74a3b" },
                { icon: FaBox, label: "Low Stock", value: stats.lowStockProducts, color: "#f6c23e" },
                { icon: FaUsers, label: "Active Users", value: stats.activeUsers, color: "#1cc88a" },
                { icon: FaRupeeSign, label: "Monthly Revenue", value: `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`, color: "#4e73df" }
              ].map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                    <stat.icon />
                  </div>
                  <div className="stat-info">
                    <h3>{stat.label}</h3>
                    <p className="stat-number">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-activity">
              <div className="activity-section">
                <h2>Recent Users</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info">
                              <strong>{user.username}</strong>
                              <span>{user.fullName}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                              {user.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="activity-section">
                <h2>Recent Orders</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td>#{(order.id || "").toString().padStart(6, '0')}</td>
                          <td>{order.user?.username || "Guest"}</td>
                          <td>₹{(order.total || 0).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${order.status || 'pending'}`}>
                              {order.status || 'Pending'}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="users-management">
            <div className="section-header">
              <h2>Manage Users ({filteredUsers.length} found)</h2>
              <div className="filter-controls">
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                  <option value="all">All Users</option>
                  <option value="admin">Admins</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('username')}>
                      User <FaSort />
                    </th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData(filteredUsers).map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <strong>{user.username}</strong>
                          <span>{user.fullName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>
                        <button 
                          className={`status-toggle ${user.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleUserStatus(user.id, user.active)}
                        >
                          {user.active ? <FaCheck /> : <FaTimes />}
                          {user.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit" 
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDelete("users", user.id)}
                            disabled={user.isAdmin || user.id === currentUser?.id}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="products-management">
            <div className="section-header">
              <h2>Manage Products ({filteredProducts.length} found)</h2>
              <div className="filter-controls">
                <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
                  <option value="all">All Products</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="assured">Assured</option>
                </select>
              </div>
            </div>
            
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.images?.[0] ? (
                      <img 
                        src={`http://localhost:8085${product.images[0]}`} 
                        alt={product.name}
                      />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                    {product.discount > 0 && (
                      <div className="discount-badge">-{product.discount}%</div>
                    )}
                    {product.assured && (
                      <div className="assured-badge">Assured</div>
                    )}
                  </div>
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <div className="price-section">
                      <span className="price">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">₹{product.originalPrice}</span>
                      )}
                    </div>
                    <p className={`stock ${product.stock <= 10 ? 'low-stock' : ''}`}>
                      Stock: {product.stock}
                    </p>
                    <p className="brand">{product.brand}</p>
                  </div>
                  
                  <div className="product-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowEditModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete("products", product.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="orders-management">
            <div className="section-header">
              <h2>Manage Orders ({filteredOrders.length} found)</h2>
              <div className="filter-controls">
                <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{(order.id || "").toString().padStart(6, '0')}</td>
                      <td>{order.user?.username || "Guest"}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{(order.items || []).length} items</td>
                      <td>₹{(order.total || 0).toFixed(2)}</td>
                      <td>
                        <select 
                          value={order.status || 'pending'} 
                          onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                          className={`status-select ${order.status || 'pending'}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button 
                          className="action-btn view"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="settings">
            <h2>Admin Settings</h2>
            <div className="settings-grid">
              <div className="settings-card">
                <h3>System Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Version:</span>
                    <span className="info-value">1.0.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Users:</span>
                    <span className="info-value">{stats.totalUsers}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Products:</span>
                    <span className="info-value">{stats.totalProducts}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Orders:</span>
                    <span className="info-value">{stats.totalOrders}</span>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <h3>Quick Actions</h3>
                <div className="action-buttons-vertical">
                  <button className="action-btn primary" onClick={() => setShowAddModal(true)}>
                    <FaPlus /> Add New Product
                  </button>
                  <button className="action-btn secondary" onClick={fetchData}>
                    <FaChartBar /> Refresh Data
                  </button>
                  <button className="action-btn warning" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button onClick={() => setShowAddModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Shoes">Shoes</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newProduct.stock} 
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    value={newProduct.brand} 
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Sizes (comma-separated) *</label>
                  <input 
                    type="text" 
                    value={newProduct.sizes} 
                    onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})} 
                    placeholder="S,M,L,XL"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="4"
                  value={newProduct.description} 
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                  placeholder="Enter product description..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={newProduct.assured} 
                    onChange={(e) => setNewProduct({...newProduct, assured: e.target.checked})} 
                  />
                  Assured Product
                </label>
              </div>

              <div className="form-group">
                <label>Upload Images *</label>
                <div className="file-upload">
                  <FaUpload />
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    required
                  />
                  <span>Click to upload images</span>
                </div>
                {imageFiles.length > 0 && (
                  <div className="file-preview">
                    <p>{imageFiles.length} file(s) selected</p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    value={editingProduct.name} 
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={editingProduct.price} 
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input 
                    type="number" 
                    min="0"
                    value={editingProduct.stock} 
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Discount (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100"
                    value={editingProduct.discount} 
                    onChange={(e) => setEditingProduct({...editingProduct, discount: e.target.value})} 
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showUserModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setShowUserModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    value={editingUser.username} 
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={editingUser.email} 
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    value={editingUser.fullName} 
                    onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Mobile</label>
                  <input 
                    type="text" 
                    value={editingUser.mobile} 
                    onChange={(e) => setEditingUser({...editingUser, mobile: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={editingUser.isAdmin} 
                    onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})} 
                  />
                  Administrator
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;