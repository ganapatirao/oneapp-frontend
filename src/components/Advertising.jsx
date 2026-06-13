import { useState, useEffect, useRef } from 'react';
import { Plus, Filter, MapPin, MessageCircle, Phone, Search, Eye, Calendar, X, Star, ChevronLeft, ChevronRight, Briefcase, Car, Home, Smartphone, Heart, User, Shield, Zap, Tag, Sparkles, SlidersHorizontal, ChevronDown, ChevronUp, Upload, Image as ImageIcon } from 'lucide-react';
import { advertisingApi, API_BASE_URL } from '../services/api';
import SubcategoryFilter from './SubcategoryFilter';

export default function Advertising({ userRole }) {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [showPostAd, setShowPostAd] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showAdDetail, setShowAdDetail] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatPhone, setChatPhone] = useState('');
  const [chatEmail, setChatEmail] = useState('');
  const [chatErrors, setChatErrors] = useState({
    message: '',
    phone: '',
    email: '',
    contact: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [conditionFilter, setConditionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState(false);
  const [validationSettings, setValidationSettings] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    price: '',
    categoryName: '',
    subcategory: '',
    location: '',
    city: '',
    condition: '',
    imageUrl: '',
    imageUrls: '',
    phone: '',
    email: '',
    negotiable: false,
    isFeatured: false,
    isUrgent: false
  });

  useEffect(() => {
    loadAds();
    loadCategories();
    loadValidationSettings();
    loadStates();
    loadConditions();
  }, []);

  const loadStates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/advertising/states`);
      if (response.ok) {
        const data = await response.json();
        setStates(data);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    }
  };

  const loadCities = async (stateCode) => {
    try {
      const url = stateCode 
        ? `${API_BASE_URL}/advertising/cities?stateCode=${stateCode}`
        : `${API_BASE_URL}/advertising/cities`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadConditions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/advertising/conditions`);
      if (response.ok) {
        const data = await response.json();
        setConditions(data);
      }
    } catch (error) {
      console.error('Error loading conditions:', error);
    }
  };

  const loadValidationSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/validation/settings/Advertisement`);
      if (response.ok) {
        const settings = await response.json();
        setValidationSettings(settings);
      }
    } catch (error) {
      console.error('Error loading validation settings:', error);
    }
  };

  const loadAds = async () => {
    try {
      const response = await advertisingApi.getAds();
      setAds(response.data.filter(a => a.status === 'Active').map(ad => ({
        ...ad,
        views: ad.views || Math.floor(Math.random() * 500) + 10,
        postedDate: ad.postedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      })));
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await advertisingApi.getAdCategories();
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        // If no categories from API, extract from existing ads
        const adsResponse = await advertisingApi.getAds();
        if (adsResponse.data && adsResponse.data.length > 0) {
          const uniqueCategories = [...new Set(adsResponse.data.map(ad => ad.categoryName).filter(Boolean))];
          const categoryMap = {};
          
          adsResponse.data.forEach(ad => {
            if (ad.categoryName) {
              if (!categoryMap[ad.categoryName]) {
                categoryMap[ad.categoryName] = {
                  id: ad.categoryName,
                  name: ad.categoryName,
                  emoji: '📦',
                  subcategories: []
                };
              }
              if (ad.subcategory && !categoryMap[ad.categoryName].subcategories.includes(ad.subcategory)) {
                categoryMap[ad.categoryName].subcategories.push(ad.subcategory);
              }
            }
          });
          
          const extractedCategories = Object.values(categoryMap);
          if (extractedCategories.length > 0) {
            setCategories(extractedCategories);
          }
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const validateField = async (fieldName, value) => {
    if (!validationSettings[fieldName]) return { isValid: true, errors: [] };

    const setting = validationSettings[fieldName];
    const errors = [];
    const stringValue = value?.toString() ?? "";

    // Required validation
    if (setting.validationRules.required && !stringValue.trim()) {
      errors.push(setting.errorMessages.required || `${fieldName} is required`);
    }

    // Min length validation
    if (setting.validationRules.minLength && stringValue.length < setting.validationRules.minLength) {
      errors.push(setting.errorMessages.minLength || `${fieldName} must be at least ${setting.validationRules.minLength} characters`);
    }

    // Max length validation
    if (setting.validationRules.maxLength && stringValue.length > setting.validationRules.maxLength) {
      errors.push(setting.errorMessages.maxLength || `${fieldName} must not exceed ${setting.validationRules.maxLength} characters`);
    }

    // Regex pattern validation
    if (setting.validationRules.regexPattern && stringValue.trim()) {
      try {
        const regex = new RegExp(setting.validationRules.regexPattern);
        if (!regex.test(stringValue)) {
          errors.push(setting.errorMessages.pattern || `${fieldName} contains invalid characters`);
        }
      } catch (e) {
        console.error('Invalid regex pattern:', setting.validationRules.regexPattern);
      }
    }

    // Min/Max value validation for numeric fields
    if (value && !isNaN(value)) {
      const numValue = parseFloat(value);
      if (setting.validationRules.minValue !== undefined && numValue < setting.validationRules.minValue) {
        errors.push(setting.errorMessages.minValue || `${fieldName} must be at least ${setting.validationRules.minValue}`);
      }
      if (setting.validationRules.maxValue !== undefined && numValue > setting.validationRules.maxValue) {
        errors.push(setting.errorMessages.maxValue || `${fieldName} must not exceed ${setting.validationRules.maxValue}`);
      }
    }

    // Allowed values validation
    if (setting.validationRules.allowedValues && stringValue.trim()) {
      if (!setting.validationRules.allowedValues.includes(stringValue)) {
        errors.push(setting.errorMessages.invalidValue || `${fieldName} must be one of: ${setting.validationRules.allowedValues.join(', ')}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFieldChange = async (fieldName, value) => {
    setNewAd({ ...newAd, [fieldName]: value });
    const validation = await validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation.errors
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type === 'application/octet-stream'
    );

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        setUploadedImages(prev => [...prev, imageDataUrl]);
        
        // Update newAd with the first image as primary
        if (!newAd.imageUrl) {
          setNewAd(prev => ({ ...prev, imageUrl: imageDataUrl }));
        }
        
        // Update imageUrls array
        const currentImageUrls = newAd.imageUrls ? newAd.imageUrls.split(',').map(u => u.trim()) : [];
        if (!currentImageUrls.includes(imageDataUrl)) {
          setNewAd(prev => ({ 
            ...prev, 
            imageUrls: [...currentImageUrls, imageDataUrl].join(', ') 
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (imageToRemove) => {
    setUploadedImages(prev => prev.filter(img => img !== imageToRemove));
    
    const currentImageUrls = newAd.imageUrls ? newAd.imageUrls.split(',').map(u => u.trim()) : [];
    const updatedImageUrls = currentImageUrls.filter(url => url !== imageToRemove);
    
    setNewAd(prev => ({
      ...prev,
      imageUrls: updatedImageUrls.join(', '),
      imageUrl: updatedImageUrls.length > 0 ? updatedImageUrls[0] : ''
    }));
  };

  const handlePostAd = async (e) => {
    e.preventDefault();
    
    // Validate all fields using dynamic validation
    const allErrors = {};
    const fieldsToValidate = ['title', 'description', 'price', 'categoryName', 'subcategory', 'location', 'city', 'condition', 'phone', 'email', 'imageUrl'];
    
    for (const field of fieldsToValidate) {
      const validation = await validateField(field, newAd[field]);
      if (!validation.isValid) {
        allErrors[field] = validation.errors;
      }
    }
    
    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      alert('Please fix the validation errors before submitting');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const userEmail = localStorage.getItem('userEmail');
      const adData = {
        ...newAd,
        price: parseFloat(newAd.price),
        sellerId: userId,
        sellerName: userName || 'Anonymous',
        sellerEmail: userEmail || '',
        sellerPhone: newAd.phone,
        imageUrls: newAd.imageUrls ? newAd.imageUrls.split(',').map(url => url.trim()) : [newAd.imageUrl],
        phoneDisplayStatus: 'Visible',
        views: 0,
        postedDate: new Date().toISOString()
      };
      await advertisingApi.createAd(adData);
      loadAds();
      setNewAd({
        title: '',
        description: '',
        price: '',
        categoryName: '',
        subcategory: '',
        location: '',
        city: '',
        condition: '',
        imageUrl: '',
        imageUrls: '',
        phone: '',
        email: '',
        negotiable: false,
        isFeatured: false,
        isUrgent: false
      });
      setUploadedImages([]);
      setValidationErrors({});
      setShowPostAd(false);
      alert('Ad posted successfully!');
    } catch (error) {
      console.error('Error posting ad:', error);
      alert('Error posting ad. Please try again.');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory('All');
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleViewAd = (ad) => {
    setSelectedAd(ad);
    setCurrentImageIndex(0);
    setShowAdDetail(true);
  };

  const handleNextImage = () => {
    if (selectedAd && selectedAd.imageUrls) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedAd.imageUrls.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedAd && selectedAd.imageUrls) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedAd.imageUrls.length) % selectedAd.imageUrls.length);
    }
  };

  const maskPhoneNumber = (phone, status) => {
    if (status === 'Hidden' && phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 4) {
        const lastFour = digits.slice(-4);
        const maskedCount = digits.length - 4;
        return 'x'.repeat(maskedCount) + lastFour;
      }
      return phone;
    }
    return phone;
  };

  const handleRespond = (ad) => {
    setSelectedAd(ad);
    setShowAdDetail(false);
    setShowChatModal(true);
    setChatPhone('');
    setChatEmail('');
    setChatErrors({ message: '', phone: '', email: '', contact: '' });
  };

  const handleSendChat = async (e) => {
    e.preventDefault();

    setChatErrors({ message: '', phone: '', email: '', contact: '' });

    if (!chatMessage.trim()) {
      setChatErrors(prev => ({ ...prev, message: 'Please enter a message' }));
      return;
    }

    if (!chatPhone.trim() && !chatEmail.trim()) {
      setChatErrors(prev => ({ ...prev, contact: 'Please enter either phone number or email' }));
      return;
    }

    if (chatPhone && !/^\+?[\d\s-]{10,}$/.test(chatPhone)) {
      setChatErrors(prev => ({ ...prev, phone: 'Please enter a valid phone number (min 10 digits)' }));
      return;
    }

    if (chatEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(chatEmail)) {
      setChatErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');

      if (!userId) {
        alert('Please login to send a message');
        return;
      }

      await advertisingApi.createAdResponse({
        adId: selectedAd.id,
        responderId: userId,
        responderName: userName || 'Anonymous',
        responderEmail: chatEmail || '',
        responderPhone: chatPhone || '',
        message: chatMessage,
        isRead: false,
        status: 'Pending'
      });

      alert('Message sent to seller!');
      setChatMessage('');
      setChatPhone('');
      setChatEmail('');
      setChatErrors({ message: '', phone: '', email: '', contact: '' });
      setShowChatModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const handleCallSeller = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, '_self');
    } else {
      alert('Seller phone number not available');
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchCategory = selectedCategory === 'All' || ad.categoryName === selectedCategory;
    const matchSubcategory = selectedSubcategory === 'All' || ad.subcategory === selectedSubcategory;
    const matchSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLocation = !locationFilter || ad.location?.toLowerCase().includes(locationFilter.toLowerCase());
    const matchCity = !cityFilter || ad.city?.toLowerCase().includes(cityFilter.toLowerCase());
    const matchPrice = (!priceRange.min || ad.price >= parseFloat(priceRange.min)) &&
                       (!priceRange.max || ad.price <= parseFloat(priceRange.max));
    const matchCondition = conditionFilter === 'All' || ad.condition === conditionFilter;
    const matchFeatured = !showFeaturedOnly || ad.isFeatured;
    const matchUrgent = !showUrgentOnly || ad.isUrgent;
    return matchCategory && matchSubcategory && matchSearch && matchLocation && matchCity && matchPrice && matchCondition && matchFeatured && matchUrgent;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.postedDate) - new Date(a.postedDate);
    if (sortBy === 'oldest') return new Date(a.postedDate) - new Date(b.postedDate);
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'popular') return b.views - a.views;
    return 0;
  });

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-IN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative">
            <div className="absolute -top-2 -left-2 w-20 h-20 bg-orange-200 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-red-200 rounded-full opacity-50 blur-xl"></div>
            <h1 className="relative text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent">
              India Classifieds
            </h1>
            <p className="relative text-gray-600 mt-2 text-lg">Buy & sell everything in your local area</p>
          </div>
          {(userRole === 'Advertiser' || userRole === 'Admin') && (
            <button
              onClick={() => setShowPostAd(true)}
              className="relative group bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-orange-600 hover:via-red-600 hover:to-orange-600 transition-all duration-300 flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
              <Plus size={22} className="mr-2 relative z-10" />
              <span className="relative z-10">Post Free Ad</span>
            </button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search for anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
              >
                <Filter size={20} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="border-t bg-gradient-to-r from-gray-50 to-orange-50 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">City</label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-1/2 px-3 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-1/2 px-3 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Condition</label>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                  >
                    <option value="All">All Conditions</option>
                    {conditions.map((condition) => (
                      <option key={condition.id} value={condition.name}>{condition.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white shadow-md transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Featured</label>
                  <label className="flex items-center cursor-pointer bg-white px-4 py-3 border-2 border-orange-200 rounded-xl shadow-md hover:border-orange-400 transition-all">
                    <input
                      type="checkbox"
                      checked={showFeaturedOnly}
                      onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                      className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Show Featured</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2">Urgent</label>
                  <label className="flex items-center cursor-pointer bg-white px-4 py-3 border-2 border-orange-200 rounded-xl shadow-md hover:border-orange-400 transition-all">
                    <input
                      type="checkbox"
                      checked={showUrgentOnly}
                      onChange={(e) => setShowUrgentOnly(e.target.checked)}
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Show Urgent</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setLocationFilter('');
                      setCityFilter('');
                      setPriceRange({ min: '', max: '' });
                      setConditionFilter('All');
                      setSortBy('newest');
                      setShowFeaturedOnly(false);
                      setShowUrgentOnly(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold hover:from-gray-500 hover:to-gray-600 transition-all shadow-md"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => handleCategoryChange('All')}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all duration-300 text-sm border-2 shadow-md ${
                selectedCategory === 'All'
                  ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white border-orange-500 shadow-xl transform scale-105'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg'
              }`}
            >
              <Sparkles size={18} className="inline mr-2" />
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.name)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold transition-all duration-300 text-sm border-2 flex items-center gap-2 shadow-md ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 text-white border-orange-500 shadow-xl transform scale-105'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:bg-orange-50 hover:shadow-lg'
                }`}
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="whitespace-nowrap">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Filter */}
        <SubcategoryFilter
          selectedCategory={selectedCategory}
          categories={categories}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={handleSubcategoryChange}
        />

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-600 text-sm font-medium">
            <span className="text-2xl font-bold text-orange-600">{filteredAds.length}</span> ads found
          </div>
        </div>

        {/* Ads Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAds.map((ad) => {
            const adImages = ad.imageUrls && ad.imageUrls.length > 0 ? ad.imageUrls : [ad.imageUrl];
            return (
              <div
                key={ad.id}
                onClick={() => handleViewAd(ad)}
                className="group bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-300 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={adImages[0]}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {ad.isFeatured && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Featured
                    </div>
                  )}
                  {ad.isUrgent && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                      Urgent
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {ad.title}
                  </h3>
                  <div className="flex items-center mb-1 text-xs text-gray-500">
                    <MapPin size={12} className="mr-1" />
                    <span className="truncate">{ad.location}</span>
                  </div>
                  <p className="text-xl font-bold text-orange-600">{formatPrice(ad.price)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAds.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 animate-bounce">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No ads found</h3>
            <p className="text-gray-500 text-lg">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Post Ad Modal */}
        {showPostAd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 border-b flex justify-between items-center rounded-t-3xl">
                <h2 className="text-2xl font-bold text-white">Post Your Ad</h2>
                <button onClick={() => setShowPostAd(false)} className="text-white hover:text-orange-200 transition-colors">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handlePostAd} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title *</label>
                  <input
                    type="text"
                    value={newAd.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                      validationErrors.title ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="What are you selling?"
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.title[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={newAd.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm resize-none ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-200'
                    }`}
                    rows="4"
                    placeholder="Describe your item in detail..."
                    required
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.description[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      step="1"
                      value={newAd.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                        validationErrors.price ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Enter price"
                      required
                      min="0"
                    />
                    {validationErrors.price && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.price[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={newAd.categoryName}
                      onChange={(e) => {
                        handleFieldChange('categoryName', e.target.value);
                        setNewAd(prev => ({ ...prev, subcategory: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white ${
                        validationErrors.categoryName ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>{category.emoji} {category.name}</option>
                      ))}
                    </select>
                    {validationErrors.categoryName && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.categoryName[0]}</p>
                    )}
                  </div>
                </div>
                {newAd.categoryName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                    <select
                      value={newAd.subcategory}
                      onChange={(e) => handleFieldChange('subcategory', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white ${
                        validationErrors.subcategory ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select Subcategory</option>
                      {categories.find(c => c.name === newAd.categoryName)?.subcategories?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    {validationErrors.subcategory && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.subcategory[0]}</p>
                    )}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={newAd.location}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                        validationErrors.location ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="Area, Street"
                      required
                    />
                    {validationErrors.location && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.location[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        setSelectedState(e.target.value);
                        loadCities(e.target.value);
                        setNewAd(prev => ({ ...prev, city: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-200'
                      }`}
                      required
                    >
                      <option value="">Select State</option>
                      {states.map((state) => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <select
                    value={newAd.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white ${
                      validationErrors.city ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                    disabled={!selectedState}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  {validationErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.city[0]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                  <select
                    value={newAd.condition}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white ${
                      validationErrors.condition ? 'border-red-500' : 'border-gray-200'
                    }`}
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditions.map((condition) => (
                      <option key={condition.id} value={condition.name}>{condition.name}</option>
                    ))}
                  </select>
                  {validationErrors.condition && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.condition[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={newAd.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.phone[0]}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newAd.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="your@email.com"
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.email[0]}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold text-orange-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                          {idx === 0 && (
                            <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {validationErrors.imageUrl && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.imageUrl[0]}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="negotiable"
                      checked={newAd.negotiable}
                      onChange={(e) => setNewAd({ ...newAd, negotiable: e.target.checked })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Price is negotiable</span>
                  </label>
                  <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newAd.isFeatured}
                      onChange={(e) => setNewAd({ ...newAd, isFeatured: e.target.checked })}
                      className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Ad (₹99)</span>
                  </label>
                  <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={newAd.isUrgent}
                      onChange={(e) => setNewAd({ ...newAd, isUrgent: e.target.checked })}
                      className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Urgent Sale (₹49)</span>
                  </label>
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  >
                    Post Ad Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostAd(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ad Detail Modal */}
        {showAdDetail && selectedAd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Ad Details</h2>
                <button onClick={() => setShowAdDetail(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                {/* Image Gallery with Navigation */}
                <div className="relative mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedAd.imageUrls && selectedAd.imageUrls.length > 0 ? selectedAd.imageUrls[currentImageIndex] : selectedAd.imageUrl}
                    alt={selectedAd.title}
                    className="w-full h-80 object-cover"
                  />
                  {selectedAd.imageUrls && selectedAd.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium z-10">
                        {currentImageIndex + 1} / {selectedAd.imageUrls.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Ad Info */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {selectedAd.isFeatured && (
                      <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">Featured</span>
                    )}
                    {selectedAd.isUrgent && (
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Urgent</span>
                    )}
                    {selectedAd.negotiable && (
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">Negotiable</span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedAd.title}</h1>
                  <p className="text-3xl font-bold text-orange-600 mb-4">{formatPrice(selectedAd.price)}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center"><MapPin size={14} className="mr-1" /> {selectedAd.location}</span>
                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {formatDate(selectedAd.postedDate)}</span>
                    <span className="flex items-center"><Eye size={14} className="mr-1" /> {selectedAd.views}</span>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">{selectedAd.description}</p>
                  </div>
                </div>

                {/* Seller Info & Actions */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-12 h-12 rounded-full flex items-center justify-center mr-3">
                        <User size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{selectedAd.sellerName || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{selectedAd.categoryName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRespond(selectedAd)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center shadow-md"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      Message
                    </button>
                    {selectedAd.sellerPhone && (
                      <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center shadow-md">
                        <Phone size={18} className="mr-2" />
                        {maskPhoneNumber(selectedAd.sellerPhone, selectedAd.phoneDisplayStatus)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && selectedAd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Send Message</h2>
                <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
                  <p className="text-xs text-gray-600 mb-1">To: {selectedAd.sellerName || 'Anonymous'}</p>
                  <p className="text-sm font-medium text-gray-800">{selectedAd.title}</p>
                </div>
                <form onSubmit={handleSendChat} className="space-y-3">
                  <div>
                    <input
                      type="tel"
                      value={chatPhone}
                      onChange={(e) => {
                        setChatPhone(e.target.value);
                        if (chatErrors.phone) setChatErrors(prev => ({ ...prev, phone: '' }));
                        if (chatErrors.contact) setChatErrors(prev => ({ ...prev, contact: '' }));
                      }}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:border-transparent text-sm ${chatErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}
                      placeholder="Phone (required if no email)"
                      maxLength="15"
                    />
                    {chatErrors.phone && <p className="text-red-500 text-xs mt-1">{chatErrors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={chatEmail}
                      onChange={(e) => {
                        setChatEmail(e.target.value);
                        if (chatErrors.email) setChatErrors(prev => ({ ...prev, email: '' }));
                        if (chatErrors.contact) setChatErrors(prev => ({ ...prev, contact: '' }));
                      }}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:border-transparent text-sm ${chatErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}
                      placeholder="Email (required if no phone)"
                      maxLength="100"
                    />
                    {chatErrors.email && <p className="text-red-500 text-xs mt-1">{chatErrors.email}</p>}
                  </div>
                  {chatErrors.contact && <p className="text-red-500 text-xs">{chatErrors.contact}</p>}
                  <div>
                    <textarea
                      value={chatMessage}
                      onChange={(e) => {
                        setChatMessage(e.target.value);
                        if (chatErrors.message) setChatErrors(prev => ({ ...prev, message: '' }));
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent text-sm resize-none ${chatErrors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-orange-500'}`}
                      rows="3"
                      placeholder="Your message..."
                      required
                      maxLength="500"
                    />
                    {chatErrors.message && <p className="text-red-500 text-xs mt-1">{chatErrors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
