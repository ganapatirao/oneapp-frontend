import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingBag, Briefcase, Calendar, Film, Package, DollarSign, TrendingUp, Plus, Trash2, Edit, Power, PowerOff, X, RefreshCw } from 'lucide-react';
import { adminApi, shoppingApi, advertisingApi, recruitmentApi, bookingApi } from '../../services/api';
import ShoppingAdmin from './ShoppingAdmin';
import SubcategoryFilter from '../SubcategoryFilter';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
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
  }, [navigate]);

  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Product');
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
      const response = await adminApi.getAdCategories();
      if (response.data && response.data.length > 0) {
        setAdCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading ad categories:', error);
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

    // Validation
    if (!adFormData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (adFormData.title.length > 100) {
      alert('Title must be less than 100 characters');
      return;
    }
    if (!adFormData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (adFormData.description.length > 2000) {
      alert('Description must be less than 2000 characters');
      return;
    }
    if (!adFormData.price || parseFloat(adFormData.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (!adFormData.categoryName) {
      alert('Please select a category');
      return;
    }
    if (adFormData.categoryName === 'Other' && !adFormData.customCategory.trim()) {
      alert('Please enter a custom category name');
      return;
    }
    if (adFormData.customCategory && adFormData.customCategory.length > 50) {
      alert('Custom category name must be less than 50 characters');
      return;
    }
    if (!adFormData.location.trim()) {
      alert('Please enter a location');
      return;
    }
    if (adFormData.location.length > 100) {
      alert('Location must be less than 100 characters');
      return;
    }
    if (!adFormData.city) {
      alert('Please select a city');
      return;
    }
    if (!adFormData.condition) {
      alert('Please select a condition');
      return;
    }
    if (!adFormData.phone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    if (!/^\+?[\d\s-]{10,}$/.test(adFormData.phone)) {
      alert('Please enter a valid phone number (min 10 digits)');
      return;
    }
    if (!adFormData.email.trim()) {
      alert('Please enter an email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adFormData.email)) {
      alert('Please enter a valid email address');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b overflow-x-auto">
          {['overview', 'shopping', 'ads', 'jobs', 'transport', 'packages', 'movies', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboard.totalUsers}</p>
                  </div>
                  <Users size={32} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboard.totalProducts}</p>
                  </div>
                  <ShoppingBag size={32} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-800">{dashboard.totalOrders}</p>
                  </div>
                  <TrendingUp size={32} className="text-purple-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-800">${dashboard.totalRevenue.toFixed(2)}</p>
                  </div>
                  <DollarSign size={32} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Tab */}
        {activeTab === 'shopping' && <ShoppingAdmin />}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Advertisements ({ads.length})</h2>
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
                  setEditModal({ isOpen: true, type: 'ad', data: null });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Ad
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Search ads..."
                    value={adSearchTerm || ''}
                    onChange={(e) => setAdSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={adCategoryFilter || 'All'}
                    onChange={(e) => setAdCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="All">All Categories</option>
                    <option value="Jobs">Jobs</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Mobiles">Mobiles</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Services">Services</option>
                    <option value="Pets">Pets</option>
                    <option value="Matrimonial">Matrimonial</option>
                    <option value="Community">Community</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <select
                    value={adStatusFilter || 'All'}
                    onChange={(e) => setAdStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adFeaturedOnly || false}
                    onChange={(e) => setAdFeaturedOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adUrgentOnly || false}
                    onChange={(e) => setAdUrgentOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Urgent Only</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Seller</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Views</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
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
                      if (adSortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
                      if (adSortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
                      if (adSortBy === 'price-low') return a.price - b.price;
                      if (adSortBy === 'price-high') return b.price - a.price;
                      if (adSortBy === 'popular') return (b.views || 0) - (a.views || 0);
                      return 0;
                    })
                    .map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">{ad.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ad.categoryName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ad.sellerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">₹{ad.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ad.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ad.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          ad.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">{ad.views || 0}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditAd(ad)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateAdStatus(ad.id, ad.status === 'Active' ? 'Inactive' : 'Active')}
                          className={ad.status === 'Active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                          title={ad.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {ad.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Jobs Management ({jobs.length})</h2>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'job', data: null })}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={20} />
                Add Job
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Job Title</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Salary</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-blue-50 transition-colors border-b border-gray-100">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.experience || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{job.company}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{job.location}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{job.salary}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">{job.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, job.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-colors ${job.status === 'Active' ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                          title={job.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {job.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Transports ({transports.length})</h2>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'transport', data: null })}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Transport
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Route</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transports.map((transport) => (
                    <tr key={transport.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{transport.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{transport.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{transport.source} → {transport.destination}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transport.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transport.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditTransport(transport)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateTransportStatus(transport.id, transport.status === 'Active' ? 'Inactive' : 'Active')}
                          className={transport.status === 'Active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                          title={transport.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {transport.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteTransport(transport.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Travel Packages ({packages.length})</h2>
              <button
                onClick={() => {
                  setPackagePreview('');
                  setEditModal({ isOpen: true, type: 'package', data: null });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Package
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{pkg.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{pkg.duration}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">${pkg.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pkg.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdatePackageStatus(pkg.id, pkg.status === 'Active' ? 'Inactive' : 'Active')}
                          className={pkg.status === 'Active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                          title={pkg.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {pkg.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Movies ({movies.length})</h2>
              <button
                onClick={() => {
                  setMoviePreview('');
                  setEditModal({ isOpen: true, type: 'movie', data: null });
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Movie
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Genre</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{movie.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{movie.genre}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{movie.rating}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          movie.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditMovie(movie)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateMovieStatus(movie.id, movie.status === 'Active' ? 'Inactive' : 'Active')}
                          className={movie.status === 'Active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                          title={movie.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {movie.status === 'Active' ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.id)}
                          className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Users ({users.length})</h2>
              <button
                onClick={() => setEditModal({ isOpen: true, type: 'user', data: null })}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Full Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{user.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.fullName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{user.phone}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, !user.isActive)}
                          className={user.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
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
                <form onSubmit={handleSaveAd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad Title *</label>
                    <input
                      type="text"
                      value={adFormData.title}
                      onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="What are you selling? (max 100 chars)"
                      required
                      maxLength="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={adFormData.description}
                      onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                      rows="4"
                      placeholder="Describe your item in detail..."
                      required
                      maxLength="2000"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                      <input
                        type="number"
                        step="1"
                        value={adFormData.price}
                        onChange={(e) => setAdFormData({ ...adFormData, price: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter price"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select
                        value={adFormData.categoryName}
                        onChange={(e) => setAdFormData({ ...adFormData, categoryName: e.target.value, subcategory: '', customCategory: '' })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <input
                        type="text"
                        value={adFormData.location}
                        onChange={(e) => setAdFormData({ ...adFormData, location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Area, Street (max 100 chars)"
                        required
                        maxLength="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <select
                        value={adFormData.city}
                        onChange={(e) => setAdFormData({ ...adFormData, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                        required
                      >
                        <option value="">Select City</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Pune">Pune</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="Ahmedabad">Ahmedabad</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                    <select
                      value={adFormData.condition}
                      onChange={(e) => setAdFormData({ ...adFormData, condition: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                      required
                    >
                      <option value="">Select Condition</option>
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={adFormData.phone}
                        onChange={(e) => setAdFormData({ ...adFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="+91 XXXXX XXXXX"
                        pattern="[0-9+\-\s]+"
                        maxLength="15"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={adFormData.email}
                        onChange={(e) => setAdFormData({ ...adFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="your@email.com"
                        maxLength="100"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
                    <input
                      name="primaryAdImage"
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = await fileToDataUrl(file);
                          setAdPrimaryPreview(preview);
                        }
                      }}
                    />
                    {(adPrimaryPreview || adFormData.imageUrl) && (
                      <img src={adPrimaryPreview || adFormData.imageUrl} alt="Preview" className="mt-2 h-32 w-32 rounded object-cover border" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                    <input
                      name="additionalAdImages"
                      type="file"
                      accept="image/*"
                      multiple
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const previews = await filesToDataUrls(files);
                          setAdAdditionalPreviews(previews);
                        }
                      }}
                    />
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {adAdditionalPreviews.length > 0 && adAdditionalPreviews.map((url, index) => (
                        <img key={`new-${index}`} src={url} alt={`New ${index + 1}`} className="h-20 w-20 rounded object-cover border" />
                      ))}
                      {Array.isArray(adFormData.imageUrls) && adFormData.imageUrls.length > 0 && adFormData.imageUrls.map((url, index) => (
                        <img key={`existing-${index}`} src={url} alt={`Existing ${index + 1}`} className="h-20 w-20 rounded object-cover border" />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                      <input
                        type="checkbox"
                        checked={adFormData.negotiable}
                        onChange={(e) => setAdFormData({ ...adFormData, negotiable: e.target.checked })}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Price is negotiable</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                      <input
                        type="checkbox"
                        checked={adFormData.isFeatured}
                        onChange={(e) => setAdFormData({ ...adFormData, isFeatured: e.target.checked })}
                        className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Ad</span>
                    </label>
                    <label className="flex items-center cursor-pointer bg-white px-4 py-3 border border-gray-200 rounded-xl">
                      <input
                        type="checkbox"
                        checked={adFormData.isUrgent}
                        onChange={(e) => setAdFormData({ ...adFormData, isUrgent: e.target.checked })}
                        className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Urgent Sale</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={adFormData.status}
                      onChange={(e) => setAdFormData({ ...adFormData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
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
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {editModal.type === 'job' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveJob({ title: e.target.title.value, company: e.target.company.value, location: e.target.location.value, salary: e.target.salary.value, type: e.target.type.value, description: e.target.description.value, skills: e.target.skills.value.split(',').map(s => s.trim()), status: e.target.status.value }); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input name="title" defaultValue={editModal.data?.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input name="company" defaultValue={editModal.data?.company} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input name="location" defaultValue={editModal.data?.location} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                        <input name="salary" defaultValue={editModal.data?.salary} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <input name="type" defaultValue={editModal.data?.type} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input name="skills" defaultValue={editModal.data?.skills?.join(', ')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
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

              {editModal.type === 'transport' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveTransport({ type: e.target.type.value, name: e.target.name.value, source: e.target.source.value, destination: e.target.destination.value, price: parseFloat(e.target.price.value), duration: e.target.duration.value, operator: e.target.operator.value, status: e.target.status.value }); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <input name="type" defaultValue={editModal.data?.type} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input name="name" defaultValue={editModal.data?.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <input name="source" defaultValue={editModal.data?.source} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                        <input name="destination" defaultValue={editModal.data?.destination} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input name="price" type="number" step="0.01" defaultValue={editModal.data?.price} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input name="duration" defaultValue={editModal.data?.duration} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                      <input name="operator" defaultValue={editModal.data?.operator} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
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
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input name="name" defaultValue={editModal.data?.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input name="duration" defaultValue={editModal.data?.duration} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                        <input name="price" type="number" step="0.01" defaultValue={editModal.data?.price} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destinations (comma separated)</label>
                      <input name="destinations" defaultValue={editModal.data?.destinations?.join(', ')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input 
                        name="imageUrl" 
                        type="file" 
                        accept="image/*" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setPackagePreview(preview);
                          }
                        }}
                      />
                      {(packagePreview || editModal.data?.imageUrl) && (
                        <img src={packagePreview || editModal.data?.imageUrl} alt="Preview" className="mt-2 h-32 w-32 rounded object-cover border" />
                      )}
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
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input name="title" defaultValue={editModal.data?.title} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <input name="genre" defaultValue={editModal.data?.genre} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                        <input name="language" defaultValue={editModal.data?.language} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                        <input name="duration" type="number" defaultValue={editModal.data?.duration} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <input name="rating" type="number" step="0.1" defaultValue={editModal.data?.rating} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                      <input 
                        name="imageUrl" 
                        type="file" 
                        accept="image/*" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const preview = await fileToDataUrl(file);
                            setMoviePreview(preview);
                          }
                        }}
                      />
                      {(moviePreview || editModal.data?.imageUrl) && (
                        <img src={moviePreview || editModal.data?.imageUrl} alt="Preview" className="mt-2 h-32 w-32 rounded object-cover border" />
                      )}
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
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        name="username"
                        defaultValue={editModal.data?.username}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        readOnly={!!editModal.data}
                        {...(!editModal.data ? { required: true } : {})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input name="fullName" defaultValue={editModal.data?.fullName} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required maxLength="100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        name="email"
                        type="email"
                        defaultValue={editModal.data?.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        readOnly={!!editModal.data}
                        {...(!editModal.data ? { required: true } : {})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input name="phone" defaultValue={editModal.data?.phone} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required maxLength="20" pattern="[0-9+\-\s]+" title="Only numbers, +, - and spaces allowed" />
                    </div>
                    {editModal.data && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="text"
                          value="••••••••"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">Current password is masked for security. Enter a new password below to reset.</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password {editModal.data ? '(Leave blank to keep current)' : '(Required)'}</label>
                      <input
                        name="newPassword"
                        type="password"
                        defaultValue=""
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        {...(!editModal.data ? { required: true, minLength: 6 } : { minLength: 6 })}
                        maxLength="100"
                        placeholder={editModal.data ? "Enter new password to reset" : "Create a password"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select name="role" defaultValue={editModal.data?.role || 'User'} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select name="isActive" defaultValue={editModal.data?.isActive ? 'true' : 'false'} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
