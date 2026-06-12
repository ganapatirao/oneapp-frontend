import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, X as CloseIcon } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(role === 'Admin');
      setUserRole(role || 'User');
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

  const loadProducts = async () => {
    try {
      const response = await shoppingApi.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
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

    // Redirect user role to checkout after login
    if (role === 'User') {
      setShowCheckout(true);
    }
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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await shoppingApi.getProducts();
      const allProducts = response.data;
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase()) ||
        product.category?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const Navigation = () => {
    const navigate = useNavigate();

    return (
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <Search size={20} sm={24} className="text-white" />
              </button>
              <button
                onClick={() => setShowCartModal(true)}
                className="relative p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                <ShoppingCart size={20} sm={24} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <span className="text-xl sm:text-2xl font-bold text-white">OA</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold text-white hidden sm:block">OneApp</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link to="/" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Home</Link>
              <Link to="/shopping" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Shopping</Link>
              {(userRole === 'Advertiser' || userRole === 'Admin') && (
                <Link to="/advertising" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Advertising</Link>
              )}
              {(userRole === 'Recruiter' || userRole === 'Admin') && (
                <Link to="/recruitment" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Recruitment</Link>
              )}
              {(userRole === 'BookingAgent' || userRole === 'Admin') && (
                <Link to="/booking" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Booking</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium">Admin</Link>
              )}
            </div>

            <div className="hidden md:flex items-center">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-300 backdrop-blur-sm text-white font-medium"
                >
                  <LogOut size={18} sm={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 bg-white text-blue-600 hover:bg-white/90 px-4 py-2 rounded-xl transition-all duration-300 font-bold shadow-lg"
                >
                  <User size={18} sm={20} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              {mobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20 backdrop-blur-sm bg-black/20">
              <div className="flex flex-col space-y-3">
                <Link to="/" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/shopping" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Shopping</Link>
                {(userRole === 'Advertiser' || userRole === 'Admin') && (
                  <Link to="/advertising" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Advertising</Link>
                )}
                {(userRole === 'Recruiter' || userRole === 'Admin') && (
                  <Link to="/recruitment" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Recruitment</Link>
                )}
                {(userRole === 'BookingAgent' || userRole === 'Admin') && (
                  <Link to="/booking" className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium" onClick={() => setMobileMenuOpen(false)}>Booking</Link>
                )}
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

        {/* Search Dropdown */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, services..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  autoFocus
                />
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Search Results</h3>
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchResults([]);
                        // Store selected product in localStorage for Shopping component to open modal
                        localStorage.setItem('selectedProductId', product.id);
                        window.location.href = '/shopping';
                      }}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-500">{product.category}</p>
                        <p className="text-sm font-semibold text-blue-600">₹{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="mt-4 text-gray-500 text-center">No results found</p>
              )}
            </div>
          </div>
        )}
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
