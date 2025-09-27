// src/pages/itempage.jsx (This is the same as above, but included again for completeness as it's modified)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages_css/itempage.css";
import { FaHeart, FaShare, FaStar, FaShoppingCart, FaArrowLeft, FaCheck, FaTruck, FaShieldAlt, FaUndo, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8085/api/admin/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      if (error.response) {
        console.error("Response error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received (CORS or server down?):", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8085/api/admin/products");
      const related = res.data.filter(p => p.category === product?.category && p.id !== product.id).slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const navigateImage = (direction) => {
    if (!product || !product.images || product.images.length === 0) return;
    if (direction === "next") {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    } else {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  const toggleWishlist = () => {
    setWishlisted(!wishlisted);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }
    alert(`Added ${quantity} ${product.name} (Size: ${selectedSize}) to cart!`);
  };

// In your ItemPage component - fix the handleBuyNow function
const handleBuyNow = () => {
  if (!selectedSize) {
    alert("Please select a size first");
    return;
  }
  
  // Navigate to checkout page with product data
  navigate('/checkout', { 
    state: { 
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images, // Make sure this is 'images' (plural)
        selectedSize: selectedSize, // Changed from 'size' to 'selectedSize'
        quantity: quantity
      },
      quantity: quantity, // Also pass quantity separately if needed
      selectedSize: selectedSize // And selectedSize separately
    }
  });
};

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="item-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      <div className="product-detail-container">
        <div className="product-images">
          {product.images && product.images.length > 0 ? (
            <>
              <div className="main-image">
                <img src={`http://localhost:8085${product.images[currentImageIndex]}`} alt={product.name} loading="lazy" onError={() => console.log("Image failed to load")} />
                {product.images.length > 1 && (
                  <>
                    <button className="nav-button prev" onClick={() => navigateImage("prev")}>
                      <FaChevronLeft />
                    </button>
                    <button className="nav-button next" onClick={() => navigateImage("next")}>
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>
              <div className="thumbnail-container">
                {product.images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={`http://localhost:8085${img}`} alt={`${product.name} view ${index + 1}`} loading="lazy" onError={() => console.log("Thumbnail failed to load")} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={i < (product.rating || 0) ? "star-filled" : "star-empty"} 
                />
              ))}
            </div>
            <span className="rating-value">{product.rating || 0}/5</span>
            <span className="review-count">({product.reviewCount || 0} reviews)</span>
          </div>
          <div className="price-section">
            <span className="current-price">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
            {product.discount && (
              <span className="discount-badge">{product.discount}% OFF</span>
            )}
          </div>
          {product.assured && (
            <div className="assured-badge">
              <FaCheck /> 🌟 Assured
            </div>
          )}
          <div className="size-section">
            <h3>Select Size</h3>
            <div className="size-options">
              {product.sizes && product.sizes.map(size => (
                <button 
                  key={size} 
                  className={`size-option ${selectedSize === size ? "selected" : ""}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="quantity-section">
            <h3>Quantity</h3>
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>
          <div className="action-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FaShoppingCart /> Add to Cart
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
            <button 
              className={`wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
              onClick={toggleWishlist}
            >
              <FaHeart />
            </button>
          </div>
          <div className="delivery-options">
            <div className="delivery-option">
              <FaTruck />
              <div>
                <h4>Free Delivery</h4>
                <p>Enter your postal code for delivery availability</p>
              </div>
            </div>
            <div className="delivery-option">
              <FaUndo />
              <div>
                <h4>Return Policy</h4>
                <p>30 days return policy. Terms apply</p>
              </div>
            </div>
            <div className="delivery-option">
              <FaShieldAlt />
              <div>
                <h4>Warranty</h4>
                <p>1 year manufacturer warranty</p>
              </div>
            </div>
          </div>
          <div className="share-section">
            <span>Share this product:</span>
            <button className="share-btn">
              <FaShare />
            </button>
          </div>
        </div>
      </div>

      <div className="product-details">
        <div className="details-tabs">
          <button className="tab active">Product Description</button>
          <button className="tab">Specifications</button>
          <button className="tab">Reviews ({product.reviewCount || 0})</button>
        </div>
        <div className="tab-content">
          <h3>About this item</h3>
          <p>{product.description || "No description available for this product."}</p>
          <div className="features-list">
            <h4>Key Features:</h4>
            <ul>
              <li>Premium quality material</li>
              <li>Comfortable fit</li>
              <li>Modern design</li>
              <li>Durable construction</li>
            </ul>
          </div>
          <div className="note-section">
            <h4>Note:</h4>
            <p>Product color may vary slightly due to photographic lighting sources or your monitor settings.</p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>You might also like</h2>
          <div className="related-products-grid">
            {relatedProducts.map(product => (
              <div 
                key={product.id} 
                className="related-product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="related-product-image">
                  {product.images && product.images.length > 0 ? (
                    <img src={`http://localhost:8085${product.images[0]}`} alt={product.name} loading="lazy" onError={() => console.log("Related image failed to load")} />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>
                <div className="related-product-info">
                  <h3>{product.name}</h3>
                  <p className="related-product-category">{product.category}</p>
                  <p className="related-product-price">₹{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemPage;