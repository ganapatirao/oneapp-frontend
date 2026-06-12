import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Power, PowerOff, X, ChevronDown, ChevronUp, Search, Filter, Calendar, Users, DollarSign, Package, TrendingUp, MapPin, RefreshCw } from 'lucide-react';
import { adminApi } from '../../services/api';

export default function ShoppingAdmin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Category state
  const [categoryFilter, setCategoryFilter] = useState({ name: '', status: '', description: '' });
  const [defaultCategorySequence, setDefaultCategorySequence] = useState(0);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [categoryImageDragging, setCategoryImageDragging] = useState(false);

  // Product state
  const [productFilter, setProductFilter] = useState({ name: '', category: '', status: '', minPrice: '', maxPrice: '', stockLevel: '', hasOffer: '', minRating: '' });
  const [defaultDisplaySequence, setDefaultDisplaySequence] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productValidationErrors, setProductValidationErrors] = useState({});
  const [productAdditionalImages, setProductAdditionalImages] = useState([]);
  const [productPrimaryPreview, setProductPrimaryPreview] = useState('');
  const [productAdditionalPreviews, setProductAdditionalPreviews] = useState([]);
  const [validationSettings, setValidationSettings] = useState({});
  const [sizeOptions, setSizeOptions] = useState([]);
  const [colorVariants, setColorVariants] = useState([]);
  const [selectedColorVariant, setSelectedColorVariant] = useState(0);
  
  // Order state
  const [orderFilter, setOrderFilter] = useState({ status: '', search: '', dateFrom: '', dateTo: '' });
  
  // Modal state
  const [editModal, setEditModal] = useState({ isOpen: false, type: null, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: null, id: null, name: '' });
  const [orderDetailModal, setOrderDetailModal] = useState({ isOpen: false, data: null });

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

  const addSizeOption = () => {
    setSizeOptions([...sizeOptions, { name: '', priceAdjustment: 0, stock: 0 }]);
  };

  const removeSizeOption = (index) => {
    setSizeOptions(sizeOptions.filter((_, i) => i !== index));
  };

  const updateSizeOption = (index, field, value) => {
    const updated = [...sizeOptions];
    updated[index] = { ...updated[index], [field]: value };
    setSizeOptions(updated);
  };

  const addColorVariant = () => {
    setColorVariants([...colorVariants, { name: '', hexCode: '', imageUrl: '', imageUrls: [], priceAdjustment: 0, sizeOptions: [], stock: 0 }]);
  };

  const removeColorVariant = (index) => {
    const updated = colorVariants.filter((_, i) => i !== index);
    setColorVariants(updated);
    if (selectedColorVariant >= updated.length) {
      setSelectedColorVariant(Math.max(0, updated.length - 1));
    }
  };

  const updateColorVariant = (index, field, value) => {
    const updated = [...colorVariants];
    updated[index] = { ...updated[index], [field]: value };
    setColorVariants(updated);
  };

  const updateColorVariantSizeOption = (colorIndex, sizeIndex, field, value) => {
    const updated = [...colorVariants];
    if (!updated[colorIndex].sizeOptions) {
      updated[colorIndex].sizeOptions = [];
    }
    updated[colorIndex].sizeOptions[sizeIndex] = { ...updated[colorIndex].sizeOptions[sizeIndex], [field]: value };
    setColorVariants(updated);
  };

  const addColorVariantSizeOption = (colorIndex) => {
    const updated = [...colorVariants];
    if (!updated[colorIndex].sizeOptions) {
      updated[colorIndex].sizeOptions = [];
    }
    updated[colorIndex].sizeOptions = [...updated[colorIndex].sizeOptions, { name: '', priceAdjustment: 0, stock: 0 }];
    setColorVariants(updated);
  };

  const removeColorVariantSizeOption = (colorIndex, sizeIndex) => {
    const updated = [...colorVariants];
    updated[colorIndex].sizeOptions = updated[colorIndex].sizeOptions.filter((_, i) => i !== sizeIndex);
    setColorVariants(updated);
  };

  const validateField = (fieldName, value) => {
    const setting = validationSettings[fieldName];
    const errors = [];

    // Regex patterns for specific fields
    const regexPatterns = {
      name: /^[a-zA-Z0-9\s\-']+$/,
      seller: /^[a-zA-Z\s\-']+$/,
      price: /^\d{1,7}(\.\d{1,2})?$/,
      stock: /^\d{1,7}$/,
      displaySequence: /^\d+$/,
      offerPercentage: /^\d{1,3}$/,
      rating: /^\d(\.\d{1,2})?$/
    };

    // Backend model validations
    if (fieldName === 'name') {
      if (!value || !value.trim()) {
        errors.push('Name is required');
      } else if (value.length > 100) {
        errors.push('Name must not exceed 100 characters');
      } else if (!regexPatterns.name.test(value)) {
        errors.push('Name can only contain letters, numbers, spaces, hyphens, and apostrophes');
      }
    }

    if (fieldName === 'description') {
      if (!value || !value.trim()) {
        errors.push('Description is required');
      } else if (value.length > 5000) {
        errors.push('Description must not exceed 5000 characters');
      }
    }

    if (fieldName === 'price') {
      if (!value || value === '') {
        errors.push('Price is required');
      } else if (!regexPatterns.price.test(value)) {
        errors.push('Price must be numeric only and not exceed 7 digits');
      } else if (parseFloat(value) <= 0) {
        errors.push('Price must be greater than 0');
      } else if (parseFloat(value) > 9999999) {
        errors.push('Price must not exceed 9999999');
      }
    }

    if (fieldName === 'stock') {
      if (!value || value === '') {
        errors.push('Stock is required');
      } else if (!regexPatterns.stock.test(value)) {
        errors.push('Stock must be numeric only and not exceed 7 digits');
      } else if (parseInt(value) < 0) {
        errors.push('Stock must be 0 or greater');
      }
    }

    if (fieldName === 'seller') {
      if (!value || !value.trim()) {
        errors.push('Seller is required');
      } else if (value.length > 50) {
        errors.push('Seller must not exceed 50 characters');
      } else if (!regexPatterns.seller.test(value)) {
        errors.push('Seller can only contain letters, spaces, hyphens, and apostrophes');
      }
    }

    if (fieldName === 'displaySequence') {
      if (!value || value === '') {
        errors.push('Display sequence is required');
      } else if (!regexPatterns.displaySequence.test(value)) {
        errors.push('Display sequence must be numeric only');
      } else if (parseInt(value) < 0) {
        errors.push('Display sequence must be a positive integer');
      }
    }

    if (fieldName === 'offerPercentage') {
      if (value !== '' && value !== null && value !== undefined) {
        if (!regexPatterns.offerPercentage.test(value)) {
          errors.push('Offer percentage must be numeric');
        } else if (parseInt(value) < 0 || parseInt(value) > 100) {
          errors.push('Offer percentage must be between 0 and 100');
        }
      }
    }

    if (fieldName === 'rating') {
      if (value !== '' && value !== null && value !== undefined) {
        if (!regexPatterns.rating.test(value)) {
          errors.push('Rating must be numeric');
        } else if (parseFloat(value) < 0 || parseFloat(value) > 5) {
          errors.push('Rating must be between 0 and 5');
        }
      }
    }

    if (fieldName === 'highlights') {
      const highlightsArray = value ? value.split('\n').map(h => h.trim()).filter(h => h) : [];
      if (highlightsArray.length === 0) {
        errors.push('At least one highlight is required');
      }
      highlightsArray.forEach((highlight, idx) => {
        if (highlight.length > 500) {
          errors.push(`Highlight ${idx + 1} must not exceed 500 characters`);
        }
      });
    }

    if (fieldName === 'category') {
      if (!value || !value.trim()) {
        errors.push('Category is required');
      }
    }

    if (fieldName === 'imageUrl') {
      if (!value || value === '') {
        errors.push('Primary image is required');
      }
    }

    if (fieldName === 'imageUrls') {
      if (!value || value.length === 0) {
        errors.push('At least one additional image is required');
      }
    }

    // Fallback to validation settings if available
    if (setting && errors.length === 0) {
      const rules = setting.validationRules;

      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(`${fieldName} is required`);
      }

      if (rules.minLength && value && value.length < rules.minLength) {
        errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && value && value.length > rules.maxLength) {
        errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
      }

      if (rules.minValue !== undefined && value !== null && value !== '' && parseFloat(value) < rules.minValue) {
        errors.push(`${fieldName} must be at least ${rules.minValue}`);
      }

      if (rules.maxValue !== undefined && value !== null && value !== '' && parseFloat(value) > rules.maxValue) {
        errors.push(`${fieldName} must not exceed ${rules.maxValue}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFieldBlur = (fieldName, value) => {
    const result = validateField(fieldName, value);
    setProductValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.isValid ? '' : result.errors[0]
    }));
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadOrders();
    loadValidationSettings();
  }, []);

  const loadValidationSettings = async () => {
    try {
      const response = await adminApi.getValidationSettings('Product');
      const settingsDict = {};
      response.data.forEach(setting => {
        settingsDict[setting.fieldName] = setting;
      });
      setValidationSettings(settingsDict);
    } catch (error) {
      console.error('Error loading validation settings:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminApi.getShoppingCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await adminApi.getShoppingProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await adminApi.getShoppingOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // Category handlers
  const handleAddCategory = async () => {
    setEditModal({ isOpen: true, type: 'category', data: null });
    try {
      const response = await adminApi.getNextCategorySequence();
      setDefaultCategorySequence(response.data.nextSequence);
    } catch (error) {
      setDefaultCategorySequence(0);
    }
    setCategoryImagePreview('');
  };

  const handleEditCategory = async (category) => {
    setEditModal({ isOpen: true, type: 'category', data: category });
    setDefaultCategorySequence(category.displaySequence || 0);
    setCategoryImagePreview(category.imageUrl || '');
  };

  const handleCategoryImageDrop = (e) => {
    e.preventDefault();
    setCategoryImageDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      fileToDataUrl(file).then(setCategoryImagePreview);
    }
  };

  const handleCategoryImageDragOver = (e) => {
    e.preventDefault();
    setCategoryImageDragging(true);
  };

  const handleCategoryImageDragLeave = () => {
    setCategoryImageDragging(false);
  };

  const handleCategoryImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      fileToDataUrl(file).then(setCategoryImagePreview);
    }
  };

  const handleDeleteCategoryClick = (category) => {
    setDeleteModal({ isOpen: true, type: 'category', id: category.id, name: category.name });
  };

  const handleDeleteCategory = async () => {
    try {
      await adminApi.deleteShoppingCategory(deleteModal.id);
      loadCategories();
      setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      const dataToSave = {
        ...categoryData,
        imageUrl: categoryImagePreview || categoryData.imageUrl
      };
      if (editModal.data?.id) {
        await adminApi.updateShoppingCategory(editModal.data.id, dataToSave);
      } else {
        await adminApi.createShoppingCategory(dataToSave);
      }
      loadCategories();
      setEditModal({ isOpen: false, type: null, data: null });
      setCategoryImagePreview('');
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Product handlers
  const handleAddProduct = async () => {
    setEditModal({ isOpen: true, type: 'product', data: null });
    setProductValidationErrors({});
    setProductAdditionalImages([]);
    setProductPrimaryPreview('');
    setProductAdditionalPreviews([]);
    setSelectedCategory('');
    setDefaultDisplaySequence(0);
    setSizeOptions([]);
    setColorVariants([]);
    setSelectedColorVariant(0);
  };

  const handleEditProduct = async (product) => {
    setEditModal({ isOpen: true, type: 'product', data: product });
    setProductValidationErrors({});
    setProductAdditionalImages([]);
    setProductPrimaryPreview(product.imageUrl || '');
    setProductAdditionalPreviews(product.imageUrls || []);
    setSelectedCategory(product.categoryName || '');
    setDefaultDisplaySequence(product.displaySequence || 0);
    setSizeOptions(product.sizeOptions || []);
    setColorVariants(product.colorVariants || []);
    setSelectedColorVariant(0);
  };

  const handleDeleteProductClick = (product) => {
    setDeleteModal({ isOpen: true, type: 'product', id: product.id, name: product.name });
  };

  const handleDeleteProduct = async () => {
    try {
      await adminApi.deleteShoppingProduct(deleteModal.id);
      loadProducts();
      setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateProductStatus = async (productId, status) => {
    try {
      await adminApi.updateShoppingProductStatus(productId, status);
      loadProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editModal.data?.id) {
        await adminApi.updateShoppingProduct(editModal.data.id, productData);
      } else {
        await adminApi.createShoppingProduct(productData);
      }
      loadProducts();
      setEditModal({ isOpen: false, type: null, data: null });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Order handlers
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await adminApi.updateShoppingOrderStatus(orderId, status);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrderClick = (order) => {
    setDeleteModal({ isOpen: true, type: 'order', id: order.id, name: `Order #${order.id.substring(0, 8)}` });
  };

  const handleDeleteOrder = async () => {
    try {
      await adminApi.deleteShoppingOrder(deleteModal.id);
      loadOrders();
      setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Accordion */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setActiveAccordion(activeAccordion === 'categories' ? '' : 'categories')}
          className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <p className="text-sm text-gray-500">{categories.length} items</p>
            </div>
          </div>
          {activeAccordion === 'categories' ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
        </button>
        {activeAccordion === 'categories' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none min-w-[200px]">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categoryFilter.name}
                    onChange={(e) => setCategoryFilter({ ...categoryFilter, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="relative flex-1 sm:flex-none min-w-[200px]">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search description..."
                    value={categoryFilter.description}
                    onChange={(e) => setCategoryFilter({ ...categoryFilter, description: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={categoryFilter.status}
                  onChange={(e) => setCategoryFilter({ ...categoryFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[150px]"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={handleAddCategory}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Add Category
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sequence</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories
                    .filter(category => {
                      const matchesName = !categoryFilter.name || category.name.toLowerCase().includes(categoryFilter.name.toLowerCase());
                      const matchesDescription = !categoryFilter.description || category.description.toLowerCase().includes(categoryFilter.description.toLowerCase());
                      const matchesStatus = !categoryFilter.status || category.status === categoryFilter.status;
                      return matchesName && matchesDescription && matchesStatus;
                    })
                    .map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{category.description}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{category.displaySequence || 0}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategoryClick(category)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Products Accordion */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setActiveAccordion(activeAccordion === 'products' ? '' : 'products')}
          className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors bg-gradient-to-r from-green-50 to-emerald-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800">Products</h2>
              <p className="text-sm text-gray-500">{products.length} items</p>
            </div>
          </div>
          {activeAccordion === 'products' ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
        </button>
        {activeAccordion === 'products' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none min-w-[200px]">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productFilter.name}
                    onChange={(e) => setProductFilter({ ...productFilter, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={productFilter.category}
                  onChange={(e) => setProductFilter({ ...productFilter, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={productFilter.status}
                  onChange={(e) => setProductFilter({ ...productFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[120px]"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={productFilter.minPrice}
                  onChange={(e) => setProductFilter({ ...productFilter, minPrice: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-24 sm:w-32"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={productFilter.maxPrice}
                  onChange={(e) => setProductFilter({ ...productFilter, maxPrice: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-24 sm:w-32"
                />
                <select
                  value={productFilter.stockLevel}
                  onChange={(e) => setProductFilter({ ...productFilter, stockLevel: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[120px]"
                >
                  <option value="">All Stock</option>
                  <option value="out">Out of Stock</option>
                  <option value="low">Low Stock (≤10)</option>
                  <option value="in">In Stock</option>
                </select>
                <select
                  value={productFilter.hasOffer}
                  onChange={(e) => setProductFilter({ ...productFilter, hasOffer: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[120px]"
                >
                  <option value="">All Offers</option>
                  <option value="yes">Has Offer</option>
                  <option value="no">No Offer</option>
                </select>
                <select
                  value={productFilter.minRating}
                  onChange={(e) => setProductFilter({ ...productFilter, minRating: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[120px]"
                >
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              <button
                onClick={handleAddProduct}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sequence</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products
                    .filter(p => {
                      const matchName = !productFilter.name || p.name?.toLowerCase().includes(productFilter.name.toLowerCase());
                      const matchCategory = !productFilter.category || p.categoryName === productFilter.category;
                      const matchStatus = !productFilter.status || p.status === productFilter.status;
                      const matchMinPrice = !productFilter.minPrice || p.price >= parseFloat(productFilter.minPrice);
                      const matchMaxPrice = !productFilter.maxPrice || p.price <= parseFloat(productFilter.maxPrice);
                      let matchStock = true;
                      if (productFilter.stockLevel === 'out') matchStock = p.stock === 0;
                      else if (productFilter.stockLevel === 'low') matchStock = p.stock > 0 && p.stock <= 10;
                      else if (productFilter.stockLevel === 'in') matchStock = p.stock > 10;
                      let matchOffer = true;
                      if (productFilter.hasOffer === 'yes') matchOffer = p.offerPercentage > 0;
                      else if (productFilter.hasOffer === 'no') matchOffer = p.offerPercentage === 0;
                      let matchRating = true;
                      if (productFilter.minRating) matchRating = p.rating >= parseFloat(productFilter.minRating);
                      return matchName && matchCategory && matchStatus && matchMinPrice && matchMaxPrice && matchStock && matchOffer && matchRating;
                    })
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{product.displaySequence || 0}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateProductStatus(product.id, product.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`p-2 rounded-lg transition-colors ${product.status === 'Active' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={product.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {product.status === 'Active' ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button
                          onClick={() => handleDeleteProductClick(product)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Orders Accordion */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <button
          onClick={() => setActiveAccordion(activeAccordion === 'orders' ? '' : 'orders')}
          className="w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors bg-gradient-to-r from-purple-50 to-pink-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">O</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800">Orders</h2>
              <p className="text-sm text-gray-500">{orders.length} items</p>
            </div>
          </div>
          {activeAccordion === 'orders' ? <ChevronUp size={24} className="text-gray-600" /> : <ChevronDown size={24} className="text-gray-600" />}
        </button>
        {activeAccordion === 'orders' && (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none min-w-[200px]">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderFilter.search || ''}
                    onChange={(e) => setOrderFilter({ ...orderFilter, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={orderFilter.status}
                  onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm flex-1 sm:flex-none min-w-[150px]"
                >
                  <option value="">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {orders
                    .filter(order => {
                      const matchesStatus = !orderFilter.status || order.status === orderFilter.status;
                      const matchesSearch = !orderFilter.search || 
                        order.id.toLowerCase().includes(orderFilter.search.toLowerCase()) ||
                        (order.userName && order.userName.toLowerCase().includes(orderFilter.search.toLowerCase())) ||
                        (order.userEmail && order.userEmail.toLowerCase().includes(orderFilter.search.toLowerCase()));
                      return matchesStatus && matchesSearch;
                    })
                    .map((order) => (
                    <tr key={order.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 font-mono">{order.id.substring(0, 8)}...</td>
                      <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-600 font-medium">{order.userName}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{order.userEmail || '-'}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{order.userPhone || '-'}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                          order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 sm:px-6 py-4 flex gap-2">
                        <button
                          onClick={() => setOrderDetailModal({ isOpen: true, data: order })}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                        >
                          View
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-2 py-1.5 border-2 border-gray-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrderClick(order)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:shadow-md"
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
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`p-6 text-white ${
              editModal.type === 'category' 
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' 
                : 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">
                    {editModal.type === 'category' ? (editModal.data ? 'Edit Category' : 'Add Category') :
                     editModal.type === 'product' ? (editModal.data ? 'Edit Product' : 'Add Product') : ''}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {editModal.type === 'category' ? 'Manage category details' : 'Manage product information'}
                  </p>
                </div>
                <button
                  onClick={() => setEditModal({ isOpen: false, type: null, data: null })}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {editModal.type === 'category' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory({ name: e.target.name.value, description: e.target.description.value, displaySequence: parseInt(e.target.displaySequence.value) || 0, status: e.target.status.value }); }}>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-blue-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        Category Name *
                      </label>
                      <input name="name" defaultValue={editModal.data?.name} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white" placeholder="Enter category name" required />
                    </div>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-indigo-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">D</span>
                        </div>
                        Description
                      </label>
                      <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm resize-none bg-white" rows="3" placeholder="Enter category description" />
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-purple-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">I</span>
                        </div>
                        Category Image
                      </label>
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                          categoryImageDragging
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50/50'
                        }`}
                        onDrop={handleCategoryImageDrop}
                        onDragOver={handleCategoryImageDragOver}
                        onDragLeave={handleCategoryImageDragLeave}
                        onClick={() => document.getElementById('categoryImageInput').click()}
                      >
                        <input
                          id="categoryImageInput"
                          type="file"
                          accept="image/*"
                          onChange={handleCategoryImageSelect}
                          className="hidden"
                        />
                        {categoryImagePreview ? (
                          <div className="relative">
                            <img src={categoryImagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryImagePreview('');
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Drag & drop an image here</p>
                            <p className="text-xs text-gray-500">or click to browse</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-pink-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                          Display Sequence *
                        </label>
                        <input
                          name="displaySequence"
                          type="number"
                          min="0"
                          defaultValue={editModal.data?.displaySequence !== undefined ? editModal.data.displaySequence : defaultCategorySequence}
                          className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm bg-white"
                          required
                        />
                      </div>
                      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-5 border border-rose-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-rose-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">A</span>
                          </div>
                          Status
                        </label>
                        <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm bg-white">
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Save Category
                    </button>
                  </div>
                </form>
              )}
              {editModal.type === 'product' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  
                  const errors = {};
                  const name = e.target.name.value;
                  const description = e.target.description.value;
                  const price = e.target.price.value;
                  const stock = e.target.stock.value;
                  const seller = e.target.seller.value;
                  const highlightsValue = e.target.highlights.value;
                  const offerPercentageValue = e.target.offerPercentage.value;
                  const categoryName = selectedCategory;
                  
                  const nameResult = validateField('name', name);
                  if (!nameResult.isValid) errors.name = nameResult.errors[0];
                  
                  const descriptionResult = validateField('description', description);
                  if (!descriptionResult.isValid) errors.description = descriptionResult.errors[0];
                  
                  const priceResult = validateField('price', price);
                  if (!priceResult.isValid) errors.price = priceResult.errors[0];
                  
                  const stockResult = validateField('stock', stock);
                  if (!stockResult.isValid) errors.stock = stockResult.errors[0];
                  
                  const sellerResult = validateField('seller', seller);
                  if (!sellerResult.isValid) errors.seller = sellerResult.errors[0];
                  
                  if (!categoryName || !categoryName.trim()) {
                    errors.category = 'Category is required';
                  }
                  
                  const highlightsArray = highlightsValue ? highlightsValue.split('\n').map(h => h.trim()).filter(h => h) : [];
                  if (highlightsArray.length === 0) {
                    errors.highlights = 'At least one highlight is required';
                  }
                  
                  const offerPercentage = parseInt(offerPercentageValue) || 0;
                  if (offerPercentage < 0 || offerPercentage > 100) {
                    errors.offerPercentage = 'Offer percentage must be between 0 and 100';
                  }
                  
                  if (!productPrimaryPreview && !editModal.data?.imageUrl) {
                    errors.imageUrl = 'Primary image is required';
                  }
                  
                  if (Object.keys(errors).length > 0) {
                    setProductValidationErrors(errors);
                    return;
                  }
                  
                  setProductValidationErrors({});
                  
                  const primaryImage = await fileToDataUrl(e.target.imageUrl.files?.[0]);
                  const uploadedImageUrls = await filesToDataUrls(e.target.imageUrls.files);
                  const newAllImages = [...productAdditionalImages, ...uploadedImageUrls];
                  
                  const imageUrlsArray = newAllImages.length > 0 ? newAllImages : (editModal.data?.imageUrls || []);
                  
                  handleSaveProduct({
                    name: e.target.name.value,
                    description: e.target.description.value,
                    price: parseFloat(e.target.price.value),
                    stock: parseInt(e.target.stock.value),
                    seller: e.target.seller.value,
                    imageUrl: primaryImage || editModal.data?.imageUrl || '',
                    imageUrls: imageUrlsArray,
                    rating: parseFloat(e.target.rating.value) || 0,
                    highlights: highlightsArray,
                    offerPercentage: offerPercentage,
                    status: e.target.status.value,
                    categoryName: categoryName,
                    displaySequence: parseInt(e.target.displaySequence.value) || 0,
                    sizeOptions: sizeOptions,
                    colorVariants: colorVariants
                  });
                  setProductPrimaryPreview('');
                  setProductAdditionalPreviews([]);
                  setProductAdditionalImages([]);
                  setProductValidationErrors({});
                }}>
                  <div className="space-y-5">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-green-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        Product Name *
                      </label>
                      <input
                        name="name"
                        defaultValue={editModal.data?.name || ''}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm bg-white ${productValidationErrors.name ? 'border-red-500' : 'border-green-200'}`}
                        required
                        maxLength={validationSettings.name?.validationRules.maxLength || 100}
                        onBlur={(e) => handleFieldBlur('name', e.target.value)}
                        placeholder="Enter product name"
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.name || ''}</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-emerald-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">D</span>
                        </div>
                        Description *
                      </label>
                      <textarea
                        name="description"
                        defaultValue={editModal.data?.description || ''}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm resize-none bg-white ${productValidationErrors.description ? 'border-red-500' : 'border-emerald-200'}`}
                        rows="3"
                        maxLength={validationSettings.description?.validationRules.maxLength || 2000}
                        onBlur={(e) => handleFieldBlur('description', e.target.value)}
                        placeholder="Enter product description"
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.description || ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-teal-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">$</span>
                          </div>
                          Price *
                        </label>
                        <input
                          name="price"
                          type="number"
                          step="0.01"
                          min={validationSettings.price?.validationRules.minValue || 0}
                          max={validationSettings.price?.validationRules.maxValue || 9999999}
                          defaultValue={editModal.data?.price || ''}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all shadow-sm bg-white ${productValidationErrors.price ? 'border-red-500' : 'border-teal-200'}`}
                          required
                          onBlur={(e) => handleFieldBlur('price', e.target.value)}
                          placeholder="0.00"
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.price || ''}</span>
                      </div>
                      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-5 border border-cyan-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-cyan-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">S</span>
                          </div>
                          Stock *
                        </label>
                        <input
                          name="stock"
                          type="number"
                          min={validationSettings.stock?.validationRules.minValue || 0}
                          max={validationSettings.stock?.validationRules.maxValue || 9999999}
                          defaultValue={editModal.data?.stock || ''}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-sm bg-white ${productValidationErrors.stock ? 'border-red-500' : 'border-cyan-200'}`}
                          required
                          onBlur={(e) => handleFieldBlur('stock', e.target.value)}
                          placeholder="0"
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.stock || ''}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-5 border border-sky-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-sky-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">V</span>
                        </div>
                        Seller *
                      </label>
                      <input
                        name="seller"
                        defaultValue={editModal.data?.seller || ''}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all shadow-sm bg-white ${productValidationErrors.seller ? 'border-red-500' : 'border-sky-200'}`}
                        maxLength={validationSettings.seller?.validationRules.maxLength || 50}
                        onBlur={(e) => handleFieldBlur('seller', e.target.value)}
                        placeholder="Enter seller name"
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.seller || ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-blue-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">#</span>
                          </div>
                          Display Sequence *
                        </label>
                        <input
                          name="displaySequence"
                          type="number"
                          min="0"
                          value={editModal.data?.displaySequence !== undefined ? editModal.data.displaySequence : defaultDisplaySequence}
                          onChange={(e) => setDefaultDisplaySequence(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm bg-white"
                          required
                          onBlur={(e) => handleFieldBlur('displaySequence', e.target.value)}
                        />
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-5 border border-indigo-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-indigo-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">C</span>
                          </div>
                          Category *
                        </label>
                        <select
                          name="categorySelect"
                          value={selectedCategory}
                          onChange={async (e) => {
                            setSelectedCategory(e.target.value);
                            setProductValidationErrors({...productValidationErrors, category: ''});
                            if (e.target.value) {
                              try {
                                const response = await adminApi.getNextProductSequence(e.target.value);
                                setDefaultDisplaySequence(response.data.nextSequence);
                              } catch (error) {
                                setDefaultDisplaySequence(0);
                              }
                            }
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm bg-white ${productValidationErrors.category ? 'border-red-500' : 'border-indigo-200'}`}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.category || ''}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-violet-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">I</span>
                        </div>
                        Primary Image *
                      </label>
                      <div className="relative border-2 border-dashed border-violet-300 rounded-xl p-4 text-center hover:border-violet-500 hover:bg-violet-50/50 transition-all cursor-pointer" onClick={() => document.getElementById('productPrimaryImageInput').click()}>
                        <input
                          id="productPrimaryImageInput"
                          name="imageUrl"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => setProductPrimaryPreview(await fileToDataUrl(e.target.files?.[0]))}
                          className="hidden"
                        />
                        {productPrimaryPreview || editModal.data?.imageUrl ? (
                          <img src={productPrimaryPreview || editModal.data?.imageUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg shadow-md" />
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Click to upload primary image</p>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.imageUrl || ''}</span>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-5 border border-purple-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-purple-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">A</span>
                        </div>
                        Additional Images *
                      </label>
                      <div className="relative border-2 border-dashed border-purple-300 rounded-xl p-4 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all cursor-pointer" onClick={() => document.getElementById('productAdditionalImagesInput').click()}>
                        <input
                          id="productAdditionalImagesInput"
                          name="imageUrls"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={async (e) => {
                            const newPreviews = await filesToDataUrls(e.target.files);
                            setProductAdditionalPreviews([...productAdditionalPreviews, ...newPreviews]);
                          }}
                          className="hidden"
                        />
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Click to upload additional images</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {productAdditionalPreviews.map((preview, idx) => (
                          <div key={idx} className="relative">
                            <img src={preview} alt={`Preview ${idx}`} className="h-20 w-20 rounded-lg object-cover shadow-md" />
                            <button
                              type="button"
                              onClick={() => {
                                const newPreviews = productAdditionalPreviews.filter((_, i) => i !== idx);
                                setProductAdditionalPreviews(newPreviews);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {(editModal.data?.imageUrls || []).map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative">
                            <img src={url} alt={`Existing ${idx}`} className="h-20 w-20 rounded-lg object-cover shadow-md" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 rounded-xl p-5 border border-fuchsia-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-fuchsia-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">H</span>
                        </div>
                        Highlights (one per line) *
                      </label>
                      <textarea
                        name="highlights"
                        defaultValue={editModal.data?.highlights?.join('\n') || ''}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all shadow-sm resize-none bg-white ${productValidationErrors.highlights ? 'border-red-500' : 'border-fuchsia-200'}`}
                        rows="3"
                        placeholder="Enter highlights, one per line"
                        required
                        onBlur={(e) => handleFieldBlur('highlights', e.target.value)}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.highlights || ''}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-5 border border-pink-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-pink-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">%</span>
                          </div>
                          Offer Percentage (%)
                        </label>
                        <input
                          name="offerPercentage"
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={editModal.data?.offerPercentage || 0}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm bg-white ${productValidationErrors.offerPercentage ? 'border-red-500' : 'border-pink-200'}`}
                          placeholder="0-100"
                          onBlur={(e) => handleFieldBlur('offerPercentage', e.target.value)}
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.offerPercentage || ''}</span>
                      </div>
                      <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl p-5 border border-rose-100">
                        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <div className="bg-rose-600 rounded-lg p-1">
                            <span className="text-white text-xs font-bold">★</span>
                          </div>
                          Rating
                        </label>
                        <input
                          name="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          defaultValue={editModal.data?.rating || 0}
                          className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm bg-white"
                          placeholder="0-5"
                          onBlur={(e) => handleFieldBlur('rating', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-5 border border-orange-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-orange-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        Size/Weight Options
                      </label>
                      <div className="space-y-3 bg-white rounded-xl p-4 border border-orange-200" id="sizeOptionsContainer">
                        {sizeOptions.map((sizeOption, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Size/Weight (e.g., S, M, L, 1kg)"
                              value={sizeOption.name}
                              onChange={(e) => updateSizeOption(index, 'name', e.target.value)}
                              className="flex-1 w-full px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm bg-white"
                              data-size-name={index}
                            />
                            <input
                              type="number"
                              placeholder="Price Adj."
                              value={sizeOption.priceAdjustment}
                              onChange={(e) => updateSizeOption(index, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                              className="w-full sm:w-24 px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm bg-white"
                              data-price-adj={index}
                            />
                            <input
                              type="number"
                              placeholder="Stock"
                              value={sizeOption.stock}
                              onChange={(e) => updateSizeOption(index, 'stock', parseInt(e.target.value) || 0)}
                              className="w-full sm:w-20 px-3 py-2 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm bg-white"
                              data-stock={index}
                            />
                            <button
                              type="button"
                              onClick={() => removeSizeOption(index)}
                              className="text-red-600 hover:text-red-800 px-2 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addSizeOption}
                          className="w-full sm:w-auto text-orange-600 text-sm font-bold hover:text-orange-800 flex items-center justify-center gap-1 py-2 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                        >
                          <Plus size={16} />
                          Add Size/Weight Option
                        </button>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-amber-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">C</span>
                        </div>
                        Color Variants
                      </label>
                      <div className="space-y-4">
                        {colorVariants.length === 0 ? (
                          <button
                            type="button"
                            onClick={addColorVariant}
                            className="w-full text-amber-600 text-sm font-bold hover:text-amber-800 flex items-center justify-center gap-1 py-3 border-2 border-dashed border-amber-300 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all"
                          >
                            <Plus size={16} />
                            Add First Color Variant
                          </button>
                        ) : (
                          <>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {colorVariants.map((variant, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setSelectedColorVariant(index)}
                                  className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                                    selectedColorVariant === index
                                      ? 'border-amber-500 bg-amber-50'
                                      : 'border-gray-200 hover:border-amber-300'
                                  }`}
                                >
                                  {variant.hexCode && (
                                    <div
                                      className="w-5 h-5 rounded-full border border-gray-300"
                                      style={{ backgroundColor: variant.hexCode }}
                                    />
                                  )}
                                  <span className="text-sm font-medium">{variant.name || `Color ${index + 1}`}</span>
                                  {colorVariants.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeColorVariant(index);
                                      }}
                                      className="text-red-500 hover:text-red-700 ml-1"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={addColorVariant}
                                className="flex-shrink-0 px-4 py-2 rounded-lg border-2 border-dashed border-amber-300 text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-all flex items-center gap-1"
                              >
                                <Plus size={16} />
                                Add Color
                              </button>
                            </div>
                            {colorVariants[selectedColorVariant] && (
                              <div className="bg-white rounded-xl p-4 space-y-4 border border-amber-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Color Name *</label>
                                    <input
                                      type="text"
                                      value={colorVariants[selectedColorVariant].name}
                                      onChange={(e) => updateColorVariant(selectedColorVariant, 'name', e.target.value)}
                                      className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm bg-white"
                                      placeholder="e.g., Black, Red, Blue"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Hex Code</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={colorVariants[selectedColorVariant].hexCode || '#000000'}
                                        onChange={(e) => updateColorVariant(selectedColorVariant, 'hexCode', e.target.value)}
                                        className="w-12 h-10 rounded cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        value={colorVariants[selectedColorVariant].hexCode || ''}
                                        onChange={(e) => updateColorVariant(selectedColorVariant, 'hexCode', e.target.value)}
                                        className="flex-1 px-3 py-2 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm bg-white"
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Price Adjustment</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={colorVariants[selectedColorVariant].priceAdjustment}
                                      onChange={(e) => updateColorVariant(selectedColorVariant, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                                      className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm bg-white"
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Stock</label>
                                    <input
                                      type="number"
                                      value={colorVariants[selectedColorVariant].stock}
                                      onChange={(e) => updateColorVariant(selectedColorVariant, 'stock', parseInt(e.target.value) || 0)}
                                      className="w-full px-3 py-2 border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm bg-white"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Image *</label>
                                  <div className="relative border-2 border-dashed border-amber-300 rounded-lg p-3 text-center hover:border-amber-500 hover:bg-amber-50 transition-all cursor-pointer" onClick={() => document.getElementById(`colorImage-${selectedColorVariant}`).click()}>
                                    <input
                                      id={`colorImage-${selectedColorVariant}`}
                                      type="file"
                                      accept="image/*"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          const dataUrl = await fileToDataUrl(file);
                                          updateColorVariant(selectedColorVariant, 'imageUrl', dataUrl);
                                        }
                                      }}
                                      className="hidden"
                                    />
                                    {colorVariants[selectedColorVariant].imageUrl ? (
                                      <img src={colorVariants[selectedColorVariant].imageUrl} alt="Preview" className="max-h-32 mx-auto rounded" />
                                    ) : (
                                      <p className="text-xs text-gray-500">Click to upload image</p>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">Size Options for this Color</label>
                                  <div className="space-y-2">
                                    {(colorVariants[selectedColorVariant].sizeOptions || []).map((sizeOption, sizeIndex) => (
                                      <div key={sizeIndex} className="flex flex-col sm:flex-row gap-2 items-center">
                                        <input
                                          type="text"
                                          placeholder="Size"
                                          value={sizeOption.name}
                                          onChange={(e) => updateColorVariantSizeOption(selectedColorVariant, sizeIndex, 'name', e.target.value)}
                                          className="flex-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                                        />
                                        <input
                                          type="number"
                                          placeholder="Price Adj."
                                          value={sizeOption.priceAdjustment}
                                          onChange={(e) => updateColorVariantSizeOption(selectedColorVariant, sizeIndex, 'priceAdjustment', parseFloat(e.target.value) || 0)}
                                          className="w-full sm:w-24 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                                        />
                                        <input
                                          type="number"
                                          placeholder="Stock"
                                          value={sizeOption.stock}
                                          onChange={(e) => updateColorVariantSizeOption(selectedColorVariant, sizeIndex, 'stock', parseInt(e.target.value) || 0)}
                                          className="w-full sm:w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeColorVariantSizeOption(selectedColorVariant, sizeIndex)}
                                          className="text-red-600 hover:text-red-800 px-2 text-sm"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => addColorVariantSizeOption(selectedColorVariant)}
                                      className="text-amber-600 text-xs font-bold hover:text-amber-800 flex items-center gap-1"
                                    >
                                      <Plus size={12} />
                                      Add Size Option
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-lime-50 rounded-xl p-5 border border-yellow-100">
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <div className="bg-yellow-600 rounded-lg p-1">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                        Status
                      </label>
                      <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all shadow-sm bg-white">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 rounded-xl hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                      Save Product
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Delete {deleteModal.type}</h3>
                  <p className="text-gray-600">Are you sure you want to delete "{deleteModal.name}"?</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, name: '' })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteModal.type === 'category' ? handleDeleteCategory : deleteModal.type === 'product' ? handleDeleteProduct : handleDeleteOrder}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderDetailModal.isOpen && orderDetailModal.data && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Order Details</h3>
                  <p className="text-purple-100 text-sm">Order ID: {orderDetailModal.data.id.substring(0, 12)}...</p>
                </div>
                <button
                  onClick={() => setOrderDetailModal({ isOpen: false, data: null })}
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
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 rounded-lg p-2">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-semibold text-gray-800 text-sm">
                        {new Date(orderDetailModal.data.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-lg p-2">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-800 text-sm">{orderDetailModal.data.userName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 rounded-lg p-2">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="font-bold text-gray-800 text-sm">{formatPrice(orderDetailModal.data.total)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Package size={18} className="text-purple-600" />
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
                      {orderDetailModal.data.items && orderDetailModal.data.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-purple-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.productName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.sizeOptionName && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">Size: {item.sizeOptionName}</span>}
                            {item.colorVariantName && <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Color: {item.colorVariantName}</span>}
                            {!item.sizeOptionName && !item.colorVariantName && <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">{formatPrice(item.price)}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-800">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-purple-600">{formatPrice(item.price * item.quantity)}</td>
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
                    <span className="font-medium text-gray-800">{formatPrice(orderDetailModal.data.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-800">{formatPrice(99)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span className="font-medium text-gray-800">{formatPrice((orderDetailModal.data.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0) * 0.18)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total</span>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{formatPrice(orderDetailModal.data.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="bg-purple-100 rounded-lg p-1.5">
                      <MapPin size={16} className="text-purple-600" />
                    </div>
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{orderDetailModal.data.shippingAddress || 'N/A'}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="bg-blue-100 rounded-lg p-1.5">
                      <MapPin size={16} className="text-blue-600" />
                    </div>
                    Billing Address
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{orderDetailModal.data.billingAddress || 'N/A'}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="bg-green-100 rounded-lg p-1.5">
                    <Users size={16} className="text-green-600" />
                  </div>
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-800">{orderDetailModal.data.userEmail || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{orderDetailModal.data.userPhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="bg-amber-100 rounded-lg p-1.5">
                    <DollarSign size={16} className="text-amber-600" />
                  </div>
                  Payment Method
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 inline-block">{orderDetailModal.data.paymentMethod || 'N/A'}</p>
              </div>

              {/* Status */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <RefreshCw size={18} className="text-purple-600" />
                  Order Status
                </h4>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  orderDetailModal.data.status === 'Delivered' ? 'bg-green-100 text-green-800 border border-green-200' :
                  orderDetailModal.data.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  orderDetailModal.data.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {orderDetailModal.data.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
