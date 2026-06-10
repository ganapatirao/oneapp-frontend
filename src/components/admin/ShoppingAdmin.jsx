import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Power, PowerOff, X, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { adminApi } from '../../services/api';

export default function ShoppingAdmin() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeAccordion, setActiveAccordion] = useState('categories');
  
  // Category state
  const [categoryFilter, setCategoryFilter] = useState({ name: '', status: '' });
  const [defaultCategorySequence, setDefaultCategorySequence] = useState(0);
  
  // Product state
  const [productFilter, setProductFilter] = useState({ name: '', category: '', status: '' });
  const [defaultDisplaySequence, setDefaultDisplaySequence] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productValidationErrors, setProductValidationErrors] = useState({});
  const [productAdditionalImages, setProductAdditionalImages] = useState([]);
  const [productPrimaryPreview, setProductPrimaryPreview] = useState('');
  const [productAdditionalPreviews, setProductAdditionalPreviews] = useState([]);
  const [validationSettings, setValidationSettings] = useState({});
  
  // Order state
  const [orderFilter, setOrderFilter] = useState({ status: '', dateFrom: '', dateTo: '' });
  
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

  const validateField = (fieldName, value) => {
    const setting = validationSettings[fieldName];
    if (!setting) return { isValid: true, errors: [] };

    const errors = [];
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

    return { isValid: errors.length === 0, errors };
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
  };

  const handleEditCategory = async (category) => {
    setEditModal({ isOpen: true, type: 'category', data: category });
    setDefaultCategorySequence(category.displaySequence || 0);
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
      if (editModal.data?.id) {
        await adminApi.updateShoppingCategory(editModal.data.id, categoryData);
      } else {
        await adminApi.createShoppingCategory(categoryData);
      }
      loadCategories();
      setEditModal({ isOpen: false, type: null, data: null });
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
  };

  const handleEditProduct = async (product) => {
    setEditModal({ isOpen: true, type: 'product', data: product });
    setProductValidationErrors({});
    setProductAdditionalImages([]);
    setProductPrimaryPreview(product.imageUrl || '');
    setProductAdditionalPreviews(product.imageUrls || []);
    setSelectedCategory(product.categoryName || '');
    setDefaultDisplaySequence(product.displaySequence || 0);
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categoryFilter.name}
                    onChange={(e) => setCategoryFilter({ ...categoryFilter, name: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={categoryFilter.status}
                  onChange={(e) => setCategoryFilter({ ...categoryFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Add Category
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sequence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories
                    .filter(category => {
                      const matchesName = !categoryFilter.name || category.name.toLowerCase().includes(categoryFilter.name.toLowerCase());
                      const matchesStatus = !categoryFilter.status || category.status === categoryFilter.status;
                      return matchesName && matchesStatus;
                    })
                    .map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{category.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{category.displaySequence || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
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
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productFilter.name}
                    onChange={(e) => setProductFilter({ ...productFilter, name: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={productFilter.category}
                  onChange={(e) => setProductFilter({ ...productFilter, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <select
                  value={productFilter.status}
                  onChange={(e) => setProductFilter({ ...productFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sequence</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products
                    .filter(p => {
                      const matchName = p.name?.toLowerCase().includes(productFilter.name.toLowerCase());
                      const matchCategory = !productFilter.category || p.categoryName === productFilter.category;
                      const matchStatus = !productFilter.status || p.status === productFilter.status;
                      return matchName && matchCategory && matchStatus;
                    })
                    .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.categoryName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.displaySequence || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-2">
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
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3">
                <select
                  value={orderFilter.status}
                  onChange={(e) => setOrderFilter({ ...orderFilter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders
                    .filter(order => {
                      const matchesStatus = !orderFilter.status || order.status === orderFilter.status;
                      return matchesStatus;
                    })
                    .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.userName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.userEmail || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.userPhone || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => setOrderDetailModal({ isOpen: true, data: order })}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrderClick(order)}
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

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {editModal.type === 'category' ? (editModal.data ? 'Edit Category' : 'Add Category') : 
                 editModal.type === 'product' ? (editModal.data ? 'Edit Product' : 'Add Product') : ''}
              </h3>
              <button
                onClick={() => setEditModal({ isOpen: false, type: null, data: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              {editModal.type === 'category' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory({ name: e.target.name.value, description: e.target.description.value, imageUrl: e.target.imageUrl.value, displaySequence: parseInt(e.target.displaySequence.value) || 0, status: e.target.status.value }); }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input name="name" defaultValue={editModal.data?.name} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea name="description" defaultValue={editModal.data?.description} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                      <input name="imageUrl" defaultValue={editModal.data?.imageUrl} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Display Sequence *</label>
                      <input 
                        name="displaySequence" 
                        type="number" 
                        min="0" 
                        defaultValue={editModal.data?.displaySequence !== undefined ? editModal.data.displaySequence : defaultCategorySequence} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
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
                  const prosValue = e.target.pros.value;
                  const consValue = e.target.cons.value;
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
                  
                  const prosArray = prosValue ? prosValue.split('\n').map(p => p.trim()).filter(p => p) : [];
                  if (prosArray.length === 0) {
                    errors.pros = 'At least one pro is required';
                  }
                  
                  const consArray = consValue ? consValue.split('\n').map(c => c.trim()).filter(c => c) : [];
                  if (consArray.length === 0) {
                    errors.cons = 'At least one con is required';
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
                    pros: prosArray,
                    cons: consArray,
                    status: e.target.status.value,
                    categoryName: categoryName,
                    displaySequence: parseInt(e.target.displaySequence.value) || 0
                  });
                  setProductPrimaryPreview('');
                  setProductAdditionalPreviews([]);
                  setProductAdditionalImages([]);
                  setProductValidationErrors({});
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                      <input 
                        name="name" 
                        defaultValue={editModal.data?.name || ''} 
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                        required 
                        maxLength={validationSettings.name?.validationRules.maxLength || 100}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.name || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                      <textarea 
                        name="description" 
                        defaultValue={editModal.data?.description || ''} 
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.description ? 'border-red-500' : 'border-gray-300'}`} 
                        rows="3" 
                        maxLength={validationSettings.description?.validationRules.maxLength || 2000}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.description || ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                        <input 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          min={validationSettings.price?.validationRules.minValue || 0} 
                          max={validationSettings.price?.validationRules.maxValue || 9999999} 
                          defaultValue={editModal.data?.price || ''} 
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.price ? 'border-red-500' : 'border-gray-300'}`} 
                          required 
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.price || ''}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock *</label>
                        <input 
                          name="stock" 
                          type="number" 
                          min={validationSettings.stock?.validationRules.minValue || 0} 
                          max={validationSettings.stock?.validationRules.maxValue || 9999999} 
                          defaultValue={editModal.data?.stock || ''} 
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.stock ? 'border-red-500' : 'border-gray-300'}`} 
                          required 
                        />
                        <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.stock || ''}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Seller *</label>
                      <input 
                        name="seller" 
                        defaultValue={editModal.data?.seller || ''} 
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.seller ? 'border-red-500' : 'border-gray-300'}`} 
                        maxLength={validationSettings.seller?.validationRules.maxLength || 50}
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.seller || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Display Sequence *</label>
                      <input
                        name="displaySequence"
                        type="number"
                        min="0"
                        value={editModal.data?.displaySequence !== undefined ? editModal.data.displaySequence : defaultDisplaySequence}
                        onChange={(e) => setDefaultDisplaySequence(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.category || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Image *</label>
                      <input
                        name="imageUrl"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => setProductPrimaryPreview(await fileToDataUrl(e.target.files?.[0]))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      {(productPrimaryPreview || editModal.data?.imageUrl) && (
                        <img src={productPrimaryPreview || editModal.data?.imageUrl} alt="Preview" className="mt-2 h-32 w-32 rounded object-cover" />
                      )}
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.imageUrl || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images *</label>
                      <input
                        name="imageUrls"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          const newPreviews = await filesToDataUrls(e.target.files);
                          setProductAdditionalPreviews([...productAdditionalPreviews, ...newPreviews]);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {productAdditionalPreviews.map((preview, idx) => (
                          <div key={idx} className="relative">
                            <img src={preview} alt={`Preview ${idx}`} className="h-20 w-20 rounded object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newPreviews = productAdditionalPreviews.filter((_, i) => i !== idx);
                                setProductAdditionalPreviews(newPreviews);
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                        {(editModal.data?.imageUrls || []).map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative">
                            <img src={url} alt={`Existing ${idx}`} className="h-20 w-20 rounded object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pros (one per line) *</label>
                      <textarea
                        name="pros"
                        defaultValue={editModal.data?.pros?.join('\n') || ''}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.pros ? 'border-red-500' : 'border-gray-300'}`}
                        rows="3"
                        placeholder="Enter pros, one per line"
                        required
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.pros || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Cons (one per line) *</label>
                      <textarea
                        name="cons"
                        defaultValue={editModal.data?.cons?.join('\n') || ''}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${productValidationErrors.cons ? 'border-red-500' : 'border-gray-300'}`}
                        rows="3"
                        placeholder="Enter cons, one per line"
                        required
                      />
                      <span className="text-xs text-red-500 mt-1 block">{productValidationErrors.cons || ''}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                      <input
                        name="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        defaultValue={editModal.data?.rating || 0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select name="status" defaultValue={editModal.data?.status || 'Active'} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Order Details</h3>
              <button
                onClick={() => setOrderDetailModal({ isOpen: false, data: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <p className="font-medium">{orderDetailModal.data.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">{orderDetailModal.data.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">{new Date(orderDetailModal.data.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <p className="font-medium">${orderDetailModal.data.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">User ID:</span>
                    <p className="font-medium">{orderDetailModal.data.userId || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{orderDetailModal.data.userName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{orderDetailModal.data.userEmail || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{orderDetailModal.data.userPhone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping & Billing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Shipping & Billing</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Shipping Address:</span>
                    <p className="font-medium">{orderDetailModal.data.shippingAddress || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Billing Address:</span>
                    <p className="font-medium">{orderDetailModal.data.billingAddress || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment Method:</span>
                    <p className="font-medium">{orderDetailModal.data.paymentMethod || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetailModal.data.items && orderDetailModal.data.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-200">
                          <td className="px-4 py-2 text-sm">{item.productName}</td>
                          <td className="px-4 py-2 text-sm">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
