import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, X, Search, Filter, Star, Zap, Shield, TrendingUp, Calendar, MapPin, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { advertisingApi } from '../../services/api';

export default function AgentDashboard() {
  const [ads, setAds] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, views: 0 });
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgentAds();
  }, []);

  const loadAgentAds = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const response = await advertisingApi.getAds();
      const userAds = response.data.filter(ad => ad.sellerId === userId);
      setAds(userAds);
      setStats({
        total: userAds.length,
        active: userAds.filter(ad => ad.status === 'Active').length,
        pending: userAds.filter(ad => ad.status === 'Pending').length,
        views: userAds.reduce((sum, ad) => sum + (ad.views || 0), 0)
      });
    } catch (error) {
      console.error('Error loading agent ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
      try {
        await advertisingApi.deleteAd(adId);
        loadAgentAds();
        alert('Ad deleted successfully!');
      } catch (error) {
        console.error('Error deleting ad:', error);
        alert('Error deleting ad. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (ad) => {
    try {
      const newStatus = ad.status === 'Active' ? 'Inactive' : 'Active';
      await advertisingApi.updateAdStatus(ad.id, newStatus);
      loadAgentAds();
      alert(`Ad ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating ad status:', error);
      alert('Error updating ad status. Please try again.');
    }
  };

  const handleToggleFeatured = async (ad) => {
    try {
      const updatedAd = { ...ad, isFeatured: !ad.isFeatured };
      await advertisingApi.updateAd(ad.id, updatedAd);
      loadAgentAds();
      alert(`Ad ${updatedAd.isFeatured ? 'marked as featured' : 'removed from featured'}!`);
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Error updating featured status. Please try again.');
    }
  };

  const handleToggleUrgent = async (ad) => {
    try {
      const updatedAd = { ...ad, isUrgent: !ad.isUrgent };
      await advertisingApi.updateAd(ad.id, updatedAd);
      loadAgentAds();
      alert(`Ad ${updatedAd.isUrgent ? 'marked as urgent' : 'removed from urgent'}!`);
    } catch (error) {
      console.error('Error updating urgent status:', error);
      alert('Error updating urgent status. Please try again.');
    }
  };

  const filteredAds = ads.filter(ad => {
    const matchStatus = filterStatus === 'All' || ad.status === filterStatus;
    const matchSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ad.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your advertisements</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Post New Ad
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Ads</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Ads</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Ads</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Views</p>
                <p className="text-3xl font-bold text-purple-600">{stats.views}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Eye size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your ads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('All')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'All' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('Active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('Inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'Inactive' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inactive
              </button>
              <button
                onClick={() => setFilterStatus('Pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === 'Pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Ads Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Ad</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Posted</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img src={ad.imageUrl} alt={ad.title} className="w-16 h-16 object-cover rounded-lg mr-4" />
                        <div>
                          <p className="font-medium text-gray-800 max-w-xs truncate">{ad.title}</p>
                          <div className="flex gap-1 mt-1">
                            {ad.isFeatured && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">Featured</span>
                            )}
                            {ad.isUrgent && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">Urgent</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ad.categoryName}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatPrice(ad.price)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ad.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        ad.status === 'Active' ? 'bg-green-100 text-green-800' :
                        ad.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{ad.views || 0}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(ad.postedDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedAd(ad); setShowEditModal(true); }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(ad)}
                          className={ad.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                          title={ad.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          {ad.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(ad)}
                          className={ad.isFeatured ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-400 hover:text-yellow-600'}
                          title="Toggle Featured"
                        >
                          <Star size={18} className={ad.isFeatured ? 'fill-current' : ''} />
                        </button>
                        <button
                          onClick={() => handleToggleUrgent(ad)}
                          className={ad.isUrgent ? 'text-red-600 hover:text-red-800' : 'text-gray-400 hover:text-red-600'}
                          title="Toggle Urgent"
                        >
                          <Zap size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredAds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No ads found</h3>
              <p className="text-gray-500">Start by posting your first advertisement</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{showAddModal ? 'Post New Ad' : 'Edit Ad'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedAd(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Please use the main Advertising page to post or edit ads.</p>
              <button
                onClick={() => window.location.href = '/advertising'}
                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Go to Advertising Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
