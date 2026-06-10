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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent animate-fade-in">
              Welcome to Business Platform
            </h1>
            <p className="text-2xl mb-10 opacity-90 font-light">Your one-stop destination for Shopping, Advertising, Recruitment, and Booking</p>
            <div className="flex justify-center space-x-6">
              <Link to="/shopping" className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2">
                <ShoppingCart size={24} />
                <span>Start Shopping</span>
              </Link>
              <Link to="/advertising" className="bg-transparent border-3 border-white text-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2">
                <Briefcase size={24} />
                <span>Post an Ad</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Featured Products</h2>
              <p className="text-gray-600 mt-2">Discover our handpicked selection</p>
            </div>
            <Link to="/shopping" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-3">
                    <Star size={18} className="text-yellow-500 fill-current" />
                    <span className="ml-2 text-sm font-medium text-gray-600">{product.rating} ({product.reviewCount} reviews)</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Featured Ads</h2>
              <p className="text-gray-600 mt-2">Find what you're looking for</p>
            </div>
            <Link to="/advertising" className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ads.map((ad) => (
              <div key={ad.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg line-clamp-2">{ad.title}</h3>
                  <div className="flex items-center mb-3">
                    <MapPin size={18} className="text-orange-500" />
                    <span className="ml-2 text-sm font-medium text-gray-600">{ad.location}</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{formatPrice(ad.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Featured Jobs</h2>
              <p className="text-gray-600 mt-2">Discover your next career opportunity</p>
            </div>
            <Link to="/recruitment" className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 group">
                <div className="flex items-center mb-4">
                  <Briefcase size={24} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800 ml-2">{job.title}</h3>
                </div>
                <p className="text-gray-600 mb-2">{job.company}</p>
                <div className="flex items-center mb-2">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="ml-1 text-sm text-gray-600">{job.location}</span>
                </div>
                <p className="text-lg font-bold text-green-600">{job.salary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Transport Options</h2>
              <p className="text-gray-600 mt-2">Travel with comfort and style</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {transports.map((transport) => (
              <div key={transport.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-6 group">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-xl">
                    <Calendar size={28} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-gray-800">{transport.name}</h3>
                    <p className="text-sm text-gray-600">{transport.type}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                  <span className="text-gray-700 font-medium">{transport.source}</span>
                  <ArrowRight size={18} className="text-indigo-600" />
                  <span className="text-gray-700 font-medium">{transport.destination}</span>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(transport.price)}</p>
                <p className="text-sm text-gray-500 mt-2">{transport.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Packages */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Travel Packages</h2>
              <p className="text-gray-600 mt-2">Explore amazing destinations</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-2 rounded-lg">
                      <Plane size={20} className="text-white" />
                    </div>
                    <h3 className="font-bold text-gray-800 ml-3">{pkg.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{pkg.duration}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{formatPrice(pkg.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Movies */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Now Showing</h2>
              <p className="text-gray-600 mt-2">Catch the latest blockbusters</p>
            </div>
            <Link to="/booking" className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-rose-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center">
              View All <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {movies.map((movie) => (
              <div key={movie.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                <div className="relative overflow-hidden">
                  <img src={movie.imageUrl} alt={movie.title} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center">
                      <Star size={18} className="text-yellow-400 fill-current" />
                      <span className="ml-2 text-white font-semibold">{movie.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-2 text-lg line-clamp-2">{movie.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{movie.genre} • {movie.language}</p>
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="ml-2 text-sm font-medium text-gray-600">{movie.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
