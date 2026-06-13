import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, Briefcase, Calendar, Film, Package, DollarSign, TrendingUp, Plus, Trash2, Edit, Power, PowerOff, X, RefreshCw, MapPin, Sparkles, ShieldCheck, BarChart3, Settings, Layers, Zap, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { adminApi, shoppingApi, advertisingApi, recruitmentApi, bookingApi, API_BASE_URL } from '../../services/api';
import ShoppingAdmin from './ShoppingAdmin';
import SubcategoryFilter from '../SubcategoryFilter';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transports, setTransports] = useState([]);
  const [packages, setPackages] = useState([]);
  const [movies, setMovies] = useState([]);

  // Modal states
  const [editModal, setEditModal] = useState({ isOpen: false, type: null, data: null });
  const [addModal, setAddModal] = useState({ isOpen: false, type: null });
  const [adPrimaryPreview, setAdPrimaryPreview] = useState('');
  const [adAdditionalPreviews, setAdAdditionalPreviews] = useState([]);
  const [packagePreview, setPackagePreview] = useState('');
  const [moviePreview, setMoviePreview] = useState('');
  const [validationSettings, setValidationSettings] = useState({});

  // Drag and drop states
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);
  const [isDraggingAdditional, setIsDraggingAdditional] = useState(false);
  const [isDraggingPackage, setIsDraggingPackage] = useState(false);
  const [isDraggingMovie, setIsDraggingMovie] = useState(false);

  // Filter states
  const [adSearchTerm, setAdSearchTerm] = useState('');
  const [adCategoryFilter, setAdCategoryFilter] = useState('All');
  const [adStatusFilter, setAdStatusFilter] = useState('All');
  const [adSortBy, setAdSortBy] = useState('newest');
  const [adFeaturedOnly, setAdFeaturedOnly] = useState(false);
  const [adUrgentOnly, setAdUrgentOnly] = useState(false);

  // Ad form state
  const [adFormData, setAdFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryName: '',
    subcategory: '',
    customCategory: '',
    location: '',
    city: '',
    condition: '',
    phone: '',
    email: '',
    imageUrl: '',
    imageUrls: [],
    negotiable: false,
    isFeatured: false,
    isUrgent: false,
    status: 'Active'
  });

  const [adCategories, setAdCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedState, setSelectedState] = useState('');

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const filesToDataUrls = async (fileList) => Promise.all(Array.from(fileList || []).map(fileToDataUrl));

  // Drag and drop handlers
  const handlePrimaryDragOver = (e) => {
    e.preventDefault();
    setIsDraggingPrimary(true);
  };

  const handlePrimaryDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingPrimary(false);
  };

  const handlePrimaryDrop = async (e) => {
    e.preventDefault();
    setIsDraggingPrimary(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = await fileToDataUrl(file);
      setAdPrimaryPreview(preview);
    }
  };

  const handleAdditionalDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAdditional(true);
  };

  const handleAdditionalDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingAdditional(false);
  };

  const handleAdditionalDrop = async (e) => {
    e.preventDefault();
    setIsDraggingAdditional(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const previews = await filesToDataUrls(imageFiles);
        setAdAdditionalPreviews([...adAdditionalPreviews, ...previews]);
      }
    }
  };

  const handlePackageDragOver = (e) => {
    e.preventDefault();
    setIsDraggingPackage(true);
  };

  const handlePackageDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingPackage(false);
  };

  const handlePackageDrop = async (e) => {
    e.preventDefault();
    setIsDraggingPackage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = await fileToDataUrl(file);
      setPackagePreview(preview);
    }
  };

  const handleMovieDragOver = (e) => {
    e.preventDefault();
    setIsDraggingMovie(true);
  };

  const handleMovieDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingMovie(false);
  };

  const handleMovieDrop = async (e) => {
    e.preventDefault();
    setIsDraggingMovie(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const preview = await fileToDataUrl(file);
      setMoviePreview(preview);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (role !== 'Admin' || !token) {
      navigate('/login');
      return;
    }
    loadDashboard();
    loadAllOrders();
    loadUsers();
    loadAds();
    loadJobs();
    loadTransports();
    loadPackages();
    loadMovies();
    loadAdCategories();
    loadValidationSettings();
    loadStates();
    loadConditions();
  }, [navigate]);

  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Advertisement');
      const settingsDict = {};
      response.data.forEach(setting => {
        settingsDict[setting.fieldName] = setting;
      });
      setValidationSettings(settingsDict);
    } catch (error) {
      console.error('Failed to fetch validation settings:', error);
    }
  };

  const validateField = (fieldName, value) => {
    const setting = validationSettings[fieldName];
    if (!setting) return { isValid: true, errors: [] };
    
    const errors = [];
    const rules = setting.validationRules;
    const messages = setting.errorMessages;
    
    // Required validation
    if (rules.required && !value?.trim()) {
      errors.push(messages.required || `${fieldName} is required`);
    }
    
    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(messages.maxLength || `${fieldName} must not exceed ${rules.maxLength} characters`);
    }
    
    // Regex pattern validation
    if (rules.regexPattern && !new RegExp(rules.regexPattern).test(value)) {
      errors.push(messages.pattern || `${fieldName} contains invalid characters`);
    }
    
    // Min/Max value validation
    if (rules.minValue && parseFloat(value) < rules.minValue) {
      errors.push(messages.minValue || `${fieldName} must be at least ${rules.minValue}`);
    }
    
    if (rules.maxValue && parseFloat(value) > rules.maxValue) {
      errors.push(messages.maxValue || `${fieldName} must not exceed ${rules.maxValue}`);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const loadDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        alert('Unauthorized. Please login as admin.');
        navigate('/login');
      }
    }
  };

  const loadAllOrders = async () => {
    try {
      const response = await adminApi.getAllOrders();
      setAllOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAds = async () => {
    try {
      const response = await advertisingApi.getAds();
      setAds(response.data);
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await adminApi.getJobs();
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadTransports = async () => {
    try {
      const response = await bookingApi.getTransports();
      setTransports(response.data);
    } catch (error) {
      console.error('Error loading transports:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await bookingApi.getPackages();
      setPackages(response.data);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadMovies = async () => {
    try {
      const response = await bookingApi.getMovies();
      setMovies(response.data);
    } catch (error) {
      console.error('Error loading movies:', error);
    }
  };

  const loadAdCategories = async () => {
    try {
      const response = await advertisingApi.getAdCategories();
      if (response.data && response.data.length > 0) {
        setAdCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading ad categories:', error);
    }
  };

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

  const handleDeleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await adminApi.deleteUser(userId);
        loadUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      loadAllOrders();
      alert('Order status updated!');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Ad handlers
  const handleDeleteAd = async (adId) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      try {
        await adminApi.deleteAd(adId);
        loadAds();
        alert('Ad deleted successfully!');
      } catch (error) {
        console.error('Error deleting ad:', error);
      }
    }
  };

  const handleUpdateAdStatus = async (adId, status) => {
    try {
      await adminApi.updateAdStatus(adId, status);
      loadAds();
      alert('Ad status updated!');
    } catch (error) {
      console.error('Error updating ad status:', error);
    }
  };

  const handleEditAd = (ad) => {
    setAdFormData({
      title: ad.title || '',
      description: ad.description || '',
      price: ad.price || '',
      categoryName: ad.categoryName || '',
      subcategory: ad.subcategory || '',
      customCategory: '',
      location: ad.location || '',
      city: ad.city || '',
      condition: ad.condition || '',
      phone: ad.sellerPhone || ad.phone || '',
      email: ad.sellerEmail || ad.email || '',
      imageUrl: ad.imageUrl || (ad.imageUrls && ad.imageUrls.length > 0 ? ad.imageUrls[0] : ''),
      imageUrls: ad.imageUrls || [],
      negotiable: ad.negotiable || false,
      isFeatured: ad.isFeatured || false,
      isUrgent: ad.isUrgent || false,
      status: ad.status || 'Active'
    });
    setEditModal({ isOpen: true, type: 'ad', data: ad });
  };

  const handleSaveAd = async (e) => {
    e.preventDefault();

    // Dynamic validation using validationSettings
    const allErrors = {};
    const fieldsToValidate = ['title', 'description', 'price', 'categoryName', 'location', 'city', 'condition', 'sellerPhone', 'sellerEmail'];
    
    for (const field of fieldsToValidate) {
      const fieldValue = field === 'sellerPhone' ? adFormData.phone : 
                         field === 'sellerEmail' ? adFormData.email : 
                         adFormData[field];
      const validation = validateField(field, fieldValue);
      if (!validation.isValid) {
        allErrors[field] = validation.errors;
      }
    }
    
    if (Object.keys(allErrors).length > 0) {
      const errorMessages = Object.values(allErrors).flat();
      alert('Validation errors:\n' + errorMessages.join('\n'));
      return;
    }
    try {
      const primaryAdImage = await fileToDataUrl(e.currentTarget?.primaryAdImage?.files?.[0]);
      // Use the state-based additional previews instead of reading from file input again
      const additionalAdImages = adAdditionalPreviews.length > 0 ? adAdditionalPreviews : await filesToDataUrls(e.currentTarget?.additionalAdImages?.files || []);
      console.log('Primary image:', primaryAdImage ? 'uploaded' : 'none');
      console.log('Additional images count:', additionalAdImages.length);
      console.log('Additional images:', additionalAdImages);
      console.log('adAdditionalPreviews state:', adAdditionalPreviews);
      if (!primaryAdImage && !adFormData.imageUrl && additionalAdImages.length === 0 && (!Array.isArray(adFormData.imageUrls) || adFormData.imageUrls.length === 0)) {
        alert('Please select at least one image');
        return;
      }

      // If it's a new category, create it first
      if (adFormData.categoryName === 'Other' && adFormData.customCategory.trim()) {
        await adminApi.createAdCategory({
          name: adFormData.customCategory,
          emoji: '📁',
          subcategories: []
        });
        // Reload categories to get the new one
        await loadAdCategories();
      }

      const adData = {
        ...adFormData,
        price: parseFloat(adFormData.price),
        categoryName: adFormData.categoryName === 'Other' ? adFormData.customCategory : adFormData.categoryName,
        imageUrl: primaryAdImage || adFormData.imageUrl || (additionalAdImages.length > 0 ? additionalAdImages[0] : ''),
        imageUrls: additionalAdImages.length > 0
          ? additionalAdImages
          : (primaryAdImage ? [primaryAdImage] : (editModal.data?.id ? (Array.isArray(adFormData.imageUrls) ? adFormData.imageUrls : []) : [])),
        sellerId: editModal.data?.sellerId || 'admin',
        sellerName: editModal.data?.sellerName || 'Admin',
        sellerEmail: adFormData.email,
        sellerPhone: adFormData.phone,
        phoneDisplayStatus: 'Visible',
        views: editModal.data?.views || 0,
        postedDate: editModal.data?.postedDate || new Date().toISOString()
      };
      console.log('Final adData imageUrls:', adData.imageUrls);
      console.log('Final adData imageUrl:', adData.imageUrl);
      console.log('Sending adData to backend:', JSON.stringify({ imageUrl: adData.imageUrl, imageUrlsCount: adData.imageUrls?.length }, null, 2));

      if (editModal.data?.id) {
        await adminApi.updateAd(editModal.data.id, adData);
        alert('Ad updated successfully!');
      } else {
        await adminApi.createAd(adData);
        alert('Ad created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      setAdFormData({
        title: '',
        description: '',
        price: '',
        categoryName: '',
        subcategory: '',
        customCategory: '',
        location: '',
        city: '',
        condition: '',
        phone: '',
        email: '',
        imageUrl: '',
        imageUrls: [],
        negotiable: false,
        isFeatured: false,
        isUrgent: false,
        status: 'Active'
      });
      setAdPrimaryPreview('');
      setAdAdditionalPreviews([]);
      loadAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      console.error('Error response:', error.response?.data);
      alert(`Error saving ad: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    }
  };

  // Job handlers
  const handleDeleteJob = async (jobId) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await adminApi.deleteJob(jobId);
        loadJobs();
        alert('Job deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      await adminApi.updateJobStatus(jobId, status);
      loadJobs();
      alert('Job status updated!');
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleEditJob = (job) => {
    setEditModal({ isOpen: true, type: 'job', data: job });
  };

  const handleSaveJob = async (jobData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updateJob(editModal.data.id, jobData);
        alert('Job updated successfully!');
      } else {
        await adminApi.createJob(jobData);
        alert('Job created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      loadJobs();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  // Transport handlers
  const handleDeleteTransport = async (transportId) => {
    if (confirm('Are you sure you want to delete this transport?')) {
      try {
        await adminApi.deleteTransport(transportId);
        loadTransports();
        alert('Transport deleted successfully!');
      } catch (error) {
        console.error('Error deleting transport:', error);
      }
    }
  };

  const handleUpdateTransportStatus = async (transportId, status) => {
    try {
      await adminApi.updateTransportStatus(transportId, status);
      loadTransports();
      alert('Transport status updated!');
    } catch (error) {
      console.error('Error updating transport status:', error);
    }
  };

  const handleEditTransport = (transport) => {
    setEditModal({ isOpen: true, type: 'transport', data: transport });
  };

  const handleSaveTransport = async (transportData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updateTransport(editModal.data.id, transportData);
        alert('Transport updated successfully!');
      } else {
        await adminApi.createTransport(transportData);
        alert('Transport created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      loadTransports();
    } catch (error) {
      console.error('Error saving transport:', error);
    }
  };

  // Package handlers
  const handleDeletePackage = async (packageId) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await adminApi.deletePackage(packageId);
        loadPackages();
        alert('Package deleted successfully!');
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleUpdatePackageStatus = async (packageId, status) => {
    try {
      await adminApi.updatePackageStatus(packageId, status);
      loadPackages();
      alert('Package status updated!');
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const handleEditPackage = (pkg) => {
    setEditModal({ isOpen: true, type: 'package', data: pkg });
  };

  const handleSavePackage = async (packageData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updatePackage(editModal.data.id, packageData);
        alert('Package updated successfully!');
      } else {
        await adminApi.createPackage(packageData);
        alert('Package created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      loadPackages();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  // Movie handlers
  const handleDeleteMovie = async (movieId) => {
    if (confirm('Are you sure you want to delete this movie?')) {
      try {
        await adminApi.deleteMovie(movieId);
        loadMovies();
        alert('Movie deleted successfully!');
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  const handleUpdateMovieStatus = async (movieId, status) => {
    try {
      await adminApi.updateMovieStatus(movieId, status);
      loadMovies();
      alert('Movie status updated!');
    } catch (error) {
      console.error('Error updating movie status:', error);
    }
  };

  const handleEditMovie = (movie) => {
    setEditModal({ isOpen: true, type: 'movie', data: movie });
  };

  const handleSaveMovie = async (movieData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updateMovie(editModal.data.id, movieData);
        alert('Movie updated successfully!');
      } else {
        await adminApi.createMovie(movieData);
        alert('Movie created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      loadMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
    }
  };

  // User status handler
  const handleUpdateUserStatus = async (userId, isActive) => {
    try {
      await adminApi.updateUserStatus(userId, isActive);
      loadUsers();
      alert('User status updated!');
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleEditUser = (user) => {
    setEditModal({ isOpen: true, type: 'user', data: user });
  };

  const handleSaveUser = async (userData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updateUser(editModal.data.id, userData);
        alert('User updated successfully!');
      } else {
        await adminApi.register(userData);
        alert('User created successfully!');
      }
      setEditModal({ isOpen: false, type: null, data: null });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Error saving user. Please try again.');
    }
  };

  const handleSeedData = async () => {
    if (confirm('This will clear all existing data and seed fresh data. Are you sure?')) {
      try {
        await adminApi.seedData();
        alert('Database seeded successfully!');
        loadDashboard();
        loadUsers();
        loadProducts();
        loadAds();
        loadJobs();
        loadTransports();
        loadPackages();
        loadMovies();
      } catch (error) {
        console.error('Error seeding data:', error);
        alert('Error seeding data. Please try again.');
      }
    }
  };

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your platform efficiently</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 border-b border-purple-200 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {['overview', 'shopping', 'ads', 'jobs', 'transport', 'packages', 'movies', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-semibold transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-6">
              <button
                onClick={handleSeedData}
                className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Seed Database Data
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => setActiveTab('users')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Total Users</p>
                    <p className="text-4xl font-bold">{dashboard.totalUsers}</p>
                    <p className="text-blue-200 text-xs mt-2">Active accounts</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3">
                    <Users size={32} className="text-white" />
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('shopping')}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium mb-1">Total Products</p>
                    <p className="text-4xl font-bold">{dashboard.totalProducts}</p>
                    <p className="text-green-200 text-xs mt-2">Available items</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3">
                    <ShoppingBag size={32} className="text-white" />
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('shopping')}
                className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Total Orders</p>
                    <p className="text-4xl font-bold">{dashboard.totalOrders}</p>
                    <p className="text-purple-200 text-xs mt-2">All time orders</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium mb-1">Total Revenue</p>
                    <p className="text-4xl font-bold">{formatPrice(dashboard.totalRevenue)}</p>
                    <p className="text-amber-200 text-xs mt-2">Total earnings</p>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-3">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div 
                onClick={() => setActiveTab('jobs')}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 rounded-xl p-3">
                    <Briefcase size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-800">{dashboard.totalJobs || 0}</p>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('ads')}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 rounded-xl p-3">
                    <Film size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Ads</p>
                    <p className="text-2xl font-bold text-gray-800">{dashboard.totalAds || 0}</p>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setActiveTab('transport')}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 rounded-xl p-3">
                    <Calendar size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-800">{dashboard.totalBookings || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders ({allOrders.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {allOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{order.id.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{order.userName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-800">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleViewOrderDetails(order)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && <ShoppingAdmin />}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Advertisements</h2>
                <p className="text-gray-500 mt-1">Manage all advertisements ({ads.length})</p>
              </div>
              <button
                onClick={() => {
                  setAdFormData({
                    title: '',
                    description: '',
                    price: '',
                    categoryName: '',
                    subcategory: '',
                    customCategory: '',
                    location: '',
                    city: '',
                    condition: '',
                    phone: '',
                    email: '',
                    imageUrl: '',
                    imageUrls: [],
                    negotiable: false,
                    isFeatured: false,
                    isUrgent: false,
                    status: 'Active'
                  });
                  setAdPrimaryPreview('');
                  setAdAdditionalPreviews([]);
                  setSelectedState('');
                  setEditModal({ isOpen: true, type: 'ad', data: null });
                }}
                className="relative group bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add Ad</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-purple-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ads..."
                    value={adSearchTerm || ''}
                    onChange={(e) => setAdSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400" size={18} />
                </div>
                <div>
                  <select
                    value={adCategoryFilter || 'All'}
                    onChange={(e) => setAdCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                  >
                    <option value="All">All Categories</option>
                    {adCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={adStatusFilter || 'All'}
                    onChange={(e) => setAdStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <select
                    value={adSortBy || 'newest'}
                    onChange={(e) => setAdSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <input
                    type="checkbox"
                    checked={adFeaturedOnly || false}
                    onChange={(e) => setAdFeaturedOnly(e.target.checked)}
                    className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Featured Only</span>
                </label>
                <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
                  <input
                    type="checkbox"
                    checked={adUrgentOnly || false}
                    onChange={(e) => setAdUrgentOnly(e.target.checked)}
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Urgent Only</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-purple-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Title</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Category</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Seller</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Price</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Location</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Views</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-purple-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads
                    .filter(ad => {
                      const matchSearch = !adSearchTerm || ad.title?.toLowerCase().includes(adSearchTerm.toLowerCase()) || ad.description?.toLowerCase().includes(adSearchTerm.toLowerCase());
                      const matchCategory = adCategoryFilter === 'All' || ad.categoryName === adCategoryFilter;
                      const matchStatus = adStatusFilter === 'All' || ad.status === adStatusFilter;
                      const matchFeatured = !adFeaturedOnly || ad.isFeatured;
                      const matchUrgent = !adUrgentOnly || ad.isUrgent;
                      return matchSearch && matchCategory && matchStatus && matchFeatured && matchUrgent;
                    })
                    .sort((a, b) => {
                      if (adSortBy === 'newest') return new Date(b.postedDate || b.createdAt) - new Date(a.postedDate || a.createdAt);
                      if (adSortBy === 'oldest') return new Date(a.postedDate || a.createdAt) - new Date(b.postedDate || b.createdAt);
                      if (adSortBy === 'price-low') return a.price - b.price;
                      if (adSortBy === 'price-high') return b.price - a.price;
                      if (adSortBy === 'popular') return (b.views || 0) - (a.views || 0);
                      return 0;
                    })
                    .map((ad) => (
                    <tr key={ad.id} className="hover:bg-purple-50 transition-colors border-b border-purple-100">
                      <td className="px-4 py-4 text-sm text-gray-800 max-w-xs truncate font-medium">{ad.title}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{ad.categoryName}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{ad.sellerEmail || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-purple-600">₹{ad.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{ad.location}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          ad.status === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 
                          ad.status === 'Inactive' ? 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md' :
                          'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{ad.views || 0}</td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditAd(ad)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateAdStatus(ad.id, ad.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-all ${ad.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={ad.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {ad.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-blue-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Jobs Management</h2>
                <p className="text-gray-500 mt-1">Manage all job postings ({jobs.length})</p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'job', data: null })}
                className="relative group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add Job</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-blue-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Job Title</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Company</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Location</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Salary</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Type</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-blue-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-blue-50 transition-colors border-b border-blue-100">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-gray-800">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.experience || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800">{job.company}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{job.location}</td>
                      <td className="px-4 py-4 text-sm font-bold text-green-600">{job.salary}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-gradient-to-r from-blue-400 to-blue-500 text-white px-3 py-1 rounded-full font-medium shadow-md">{job.type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          job.status === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-all ${job.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={job.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {job.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-green-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Transport Management</h2>
                <p className="text-gray-500 mt-1">Manage all transport services ({transports.length})</p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'transport', data: null })}
                className="relative group bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add Transport</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-green-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-green-50 to-teal-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Type</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Route</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Price</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Duration</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-green-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transports.map((transport) => (
                    <tr key={transport.id} className="hover:bg-green-50 transition-colors border-b border-green-100">
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{transport.name}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-gradient-to-r from-green-400 to-teal-400 text-white px-3 py-1 rounded-full font-medium shadow-md">{transport.type}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800">{transport.source} → {transport.destination}</td>
                      <td className="px-4 py-4 text-sm font-bold text-green-600">₹{transport.price?.toLocaleString('en-IN') || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{transport.duration || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          transport.status === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                        }`}>
                          {transport.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditTransport(transport)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateTransportStatus(transport.id, transport.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-all ${transport.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={transport.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {transport.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteTransport(transport.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Packages Tab */}
        {activeTab === 'packages' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-orange-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Travel Packages</h2>
                <p className="text-gray-500 mt-1">Manage all travel packages ({packages.length})</p>
              </div>
              <button
                onClick={() => {
                  setPackagePreview('');
                  setEditModal({ isOpen: true, type: 'package', data: null });
                }}
                className="relative group bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add Package</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-orange-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-orange-800">Name</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-orange-800">Duration</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-orange-800">Price</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-orange-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-orange-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-orange-50 transition-colors border-b border-orange-100">
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{pkg.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{pkg.duration}</td>
                      <td className="px-4 py-4 text-sm font-bold text-orange-600">₹{pkg.price?.toLocaleString('en-IN') || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          pkg.status === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdatePackageStatus(pkg.id, pkg.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-all ${pkg.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={pkg.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {pkg.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Movies Tab */}
        {activeTab === 'movies' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-pink-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Movies Management</h2>
                <p className="text-gray-500 mt-1">Manage all movies ({movies.length})</p>
              </div>
              <button
                onClick={() => {
                  setMoviePreview('');
                  setEditModal({ isOpen: true, type: 'movie', data: null });
                }}
                className="relative group bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add Movie</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-pink-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-50 to-rose-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Title</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Genre</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Language</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Duration</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Rating</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-pink-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-pink-50 transition-colors border-b border-pink-100">
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{movie.title}</td>
                      <td className="px-4 py-4">
                        <span className="text-xs bg-gradient-to-r from-pink-400 to-rose-400 text-white px-3 py-1 rounded-full font-medium shadow-md">{movie.genre}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-800">{movie.language || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{movie.duration || 'N/A'} min</td>
                      <td className="px-4 py-4 text-sm font-bold text-pink-600">⭐ {movie.rating || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          movie.status === 'Active' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                        }`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditMovie(movie)}
                          className="p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateMovieStatus(movie.id, movie.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-all ${movie.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={movie.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {movie.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-indigo-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Users Management</h2>
                <p className="text-gray-500 mt-1">Manage all users ({users.length})</p>
              </div>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'user', data: null })}
                className="relative group bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-xl transition-opacity"></div>
                <Plus size={20} className="mr-2 relative z-10" />
                <span className="relative z-10">Add User</span>
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-indigo-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-violet-50">
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Username</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Full Name</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Email</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Phone</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Role</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Status</th>
                    <th className="px-4 py-4 text-left text-sm font-bold text-indigo-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-indigo-50 transition-colors border-b border-indigo-100">
                      <td className="px-4 py-4 text-sm text-gray-800 font-medium">{user.username}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{user.fullName}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{user.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-800">{user.phone || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium shadow-md ${
                          user.role === 'Admin' ? 'bg-gradient-to-r from-purple-400 to-purple-500 text-white' :
                          user.role === 'Recruiter' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                          user.role === 'Advertiser' ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                          user.role === 'BookingAgent' ? 'bg-gradient-to-r from-teal-400 to-teal-500 text-white' :
                          'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          user.isActive ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, !user.isActive)}
                          className={`p-2 rounded-lg transition-all ${user.isActive ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderDetails && selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-1">Order Details</h3>
                    <p className="text-blue-100 text-sm">Order ID: {selectedOrder.id.substring(0, 12)}...</p>
                  </div>
                  <button
                    onClick={() => setShowOrderDetails(false)}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                  >
                    <X size={24} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Order Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 rounded-lg p-2">
                        <Calendar size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 rounded-lg p-2">
                        <Users size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Customer</p>
                        <p className="font-semibold text-gray-800 text-sm">{selectedOrder.userName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 rounded-lg p-2">
                        <DollarSign size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Amount</p>
                        <p className="font-bold text-gray-800 text-sm">{formatPrice(selectedOrder.total)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Package size={18} className="text-blue-600" />
                      Order Items
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variant</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.sizeOptionName && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Size: {item.sizeOptionName}</span>}
                              {item.colorVariantName && <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Color: {item.colorVariantName}</span>}
                              {!item.sizeOptionName && !item.colorVariantName && <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-800">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">{formatPrice(selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-800">{formatPrice(99)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Tax (18%)</span>
                      <span className="font-medium text-gray-800">{formatPrice((selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0) * 0.18)}</span>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="bg-blue-100 rounded-lg p-1.5">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      Shipping Address
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOrder.shippingAddress}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="bg-green-100 rounded-lg p-1.5">
                        <MapPin size={16} className="text-green-600" />
                      </div>
                      Billing Address
                    </h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedOrder.billingAddress}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="bg-purple-100 rounded-lg p-1.5">
                      <DollarSign size={16} className="text-purple-600" />
                    </div>
                    Payment Method
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 inline-block">{selectedOrder.paymentMethod}</p>
                </div>

                {/* Status Update */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <RefreshCw size={18} className="text-blue-600" />
                    Update Order Status
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, status);
                          setShowOrderDetails(false);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                          selectedOrder.status === status
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editModal.data ? `Edit ${editModal.type.charAt(0).toUpperCase() + editModal.type.slice(1)}` : `Add ${editModal.type.charAt(0).toUpperCase() + editModal.type.slice(1)}`}
                </h3>
                <button
                  onClick={() => setEditModal({ isOpen: false, type: null, data: null })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {editModal.type === 'product' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  // Validate all fields using MongoDB settings
                  const errors = {};
                  const name = e.target.name.value;
                  const description = e.target.description.value;
                  const price = e.target.price.value;
                  const stock = e.target.stock.value;
                  const seller = e.target.seller.value;
                  const prosValue = e.target.pros.value;
                  const consValue = e.target.cons.value;
                  const categoryName = selectedCategory === 'other' ? customCategory : e.target.categorySelect.value;
                  console.log('Category Name:', categoryName, 'Selected Category:', selectedCategory, 'Custom Category:', customCategory);
                  
                  // Name validation
                  const nameResult = validateField('name', name);
                  if (!nameResult.isValid) errors.name = nameResult.errors[0];
                  
                  // Description validation
                  const descriptionResult = validateField('description', description);
                  if (!descriptionResult.isValid) errors.description = descriptionResult.errors[0];
                  
                  // Price validation
                  const priceResult = validateField('price', price);
                  if (!priceResult.isValid) errors.price = priceResult.errors[0];
                  
                  // Stock validation
                  const stockResult = validateField('stock', stock);
                  if (!stockResult.isValid) errors.stock = stockResult.errors[0];
                  
                  // Seller validation
                  const sellerResult = validateField('seller', seller);
                  if (!sellerResult.isValid) errors.seller = sellerResult.errors[0];
                  
                  // Category validation
                  if (!categoryName || !categoryName.trim()) {
                    errors.category = 'Category is required';
                  }
                  
                  // Pros validation
                  const prosArray = prosValue ? prosValue.split('\n').map(p => p.trim()).filter(p => p) : [];
                  if (prosArray.length === 0) {
                    errors.pros = 'At least one pro is required';
                  } else {
                    prosArray.forEach((pro, idx) => {
                      if (pro.length > 500) {
                        errors.pros = `Pro ${idx + 1} must not exceed 500 characters`;
                      }
                    });
                  }
                  
                  // Cons validation
                  const consArray = consValue ? consValue.split('\n').map(c => c.trim()).filter(c => c) : [];
                  if (consArray.length === 0) {
                    errors.cons = 'At least one con is required';
                  } else {
                    consArray.forEach((con, idx) => {
                      if (con.length > 500) {
                        errors.cons = `Con ${idx + 1} must not exceed 500 characters`;
                      }
                    });
                  }
                  
                  // Image validation
                  if (!productPrimaryPreview && !editModal.data?.imageUrl) {
                    errors.imageUrl = 'Primary image is required';
                  }
                  
                  const existingAllImages = [...productAdditionalPreviews, ...(editModal.data?.imageUrls || [])];
                  if (existingAllImages.length === 0) {
                    errors.imageUrls = 'At least one secondary image is required';
                  }
                  
                  if (Object.keys(errors).length > 0) {
                    setProductValidationErrors(errors);
                    return;
                  }
                  
                  setProductValidationErrors({});
                  
                  // Image validation
                  const primaryImage = await fileToDataUrl(e.target.imageUrl.files?.[0]);
                  const uploadedImageUrls = await filesToDataUrls(e.target.imageUrls.files);
                  const newAllImages = [...productAdditionalImages, ...uploadedImageUrls];
                  
                  if (!primaryImage && !editModal.data?.imageUrl) {
                    errors.imageUrl = 'Primary image is required';
                  }
                  
                  if (newAllImages.length === 0 && (!editModal.data?.imageUrls || editModal.data.imageUrls.length === 0)) {
                    errors.imageUrls = 'At least one secondary image is required';
                  }
                  
                  if (Object.keys(errors).length > 0) {
                    setProductValidationErrors(errors);
                    return;
                  }
                  
                  const imageUrlsArray = newAllImages.length > 0 ? newAllImages : (editModal.data?.imageUrls || []);
                  const categoryImage = await fileToDataUrl(e.target.customCategoryImage?.files?.[0]);
                  if (selectedCategory === 'other' && categoryImage) {
                    setCustomCategoryUrl(categoryImage);
                  }
                  
                  handleSaveProduct({
                    name: e.target.name.value,
                    description: e.target.description.value,
                    price: parseFloat(e.target.price.value),
                    stock: parseInt(e.target.stock.value),
                    seller: e.target.seller.value,
                    imageUrl: primaryImage || editModal.data?.imageUrl || '',
                    imageUrls: imageUrlsArray,
                    rating: parseFloat(e.target.rating.value) || 0,
                    pros: prosArray,
                    cons: consArray,
                    status: e.target.status.value,
                    categoryName: categoryName,
                    displaySequence: parseInt(e.target.displaySequence.value) || 0
                  });
                  setCustomCategory('');
                  setSelectedCategory('');
                  setProductPrimaryPreview('');
                  setProductAdditionalPreviews([]);
                  setProductAdditionalImages([]);
                  setProductValidationErrors({});
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input 
                        name="name" 
                        defaultValue={editModal.data?.name} 
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                        maxLength={validationSettings.name?.validationRules.maxLength || 20} 
                        onBlur={(e) => {
                          const result = validateField('name', e.target.value);
                          setProductValidationErrors({...productValidationErrors, name: result.errors[0] || ''});
                        }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-red-500">{productValidationErrors.name || ''}</span>
                        <span className="text-xs text-gray-500">{editModal.data?.name?.length || 0}/{validationSettings.name?.validationRules.maxLength || 20}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea 
                        name="description" 
                        defaultValue={editModal.data?.description} 
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.description ? 'border-red-500' : 'border-gray-300'}`} 
                        rows="3" 
                        maxLength={validationSettings.description?.validationRules.maxLength || 2000}
                        onBlur={(e) => {
                          const result = validateField('description', e.target.value);
                          setProductValidationErrors({...productValidationErrors, description: result.errors[0] || ''});
                        }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-red-500">{productValidationErrors.description || ''}</span>
                        <span className="text-xs text-gray-500">{editModal.data?.description?.length || 0}/{validationSettings.description?.validationRules.maxLength || 2000}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                        <input 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          min={validationSettings.price?.validationRules.minValue || 0} 
                          max={validationSettings.price?.validationRules.maxValue || 9999999} 
                          defaultValue={editModal.data?.price} 
                          className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.price ? 'border-red-500' : 'border-gray-300'}`} 
                          required 
                          maxLength="7"
                          onBlur={(e) => {
                            const result = validateField('price', e.target.value);
                            setProductValidationErrors({...productValidationErrors, price: result.errors[0] || ''});
                          }}
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.price || ''}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                        <input 
                          name="stock" 
                          type="number" 
                          min={validationSettings.stock?.validationRules.minValue || 0} 
                          max={validationSettings.stock?.validationRules.maxValue || 9999999} 
                          defaultValue={editModal.data?.stock} 
                          className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.stock ? 'border-red-500' : 'border-gray-300'}`} 
                          required 
                          maxLength="7"
                          onBlur={(e) => {
                            const result = validateField('stock', e.target.value);
                            setProductValidationErrors({...productValidationErrors, stock: result.errors[0] || ''});
                          }}
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.stock || ''}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seller *</label>
                      <input 
                        name="seller" 
                        defaultValue={editModal.data?.seller} 
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.seller ? 'border-red-500' : 'border-gray-300'}`} 
                        maxLength={validationSettings.seller?.validationRules.maxLength || 50}
                        onBlur={(e) => {
                          const result = validateField('seller', e.target.value);
                          setProductValidationErrors({...productValidationErrors, seller: result.errors[0] || ''});
                        }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-red-500">{productValidationErrors.seller || ''}</span>
                        <span className="text-xs text-gray-500">{editModal.data?.seller?.length || 0}/{validationSettings.seller?.validationRules.maxLength || 50}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Sequence *</label>
                      <input
                        name="displaySequence"
                        type="number"
                        min="0"
                        value={editModal.data?.displaySequence || defaultDisplaySequence || 0}
                        onChange={(e) => setDefaultDisplaySequence(parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.displaySequence ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        onBlur={(e) => {
                          const result = validateField('displaySequence', parseInt(e.target.value));
                          setProductValidationErrors({...productValidationErrors, displaySequence: result.errors[0] || ''});
                        }}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.displaySequence || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image *</label>
                      <input 
                        name="imageUrl" 
                        type="file" 
                        accept="image/*" 
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.imageUrl ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setProductPrimaryPreview(preview);
                            setProductValidationErrors({...productValidationErrors, imageUrl: ''});
                          }
                        }}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.imageUrl || ''}</span>
                      {(productPrimaryPreview || editModal.data?.imageUrl) && (
                        <div className="mt-2 relative inline-block">
                          <img src={productPrimaryPreview || editModal.data?.imageUrl} alt="Preview" className="h-32 w-32 rounded object-cover border" />
                          {(productPrimaryPreview || editModal.data?.imageUrl) && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductPrimaryPreview('');
                                setProductValidationErrors({...productValidationErrors, imageUrl: 'Primary image is required'});
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Images *</label>
                      <input 
                        name="imageUrls" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.imageUrls ? 'border-red-500' : 'border-gray-300'}`}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const previews = await filesToDataUrls(files);
                            setProductAdditionalImages([...productAdditionalImages, ...previews]);
                            setProductAdditionalPreviews([...productAdditionalPreviews, ...previews]);
                            setProductValidationErrors({...productValidationErrors, imageUrls: ''});
                          }
                        }}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.imageUrls || ''}</span>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        {productAdditionalImages.map((url, index) => (
                          <div key={`new-${index}`} className="relative inline-block">
                            <img src={url} alt={`New ${index + 1}`} className="h-20 w-20 rounded object-cover border" />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = productAdditionalImages.filter((_, i) => i !== index);
                                const newPreviews = productAdditionalPreviews.filter((_, i) => i !== index);
                                setProductAdditionalImages(newImages);
                                setProductAdditionalPreviews(newPreviews);
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {editModal.data?.imageUrls?.map((url, index) => (
                          <div key={`existing-${index}`} className="relative inline-block">
                            <img src={url} alt={`Existing ${index + 1}`} className="h-20 w-20 rounded object-cover border" />
                            <button
                              type="button"
                              onClick={() => {
                                const existingImages = editModal.data.imageUrls.filter((_, i) => i !== index);
                                editModal.data.imageUrls = existingImages;
                                setEditModal({...editModal, data: {...editModal.data, imageUrls: existingImages}});
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
                        <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={editModal.data?.rating || 0} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" readOnly />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pros (one per line, max 500 chars each) *</label>
                      <textarea
                        name="pros"
                        defaultValue={editModal.data?.pros ? editModal.data.pros.join('\n') : ''}
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.pros ? 'border-red-500' : 'border-gray-300'}`}
                        rows="3"
                        placeholder="Enter each pro on a new line"
                        onBlur={(e) => {
                          const value = e.target.value;
                          const prosArray = value ? value.split('\n').map(p => p.trim()).filter(p => p) : [];
                          if (prosArray.length === 0) {
                            setProductValidationErrors({...productValidationErrors, pros: 'At least one pro is required'});
                          } else {
                            let hasError = false;
                            prosArray.forEach((pro, idx) => {
                              if (pro.length > 500) {
                                setProductValidationErrors({...productValidationErrors, pros: `Pro ${idx + 1} must not exceed 500 characters`});
                                hasError = true;
                              } else if (!/^[a-zA-Z0-9\s\.,!?;:'"()\-]+$/.test(pro)) {
                                setProductValidationErrors({...productValidationErrors, pros: `Pro ${idx + 1} contains invalid characters`});
                                hasError = true;
                              }
                            });
                            if (!hasError) {
                              setProductValidationErrors({...productValidationErrors, pros: ''});
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.pros || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cons (one per line, max 500 chars each) *</label>
                      <textarea
                        name="cons"
                        defaultValue={editModal.data?.cons ? editModal.data.cons.join('\n') : ''}
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.cons ? 'border-red-500' : 'border-gray-300'}`}
                        rows="3"
                        placeholder="Enter each con on a new line"
                        onBlur={(e) => {
                          const value = e.target.value;
                          const consArray = value ? value.split('\n').map(c => c.trim()).filter(c => c) : [];
                          if (consArray.length === 0) {
                            setProductValidationErrors({...productValidationErrors, cons: 'At least one con is required'});
                          } else {
                            let hasError = false;
                            consArray.forEach((con, idx) => {
                              if (con.length > 500) {
                                setProductValidationErrors({...productValidationErrors, cons: `Con ${idx + 1} must not exceed 500 characters`});
                                hasError = true;
                              } else if (!/^[a-zA-Z0-9\s\.,!?;:'"()\-]+$/.test(con)) {
                                setProductValidationErrors({...productValidationErrors, cons: `Con ${idx + 1} contains invalid characters`});
                                hasError = true;
                              }
                            });
                            if (!hasError) {
                              setProductValidationErrors({...productValidationErrors, cons: ''});
                            }
                          }
                        }}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.cons || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        name="categorySelect"
                        value={selectedCategory || editModal.data?.categoryName || ''}
                        className={`w-full px-3 py-2 border rounded-lg ${productValidationErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                        required
                        onChange={async (e) => {
                          setSelectedCategory(e.target.value);
                          setProductValidationErrors({...productValidationErrors, category: ''});
                          if (e.target.value === 'other') {
                            setCustomCategory('');
                          } else if (e.target.value) {
                            // Fetch default display sequence for the selected category
                            try {
                              const response = await adminApi.getNextDisplaySequence(e.target.value);
                              setDefaultDisplaySequence(response.data.nextSequence);
                            } catch (error) {
                              console.error('Error fetching next display sequence:', error);
                              setDefaultDisplaySequence(0);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (!value) {
                            setProductValidationErrors({...productValidationErrors, category: 'Category is required'});
                          } else {
                            setProductValidationErrors({...productValidationErrors, category: ''});
                          }
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                        <option value="other">Other (Add New)</option>
                        {editModal.data?.categoryName && !categories.find(c => c.name === editModal.data.categoryName) && (
                          <option value={editModal.data.categoryName}>{editModal.data.categoryName} (Existing)</option>
                        )}
                      </select>
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.category || ''}</span>
                    </div>
                    {selectedCategory === 'other' && (
                      <div id="customCategoryField" className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Category Name</label>
                          <input
                            name="customCategory"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            required
                            maxLength="100"
                            pattern="[a-zA-Z0-9\s\-_.,&()@#%]+"
                            title="Only letters, numbers, spaces and common punctuation allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                          <input
                            name="customCategoryImage"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => setCustomCategoryUrl(await fileToDataUrl(e.target.files?.[0]))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          {customCategoryUrl && <img src={customCategoryUrl} alt="Category preview" className="mt-2 h-20 w-20 rounded object-cover" />}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category Description</label>
                          <textarea
                            name="customCategoryDescription"
                            value={customCategoryDescription}
                            onChange={(e) => setCustomCategoryDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows="2"
                            maxLength="500"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Save
                    </button>
                  </div>
                </form>
              )}

              {editModal.type === 'ad' && (
                <form onSubmit={handleSaveAd} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title *</label>
                    <input
                      type="text"
                      value={adFormData.title}
                      onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                      placeholder="What are you selling?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={adFormData.description}
                      onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all resize-none"
                      rows="4"
                      placeholder="Describe your item in detail..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        step="1"
                        value={adFormData.price}
                        onChange={(e) => setAdFormData({ ...adFormData, price: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                        placeholder="Enter price"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                      <select
                        value={adFormData.categoryName}
                        onChange={(e) => setAdFormData({ ...adFormData, categoryName: e.target.value, subcategory: '', customCategory: '' })}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                        required
                      >
                        <option value="">Select Category</option>
                        {adCategories.map((category) => (
                          <option key={category.id} value={category.name}>{category.emoji} {category.name}</option>
                        ))}
                        <option value="Other">📦 Other</option>
                      </select>
                    </div>
                  </div>
                  {adFormData.categoryName === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Category Name *</label>
                      <input
                        type="text"
                        value={adFormData.customCategory}
                        onChange={(e) => setAdFormData({ ...adFormData, customCategory: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter custom category name"
                        maxLength="50"
                      />
                    </div>
                  )}
                  {adFormData.categoryName && adFormData.categoryName !== 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                      <select
                        value={adFormData.subcategory}
                        onChange={(e) => setAdFormData({ ...adFormData, subcategory: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="">Select Subcategory</option>
                        {adCategories.find(c => c.name === adFormData.categoryName)?.subcategories?.map((sub) => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={adFormData.location}
                        onChange={(e) => setAdFormData({ ...adFormData, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                        placeholder="Area, Street"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">State *</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          setSelectedState(e.target.value);
                          loadCities(e.target.value);
                          setAdFormData({ ...adFormData, city: '' });
                        }}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">City *</label>
                    <select
                      value={adFormData.city}
                      onChange={(e) => setAdFormData({ ...adFormData, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                      required
                      disabled={!selectedState}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Condition *</label>
                    <select
                      value={adFormData.condition}
                      onChange={(e) => setAdFormData({ ...adFormData, condition: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                      required
                    >
                      <option value="">Select Condition</option>
                      {conditions.map((condition) => (
                        <option key={condition.id} value={condition.name}>{condition.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={adFormData.phone}
                        onChange={(e) => setAdFormData({ ...adFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={adFormData.email}
                        onChange={(e) => setAdFormData({ ...adFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Primary Image *</label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingPrimary 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                      onDragOver={handlePrimaryDragOver}
                      onDragLeave={handlePrimaryDragLeave}
                      onDrop={handlePrimaryDrop}
                    >
                      <input
                        name="primaryAdImage"
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setAdPrimaryPreview(preview);
                          }
                        }}
                      />
                      {adPrimaryPreview || adFormData.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={adPrimaryPreview || adFormData.imageUrl} 
                            alt="Preview" 
                            className="mx-auto h-40 w-40 rounded-xl object-cover border-2 border-purple-200 shadow-lg" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdPrimaryPreview('');
                              setAdFormData({ ...adFormData, imageUrl: '' });
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-purple-400" size={48} />
                          <p className="text-sm text-gray-600 font-medium">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Additional Images</label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingAdditional 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                      onDragOver={handleAdditionalDragOver}
                      onDragLeave={handleAdditionalDragLeave}
                      onDrop={handleAdditionalDrop}
                    >
                      <input
                        name="additionalAdImages"
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            const previews = await filesToDataUrls(files);
                            setAdAdditionalPreviews([...adAdditionalPreviews, ...previews]);
                          }
                        }}
                      />
                      <div className="space-y-2">
                        <ImageIcon className="mx-auto text-purple-400" size={48} />
                        <p className="text-sm text-gray-600 font-medium">Drag & drop or click to upload multiple</p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB each</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {adAdditionalPreviews.length > 0 && adAdditionalPreviews.map((url, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img 
                            src={url} 
                            alt={`New ${index + 1}`} 
                            className="h-24 w-full rounded-xl object-cover border-2 border-purple-200 shadow-md" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = [...adAdditionalPreviews];
                              newPreviews.splice(index, 1);
                              setAdAdditionalPreviews(newPreviews);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {Array.isArray(adFormData.imageUrls) && adFormData.imageUrls.length > 0 && adFormData.imageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img 
                            src={url} 
                            alt={`Existing ${index + 1}`} 
                            className="h-24 w-full rounded-xl object-cover border-2 border-purple-200 shadow-md" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImageUrls = [...adFormData.imageUrls];
                              newImageUrls.splice(index, 1);
                              setAdFormData({ ...adFormData, imageUrls: newImageUrls });
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-all">
                      <input
                        type="checkbox"
                        checked={adFormData.negotiable}
                        onChange={(e) => setAdFormData({ ...adFormData, negotiable: e.target.checked })}
                        className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Negotiable</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-all">
                      <input
                        type="checkbox"
                        checked={adFormData.isFeatured}
                        onChange={(e) => setAdFormData({ ...adFormData, isFeatured: e.target.checked })}
                        className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Featured</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border-2 border-purple-200 rounded-xl hover:border-purple-400 transition-all">
                      <input
                        type="checkbox"
                        checked={adFormData.isUrgent}
                        onChange={(e) => setAdFormData({ ...adFormData, isUrgent: e.target.checked })}
                        className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Urgent</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select
                      value={adFormData.status}
                      onChange={(e) => setAdFormData({ ...adFormData, status: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      {editModal.data?.id ? 'Update Ad' : 'Create Ad'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditModal({ isOpen: false, type: null, data: null });
                        setAdFormData({
                          title: '',
                          description: '',
                          price: '',
                          categoryName: '',
                          subcategory: '',
                          customCategory: '',
                          location: '',
                          city: '',
                          condition: '',
                          phone: '',
                          email: '',
                          imageUrl: '',
                          imageUrls: [],
                          negotiable: false,
                          isFeatured: false,
                          isUrgent: false,
                          status: 'Active'
                        });
                        setAdPrimaryPreview('');
                        setAdAdditionalPreviews([]);
                        setSelectedState('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {editModal.type === 'job' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveJob({ title: e.target.title.value, company: e.target.company.value, location: e.target.location.value, salary: e.target.salary.value, type: e.target.type.value, description: e.target.description.value, skills: e.target.skills.value.split(',').map(s => s.trim()), status: e.target.status.value }); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                    <input name="title" defaultValue={editModal.data?.title} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all" placeholder="e.g. Senior Software Engineer" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Company *</label>
                    <input name="company" defaultValue={editModal.data?.company} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all" placeholder="Company name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                      <input name="location" defaultValue={editModal.data?.location} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all" placeholder="City, State" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Salary *</label>
                      <input name="salary" defaultValue={editModal.data?.salary} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all" placeholder="e.g. ₹10-15 LPA" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Type *</label>
                    <select name="type" defaultValue={editModal.data?.type || 'Full-time'} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all">
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all resize-none" rows="4" placeholder="Job description..." />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Skills (comma separated) *</label>
                    <input name="skills" defaultValue={editModal.data?.skills?.join(', ')} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all" placeholder="e.g. React, Node.js, MongoDB" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                    Save Job
                  </button>
                </form>
              )}

              {editModal.type === 'transport' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveTransport({ type: e.target.type.value, name: e.target.name.value, source: e.target.source.value, destination: e.target.destination.value, price: parseFloat(e.target.price.value), duration: e.target.duration.value, operator: e.target.operator.value, status: e.target.status.value }); }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Transport Type *</label>
                    <select name="type" defaultValue={editModal.data?.type || 'Bus'} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all">
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Flight">Flight</option>
                      <option value="Cab">Cab</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Service Name *</label>
                    <input name="name" defaultValue={editModal.data?.name} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="e.g. Express Bus Service" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Source *</label>
                      <input name="source" defaultValue={editModal.data?.source} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="Starting point" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Destination *</label>
                      <input name="destination" defaultValue={editModal.data?.destination} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="Ending point" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
                      <input name="price" type="number" step="0.01" defaultValue={editModal.data?.price} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="e.g. 500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Duration *</label>
                      <input name="duration" defaultValue={editModal.data?.duration} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="e.g. 2 hours" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Operator</label>
                    <input name="operator" defaultValue={editModal.data?.operator} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all" placeholder="Service operator name" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white transition-all">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl">
                    Save Transport
                  </button>
                </form>
              )}

              {editModal.type === 'package' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const packageImage = await fileToDataUrl(e.target.imageUrl.files?.[0]);
                  handleSavePackage({
                    name: e.target.name.value,
                    description: e.target.description.value,
                    duration: e.target.duration.value,
                    price: parseFloat(e.target.price.value),
                    destinations: e.target.destinations.value.split(',').map(d => d.trim()),
                    imageUrl: packageImage || editModal.data?.imageUrl || '',
                    status: e.target.status.value
                  });
                  setPackagePreview('');
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Package Name *</label>
                    <input name="name" defaultValue={editModal.data?.name} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all" placeholder="e.g. Golden Triangle Tour" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                    <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all resize-none" rows="4" placeholder="Package description..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Duration *</label>
                      <input name="duration" defaultValue={editModal.data?.duration} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all" placeholder="e.g. 5 days 4 nights" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
                      <input name="price" type="number" step="0.01" defaultValue={editModal.data?.price} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all" placeholder="e.g. 25000" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Destinations (comma separated) *</label>
                    <input name="destinations" defaultValue={editModal.data?.destinations?.join(', ')} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all" placeholder="e.g. Delhi, Agra, Jaipur" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Package Image *</label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingPackage 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'
                      }`}
                      onDragOver={handlePackageDragOver}
                      onDragLeave={handlePackageDragLeave}
                      onDrop={handlePackageDrop}
                    >
                      <input 
                        name="imageUrl" 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setPackagePreview(preview);
                          }
                        }}
                      />
                      {packagePreview || editModal.data?.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={packagePreview || editModal.data?.imageUrl} 
                            alt="Preview" 
                            className="mx-auto h-40 w-40 rounded-xl object-cover border-2 border-orange-200 shadow-lg" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPackagePreview('');
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-orange-400" size={48} />
                          <p className="text-sm text-gray-600 font-medium">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white transition-all">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-3 rounded-xl font-bold hover:from-orange-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl">
                    Save Package
                  </button>
                </form>
              )}

              {editModal.type === 'movie' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const movieImage = await fileToDataUrl(e.target.imageUrl.files?.[0]);
                  handleSaveMovie({
                    title: e.target.title.value,
                    genre: e.target.genre.value,
                    language: e.target.language.value,
                    duration: parseInt(e.target.duration.value),
                    rating: parseFloat(e.target.rating.value),
                    imageUrl: movieImage || editModal.data?.imageUrl || '',
                    status: e.target.status.value
                  });
                  setMoviePreview('');
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Movie Title *</label>
                    <input name="title" defaultValue={editModal.data?.title} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all" placeholder="e.g. The Dark Knight" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Genre *</label>
                      <select name="genre" defaultValue={editModal.data?.genre || 'Action'} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all">
                        <option value="Action">Action</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Drama">Drama</option>
                        <option value="Horror">Horror</option>
                        <option value="Romance">Romance</option>
                        <option value="Thriller">Thriller</option>
                        <option value="Sci-Fi">Sci-Fi</option>
                        <option value="Animation">Animation</option>
                        <option value="Documentary">Documentary</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Language *</label>
                      <input name="language" defaultValue={editModal.data?.language} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all" placeholder="e.g. English" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes) *</label>
                      <input name="duration" type="number" defaultValue={editModal.data?.duration} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all" placeholder="e.g. 120" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Rating (1-10) *</label>
                      <input name="rating" type="number" step="0.1" min="1" max="10" defaultValue={editModal.data?.rating} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all" placeholder="e.g. 8.5" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Movie Poster *</label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                        isDraggingMovie 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-pink-200 hover:border-pink-400 hover:bg-pink-50'
                      }`}
                      onDragOver={handleMovieDragOver}
                      onDragLeave={handleMovieDragLeave}
                      onDrop={handleMovieDrop}
                    >
                      <input 
                        name="imageUrl" 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setMoviePreview(preview);
                          }
                        }}
                      />
                      {moviePreview || editModal.data?.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={moviePreview || editModal.data?.imageUrl} 
                            alt="Preview" 
                            className="mx-auto h-40 w-40 rounded-xl object-cover border-2 border-pink-200 shadow-lg" 
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMoviePreview('');
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all shadow-md"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto text-pink-400" size={48} />
                          <p className="text-sm text-gray-600 font-medium">Drag & drop or click to upload</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm bg-white transition-all">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl">
                    Save Movie
                  </button>
                </form>
              )}

              {editModal.type === 'category' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const categoryData = {
                    name: e.target.name.value,
                    description: e.target.description.value,
                    imageUrl: e.target.imageUrl.value,
                    displaySequence: parseInt(e.target.displaySequence.value) || 0,
                    status: e.target.status.value
                  };
                  handleSaveCategory(categoryData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input name="name" defaultValue={editModal.data?.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                      <input name="imageUrl" defaultValue={editModal.data?.imageUrl} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Sequence *</label>
                      <input name="displaySequence" type="number" min="0" value={editModal.data?.displaySequence || defaultCategorySequence || 0} onChange={(e) => setDefaultCategorySequence(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Save
                    </button>
                  </div>
                </form>
              )}

              {editModal.type === 'user' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const userData = {
                    username: e.target.username.value,
                    fullName: e.target.fullName.value,
                    email: e.target.email.value,
                    phone: e.target.phone.value,
                    role: e.target.role.value,
                    isActive: e.target.isActive.value === 'true'
                  };
                  // Only include password if a new one is provided
                  if (e.target.newPassword.value) {
                    userData.password = e.target.newPassword.value;
                  }
                  handleSaveUser(userData);
                }} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Username *</label>
                    <input
                      name="username"
                      defaultValue={editModal.data?.username}
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all"
                      readOnly={!!editModal.data}
                      {...(!editModal.data ? { required: true } : {})}
                      placeholder="Choose a username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                    <input name="fullName" defaultValue={editModal.data?.fullName} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all" required maxLength="100" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={editModal.data?.email}
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all"
                      readOnly={!!editModal.data}
                      {...(!editModal.data ? { required: true } : {})}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                    <input name="phone" defaultValue={editModal.data?.phone} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all" required maxLength="20" pattern="[0-9+\-\s]+" title="Only numbers, +, - and spaces allowed" placeholder="+91 9876543210" />
                  </div>
                  {editModal.data && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                      <input
                        type="text"
                        value="••••••••"
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl bg-indigo-50 text-sm"
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">Current password is masked for security. Enter a new password below to reset.</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password {editModal.data ? '(Leave blank to keep current)' : '(Required)'}</label>
                    <input
                      name="newPassword"
                      type="password"
                      defaultValue=""
                      className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all"
                      {...(!editModal.data ? { required: true, minLength: 6 } : { minLength: 6 })}
                      maxLength="100"
                      placeholder={editModal.data ? "Enter new password to reset" : "Create a password"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Role *</label>
                    <select name="role" defaultValue={editModal.data?.role || 'User'} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all">
                      <option value="User">User</option>
                      <option value="Recruiter">Recruiter</option>
                      <option value="Advertiser">Advertiser</option>
                      <option value="BookingAgent">Booking Agent</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                    <select name="isActive" defaultValue={editModal.data?.isActive ? 'true' : 'false'} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 rounded-xl font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg hover:shadow-xl">
                    Save User
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
