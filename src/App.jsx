import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import HomePage from './components/HomePage';
import Shopping from './components/Shopping';
import Advertising from './components/Advertising';
import Recruitment from './components/Recruitment';
import Booking from './components/Booking';
import AdminDashboard from './components/admin/AdminDashboard';
import AgentDashboard from './components/admin/AgentDashboard';
import Login from './components/Login';
import Register from './components/Register';
import PasswordReset from './components/PasswordReset';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { shoppingApi, adminApi } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'Admin');
      loadCart();
    }
    loadProducts();
  }, []);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await shoppingApi.getCart(userId);
        setCartItems(response.data);
        setCartCount(response.data.length);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await shoppingApi.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleLogin = (role) => {
    setIsLoggedIn(true);
    setIsAdmin(role === 'Admin');
    loadCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCartCount(0);
    setCartItems([]);
    window.location.href = '/';
  };

  const handleRemoveFromCart = async (itemId) => {
    try {
      await shoppingApi.removeFromCart(itemId);
      loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const refreshCart = () => {
    loadCart();
  };

  const handleProceedToCheckout = () => {
    setShowCartModal(false);
    setShowCheckout(true);
  };

  const handleOrderSuccess = () => {
    setShowCheckout(false);
    loadCart();
  };

  const Navigation = () => {
    const navigate = useNavigate();

    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">Business Platform</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
              <Link to="/shopping" className="text-gray-700 hover:text-blue-600 transition-colors">Shopping</Link>
              <Link to="/advertising" className="text-gray-700 hover:text-blue-600 transition-colors">Advertising</Link>
              <Link to="/recruitment" className="text-gray-700 hover:text-blue-600 transition-colors">Recruitment</Link>
              <Link to="/booking" className="text-gray-700 hover:text-blue-600 transition-colors">Booking</Link>
              {isAdmin && (
                <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">Admin</Link>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => setShowCartModal(true)}
                className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <User size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/shopping" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Shopping</Link>
                <Link to="/advertising" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Advertising</Link>
                <Link to="/recruitment" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Recruitment</Link>
                <Link to="/booking" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Booking</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                )}
                {isLoggedIn ? (
                  <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600 transition-colors text-left">Logout</button>
                ) : (
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    );
  };

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shopping" element={<Shopping onCartChange={refreshCart} />} />
        <Route path="/advertising" element={<Advertising />} />
        <Route path="/recruitment" element={<Recruitment />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<PasswordReset />} />
      </Routes>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center relative z-20">
              <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
              <button onClick={() => setShowCartModal(false)} className="relative z-30 text-gray-500 hover:text-gray-700 text-2xl font-bold px-2 py-1 hover:bg-gray-100 rounded transition-colors">
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Cart onCartChange={refreshCart} onProceedToCheckout={handleProceedToCheckout} />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout onClose={() => setShowCheckout(false)} onOrderSuccess={handleOrderSuccess} />
      )}
    </Router>
  );
}

export default App;
