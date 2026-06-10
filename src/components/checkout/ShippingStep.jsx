import { MapPin, User, Phone, Mail } from 'lucide-react';
import { validationApi } from '../../services/api';

const ShippingStep = ({ shippingInfo, setShippingInfo, errors, setErrors, states, districts, loadDistricts }) => {
  const handleBlur = async (field) => {
    const fieldName = `shipping.${field}`;
    const value = shippingInfo[field];
    
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
    setShippingInfo({ ...shippingInfo, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        <MapPin size={28} className="mr-3 text-blue-600" />
        Shipping Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="fullName"
              value={shippingInfo.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
              required
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={shippingInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
              required
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="tel"
              name="phone"
              value={shippingInfo.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => handleBlur('phone')}
              inputMode="numeric"
              pattern="[0-9]{10}"
              className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
              required
            />
          </div>
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={shippingInfo.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
            required
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <select
            value={shippingInfo.state}
            onChange={(e) => {
              handleChange('state', e.target.value);
              setShippingInfo(prev => ({ ...prev, city: '' }));
              loadDistricts(e.target.value);
            }}
            onBlur={() => handleBlur('state')}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
            required
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.code}>{state.name}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
          <select
            value={shippingInfo.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
            required
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.name}>{district.name}</option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
          <input
            type="text"
            name="zipCode"
            value={shippingInfo.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            onBlur={() => handleBlur('zipCode')}
            inputMode="numeric"
            pattern="[0-9]{6}"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ${errors.zipCode ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300 bg-white'}`}
            required
          />
          {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
        </div>
      </div>
    </div>
  );
};

export default ShippingStep;
