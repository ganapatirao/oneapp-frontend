import { useState, useEffect } from 'react';

import { Plus, Filter, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { shoppingApi } from '../services/api';



export default function Shopping({ onCartChange }) {

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [cart, setCart] = useState([]);

  const [orders, setOrders] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [reviewProduct, setReviewProduct] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});



  useEffect(() => {

    loadCategories();
    loadCart();
    loadOrders();

  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      loadProducts();
    }
  }, [categories]);



  const loadProducts = async () => {

    try {

      const response = await shoppingApi.getProducts();

      // Backend already sorts by category sequence then product sequence
      const sortedProducts = response.data.filter(p => p.status === 'Active');

      setProducts(sortedProducts);

    } catch (error) {

      console.error('Error loading products:', error);

    }

  };



  const loadCategories = async () => {

    try {

      const response = await shoppingApi.getCategories();

      // Backend already sorts by displaySequence, use as-is
      setCategories(response.data);

    } catch (error) {

      console.error('Error loading categories:', error);

    }

  };



  const loadCart = async () => {

    try {

      const userId = localStorage.getItem('userId');

      if (userId) {

        const response = await shoppingApi.getCart(userId);

        setCart(response.data);

      }

    } catch (error) {

      console.error('Error loading cart:', error);

    }

  };



  const loadOrders = async () => {

    try {

      const userId = localStorage.getItem('userId');

      if (userId) {

        const response = await shoppingApi.getUserOrders(userId);

        setOrders(response.data);

      }

    } catch (error) {

      console.error('Error loading orders:', error);

    }

  };



  const handleAddToCart = async (product) => {

    try {

      const userId = localStorage.getItem('userId');

      if (!userId) {

        alert('Please login to add items to cart');

        return;

      }

      await shoppingApi.addToCart({

        userId,

        productId: product.id,

        quantity: 1

      });

      loadCart();

      onCartChange();

      alert('Product added to cart!');

    } catch (error) {

      console.error('Error adding to cart:', error);

    }

  };



  const handleCategoryChange = (category) => {

    setSelectedCategory(category);

  };



  const filteredProducts = selectedCategory === 'All'

    ? products

    : products.filter(p => p.categoryName === selectedCategory);



  const formatPrice = (price) => {

    return new Intl.NumberFormat('en-IN', {

      style: 'currency',

      currency: 'INR',

      maximumFractionDigits: 0

    }).format(price);

  };

  const getReviewCount = (product) => {
    return product.reviews ? product.reviews.length : 0;
  };



  const renderStars = (rating, size = 16) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  const handleNextImage = (imageCount) => {
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  const handlePrevImage = (imageCount) => {
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  useEffect(() => {
    if (selectedProduct) {
      setCurrentImageIndex(0);
    }
  }, [selectedProduct]);


  return (

    <div className="min-h-screen bg-gray-50 py-8">

      <div className="max-w-7xl mx-auto px-4">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold text-gray-800">Shopping</h1>

        </div>



        {/* Category Filter */}

        <div className="mb-8">

          <div className="flex items-center space-x-4 overflow-x-auto pb-2">

            <button

              onClick={() => handleCategoryChange('All')}

              className={`px-4 py-2 rounded-lg font-medium transition-colors ${

                selectedCategory === 'All'

                  ? 'bg-blue-600 text-white'

                  : 'bg-white text-gray-700 hover:bg-gray-100'

              }`}

            >

              All

            </button>

            {categories.map((category) => (

              <button

                key={category.id}

                onClick={() => handleCategoryChange(category.name)}

                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${

                  selectedCategory === category.name

                    ? 'bg-blue-600 text-white'

                    : 'bg-white text-gray-700 hover:bg-gray-100'

                }`}

              >

                {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="w-6 h-6 rounded-full object-cover" />}

                {category.name}

              </button>

            ))}

          </div>

        </div>



        {/* Products Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {filteredProducts.map((product) => {

            const isExpanded = expandedDescriptions[product.id];
            const shortDesc = product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description;

            return (
            <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">

              <img

                src={product.imageUrl}

                alt={product.name}

                className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"

                onClick={() => setSelectedProduct(product)}

              />

              <div className="p-4">

                <h3 className="font-bold text-gray-800 mb-2 text-lg">{product.name}</h3>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {isExpanded ? product.description : shortDesc}
                  </p>
                  {product.description.length > 100 && (
                    <button
                      onClick={() => setExpandedDescriptions(prev => ({ ...prev, [product.id]: !prev[product.id] }))}
                      className="text-blue-600 text-xs font-semibold mt-1 hover:text-blue-800 transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setReviewProduct(product)}
                  className="flex items-center mb-3 hover:text-blue-600 transition-colors"
                >
                  {renderStars(product.rating)}
                  <span className="ml-1 text-sm text-gray-600 hover:text-blue-600">{product.rating} ({getReviewCount(product)} reviews)</span>
                </button>

                <div className="flex justify-between items-center">

                  <p className="text-xl font-bold text-green-600">{formatPrice(product.price)}</p>

                  <button

                    onClick={() => handleAddToCart(product)}

                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"

                  >

                    Add

                  </button>

                </div>

              </div>

            </div>
            );
          })}

        </div>



        {/* Order History */}

        {orders.length > 0 && (

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">

            <h2 className="text-2xl font-bold text-gray-800 mb-4">Order History</h2>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead>

                  <tr className="bg-gray-50">

                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order ID</th>

                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Total</th>

                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>

                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>

                  </tr>

                </thead>

                <tbody>

                  {orders.map((order) => {

                    const isExpanded = expandedOrders[order.id];

                    return (

                    <React.Fragment key={order.id}>

                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}>

                        <td className="px-4 py-3 text-sm text-gray-800">{order.id.substring(0, 8)}...</td>

                        <td className="px-4 py-3 text-sm text-gray-800">{formatPrice(order.total)}</td>

                        <td className="px-4 py-3">

                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${

                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :

                            order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' :

                            'bg-blue-100 text-blue-800'

                          }`}>

                            {order.status}

                          </span>

                        </td>

                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>

                      </tr>

                      {isExpanded && (

                        <tr>

                          <td colSpan="4" className="px-4 py-4 bg-gray-50">

                            <div className="space-y-3">

                              <div>

                                <span className="font-semibold text-gray-700">Items:</span>

                                <div className="mt-2 space-y-2">

                                  {order.items && order.items.map((item, idx) => (

                                    <div key={idx} className="flex justify-between text-sm text-gray-600">

                                      <span>{item.productName} x {item.quantity}</span>

                                      <span>{formatPrice(item.price * item.quantity)}</span>

                                    </div>

                                  ))}

                                </div>

                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">

                                <div>

                                  <span className="font-semibold text-gray-700">Shipping Address:</span>

                                  <p className="text-gray-600">{order.shippingAddress || '-'}</p>

                                </div>

                                <div>

                                  <span className="font-semibold text-gray-700">Payment Method:</span>

                                  <p className="text-gray-600">{order.paymentMethod || '-'}</p>

                                </div>

                              </div>

                            </div>

                          </td>

                        </tr>

                      )}

                    </React.Fragment>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        )}



        {/* Product Detail Modal */}

        {selectedProduct && (

          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
                {(() => {
                  const images = selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? selectedProduct.imageUrls : [selectedProduct.imageUrl];
                  return (
                    <>
                      <img
                        src={images[currentImageIndex]}
                        alt={selectedProduct.name}
                        className="w-full h-64 md:h-96 object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(images.length); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleNextImage(images.length); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                          >
                            <ChevronRight size={24} />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((_, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-6 overflow-y-auto flex-1">

                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>

                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>

                <button
                  onClick={() => setReviewProduct(selectedProduct)}
                  className="flex items-center mb-4 hover:text-blue-600 transition-colors"
                >
                  {renderStars(selectedProduct.rating, 20)}
                  <span className="ml-2 text-gray-600 hover:text-blue-600">{selectedProduct.rating} ({getReviewCount(selectedProduct)} reviews)</span>
                </button>

                <div className="mb-4">

                  <p className="text-sm text-gray-500 mb-1">Price</p>

                  <p className="text-2xl font-bold text-green-600">{formatPrice(selectedProduct.price)}</p>

                </div>

                {(selectedProduct.pros && selectedProduct.pros.length > 0) || (selectedProduct.cons && selectedProduct.cons.length > 0) ? (

                  <div className="mb-4">

                    <div className="flex gap-4">

                      {selectedProduct.pros && selectedProduct.pros.length > 0 && (

                        <div className="flex-1">

                          <p className="text-sm font-semibold text-gray-700 mb-2">Pros:</p>

                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">

                            {selectedProduct.pros.map((pro, index) => (

                              <li key={index}>{pro}</li>

                            ))}

                          </ul>

                        </div>

                      )}

                      {selectedProduct.cons && selectedProduct.cons.length > 0 && (

                        <div className="flex-1">

                          <p className="text-sm font-semibold text-gray-700 mb-2">Cons:</p>

                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">

                            {selectedProduct.cons.map((con, index) => (

                              <li key={index}>{con}</li>

                            ))}

                          </ul>

                        </div>

                      )}

                    </div>

                  </div>

                ) : null}

                <button

                  onClick={() => {

                    handleAddToCart(selectedProduct);

                    setSelectedProduct(null);

                  }}

                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"

                >

                  Add to Cart

                </button>

              </div>

            </div>

          </div>

        )}


        {reviewProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start rounded-t-xl">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">Customer Reviews</h2>
                  <p className="text-gray-600 mt-1 text-lg">{reviewProduct.name}</p>
                </div>
                <button
                  onClick={() => setReviewProduct(null)}
                  className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-5xl font-bold text-gray-800">{reviewProduct.rating}</p>
                        <p className="text-sm text-gray-600">out of 5</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {renderStars(reviewProduct.rating, 32)}
                        <p className="text-sm text-gray-600 mt-1">{getReviewCount(reviewProduct)} reviews</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviewProduct.reviews ? reviewProduct.reviews.filter(r => r.rating === star).length : 0;
                        const percentage = getReviewCount(reviewProduct) > 0 ? (count / getReviewCount(reviewProduct)) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 w-12">{star} star</span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviewProduct.reviews && reviewProduct.reviews.length > 0 ? (
                    reviewProduct.reviews.map((review, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                            {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-800 text-lg">{review.userName || 'Verified Customer'}</p>
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Verified Purchase</span>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating, 18)}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg mb-2">{review.title}</h4>
                        <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>

  );

}




