import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages_css/landingpage.css";
import GenZFits from "../assets/GenZFits_logo.png";
import tshirtImg from "../assets/t-shirts.jpg";
import { 
  FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes, 
  FaHome, FaInfoCircle, FaEnvelope, FaInstagram, 
  FaTwitter, FaFacebookF, FaUserCircle, FaEye, FaEyeSlash,
  FaHeart
} from "react-icons/fa";

const LandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    mobile: "",
    password: "",
    verificationCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
    fetchCategoryProducts();
    fetchFeaturedProducts();
    
    // Set up session check every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8085/api/users/check-session", {
        withCredentials: true
      });
      if (response.data.status === "active") {
        setUserLoggedIn(true);
        setCurrentUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        setUserLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      setUserLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      const categories = ["T-Shirts", "Shirts", "Hoodies", "Formals", "Casuals", "Party Wear", "Trending"];
      const productsByCategory = {};
      
      for (const category of categories) {
        const res = await axios.get(`http://localhost:8085/api/admin/products/category/${category}`);
        productsByCategory[category] = res.data;
      }
      
      setCategoryProducts(productsByCategory);
    } catch (error) {
      console.error("Error fetching category products:", error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8085/api/admin/products");
      const shuffled = res.data.sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 3));
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
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
      }, { withCredentials: true });
      
      if (res.data.status === "success") {
        alert(res.data.message);
        setUserLoggedIn(true);
        setCurrentUser(res.data.data);
        setModalOpen(false);
        localStorage.setItem("user", JSON.stringify(res.data.data));
        
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
      }, { withCredentials: true });
      
      if (res.data.status === "success") {
        alert("Login successful!");
        setUserLoggedIn(true);
        setCurrentUser(res.data.data);
        setModalOpen(false);
        localStorage.setItem("user", JSON.stringify(res.data.data));

        if (res.data.data.isAdmin) {
          navigate("/adminpage");
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8085/api/users/logout", {}, { withCredentials: true });
      setUserLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem("user");
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${searchQuery}`);
  };

  const handleBuyNow = () => {
    if (!userLoggedIn) {
      setModalOpen(true);
      setIsLogin(true);
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="landing-page">
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
          <button className="icon-btn" onClick={() => navigate("/wishlist")}>
            <FaHeart />
            {/* <span>Wishlist</span> */}
          </button>
          <button className="icon-btn">
            <FaShoppingCart />
            {/* <span>Cart</span> */}
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
                  <input type="text" name="identifier" placeholder="Username or Mobile Number" value={loginData.identifier} onChange={handleLoginChange} required />
                </div>
                <div className="form-group password-input">
                  <input 
                    type={showLoginPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={loginData.password} 
                    onChange={handleLoginChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button type="submit" className="auth-btn">Login</button>
                <p className="auth-switch">Don't have an account? <span onClick={() => setIsLogin(false)}>Sign Up</span></p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <h2>Create Account</h2>
                <div className="form-group">
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div className="form-group password-input">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="form-group">
                  <input type="text" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleInputChange} required maxLength="10" />
                  <button type="button" className="otp-btn" onClick={generateVerificationCode} disabled={!formData.mobile || formData.mobile.length !== 10 || countdown > 0}>
                    {countdown > 0 ? `Resend in ${countdown}s` : "Get Verification Code"}
                  </button>
                </div>
                <div className="form-group">
                  <input type="text" name="verificationCode" placeholder="Enter Verification Code" value={formData.verificationCode} onChange={handleInputChange} required disabled={!codeSent} maxLength="4" />
                  <button type="button" className="verify-btn" onClick={verifyCode} disabled={!formData.verificationCode}>Verify Code</button>
                </div>
                {codeVerified && <p className="otp-success">✓ Verification Successful</p>}
                <button type="submit" className="auth-btn" disabled={!codeVerified}>Sign Up</button>
                <p className="auth-switch">Already have an account? <span onClick={() => setIsLogin(true)}>Login</span></p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Category bar */}
      <div className="category-bar">
        {["T-Shirts", "Shirts", "Hoodies", "Formals", "Casuals", "Party Wear", "Trending"].map(category => (
          <div key={category} className="category-item" onClick={() => handleCategoryClick(category)}>
            <img src={tshirtImg} alt={category} />
            <span>{category} ({categoryProducts[category] ? categoryProducts[category].length : 0})</span>
          </div>
        ))}
      </div>

      <section className="hero">
        <div className="hero-content">
          <h1>Elevate Your Style</h1>
          <p>Discover the latest trends in fashion with GenZfits</p>
          <button className="cta-button" onClick={() => navigate("/products")}>Shop Now</button>
          <button className="cta-button secondary" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </section>

      <section className="featured-products">
        <h2>Top Rated For You</h2>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div key={product.id} className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="product-image">
                {product.images && product.images.length > 0 ? (
                  <img src={`http://localhost:8085${product.images[0]}`} alt={product.name} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400/CCCCCC/FFFFFF?text=No+Image'; }} />
                ) : (
                  <div className="placeholder-image"></div>
                )}
              </div>
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest updates and offers</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </section>

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

export default LandingPage;