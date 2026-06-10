import { CheckCircle, ShoppingBag, Truck, Sparkles, Gift, Heart } from 'lucide-react';

const ConfirmStep = ({ orderId, onClose, onOrderSuccess }) => (
  <div className="text-center py-12">
    {/* Animated Success Icon */}
    <div className="relative inline-flex items-center justify-center mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
      <div className="relative inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300">
        <CheckCircle size={64} className="text-white" />
      </div>
      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
        <Sparkles size={20} className="text-white" />
      </div>
    </div>

    {/* Success Message */}
    <h2 className="text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
      Order Confirmed!
    </h2>
    <p className="text-gray-600 mb-2 text-lg">Thank you for your purchase.</p>
    
    {/* Order ID Display */}
    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 mx-auto max-w-md mb-8 shadow-lg">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <ShoppingBag className="text-green-600" size={20} />
        <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">Order ID</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 tracking-widest">{orderId}</p>
    </div>

    {/* Info Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Truck className="text-blue-600 mx-auto mb-2" size={32} />
        <p className="text-sm font-semibold text-blue-800">Free Shipping</p>
        <p className="text-xs text-blue-600">On all orders</p>
      </div>
      <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-4 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Gift className="text-purple-600 mx-auto mb-2" size={32} />
        <p className="text-sm font-semibold text-purple-800">Gift Wrapping</p>
        <p className="text-xs text-purple-600">Available on request</p>
      </div>
      <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-xl p-4 border border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
        <Heart className="text-red-600 mx-auto mb-2" size={32} />
        <p className="text-sm font-semibold text-red-800">Customer Care</p>
        <p className="text-xs text-red-600">24/7 Support</p>
      </div>
    </div>

    {/* Continue Shopping Button */}
    <button
      onClick={() => {
        onClose();
        onOrderSuccess();
      }}
      className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center mx-auto space-x-2"
    >
      <ShoppingBag size={24} />
      <span>Continue Shopping</span>
    </button>
  </div>
);

export default ConfirmStep;
