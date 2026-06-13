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
import Footer from './components/Footer';
import { shoppingApi, adminApi } from './services/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('');
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
      setUserRole(role || 'User');
      loadCart();
    }
  }, []);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await shoppingApi.getCart(userId);
        setCartItems(response.data);
        setCartCount(response.data.length);
      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCartItems(guestCart);
        setCartCount(guestCart.length);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };


  const handleLogin = async (role) => {
    setIsLoggedIn(true);
    setIsAdmin(role === 'Admin');
    setUserRole(role || 'User');

    // Merge guest cart to user cart
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length > 0) {
      const userId = localStorage.getItem('userId');
      for (const item of guestCart) {
        try {
          await shoppingApi.addToCart({
            userId,
            productId: item.productId,
            quantity: item.quantity,
            sizeOptionName: item.sizeOptionName,
            colorVariantName: item.colorVariantName,
            price: item.price
          });
        } catch (error) {
          console.error('Error merging cart item:', error);
        }
      }
      localStorage.removeItem('guestCart');
    }

    loadCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserRole('');
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
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowCartModal(true)}
                className="relative p-3 sm:p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
              >
                <ShoppingCart size={28} sm={32} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-105">
                  <span className="text-xl sm:text-2xl font-bold text-white">OA</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold text-white hidden sm:block group-hover:scale-105 transition-transform duration-300">OneApp</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link to="/" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Home</Link>
              <Link to="/shopping" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Shopping</Link>
              <Link to="/advertising" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Advertising</Link>
              <Link to="/recruitment" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Recruitment</Link>
              <Link to="/booking" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Booking</Link>
              {isAdmin && (
                <Link to="/admin" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium hover:scale-105">Admin</Link>
              )}
            </div>

            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm text-white font-medium hover:scale-105"
                >
                  <LogOut size={18} sm={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-white/90 px-4 py-2 rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <User size={18} sm={20} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm hover:scale-105"
            >
              {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20 backdrop-blur-sm bg-black/20">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/shopping" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Shopping</Link>
                <Link to="/advertising" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Advertising</Link>
                <Link to="/recruitment" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Recruitment</Link>
                <Link to="/booking" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Booking</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                )}
                <div className="px-4">
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm text-white font-medium"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-white/90 px-4 py-2 rounded-xl transition-all duration-300 font-bold shadow-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} />
                      <span>Login</span>
                    </Link>
                  )}
                </div>
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
        <Route path="/advertising" element={<Advertising userRole={userRole} />} />
        <Route path="/recruitment" element={<Recruitment userRole={userRole} />} />
        <Route path="/booking" element={<Booking userRole={userRole} />} />
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
              <Cart onCartChange={refreshCart} onProceedToCheckout={handleProceedToCheckout} hideTitle={true} />
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout onClose={() => setShowCheckout(false)} onOrderSuccess={handleOrderSuccess} />
      )}

      <Footer />
    </Router>
  );
}

export default App;
