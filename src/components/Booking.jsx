import { useState, useEffect } from 'react';
import { Calendar, Plane, Film, Plus, MapPin, Clock, DollarSign, Sparkles, ChevronDown, ChevronUp, Search, SlidersHorizontal, Star, Users } from 'lucide-react';
import { bookingApi } from '../services/api';
import { indiaLocations } from '../data/indiaLocations';

export default function Booking({ userRole }) {
  const [transports, setTransports] = useState([]);
  const [packages, setPackages] = useState([]);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('transport');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingData, setBookingData] = useState({
    quantity: 1,
    bookingDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    loadTransports();
    loadPackages();
    loadMovies();
    loadBookings();
  }, []);

  const loadTransports = async () => {
    try {
      const response = await bookingApi.getTransports();
      setTransports(response.data.filter(t => t.status === 'Active'));
    } catch (error) {
      console.error('Error loading transports:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await bookingApi.getPackages();
      setPackages(response.data.filter(p => p.status === 'Active'));
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadMovies = async () => {
    try {
      const response = await bookingApi.getMovies();
      setMovies(response.data.filter(m => m.status === 'Active'));
    } catch (error) {
      console.error('Error loading movies:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await bookingApi.getUserBookings(userId);
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleBook = (item, type) => {
    setSelectedItem(item);
    setSelectedItem({ ...item, bookingType: type });
    setBookingData({
      quantity: 1,
      bookingDate: type === 'movie' ? new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      await bookingApi.createBooking({
        userId,
        userName: userName || 'Anonymous',
        type: selectedItem.bookingType,
        itemId: selectedItem.id,
        itemName: selectedItem.name || selectedItem.title,
        quantity: parseInt(bookingData.quantity),
        totalPrice: (selectedItem.price || 0) * parseInt(bookingData.quantity),
        bookingDate: bookingData.bookingDate
      });
      loadBookings();
      setShowBookingForm(false);
      alert('Booking confirmed successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const filteredTransports = selectedType === 'All'
    ? transports
    : transports.filter(t => t.type === selectedType);

  const filteredTransportsByRoute = filteredTransports.filter(t => {
    const sourceMatch = !selectedSource || t.source === selectedSource;
    const destMatch = !selectedDestination || t.destination === selectedDestination;
    return sourceMatch && destMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">Booking</h1>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transports, packages, movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
            >
              <SlidersHorizontal size={18} />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPriceRange({ min: '', max: '' });
                    }}
                    className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold transition-all duration-200 text-sm border-2 flex items-center gap-2 ${
              activeTab === 'transport'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-500 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Calendar size={16} />
            Transport
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold transition-all duration-200 text-sm border-2 flex items-center gap-2 ${
              activeTab === 'package'
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-500 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
            }`}
          >
            <Plane size={16} />
            Travel Packages
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full font-semibold transition-all duration-200 text-sm border-2 flex items-center gap-2 ${
              activeTab === 'movie'
                ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white border-red-500 shadow-lg'
                : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <Film size={16} />
            Movies
          </button>
        </div>

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div>
            {/* Filters */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Transport Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
                  >
                    <option value="All">All Types</option>
                    <option value="Train">Train</option>
                    <option value="Bus">Bus</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">All Locations</option>
                    {indiaLocations.map((loc) => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">All Locations</option>
                    {indiaLocations.map((loc) => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transport Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransportsByRoute.map((transport) => (
                <div key={transport.id} className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors p-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Calendar size={18} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 text-sm">{transport.name}</h3>
                      <p className="text-xs text-gray-500">{transport.type}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2 bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-700 text-xs">{transport.source}</span>
                    <span className="text-gray-400 text-xs">→</span>
                    <span className="text-gray-700 text-xs">{transport.destination}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Clock size={12} className="text-gray-400" />
                    <span className="ml-2 text-xs text-gray-500">{transport.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(transport.price)}</p>
                    <button
                      onClick={() => handleBook(transport, 'transport')}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-800 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Travel Packages Tab */}
        {activeTab === 'package' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Plane size={16} className="text-gray-400" />
                    <h3 className="font-medium text-gray-900 ml-2 text-sm line-clamp-1">{pkg.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center mb-2">
                    <Clock size={12} className="text-gray-400" />
                    <span className="ml-2 text-xs text-gray-500">{pkg.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(pkg.price)}</p>
                    <button
                      onClick={() => handleBook(pkg, 'package')}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-800 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Movies Tab */}
        {activeTab === 'movie' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors overflow-hidden">
                <div className="aspect-[2/3] bg-gray-100">
                  <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    <Film size={14} className="text-gray-400" />
                    <h3 className="font-medium text-gray-900 ml-2 text-sm line-clamp-2">{movie.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{movie.genre} • {movie.language}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="ml-1 text-xs text-gray-600">{movie.rating}</span>
                    </div>
                    <button
                      onClick={() => handleBook(movie, 'movie')}
                      className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-800 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking History */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Bookings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 capitalize">{booking.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.itemName}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{booking.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">${booking.totalPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(booking.bookingDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Booking Form Modal */}
        {showBookingForm && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Book {selectedItem.name || selectedItem.title}</h2>
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={bookingData.quantity}
                    onChange={(e) => setBookingData({ ...bookingData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date</label>
                  <input
                    type="date"
                    value={bookingData.bookingDate}
                    onChange={(e) => setBookingData({ ...bookingData, bookingDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per item:</span>
                    <span className="font-bold text-gray-800">${(selectedItem.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold text-blue-600">${((selectedItem.price || 0) * parseInt(bookingData.quantity)).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
