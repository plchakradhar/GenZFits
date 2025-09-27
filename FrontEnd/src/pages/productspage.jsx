// src/pages/productspage.jsx (MODIFIED: Updated image src with backend URL and onError logging)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages_css/productspage.css";
import GenZFits from "../assets/GenZFits_logo.png";
import { FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes, FaHome, FaInfoCircle, FaEnvelope, FaInstagram, FaTwitter, FaFacebookF, FaUserCircle, FaHeart } from "react-icons/fa";

const ProductsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Form states (for login/signup modal)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    mobile: "",
    password: "",
    verificationCode: "",
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserLoggedIn(true);
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
    }
    
    // Get category from URL params
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category') || 'All';
    const search = queryParams.get('search') || '';
    setSelectedCategory(category);
    setSearchQuery(search);
    fetchProducts(category, search);
  }, [location]);

  const fetchProducts = async (category, search = "") => {
    try {
      setLoading(true);
      let url = "http://localhost:8085/api/admin/products";
      
      if (category && category !== "All") {
        url = `http://localhost:8085/api/admin/products/category/${category}`;
      }
      
      if (search) {
        url = `http://localhost:8085/api/admin/products/search?query=${search}`;
      }
      
      const res = await axios.get(url);
      setProducts(res.data);
      setFilteredProducts(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
    fetchProducts("All", searchQuery);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({...loginData, [name]: value});
  };

  const generateVerificationCode = () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setCodeSent(true);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    alert(`Your verification code is: ${code}`);
  };

  const verifyCode = () => {
    if (formData.verificationCode === generatedCode) {
      setCodeVerified(true);
      alert("✅ Verification successful!");
    } else {
      alert("❌ Invalid code, try again.");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!codeVerified) {
      alert("Verify code first!");
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:8085/api/users/signup", {
        fullName: formData.fullName,
        username: formData.username,
        mobile: formData.mobile,
        password: formData.password,
      });
      
      if (res.data.status === "success") {
        alert(res.data.message);
        setIsLogin(true);
        setFormData({
          fullName: "",
          username: "",
          mobile: "",
          password: "",
          verificationCode: "",
        });
        setCodeSent(false);
        setCodeVerified(false);
        setCountdown(0);
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert(err.response?.data?.message || "Server error, try again later.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.identifier || !loginData.password) {
      alert("Enter username/mobile and password");
      return;
    }
    
    try {
      const res = await axios.post("http://localhost:8085/api/users/login", {
        identifier: loginData.identifier,
        password: loginData.password
      });
      
      if (res.data.status === "success") {
        alert("Login successful!");
        setUserLoggedIn(true);
        setCurrentUser(res.data.data);
        setModalOpen(false);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        
        if (res.data.data.isAdmin) {
          navigate("/adminpage");
        } else {
          navigate("/");
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    setUserLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    navigate("/");
  };

  const applySorting = () => {
    let sorted = [...products];
    
    // Apply sorting
    switch(sortOption) {
      case "priceLowHigh":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }
    
    setFilteredProducts(sorted);
  };

  useEffect(() => {
    applySorting();
  }, [sortOption, products]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const categories = [
    "All",
    "T-Shirts",
    "Shirts",
    "Hoodies",
    "Formals",
    "Casuals",
    "Party Wear",
    "Trending"
  ];

  return (
    <div className="products-page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={GenZFits} alt="Logo" />
        </div>
        <form className="search-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <FaSearch />
          </button>
        </form>
        <div className="icons">
          {userLoggedIn ? (
            <div className="user-menu">
              <button className="icon-btn">
                <FaUserCircle />
                <span>{currentUser?.username}</span>
              </button>
              <button className="icon-btn" onClick={handleLogout}>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button className="icon-btn" onClick={() => setModalOpen(true)}>
              <FaUser />
              <span>Login</span>
            </button>
          )}
          <button className="icon-btn">
            <FaShoppingCart />
            <span>Cart</span>
          </button>
          <button className="icon-btn sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} onMouseLeave={() => setSidebarOpen(false)}>
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <div className="sidebar-menu">
          <a href="#" className="sidebar-item"><FaHome className="sidebar-icon" /><span>Home</span></a>
          <a href="#" className="sidebar-item"><FaInfoCircle className="sidebar-icon" /><span>About</span></a>
          <a href="#" className="sidebar-item"><FaEnvelope className="sidebar-icon" /><span>Contact</span></a>
        </div>
      </div>
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setModalOpen(false)}><FaTimes /></button>
            <div className="modal-tabs">
              <button className={`tab ${isLogin ? "active" : ""}`} onClick={() => setIsLogin(true)}>Login</button>
              <button className={`tab ${!isLogin ? "active" : ""}`} onClick={() => setIsLogin(false)}>Sign Up</button>
            </div>
            {isLogin ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <h2>Welcome Back!</h2>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="identifier" 
                    placeholder="Username or Mobile Number" 
                    value={loginData.identifier}
                    onChange={handleLoginChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required 
                  />
                </div>
                <button type="submit" className="auth-btn">Login</button>
                <p className="auth-switch">
                  Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <h2>Create Account</h2>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="fullName" 
                    placeholder="Full Name" 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="username" 
                    placeholder="Username" 
                    value={formData.username}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="mobile" 
                    placeholder="Mobile Number" 
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required 
                    maxLength="10"
                  />
                  <button 
                    type="button" 
                    className="otp-btn" 
                    onClick={generateVerificationCode}
                    disabled={!formData.mobile || formData.mobile.length !== 10 || countdown > 0}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Get Verification Code"}
                  </button>
                </div>
                <div className="form-group">
                  <input 
                    type="text" 
                    name="verificationCode" 
                    placeholder="Enter Verification Code" 
                    value={formData.verificationCode}
                    onChange={handleInputChange}
                    required 
                    disabled={!codeSent}
                    maxLength="4"
                  />
                  <button 
                    type="button" 
                    className="verify-btn" 
                    onClick={verifyCode}
                    disabled={!formData.verificationCode}
                  >
                    Verify Code
                  </button>
                </div>
                {codeVerified && <p className="otp-success">✓ Verification Successful</p>}
                <button type="submit" className="auth-btn" disabled={!codeVerified}>Sign Up</button>
                <p className="auth-switch">
                  Already have an account? <span onClick={() => setIsLogin(true)}>Login</span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="products-container">
        <div className="products-header">
          <h1>{selectedCategory} Products</h1>
          <div className="products-controls">
            <div className="sort-options">
              <span>Sort by:</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} >
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-content">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)} >
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={`http://localhost:8085${product.images[0]}`} alt={product.name} loading="lazy" onError={() => console.log("Image failed to load")} />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                    <button className="wishlist-btn">
                      <FaHeart />
                    </button>
                    {product.discount && (
                      <div className="discount-badge">{product.discount}% OFF</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-brand">{product.brand || "GenZfits"}</h3>
                    <p className="product-name">
                      {product.name.length > 35 ? product.name.slice(0, 35) + "..." : product.name}
                    </p>
                    <div className="product-pricing">
                      <span className="price">₹{product.price}</span>
                      {product.originalPrice && (
                        <>
                          <span className="old-price">₹{product.originalPrice}</span>
                          <span className="discount">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                          </span>
                        </>
                      )}
                    </div>
                    <div className="product-meta">
                      {product.assured && <span className="assured">🌟 Assured</span>}
                      {product.sizes && product.sizes.length > 0 && <span className="sizes">Size {product.sizes.join(", ")}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try adjusting your search term</p>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section"><h3>GenZfits</h3><p>Fashion for the new generation</p></div>
          <div className="footer-section"><h4>Quick Links</h4><ul><li><a href="#">Home</a></li><li><a href="#">Products</a></li><li><a href="#">About Us</a></li><li><a href="#">Contact</a></li></ul></div>
          <div className="footer-section"><h4>Follow Us</h4><div className="social-icons"><a href="#"><FaInstagram /></a><a href="#"><FaTwitter /></a><a href="#"><FaFacebookF /></a></div></div>
        </div>
        <div className="footer-bottom"><p>&copy; 2025 GenZfits. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default ProductsPage;