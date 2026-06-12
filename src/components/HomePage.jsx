import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Briefcase, Calendar, Plane, Star, MapPin, ArrowRight } from 'lucide-react';
import { shoppingApi, advertisingApi, recruitmentApi, bookingApi } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transports, setTransports] = useState([]);
  const [packages, setPackages] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, adsRes, jobsRes, transportsRes, packagesRes, moviesRes] = await Promise.all([
        shoppingApi.getProducts(),
        advertisingApi.getAds(),
        recruitmentApi.getJobs(),
        bookingApi.getTransports(),
        bookingApi.getPackages(),
        bookingApi.getMovies()
      ]);

      setProducts(productsRes.data.filter(p => p.status === 'Active').sort((a, b) => {
        const seqA = a.displaySequence === 0 || a.displaySequence === undefined ? Number.MAX_SAFE_INTEGER : a.displaySequence;
        const seqB = b.displaySequence === 0 || b.displaySequence === undefined ? Number.MAX_SAFE_INTEGER : b.displaySequence;
        return seqA - seqB;
      }).slice(0, 4));
      setAds(adsRes.data.filter(a => a.status === 'Active').slice(0, 4));
      setJobs(jobsRes.data.filter(j => j.status === 'Active').slice(0, 4));
      setTransports(transportsRes.data.filter(t => t.status === 'Active').slice(0, 3));
      setPackages(packagesRes.data.filter(p => p.status === 'Active').slice(0, 3));
      setMovies(moviesRes.data.filter(m => m.status === 'Active').slice(0, 4));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Welcome to OneApp
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 md:mb-10 opacity-90 px-4">Your all-in-one platform for shopping, advertising, recruitment, and booking needs</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
              <Link to="/shopping" className="bg-white text-blue-600 px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
                <ShoppingCart size={20} sm={24} />
                <span>Start Shopping</span>
              </Link>
              <Link to="/advertising" className="bg-transparent border-2 sm:border-3 border-white text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center space-x-2">
                <Briefcase size={20} sm={24} />
                <span>Post an Ad</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Featured Products</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Discover our handpicked selection</p>
            </div>
            <Link to="/shopping" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <Link key={product.id} to="/shopping" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group block">
                <div className="relative overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-2 sm:mb-3">
                    <Star size={14} sm={18} className="text-yellow-500 fill-current" />
                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Featured Ads</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Find what you're looking for</p>
            </div>
            <Link to="/advertising" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {ads.map((ad) => (
              <Link key={ad.id} to="/advertising" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group block">
                <div className="relative overflow-hidden">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg line-clamp-2">{ad.title}</h3>
                  <div className="flex items-center mb-2 sm:mb-3">
                    <MapPin size={14} sm={18} className="text-orange-500" />
                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-600">{ad.location}</span>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{formatPrice(ad.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Featured Jobs</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Discover your next career opportunity</p>
            </div>
            <Link to="/recruitment" className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {jobs.map((job) => (
              <Link key={job.id} to="/recruitment" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 sm:p-6 group block">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Briefcase size={20} sm={24} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800 ml-2 text-sm sm:text-base">{job.title}</h3>
                </div>
                <p className="text-gray-600 mb-2 text-sm sm:text-base">{job.company}</p>
                <div className="flex items-center mb-2">
                  <MapPin size={14} sm={16} className="text-gray-500" />
                  <span className="ml-1 text-xs sm:text-sm text-gray-600">{job.location}</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-green-600">{job.salary}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transport Options</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Travel with comfort and style</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {transports.map((transport) => (
              <Link key={transport.id} to="/booking" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 sm:p-6 group block">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                    <Calendar size={20} sm={28} className="text-white" />
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <h3 className="font-bold text-gray-800 text-sm sm:text-base">{transport.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{transport.type}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2 sm:mb-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <span className="text-gray-700 font-medium text-xs sm:text-sm">{transport.source}</span>
                  <ArrowRight size={14} sm={18} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium text-xs sm:text-sm">{transport.destination}</span>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(transport.price)}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{transport.duration}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Packages */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Travel Packages</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Explore amazing destinations</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {packages.map((pkg) => (
              <Link key={pkg.id} to="/booking" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group block">
                <div className="relative overflow-hidden">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-40 sm:h-48 md:h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-1.5 sm:p-2 rounded-lg">
                      <Plane size={16} sm={20} className="text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 ml-2 sm:ml-3 text-sm sm:text-base">{pkg.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{pkg.duration}</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{formatPrice(pkg.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Movies */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Now Showing</h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Catch the latest blockbusters</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center text-sm sm:text-base">
              View All <ArrowRight size={16} sm={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {movies.map((movie) => (
              <Link key={movie.id} to="/booking" className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group block">
                <div className="relative overflow-hidden">
                  <img src={movie.imageUrl} alt={movie.title} className="w-full h-48 sm:h-56 md:h-72 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center">
                      <Star size={14} sm={18} className="text-yellow-400 fill-current" />
                      <span className="ml-2 text-white font-semibold text-sm sm:text-base">{movie.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-base sm:text-lg line-clamp-2">{movie.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{movie.genre} • {movie.language}</p>
                  <div className="flex items-center">
                    <Star size={14} sm={16} className="text-yellow-500 fill-current" />
                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-600">{movie.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
