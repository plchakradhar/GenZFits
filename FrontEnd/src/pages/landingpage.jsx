import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";   // ✅ Added
import "../pages_css/landingpage.css";
import GenZFits from "../assets/GenZFits_logo.png";
import tshirtImg from "../assets/t-shirts.jpg";
import { 
  FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes, 
  FaHome, FaInfoCircle, FaEnvelope, FaInstagram, 
  FaTwitter, FaFacebookF, FaUserCircle 
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
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  const navigate = useNavigate();   // ✅ Added

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUserLoggedIn(true);
      const parsed = JSON.parse(userData);
      setCurrentUser(parsed);
    }
  }, []);

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

        // ✅ Redirect logic
        if (res.data.data.isAdmin) {
          navigate("/adminpage");   // Admins → Admin page
        } else {
          navigate("/"); // Normal users → Landing page
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
    navigate("/landingpage");   // ✅ Ensure logout returns to landing
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <img src={GenZFits} alt="Logo" />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search products..." />
          <button className="search-btn">
            <FaSearch />
          </button>
        </div>
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
                  <input type="text" name="identifier" placeholder="Username or Mobile Number" value={loginData.identifier} onChange={handleLoginChange} required />
                </div>
                <div className="form-group">
                  <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
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
                <div className="form-group">
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
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

      {/* Category bar, hero, featured products, newsletter, footer (unchanged content) */}
      <div className="category-bar">
        <div className="category-item"><img src={tshirtImg} alt="Fashion" /><span>T-Shirts</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Shirts" /><span>Shirts</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Hoodies" /><span>Hoodies</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Formals" /><span>Formals</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Casuals" /><span>Casuals</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Party Wear" /><span>Party Wear</span></div>
        <div className="category-item"><img src={tshirtImg} alt="Trending" /><span>Trending</span></div>
      </div>

      <section className="hero">
        <div className="hero-content">
          <h1>Elevate Your Style</h1>
          <p>Discover the latest trends in fashion with GenZfits</p>
          <button className="cta-button">Shop Now</button>
        </div>
      </section>

      <section className="featured-products">
        <h2>Top Rated For You</h2>
        <div className="products-grid">
          <div className="product-card"><div className="product-image"></div><h3>Urban Jacket</h3><p>$89.99</p></div>
          <div className="product-card"><div className="product-image"></div><h3>Streetwear Hoodie</h3><p>$59.99</p></div>
          <div className="product-card"><div className="product-image"></div><h3>Casual Sneakers</h3><p>$79.99</p></div>
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
