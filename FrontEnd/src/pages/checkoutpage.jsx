import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../pages_css/checkoutpage.css";
import GenZFits from "../assets/GenZFits_logo.png";
import { FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes, FaHome, FaInfoCircle, FaEnvelope, FaInstagram, FaTwitter, FaFacebookF, FaUserCircle, FaCreditCard, FaMapMarkerAlt, FaPhone, FaEnvelopeOpen, FaLock, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout states
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: ""
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: ""
  });
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review, 4: Confirmation

  useEffect(() => {
    checkSession();
    initializeCheckout();
  }, []);

  const checkSession = async () => {
    try {
      const response = await axios.get("http://localhost:8085/api/users/check-session", {
        withCredentials: true
      });
      if (response.data.status === "active") {
        setUserLoggedIn(true);
        setCurrentUser(response.data.user);
        // Pre-fill shipping info with user data
        setShippingInfo(prev => ({
          ...prev,
          fullName: response.data.user.fullName || "",
          email: response.data.user.username + "@example.com" || "",
          phone: response.data.user.mobile || ""
        }));
      } else {
        // Redirect to login if not authenticated
        navigate('/');
      }
    } catch (error) {
      navigate('/');
    }
  };

  const initializeCheckout = () => {
    // Get product from navigation state or cart
    const product = location.state?.product;
    const quantity = location.state?.quantity || 1;
    const selectedSize = location.state?.selectedSize || "M";
    
    if (product) {
      const items = [{
        ...product,
        quantity,
        selectedSize,
        itemTotal: product.price * quantity
      }];
      
      setCheckoutItems(items);
      
      const subtotal = items.reduce((sum, item) => sum + item.itemTotal, 0);
      const shipping = subtotal > 500 ? 0 : 40;
      const tax = subtotal * 0.18; // 18% tax
      const total = subtotal + shipping + tax;
      
      setOrderSummary({
        subtotal,
        shipping,
        tax,
        total
      });
    }
    
    setLoading(false);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    // Format card number and expiry date
    let formattedValue = value;
    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
    }
    setPaymentInfo(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate shipping info
      if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || 
          !shippingInfo.state || !shippingInfo.zipCode || !shippingInfo.phone) {
        alert("Please fill in all shipping information");
        return;
      }
    } else if (currentStep === 2) {
      // Validate payment info
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || 
          !paymentInfo.cvv || !paymentInfo.nameOnCard) {
        alert("Please fill in all payment information");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePlaceOrder = async () => {
    try {
      // Simulate order processing
      const orderData = {
        items: checkoutItems,
        shippingInfo,
        paymentInfo: {
          ...paymentInfo,
          cardNumber: paymentInfo.cardNumber.replace(/\s/g, "").slice(-4) // Store only last 4 digits
        },
        orderSummary,
        userId: currentUser.id,
        status: "confirmed"
      };
      
      // In a real application, you would send this to your backend
      console.log("Order placed:", orderData);
      
      // Show confirmation
      setCurrentStep(4);
      
      // Clear cart/local storage if needed
      setTimeout(() => {
        navigate('/');
      }, 5000);
      
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error processing your order. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8085/api/users/logout", {}, { withCredentials: true });
      setUserLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading checkout...</div>;
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>No items to checkout</h2>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <header className="header">
        <div className="logo" onClick={() => navigate("/")}>
          <img src={GenZFits} alt="Logo" />
        </div>
        <div className="checkout-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Shipping</p>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Payment</p>
          </div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Review</p>
          </div>
          <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
            <span>4</span>
            <p>Confirmation</p>
          </div>
        </div>
        <div className="icons">
          <button className="icon-btn">
            <FaUserCircle />
            <span>{currentUser?.username}</span>
          </button>
        </div>
      </header>

      <div className="checkout-container">
        {currentStep < 4 ? (
          <div className="checkout-content">
            <div className="checkout-form">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <div className="form-step">
                  <h2><FaMapMarkerAlt /> Shipping Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>ZIP Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingInfo.zipCode}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div className="form-step">
                  <h2><FaCreditCard /> Payment Information</h2>
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Name on Card *</label>
                      <input
                        type="text"
                        name="nameOnCard"
                        value={paymentInfo.nameOnCard}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <div className="form-step">
                  <h2><FaCheckCircle /> Order Review</h2>
                  <div className="order-review">
                    <div className="review-section">
                      <h3>Shipping Information</h3>
                      <p><strong>{shippingInfo.fullName}</strong></p>
                      <p>{shippingInfo.address}</p>
                      <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                      <p>Phone: {shippingInfo.phone}</p>
                      <p>Email: {shippingInfo.email}</p>
                    </div>
                    
                    <div className="review-section">
                      <h3>Payment Information</h3>
                      <p><strong>{paymentInfo.nameOnCard}</strong></p>
                      <p>Card: **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                      <p>Expires: {paymentInfo.expiryDate}</p>
                    </div>
                    
                    <div className="review-section">
                      <h3>Order Items</h3>
                      {checkoutItems.map((item, index) => (
                        <div key={index} className="review-item">
                          <img src={`http://localhost:8085${item.images[0]}`} alt={item.name} />
                          <div className="item-details">
                            <h4>{item.name}</h4>
                            <p>Size: {item.selectedSize}</p>
                            <p>Qty: {item.quantity}</p>
                          </div>
                          <div className="item-price">₹{item.itemTotal}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="summary-item">
                    <img src={`http://localhost:8085${item.images[0]}`} alt={item.name} />
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Size: {item.selectedSize}</p>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-total">₹{item.itemTotal}</div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="total-line">
                  <span>Subtotal:</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Shipping:</span>
                  <span>₹{orderSummary.shipping.toFixed(2)}</span>
                </div>
                <div className="total-line">
                  <span>Tax (18%):</span>
                  <span>₹{orderSummary.tax.toFixed(2)}</span>
                </div>
                <div className="total-line grand-total">
                  <span>Total:</span>
                  <span>₹{orderSummary.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="checkout-actions">
                {currentStep > 1 && (
                  <button 
                    className="btn-secondary" 
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    Back
                  </button>
                )}
                {currentStep < 3 ? (
                  <button className="btn-primary" onClick={handleNextStep}>
                    Continue to {currentStep === 1 ? 'Payment' : 'Review'}
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handlePlaceOrder}>
                    Place Order
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Step 4: Order Confirmation */
          <div className="order-confirmation">
            <div className="confirmation-content">
              <FaCheckCircle className="success-icon" />
              <h2>Order Confirmed!</h2>
              <p>Thank you for your purchase, {currentUser?.fullName}!</p>
              <p>Your order has been successfully placed and will be shipped soon.</p>
              <p>A confirmation email has been sent to {shippingInfo.email}</p>
              
              <div className="confirmation-details">
                <h3>Order Details</h3>
                <p><strong>Order Total:</strong> ₹{orderSummary.total.toFixed(2)}</p>
                <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                <p><strong>Shipping Address:</strong> {shippingInfo.address}, {shippingInfo.city}</p>
              </div>
              
              <div className="confirmation-actions">
                <button className="btn-primary" onClick={() => navigate('/products')}>
                  Continue Shopping
                </button>
                <button className="btn-secondary" onClick={() => navigate('/')}>
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;