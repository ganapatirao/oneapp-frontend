import { CreditCard as PaymentIcon, MessageCircle, Truck } from 'lucide-react';
import { validationApi } from '../../services/api';

const PaymentStep = ({ paymentInfo, setPaymentInfo, errors, setErrors }) => {
  const handleChange = (field, value) => {
    setPaymentInfo({ ...paymentInfo, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
        <PaymentIcon size={28} className="mr-3 text-green-600" />
        Payment Information
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-300 transition-all duration-300 ${paymentInfo.paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <input
                type="radio"
                value="cod"
                checked={paymentInfo.paymentMethod === 'cod'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <Truck size={24} className="mr-3 text-green-600" />
              <div>
                <span className="font-medium block">Cash on Delivery</span>
                <span className="text-xs text-gray-500">Pay when you receive</span>
              </div>
            </label>
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-300 transition-all duration-300 ${paymentInfo.paymentMethod === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <input
                type="radio"
                value="whatsapp"
                checked={paymentInfo.paymentMethod === 'whatsapp'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <MessageCircle size={24} className="mr-3 text-green-600" />
              <div>
                <span className="font-medium block">WhatsApp Payment</span>
                <span className="text-xs text-gray-500">Secure payment via WhatsApp</span>
              </div>
            </label>
          </div>
        </div>

        {paymentInfo.paymentMethod === 'whatsapp' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
              <MessageCircle size={20} className="mr-2" />
              WhatsApp Payment Instructions
            </h4>
            <div className="space-y-3 text-green-700">
              <p>1. Send your payment to <strong>+91 7737005858</strong> via WhatsApp</p>
              <p>2. Include your order ID in the message</p>
              <p>3. We'll confirm your payment and process your order</p>
              <a
                href="https://wa.me/917737005858?text=Hello, I want to make a payment for my order"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mt-4"
              >
                <MessageCircle size={20} className="mr-2" />
                Open WhatsApp
              </a>
            </div>
          </div>
        )}

        {paymentInfo.paymentMethod === 'cod' && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
              <Truck size={20} className="mr-2" />
              Cash on Delivery Details
            </h4>
            <div className="space-y-3 text-blue-700">
              <p>• Pay in cash when your order is delivered</p>
              <p>• No additional charges for COD</p>
              <p>• Please keep exact change ready</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
