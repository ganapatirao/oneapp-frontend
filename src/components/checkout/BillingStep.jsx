import { CreditCard, Mail, Phone } from 'lucide-react';
import { validationApi } from '../../services/api';

const BillingStep = ({ billingInfo, setBillingInfo, errors, setErrors, states, districts, loadDistricts, shippingInfo }) => {
  const handleBlur = async (field) => {
    if (billingInfo.sameAsShipping) return;
    const fieldName = `billing.${field}`;
    const value = billingInfo[field];
    const errorKey = `billing${field.charAt(0).toUpperCase() + field.slice(1)}`;
    
    console.log('Validating field:', fieldName, 'with value:', value);
    
    // Client-side validation first
    const clientSideErrors = validateFieldClientSide(field, value);
    if (clientSideErrors) {
      const newErrors = { ...errors };
      newErrors[errorKey] = clientSideErrors;
      setErrors(newErrors);
      console.log('Client-side validation failed:', clientSideErrors);
      return;
    }
    
    // If client-side passes, clear the error and skip server validation
    const newErrors = { ...errors };
    delete newErrors[errorKey];
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
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid email format';
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (phoneRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid Indian phone number (must start with 6, 7, 8, or 9 and be 10 digits)';
      case 'zipCode':
        const zipRegex = /^\d{6}$/;
        if (zipRegex.test(value)) {
          return null; // Valid - no error
        }
        return 'Invalid Indian PIN code (must be 6 digits)';
      case 'fullName':
        const nameRegex = /^[a-zA-Z\s\.']+$/;
        if (nameRegex.test(value) && value.length >= 2 && value.length <= 100) {
          return null; // Valid - no error
        }
        if (value.length < 2) {
          return 'Full name must be at least 2 characters';
        }
        if (value.length > 100) {
          return 'Full name must not exceed 100 characters';
        }
        return 'Full name can only contain letters, spaces, dots, and apostrophes';
      case 'address':
        const addressRegex = /^[a-zA-Z0-9\s\-\.,#\/]+$/;
        if (addressRegex.test(value) && value.length >= 10 && value.length <= 200) {
          return null; // Valid - no error
        }
        if (value.length < 10) {
          return 'Address must be at least 10 characters';
        }
        if (value.length > 200) {
          return 'Address must not exceed 200 characters';
        }
        return 'Address contains invalid characters';
      case 'state':
      case 'city':
        if (value !== '' && value !== 'Select State' && value !== 'Select District') {
          return null; // Valid - no error
        }
        return 'Please select a valid option';
    }
    return null;
  };

  const handleChange = (field, value) => {
    if (billingInfo.sameAsShipping) return;
    setBillingInfo({ ...billingInfo, [field]: value });
    // Clear error when user starts typing
    const errorKey = `billing${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        <CreditCard size={28} className="mr-3 text-purple-600" />
        Billing Information
      </h3>
      <div className="flex items-center mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <input
          type="checkbox"
          id="sameAsShipping"
          checked={billingInfo.sameAsShipping}
          onChange={(e) => {
            setBillingInfo({ ...billingInfo, sameAsShipping: e.target.checked });
            if (e.target.checked) {
              setBillingInfo({
                ...billingInfo,
                fullName: shippingInfo.fullName,
                email: shippingInfo.email,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                zipCode: shippingInfo.zipCode,
                sameAsShipping: true
              });
            }
          }}
          className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
        />
        <label htmlFor="sameAsShipping" className="text-sm font-medium text-gray-700 cursor-pointer">Same as shipping address</label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={billingInfo.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            disabled={billingInfo.sameAsShipping}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingFullName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          />
          {errors.billingFullName && <p className="text-red-500 text-sm mt-1">{errors.billingFullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={billingInfo.sameAsShipping}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingEmail ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
          </div>
          {errors.billingEmail && <p className="text-red-500 text-sm mt-1">{errors.billingEmail}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              value={billingInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => handleBlur('phone')}
              disabled={billingInfo.sameAsShipping}
              inputMode="numeric"
              pattern="[0-9]{10}"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingPhone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
            />
          </div>
          {errors.billingPhone && <p className="text-red-500 text-sm mt-1">{errors.billingPhone}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={billingInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            disabled={billingInfo.sameAsShipping}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingAddress ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          />
          {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            value={billingInfo.state}
            onChange={(e) => {
              handleChange('state', e.target.value);
              setBillingInfo(prev => ({ ...prev, city: '' }));
              loadDistricts(e.target.value);
            }}
            onBlur={() => handleBlur('state')}
            disabled={billingInfo.sameAsShipping}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingState ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.code}>{state.name}</option>
            ))}
          </select>
          {errors.billingState && <p className="text-red-500 text-sm mt-1">{errors.billingState}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <select
            value={billingInfo.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            disabled={billingInfo.sameAsShipping}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingCity ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.name}>{district.name}</option>
            ))}
          </select>
          {errors.billingCity && <p className="text-red-500 text-sm mt-1">{errors.billingCity}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
          <input
            type="text"
            value={billingInfo.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => handleBlur('zipCode')}
            disabled={billingInfo.sameAsShipping}
            inputMode="numeric"
            pattern="[0-9]{6}"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ${errors.billingZipCode ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-purple-300 bg-white'} ${billingInfo.sameAsShipping ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            required
          />
          {errors.billingZipCode && <p className="text-red-500 text-sm mt-1">{errors.billingZipCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default BillingStep;
