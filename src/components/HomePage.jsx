import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Briefcase, Calendar, Plane, Star, MapPin, ArrowRight, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-16 sm:py-20 md:py-28 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-yellow-300 w-6 h-6 sm:w-8 sm:h-8 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-yellow-300 text-sm sm:text-base font-medium tracking-wider uppercase">Premium Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">OneApp</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Your all-in-one platform for shopping, advertising, recruitment, and booking needs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link to="/shopping" className="group bg-white text-purple-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                <span>Start Shopping</span>
              </Link>
              <Link to="/advertising" className="group bg-purple-500/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base">
                <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
                <span>Post an Ad</span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-12 sm:mt-16">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <TrendingUp className="w-5 h-5 text-yellow-300" />
                  <span className="text-2xl sm:text-3xl font-bold">10K+</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Products</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <Users className="w-5 h-5 text-pink-300" />
                  <span className="text-2xl sm:text-3xl font-bold">5K+</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <Zap className="w-5 h-5 text-blue-300" />
                  <span className="text-2xl sm:text-3xl font-bold">24/7</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-lg">
                <ShoppingCart className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-500 mt-1 text-sm">Discover our handpicked selection</p>
              </div>
            </div>
            <Link to="/shopping" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} to="/shopping" className="bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {product.offerPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      {product.offerPercentage}% OFF
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Ads */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-lg">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Featured Ads</h2>
                <p className="text-gray-500 mt-1 text-sm">Find what you're looking for</p>
              </div>
            </div>
            <Link to="/advertising" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {ads.map((ad) => (
              <Link key={ad.id} to="/advertising" className="bg-white border border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1">
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {ad.isFeatured && (
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                      <Star size={10} className="fill-current" /> Featured
                    </div>
                  )}
                  {ad.isUrgent && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      Urgent
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors">{ad.title}</h3>
                  <div className="flex items-center mb-1">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="ml-1 text-xs text-gray-500">{ad.location}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(ad.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-2 rounded-lg">
                <Briefcase className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Featured Jobs</h2>
                <p className="text-gray-500 mt-1 text-sm">Discover your next career opportunity</p>
              </div>
            </div>
            <Link to="/recruitment" className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {jobs.map((job) => (
              <Link key={job.id} to="/recruitment" className="bg-white border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-green-600 transition-colors">{job.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{job.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{job.location}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{job.salary}</p>
              </Link>
            ))}
            </div>
        </div>
      </section>

      {/* Transport Options */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Transport Options</h2>
                <p className="text-gray-500 mt-1 text-sm">Travel with comfort and style</p>
              </div>
            </div>
            <Link to="/booking" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {transports.map((transport) => (
              <Link key={transport.id} to="/booking" className="bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1 p-4">
                <div className="flex items-center mb-3">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{transport.name}</h3>
                    <p className="text-xs text-gray-500">{transport.type}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2 bg-blue-50 rounded-lg p-2">
                  <span className="text-gray-700 text-xs">{transport.source}</span>
                  <ArrowRight size={12} className="text-blue-400" />
                  <span className="text-gray-700 text-xs">{transport.destination}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{formatPrice(transport.price)}</p>
                <p className="text-xs text-gray-500 mt-1">{transport.duration}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Packages */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2 rounded-lg">
                <Plane className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Travel Packages</h2>
                <p className="text-gray-500 mt-1 text-sm">Explore amazing destinations</p>
              </div>
            </div>
            <Link to="/booking" className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {packages.map((pkg) => (
              <Link key={pkg.id} to="/booking" className="bg-white border border-gray-200 rounded-xl hover:border-pink-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1">
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <div className="flex items-center mb-1">
                    <Plane size={14} className="text-pink-500" />
                    <h3 className="font-medium text-gray-900 ml-2 text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">{pkg.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{pkg.duration}</p>
                  <p className="text-sm font-bold text-gray-900">{formatPrice(pkg.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Movies */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-lg">
                <Star className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Now Showing</h2>
                <p className="text-gray-500 mt-1 text-sm">Catch the latest blockbusters</p>
              </div>
            </div>
            <Link to="/booking" className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {movies.map((movie) => (
              <Link key={movie.id} to="/booking" className="bg-white border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-lg transition-all duration-300 overflow-hidden group block transform hover:-translate-y-1">
                <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
                  <img src={movie.imageUrl} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Star size={10} className="fill-current" /> {movie.rating}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">{movie.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{movie.genre} • {movie.language}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
