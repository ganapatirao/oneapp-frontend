import { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { shoppingApi } from '../services/api';
import ShippingStep from './checkout/ShippingStep';
import BillingStep from './checkout/BillingStep';
import PaymentStep from './checkout/PaymentStep';
import ReviewStep from './checkout/ReviewStep';
import ConfirmStep from './checkout/ConfirmStep';

const steps = ['shipping', 'billing', 'payment', 'review', 'confirm'];

export default function Checkout({ onClose, onOrderSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    sameAsShipping: true
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'cod'
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [config, setConfig] = useState({ shippingCost: 99, taxRate: 0.18 });
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    loadCart();
    loadProducts();
    loadStates();
    loadConfig();
  }, []);

  useEffect(() => {
    if (billingInfo.sameAsShipping) {
      setBillingInfo({
        ...billingInfo,
        fullName: shippingInfo.fullName,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode
      });
    }
  }, [shippingInfo, billingInfo.sameAsShipping]);

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

  const loadStates = async () => {
    try {
      const response = await shoppingApi.getStates();
      setStates(response.data);
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadDistricts = async (stateCode) => {
    try {
      const response = await shoppingApi.getDistricts(stateCode);
      setDistricts(response.data);
    } catch (error) {
      console.error('Error loading districts:', error);
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

  const cartItems = cart.map((item) => {
    const product = products.find(p => p.id === item.productId);
    // Use the price from cart item (already includes color/size adjustments) instead of base product price
    const itemPrice = item.price || 0;
    return {
      ...item,
      product,
      itemPrice,
      totalPrice: itemPrice * item.quantity
    };
  });

  const subtotal = Math.ceil(cartItems.reduce((sum, item) => sum + item.totalPrice, 0));
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

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) newErrors.email = 'Invalid email format';
    if (!shippingInfo.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(shippingInfo.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid Indian phone number (must start with 6, 7, 8, or 9)';
    if (!shippingInfo.address.trim()) newErrors.address = 'Address is required';
    if (!shippingInfo.city.trim()) newErrors.city = 'District is required';
    if (!shippingInfo.state.trim()) newErrors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) newErrors.zipCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(shippingInfo.zipCode)) newErrors.zipCode = 'Invalid Indian PIN code (must be 6 digits)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBilling = () => {
    if (billingInfo.sameAsShipping) return true;
    const newErrors = {};
    if (!billingInfo.fullName.trim()) newErrors.billingFullName = 'Full name is required';
    if (!billingInfo.address.trim()) newErrors.billingAddress = 'Address is required';
    if (!billingInfo.city.trim()) newErrors.billingCity = 'District is required';
    if (!billingInfo.state.trim()) newErrors.billingState = 'State is required';
    if (!billingInfo.zipCode.trim()) newErrors.billingZipCode = 'PIN code is required';
    else if (!/^\d{6}$/.test(billingInfo.zipCode)) newErrors.billingZipCode = 'Invalid Indian PIN code (must be 6 digits)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    // COD and WhatsApp don't require additional validation
    if (paymentInfo.paymentMethod === 'cod' || paymentInfo.paymentMethod === 'whatsapp') return true;
    const newErrors = {};
    if (!paymentInfo.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
    else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\D/g, ''))) newErrors.cardNumber = 'Invalid card number';
    if (!paymentInfo.cardName.trim()) newErrors.cardName = 'Cardholder name is required';
    if (!paymentInfo.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
    else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
    if (!paymentInfo.cvv.trim()) newErrors.cvv = 'CVV is required';
    else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) newErrors.cvv = 'Invalid CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = true;
    if (currentStep === 0) isValid = validateShipping();
    if (currentStep === 1) isValid = validateBilling();
    if (currentStep === 2) isValid = validatePayment();

    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!termsAccepted) {
      setErrors({ terms: 'You must accept the terms and conditions' });
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const userPhone = localStorage.getItem('userPhone');

      // Use shipping address for billing if sameAsShipping is true
      const finalBillingInfo = billingInfo.sameAsShipping ? shippingInfo : billingInfo;

      const orderData = {
        userId,
        userName: userName || shippingInfo.fullName,
        userEmail: userEmail || shippingInfo.email,
        userPhone: userPhone || shippingInfo.phone,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.product?.name || 'Product',
          quantity: item.quantity,
          price: Math.ceil(item.itemPrice || 0),
          sizeOptionName: item.sizeOptionName,
          colorVariantName: item.colorVariantName
        })),
        total,
        status: 'Confirmed',
        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`,
        billingAddress: `${finalBillingInfo.address}, ${finalBillingInfo.city}, ${finalBillingInfo.state} ${finalBillingInfo.zipCode}`,
        paymentMethod: paymentInfo.paymentMethod === 'cod' ? 'Cash on Delivery' : paymentInfo.paymentMethod === 'whatsapp' ? 'WhatsApp Payment' : paymentInfo.paymentMethod
      };

      const response = await shoppingApi.createOrder(orderData);
      setOrderId(response.data.order?.id || response.data.id);
      setOrderPlaced(true);
      setCurrentStep(steps.length - 1);
      setOrderError(null);
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error creating order. Please try again.';
      setOrderError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            index <= currentStep ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'
          } font-semibold`}>
            {index < currentStep ? <CheckCircle size={24} /> : index + 1}
          </div>
          <span className={`ml-3 text-sm font-medium capitalize hidden sm:block transition-all duration-300 ${
            index <= currentStep ? 'text-blue-600 font-semibold' : 'text-gray-400'
          }`}>
            {step}
          </span>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1.5 mx-4 rounded-full transition-all duration-300 ${
              index < currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-gray-100 p-4 sm:p-6 border-b border-gray-200 flex-shrink-0 relative z-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Checkout</h2>
            <button onClick={onClose} className="relative z-30 text-gray-500 hover:text-gray-700 text-xl sm:text-2xl font-bold px-2 py-1 hover:bg-gray-200 rounded-lg transition-colors">
              ✕
            </button>
          </div>
          <StepIndicator />
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 relative z-10 bg-white">
          {orderError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-bold mb-2">Order Error</h3>
              <p className="text-red-600">{orderError}</p>
              <button
                onClick={() => setOrderError(null)}
                className="mt-2 text-red-800 underline hover:text-red-900"
              >
                Dismiss
              </button>
            </div>
          )}
          {currentStep === 0 && <ShippingStep shippingInfo={shippingInfo} setShippingInfo={setShippingInfo} errors={errors} setErrors={setErrors} states={states} districts={districts} loadDistricts={loadDistricts} />}
          {currentStep === 1 && <BillingStep billingInfo={billingInfo} setBillingInfo={setBillingInfo} errors={errors} setErrors={setErrors} states={states} districts={districts} loadDistricts={loadDistricts} shippingInfo={shippingInfo} />}
          {currentStep === 2 && <PaymentStep paymentInfo={paymentInfo} setPaymentInfo={setPaymentInfo} errors={errors} setErrors={setErrors} />}
          {currentStep === 3 && <ReviewStep shippingInfo={shippingInfo} billingInfo={billingInfo} paymentInfo={paymentInfo} cartItems={cartItems} subtotal={subtotal} shipping={shipping} tax={tax} total={total} termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} errors={errors} formatPrice={formatPrice} />}
          {currentStep === 4 && <ConfirmStep orderId={orderId} onClose={onClose} onOrderSuccess={onOrderSuccess} />}
        </div>

        {!orderPlaced && (
          <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex-shrink-0 flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            {currentStep === steps.length - 2 ? (
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            ) : currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
