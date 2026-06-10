import { CreditCard as PaymentIcon } from 'lucide-react';
import { validationApi } from '../../services/api';

const PaymentStep = ({ paymentInfo, setPaymentInfo, errors, setErrors }) => {
  const detectCardType = (cardNumber) => {
    const cleanedNumber = cardNumber.replace(/\D/g, '');
    if (/^4/.test(cleanedNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanedNumber) || /^2[2-7]/.test(cleanedNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanedNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cleanedNumber)) return 'discover';
    return 'unknown';
  };

  const formatCardNumber = (value) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 16);
    const formattedValue = cleanedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formattedValue;
  };

  const formatExpiryDate = (value) => {
    const cleanedValue = value.replace(/\D/g, '').slice(0, 4);
    if (cleanedValue.length >= 2) {
      return cleanedValue.slice(0, 2) + '/' + cleanedValue.slice(2);
    }
    return cleanedValue;
  };

  const handleBlur = async (field) => {
    const fieldName = `payment.${field}`;
    const value = paymentInfo[field];
    
    console.log('Validating field:', fieldName, 'with value:', value);
    
    // Client-side validation first
    const clientSideErrors = validateFieldClientSide(field, value);
    if (clientSideErrors) {
      const newErrors = { ...errors };
      newErrors[field] = clientSideErrors;
      setErrors(newErrors);
      console.log('Client-side validation failed:', clientSideErrors);
      return;
    }
    
    // If client-side passes, clear the error and skip server validation
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
    console.log('Client-side validation passed, clearing error');
    
    // Optionally call server-side validation in background for logging
    try {
      const response = await validationApi.validateField('checkout', fieldName, value);
      console.log('Server validation response:', response.data);
    } catch (error) {
      console.error('Server validation error (ignored):', error);
    }
  };

  const validateFieldClientSide = (field, value) => {
    // Skip validation if field is empty (unless it's required)
    if (!value || value.trim() === '') {
      return null; // Don't show error for empty fields on blur
    }
    
    switch (field) {
      case 'cardNumber':
        const cardRegex = /^\d{16}$/;
        if (cardRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid card number (must be 16 digits)';
      case 'cardName':
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (nameRegex.test(value) && value.length >= 2 && value.length <= 50) {
          return null; // Valid - no error
        }
        if (value.length < 2) {
          return 'Cardholder name must be at least 2 characters';
        }
        if (value.length > 50) {
          return 'Cardholder name must not exceed 50 characters';
        }
        return 'Cardholder name can only contain letters and spaces';
      case 'expiryDate':
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (expiryRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid expiry date (MM/YY)';
      case 'cvv':
        const cvvRegex = /^\d{3,4}$/;
        if (cvvRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid CVV (must be 3 or 4 digits)';
    }
    return null;
  };

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
          <div className="flex space-x-4">
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-300 transition-all duration-300 ${paymentInfo.paymentMethod === 'credit-card' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <input
                type="radio"
                value="credit-card"
                checked={paymentInfo.paymentMethod === 'credit-card'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium">Credit Card</span>
            </label>
            <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer hover:border-green-300 transition-all duration-300 ${paymentInfo.paymentMethod === 'paypal' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <input
                type="radio"
                value="paypal"
                checked={paymentInfo.paymentMethod === 'paypal'}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="mr-3 w-5 h-5 text-green-600 focus:ring-green-500"
              />
              <span className="font-medium">PayPal</span>
            </label>
          </div>
        </div>

        {paymentInfo.paymentMethod === 'credit-card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
                  onBlur={() => handleBlur('cardNumber')}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  maxLength="19"
                  className={`w-full px-4 py-3 pr-20 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {detectCardType(paymentInfo.cardNumber) === 'visa' && <span className="text-blue-600 font-bold text-sm">VISA</span>}
                  {detectCardType(paymentInfo.cardNumber) === 'mastercard' && <span className="text-red-600 font-bold text-sm">MC</span>}
                  {detectCardType(paymentInfo.cardNumber) === 'amex' && <span className="text-blue-500 font-bold text-sm">AMEX</span>}
                  {detectCardType(paymentInfo.cardNumber) === 'discover' && <span className="text-orange-600 font-bold text-sm">DISC</span>}
                </div>
              </div>
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
              <input
                type="text"
                value={paymentInfo.cardName}
                onChange={(e) => handleChange('cardName', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('cardName')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${errors.cardName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                required
              />
              {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="text"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => handleChange('expiryDate', formatExpiryDate(e.target.value))}
                  onBlur={() => handleBlur('expiryDate')}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  maxLength="5"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${errors.expiryDate ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                  required
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={paymentInfo.cvv}
                  onChange={(e) => handleChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  onBlur={() => handleBlur('cvv')}
                  placeholder="123"
                  inputMode="numeric"
                  maxLength="4"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 ${errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-green-300 bg-white'}`}
                  required
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStep;
