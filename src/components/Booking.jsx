import { useState, useEffect } from 'react';
import { Calendar, Plane, Film, Plus, MapPin, Clock, DollarSign } from 'lucide-react';
import { bookingApi } from '../services/api';
import { indiaLocations } from '../data/indiaLocations';

export default function Booking() {
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

  const filteredTransports = selectedType === 'All'
    ? transports
    : transports.filter(t => t.type === selectedType);

  const filteredTransportsByRoute = filteredTransports.filter(t => {
    const sourceMatch = !selectedSource || t.source === selectedSource;
    const destMatch = !selectedDestination || t.destination === selectedDestination;
    return sourceMatch && destMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Booking</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('transport')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'transport'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Transport
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'package'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Travel Packages
          </button>
          <button
            onClick={() => setActiveTab('movie')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'movie'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Movies
          </button>
        </div>

        {/* Transport Tab */}
        {activeTab === 'transport' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transport Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {indiaLocations.map((loc) => (
                      <option key={loc.name} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredTransportsByRoute.map((transport) => (
                <div key={transport.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-center mb-4">
                    <Calendar size={32} className="text-blue-600" />
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{transport.name}</h3>
                      <p className="text-sm text-gray-600">{transport.type}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">{transport.source}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">{transport.destination}</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <Clock size={16} className="text-gray-500" />
                    <span className="ml-2 text-sm text-gray-600">{transport.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-blue-600">${transport.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleBook(transport, 'transport')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Plane size={24} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800 ml-2">{pkg.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                  <div className="flex items-center mb-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="ml-2 text-sm text-gray-600">{pkg.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.destinations.map((dest, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{dest}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-purple-600">${pkg.price.toFixed(2)}</p>
                    <button
                      onClick={() => handleBook(pkg, 'package')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <img src={movie.imageUrl} alt={movie.title} className="w-full h-64 object-cover" />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <Film size={20} className="text-red-600" />
                    <h3 className="font-semibold text-gray-800 ml-2">{movie.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{movie.genre} • {movie.language}</p>
                  <p className="text-sm text-gray-600 mb-2">{movie.duration} min</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm text-gray-600">{movie.rating}</span>
                    </div>
                    <button
                      onClick={() => handleBook(movie, 'movie')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
