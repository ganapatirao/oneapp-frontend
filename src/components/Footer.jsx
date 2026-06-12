import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-xl font-bold text-white">OA</span>
              </div>
              <span className="text-xl font-bold text-white">OneApp</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Your all-in-one platform for shopping, advertising, recruitment, and booking needs. Simplifying your life, one solution at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Home</Link>
              </li>
              <li>
                <Link to="/shopping" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Shopping</Link>
              </li>
              <li>
                <Link to="/advertising" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Advertising</Link>
              </li>
              <li>
                <Link to="/recruitment" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Recruitment</Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Booking</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Online Shopping</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Classified Ads</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Job Portal</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Travel Booking</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">Movie Tickets</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-blue-500 flex-shrink-0 mt-1" />
                <span className="text-gray-400 text-sm sm:text-base">123 Business Street, Tech City, TC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm sm:text-base">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-blue-500 flex-shrink-0" />
                <span className="text-gray-400 text-sm sm:text-base">support@oneapp.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} OneApp. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
