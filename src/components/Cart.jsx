import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Sparkles, Package, ShieldCheck, Truck } from 'lucide-react';
import { shoppingApi } from '../services/api';

export default function Cart({ onCartChange, onProceedToCheckout, hideTitle = false }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [config, setConfig] = useState({ shippingCost: 99, taxRate: 0.18 });

  useEffect(() => {
    loadCart();
    loadProducts();
    loadConfig();
  }, []);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await shoppingApi.getCart(userId);
        setCart(response.data);
      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCart(guestCart);
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

  const loadConfig = async () => {
    try {
      const response = await shoppingApi.getConfig();
      setConfig(response.data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleUpdateQuantity = async (cartItem, delta) => {
    try {
      const userId = localStorage.getItem('userId');
      const newQuantity = cartItem.quantity + delta;
      
      if (userId) {
        // Logged in user - update in database
        if (newQuantity <= 0) {
          await shoppingApi.removeFromCart(cartItem.id);
        } else {
          await shoppingApi.addToCart({
            userId: cartItem.userId,
            productId: cartItem.productId,
            quantity: delta,
            sizeOptionName: cartItem.sizeOptionName,
            colorVariantName: cartItem.colorVariantName,
            price: cartItem.price
          });
        }
      } else {
        // Guest user - update in localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const itemIndex = guestCart.findIndex(item =>
          item.productId === cartItem.productId &&
          item.colorVariantName === cartItem.colorVariantName &&
          item.sizeOptionName === cartItem.sizeOptionName
        );
        
        if (itemIndex >= 0) {
          if (newQuantity <= 0) {
            guestCart.splice(itemIndex, 1);
          } else {
            guestCart[itemIndex].quantity = newQuantity;
            guestCart[itemIndex].totalPrice = guestCart[itemIndex].itemPrice * newQuantity;
          }
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
        }
      }
      
      loadCart();
      onCartChange();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItem) => {
    try {
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        // Logged in user - remove from database
        await shoppingApi.removeFromCart(cartItem.id);
      } else {
        // Guest user - remove from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const itemIndex = guestCart.findIndex(item =>
          item.productId === cartItem.productId &&
          item.colorVariantName === cartItem.colorVariantName &&
          item.sizeOptionName === cartItem.sizeOptionName
        );
        if (itemIndex >= 0) {
          guestCart.splice(itemIndex, 1);
          localStorage.setItem('guestCart', JSON.stringify(guestCart));
        }
      }
      
      loadCart();
      onCartChange();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const cartItems = cart.map((item) => {
    const product = products.find(p => p.id === item.productId);
    const originalPrice = product?.price || 0;
    // Use the price from cart item (calculated by backend) instead of recalculating
    const itemPrice = item.price || 0;
    return {
      ...item,
      product,
      originalPrice,
      itemPrice,
      totalPrice: itemPrice * item.quantity
    };
  });

  const subtotal = Math.ceil(cartItems.reduce((sum, item) => sum + item.totalPrice, 0));
  const originalSubtotal = Math.ceil(cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0));
  const totalDiscount = originalSubtotal - subtotal;
  const shipping = subtotal > 0 ? config.shippingCost : 0;
  const tax = Math.ceil(subtotal * config.taxRate);
  const total = Math.ceil(subtotal + shipping + tax);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {!hideTitle && (
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-xl">
              <ShoppingCart className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Shopping Cart</h1>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-purple-600 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Add items to get started with your shopping journey</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="text-purple-600 w-5 h-5" />
                  <h2 className="text-xl font-bold text-gray-900">Cart Items ({cartItems.length})</h2>
                </div>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const isExpanded = expandedDescriptions[item.id];
                    const shortDesc = item.product?.description && item.product.description.length > 80 ? item.product.description.substring(0, 80) + '...' : item.product?.description;
                    return (
                    <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 hover:bg-purple-50/50 rounded-xl p-3 transition-colors group">
                      <div className="relative">
                        <img
                          src={item.product?.imageUrl}
                          alt={item.product?.name}
                          className="w-24 h-24 object-cover rounded-xl bg-gray-100 group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.offerPercentage > 0 && (
                          <div className="absolute top-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-tl-xl rounded-br-lg text-xs font-bold">
                            {item.offerPercentage}% OFF
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">{item.product?.name}</p>
                        <div className="flex gap-2 mb-2">
                          {item.colorVariantName && (
                            <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                              {item.colorVariantName}
                            </span>
                          )}
                          {item.sizeOptionName && (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                              {item.sizeOptionName}
                            </span>
                          )}
                        </div>
                        {item.product?.offerPercentage > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">{item.product.offerPercentage}% OFF</span>
                          </div>
                        )}
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {isExpanded ? item.product?.description : shortDesc}
                          </p>
                          {item.product?.description && item.product.description.length > 80 && (
                            <button
                              onClick={() => setExpandedDescriptions(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                              className="text-gray-600 text-xs font-medium mt-1 hover:text-gray-900"
                            >
                              {isExpanded ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, -1)}
                              className="w-7 h-7 rounded border border-gray-300 hover:border-gray-400 flex items-center justify-center"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item, 1)}
                              className="w-7 h-7 rounded border border-gray-300 hover:border-gray-400 flex items-center justify-center"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-gray-500 hover:text-red-600 flex items-center gap-1 text-xs"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{formatPrice(item.itemPrice)}</p>
                        {item.originalPrice !== item.itemPrice && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                        )}
                        <p className="font-semibold text-gray-900">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-lg sticky top-4">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="text-purple-600 w-5 h-5" />
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount</span>
                      <span className="font-semibold text-green-600">-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Truck size={14} className="text-purple-600" />
                      Shipping
                    </span>
                    <span className="font-semibold text-gray-900">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-purple-600" />
                      Tax (18%)
                    </span>
                    <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-4 mt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const userId = localStorage.getItem('userId');
                    if (!userId) {
                      alert('Please login to proceed to checkout');
                      window.location.href = '/login';
                    } else {
                      onProceedToCheckout();
                    }
                  }}
                  className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  Proceed to Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
