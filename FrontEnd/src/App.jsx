// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductsPage from './pages/productspage';
import LandingPage from './pages/landingpage';
import AdminPage from './pages/adminpage';
import ItemPage from './pages/itempage';
import CheckoutPage from './pages/checkoutpage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ItemPage />} />
        <Route path="/adminpage" element={<AdminPage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> {/* Changed from /checkoutpage to /checkout */}
      </Routes>
    </Router>
  );
}

export default App;