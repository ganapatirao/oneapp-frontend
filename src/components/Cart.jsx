import { useState, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { shoppingApi } from '../services/api';

export default function Cart({ onCartChange, onProceedToCheckout }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  useEffect(() => {
    loadCart();
    loadProducts();
  }, []);

  const loadCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await shoppingApi.getCart(userId);
        setCart(response.data);
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

  const handleUpdateQuantity = async (cartItem, delta) => {
    try {
      const newQuantity = cartItem.quantity + delta;
      if (newQuantity <= 0) {
        await shoppingApi.removeFromCart(cartItem.id);
      } else {
        await shoppingApi.addToCart({
          userId: cartItem.userId,
          productId: cartItem.productId,
          quantity: delta,
          sizeOptionName: cartItem.sizeOptionName,
          price: cartItem.price
        });
      }
      loadCart();
      onCartChange();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await shoppingApi.removeFromCart(cartItemId);
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

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const originalSubtotal = cartItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
  const totalDiscount = originalSubtotal - subtotal;
  const shipping = subtotal > 0 ? 99 : 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500">Add items to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Cart Items</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => {
                    const isExpanded = expandedDescriptions[item.id];
                    const shortDesc = item.product?.description && item.product.description.length > 100 ? item.product.description.substring(0, 100) + '...' : item.product?.description;
                    return (
                    <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                      <img
                        src={item.product?.imageUrl}
                        alt={item.product?.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-lg">{item.product?.name}</p>
                        {item.sizeOptionName && (
                          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold mb-2">
                            {item.sizeOptionName}
                          </span>
                        )}
                        {item.product?.offerPercentage > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">{item.product.offerPercentage}% OFF</span>
                          </div>
                        )}
                        <div className="mb-2">
                          <p className="text-sm text-gray-500">
                            {isExpanded ? item.product?.description : shortDesc}
                          </p>
                          {item.product?.description && item.product.description.length > 100 && (
                            <button
                              onClick={() => setExpandedDescriptions(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                              className="text-blue-600 text-xs font-semibold mt-1 hover:text-blue-800 transition-colors"
                            >
                              {isExpanded ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, -1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item, 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">{formatPrice(item.itemPrice)} per item</p>
                        {item.originalPrice !== item.itemPrice && (
                          <p className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice * item.quantity)}</p>
                        )}
                        <p className="font-semibold text-gray-800 text-lg">{formatPrice(item.totalPrice)}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2">
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-gray-600">Original Subtotal</span>
                      <span className="font-medium line-through">{formatPrice(originalSubtotal)}</span>
                    </div>
                  )}
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="text-gray-600">You Save</span>
                      <span className="font-bold">-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium">{formatPrice(tax)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onProceedToCheckout}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
