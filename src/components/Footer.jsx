import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart, Zap, Shield, TrendingUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="group">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <span className="text-2xl font-bold text-white">OA</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OneApp</span>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base leading-relaxed">
              Your all-in-one platform for shopping, advertising, recruitment, and booking needs. Simplifying your life, one solution at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 hover:bg-blue-600 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group">
                <Facebook size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-blue-400 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group">
                <Twitter size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-pink-600 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group">
                <Instagram size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="bg-gray-800 hover:bg-blue-700 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group">
                <Linkedin size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
              <Zap size={20} className="mr-2 text-yellow-500" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Home</Link>
              </li>
              <li>
                <Link to="/shopping" className="text-gray-400 hover:text-green-400 hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Shopping</Link>
              </li>
              <li>
                <Link to="/advertising" className="text-gray-400 hover:text-orange-400 hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Advertising</Link>
              </li>
              <li>
                <Link to="/recruitment" className="text-gray-400 hover:text-purple-400 hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Recruitment</Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-400 hover:text-teal-400 hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Booking</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
              <TrendingUp size={20} className="mr-2 text-green-500" />
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Online Shopping</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Classified Ads</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Job Portal</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Travel Booking</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 inline-block text-sm sm:text-base">Movie Tickets</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 flex items-center">
              <Shield size={20} className="mr-2 text-blue-500" />
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 group">
                <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-blue-600 transition-colors duration-300">
                  <MapPin size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                </div>
                <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">123 Business Street, Tech City, TC 12345</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-green-600 transition-colors duration-300">
                  <Phone size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                </div>
                <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-purple-600 transition-colors duration-300">
                  <Mail size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                </div>
                <span className="text-gray-400 text-sm sm:text-base group-hover:text-white transition-colors">support@oneapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left flex items-center">
              © {new Date().getFullYear()} OneApp. All rights reserved. Made with <Heart size={14} className="mx-1 text-red-500 fill-red-500" /> in India
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors hover:underline">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors hover:underline">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors hover:underline">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
