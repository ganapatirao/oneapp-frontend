import React, { useState, useEffect, useRef } from 'react';

import { Plus, Filter, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { shoppingApi } from '../services/api';



export default function Shopping({ onCartChange }) {

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [cart, setCart] = useState([]);


  const [selectedCategory, setSelectedCategory] = useState('All');

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [expandedHighlights, setExpandedHighlights] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [addToCartError, setAddToCartError] = useState('');
  const [hasCheckedSearchProduct, setHasCheckedSearchProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    console.log('Shopping component mounted');
    loadCategories();
    loadProducts();
    loadCart();
  }, []);



  const loadProducts = async () => {

    try {

      console.log('Loading products...');
      const response = await shoppingApi.getProducts();
      console.log('Products response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data is array:', Array.isArray(response.data));

      // Backend already sorts by category sequence then product sequence
      const sortedProducts = response.data.filter(p => p.status === 'Active');
      console.log('Filtered products:', sortedProducts);
      console.log('Products count:', sortedProducts.length);

      setProducts(sortedProducts);
      setLoading(false);

    } catch (error) {

      console.error('Error loading products:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      setError(error.message || 'Failed to load products');
      setLoading(false);

    }

  };



  const loadCategories = async () => {

    try {

      console.log('Loading categories...');
      const response = await shoppingApi.getCategories();
      console.log('Categories response:', response.data);

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

      } else {
        // Load guest cart from localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        setCart(guestCart);
      }

    } catch (error) {

      console.error('Error loading cart:', error);

    }

  };






  const handleAddToCart = async (product, colorVariantName = null) => {

    try {

      console.log('Adding to cart - product:', product);
      console.log('Selected color:', selectedColor);
      console.log('Selected size:', selectedSize);

      const userId = localStorage.getItem('userId');

      // Determine which variant and size options to use based on selection
      let activeVariant = null;
      let sizeOptionsToUse = null;

      if (selectedColor !== null && product.colorVariants && product.colorVariants[selectedColor]) {
        // Color explicitly selected - use that color's size options
        activeVariant = product.colorVariants[selectedColor];
        // If color has size options, use those; otherwise fall back to product size options
        sizeOptionsToUse = activeVariant.sizeOptions && activeVariant.sizeOptions.length > 0
          ? activeVariant.sizeOptions
          : (product.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions : null);
      } else {
        // No color selected - use product-level size options
        activeVariant = null;
        sizeOptionsToUse = product.sizeOptions && product.sizeOptions.length > 0
          ? product.sizeOptions
          : null;
      }

      // Validate that selected size index is valid for current size options array
      let activeSizeIndex = selectedSize;
      if (activeSizeIndex !== null && sizeOptionsToUse && (activeSizeIndex >= sizeOptionsToUse.length || activeSizeIndex < 0)) {
        console.log('Selected size index is invalid for current size options, resetting to null');
        activeSizeIndex = null;
      }

      console.log('=== Price Calculation Debug ===');
      console.log('Product base price:', product.price);
      console.log('Product offer %:', product.offerPercentage);
      console.log('Selected color:', selectedColor);
      console.log('Selected size:', selectedSize);
      console.log('Active variant:', activeVariant);
      console.log('Size options to use:', sizeOptionsToUse);
      console.log('Size options length:', sizeOptionsToUse?.length);
      console.log('Active size index (after validation):', activeSizeIndex);

      // Validation: If product has both color variants and size options, require both to be selected
      const hasColorVariants = product.colorVariants && product.colorVariants.length > 0;
      const hasSizeOptions = product.sizeOptions && product.sizeOptions.length > 0;
      const hasColorVariantSizeOptions = hasColorVariants && product.colorVariants.some(cv => cv.sizeOptions && cv.sizeOptions.length > 0);

      if (hasColorVariants && hasSizeOptions) {
        // Product has both color variants and size options at product level
        if (selectedColor === null || selectedSize === null) {
          setAddToCartError('Please select both a color and a size option');
          return;
        }
      } else if (hasColorVariantSizeOptions) {
        // Product has color variants with size options
        if (selectedColor === null || selectedSize === null) {
          setAddToCartError('Please select both a color and a size option');
          return;
        }
      } else if (hasColorVariants) {
        // Product has only color variants
        if (selectedColor === null) {
          setAddToCartError('Please select a color option');
          return;
        }
      } else if (hasSizeOptions) {
        // Product has only size options
        if (selectedSize === null) {
          setAddToCartError('Please select a size option');
          return;
        }
      }

      setAddToCartError('');

      // Calculate price based on color and size selection (matching backend logic exactly)
      let sizeOptionName = null;
      let finalColorVariantName = null;
      let price = product.price;

      // Ceiling rounding function to avoid floating-point precision issues
      const ceilPrice = (value) => Math.ceil(value);

      // Only send color variant name if a color was explicitly selected
      if (selectedColor !== null && activeVariant) {
        finalColorVariantName = activeVariant.name;
        console.log('Color variant selected:', finalColorVariantName);
      }

      // Backend logic: First apply adjustments, then apply offer, then re-apply adjustments
      // This matches the backend's two-step process

      // Step 1: Apply adjustments to base price
      if (finalColorVariantName && activeVariant) {
        price += activeVariant.priceAdjustment || 0;
        console.log('After color adjustment:', price, '(added:', activeVariant.priceAdjustment || 0, ')');
      }

      if (activeSizeIndex !== null && activeSizeIndex >= 0 && sizeOptionsToUse && sizeOptionsToUse[activeSizeIndex]) {
        const sizeOption = sizeOptionsToUse[activeSizeIndex];
        sizeOptionName = sizeOption.name;
        price += sizeOption.priceAdjustment || 0;
        console.log('After size adjustment:', price, '(added:', sizeOption.priceAdjustment || 0, ')');
        console.log('Size option details:', sizeOption);
      } else {
        console.log('Size adjustment SKIPPED - activeSizeIndex:', activeSizeIndex, 'sizeOptionsToUse:', sizeOptionsToUse);
      }

      // Step 2: Apply offer percentage to base price, then re-add adjustments
      if (product.offerPercentage > 0) {
        const basePriceWithOffer = product.price - (product.price * product.offerPercentage / 100);
        price = basePriceWithOffer;
        console.log('After offer applied to base:', price, '(base:', product.price, 'offer:', product.offerPercentage + '%)');

        // Re-add color adjustment
        if (finalColorVariantName && activeVariant) {
          price += activeVariant.priceAdjustment || 0;
          console.log('After re-adding color adjustment:', price, '(added:', activeVariant.priceAdjustment || 0, ')');
        }

        // Re-add size adjustment
        if (activeSizeIndex !== null && activeSizeIndex >= 0 && sizeOptionsToUse && sizeOptionsToUse[activeSizeIndex]) {
          const sizeOption = sizeOptionsToUse[activeSizeIndex];
          price += sizeOption.priceAdjustment || 0;
          console.log('After re-adding size adjustment:', price, '(added:', sizeOption.priceAdjustment || 0, ')');
        }
      } else {
        // No offer - adjustments already applied in Step 1
        console.log('No offer - using price with adjustments from Step 1');
      }

      // Apply ceiling rounding to final price to avoid floating-point precision issues
      price = ceilPrice(price);
      console.log('Final calculated price (after ceiling):', price);
      console.log('Final color variant name:', finalColorVariantName);
      console.log('Final size option name:', sizeOptionName);
      console.log('Sending to backend:', { userId, productId: product.id, quantity: 1, sizeOptionName, colorVariantName: finalColorVariantName, price });
      console.log('=== End Price Calculation Debug ===');

      if (userId) {
        // Logged in user - save to database
        await shoppingApi.addToCart({

          userId,

          productId: product.id,

          quantity: 1,

          sizeOptionName,

          colorVariantName: finalColorVariantName,

          price

        });

        loadCart();

        onCartChange();
      } else {
        // Guest user - save to localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = guestCart.findIndex(item =>
          item.productId === product.id &&
          item.colorVariantName === finalColorVariantName &&
          item.sizeOptionName === sizeOptionName
        );

        if (existingItemIndex >= 0) {
          guestCart[existingItemIndex].quantity += 1;
        } else {
          guestCart.push({
            productId: product.id,
            product: product,
            quantity: 1,
            sizeOptionName,
            colorVariantName: finalColorVariantName,
            price,
            itemPrice: price,
            totalPrice: price
          });
        }

        localStorage.setItem('guestCart', JSON.stringify(guestCart));
        onCartChange();
      }

      return true;

    } catch (error) {

      console.error('Error adding to cart:', error);
      console.error('Error details:', error.response?.data);
      setAddToCartError(error.response?.data?.message || error.message || 'Failed to add to cart');
      return false;

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

  const handleImageClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e) => {
    if (isZoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({ x, y });
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setCurrentImageIndex(0);
      setSelectedColor(null);
      setSelectedSize(null);
      setIsZoomed(false);
    }
  }, [selectedProduct]);

  useEffect(() => {
    // Check if a product was selected from search - only run once after products load
    if (!hasCheckedSearchProduct && products.length > 0) {
      const selectedProductId = localStorage.getItem('selectedProductId');
      if (selectedProductId) {
        const product = products.find(p => p.id === selectedProductId);
        if (product) {
          setSelectedProduct(product);
          localStorage.removeItem('selectedProductId');
        }
      }
      setHasCheckedSearchProduct(true);
    }
  }, [products, hasCheckedSearchProduct]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-bold mb-2">Error Loading Products</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              loadProducts();
            }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">

      <div className="max-w-7xl mx-auto px-4">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Shopping</h1>

        </div>



        {/* Category Filter */}

        <div className="mb-8">

          <div className="flex items-center gap-3 overflow-x-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100 sm:px-0">

            <button

              onClick={() => handleCategoryChange('All')}

              className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105 border-2 ${

                selectedCategory === 'All'

                  ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white border-transparent shadow-lg ring-2 ring-blue-300'

                  : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-blue-50 hover:to-purple-50 border-gray-300 hover:border-blue-400'

              }`}

            >

              <span className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🛍️</span>
                All
              </span>

            </button>

            {categories.map((category) => (

              <button

                key={category.id}

                onClick={() => handleCategoryChange(category.name)}

                className={`px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-2 flex-shrink-0 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105 border-2 ${

                  selectedCategory === category.name

                    ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white border-transparent shadow-lg ring-2 ring-blue-300'

                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-blue-50 hover:to-purple-50 border-gray-300 hover:border-blue-400'

                }`}

              >

                {category.imageUrl && <img src={category.imageUrl} alt={category.name} className="w-5 h-5 sm:w-7 sm:h-7 rounded-xl object-cover flex-shrink-0 ring-2 ring-white shadow-md" />}

                <span className="truncate font-semibold">{category.name}</span>

              </button>

            ))}

          </div>

        </div>



        {/* Products Grid */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">

          {filteredProducts.map((product) => {

            const discountPrice = product.offerPercentage > 0 
              ? product.price - (product.price * product.offerPercentage / 100) 
              : product.price;

            return (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2 border border-gray-100">
              
              <div className="relative overflow-hidden">
                {product.offerPercentage > 0 && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    {product.offerPercentage}% OFF
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-52 object-cover cursor-pointer transform group-hover:scale-110 transition-transform duration-500"
                  onClick={() => {
                    setSelectedProduct(product);
                    setSelectedColor(null);
                    setSelectedSize(null);
                    setCurrentImageIndex(0);
                    setAddToCartError('');
                  }}
                />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedColor(null);
                      setSelectedSize(null);
                      setCurrentImageIndex(0);
                      setAddToCartError('');
                    }}
                    className="bg-white/90 hover:bg-white text-blue-600 p-2 rounded-full shadow-lg backdrop-blur-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                <h3 className="font-bold text-gray-800 mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>

                <div className="flex items-center mb-3">
                  {renderStars(product.rating, 14)}
                  <span className="ml-2 text-xs text-gray-500 font-medium">({getReviewCount(product)})</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    {product.offerPercentage > 0 && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</p>
                    )}
                    <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatPrice(discountPrice)}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Add
                  </button>
                </div>

              </div>

            </div>
            );
          })}

        </div>






        {/* Product Detail Modal */}

        {selectedProduct && (

          <div className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">

            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-6xl w-full max-h-[98vh] sm:max-h-[95vh] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/20">

              <div className="relative flex-shrink-0 md:w-1/2 bg-gradient-to-br from-gray-100 to-gray-200">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <X size={20} sm={24} className="text-gray-700" />
                </button>
                {(() => {
                  const defaultVariant = selectedProduct.colorVariants && selectedProduct.colorVariants.length > 0
                    ? selectedProduct.colorVariants[selectedProduct.colorVariants.findIndex(v => v.isDefault) || 0]
                    : null;
                  const activeVariant = selectedColor !== null && selectedProduct.colorVariants
                    ? selectedProduct.colorVariants[selectedColor]
                    : defaultVariant;
                  const images = activeVariant && activeVariant.imageUrl
                    ? (activeVariant.imageUrls && activeVariant.imageUrls.length > 0 ? activeVariant.imageUrls : [activeVariant.imageUrl])
                    : (selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? selectedProduct.imageUrls : [selectedProduct.imageUrl]);
                  return (
                    <>
                      <div className="relative w-full h-48 sm:h-64 md:h-full overflow-hidden cursor-zoom-in">
                        <img
                          src={images[currentImageIndex]}
                          alt={selectedProduct.name}
                          className={`w-full h-full object-cover transition-transform duration-100 ease-out ${isZoomed ? 'scale-200' : 'scale-100'}`}
                          style={{
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                          }}
                          onClick={handleImageClick}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={() => setIsZoomed(false)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
                        {!isZoomed && (
                          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
                            Click to zoom
                          </div>
                        )}
                      </div>
                      {!isZoomed && images.length > 1 && (
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 sm:bottom-6 flex gap-2 sm:gap-3 z-10">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shadow-md ${idx === currentImageIndex ? 'bg-white scale-125 ring-2 ring-white/50' : 'bg-white/50 hover:bg-white/70'}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-4 sm:p-6 md:p-10 overflow-y-auto flex-1 flex flex-col bg-gradient-to-br from-white to-blue-50/30">

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">{selectedProduct.name}</h2>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md">{selectedProduct.categoryName}</span>
                  <span className="text-gray-600 text-xs sm:text-sm font-medium">Sold by: <span className="text-blue-600">{selectedProduct.seller}</span></span>
                </div>

                <button
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center mb-4 sm:mb-6 hover:text-blue-600 transition-colors group"
                >
                  {renderStars(selectedProduct.rating, 16)}
                  <span className="ml-2 sm:ml-3 text-gray-600 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">{selectedProduct.rating} ({getReviewCount(selectedProduct)} reviews)</span>
                  <span className="ml-2 sm:ml-3 text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-full">{showReviews ? 'Hide' : 'Show Reviews'}</span>
                </button>

                <div className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 font-medium">Price</p>
                  {selectedProduct.offerPercentage > 0 && (
                    <p className="text-lg sm:text-xl text-gray-400 line-through mb-1">{formatPrice(selectedProduct.price)}</p>
                  )}
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                    {(() => {
                      // Determine which variant and size options to use based on selection
                      let activeVariant = null;
                      let sizeOptionsToUse = null;

                      if (selectedColor !== null && selectedProduct.colorVariants && selectedProduct.colorVariants[selectedColor]) {
                        // Color explicitly selected - use that color's size options
                        activeVariant = selectedProduct.colorVariants[selectedColor];
                        sizeOptionsToUse = activeVariant.sizeOptions && activeVariant.sizeOptions.length > 0
                          ? activeVariant.sizeOptions
                          : (selectedProduct.sizeOptions && selectedProduct.sizeOptions.length > 0 ? selectedProduct.sizeOptions : null);
                      } else {
                        // No color selected - use product-level size options
                        activeVariant = null;
                        sizeOptionsToUse = selectedProduct.sizeOptions && selectedProduct.sizeOptions.length > 0
                          ? selectedProduct.sizeOptions
                          : null;
                      }

                      console.log('=== Modal Price Calculation ===');
                      console.log('Selected color:', selectedColor);
                      console.log('Selected size:', selectedSize);
                      console.log('Active variant:', activeVariant);
                      console.log('Size options to use:', sizeOptionsToUse);
                      console.log('Size options length:', sizeOptionsToUse?.length);

                      // Ceiling rounding function to avoid floating-point precision issues
                      const ceilPrice = (value) => Math.ceil(value);

                      // Calculate base price with offer
                      let price = selectedProduct.offerPercentage > 0
                        ? selectedProduct.price - (selectedProduct.price * selectedProduct.offerPercentage / 100)
                        : selectedProduct.price;

                      console.log('Base price (with offer):', price);

                      // Add color adjustment if color is selected
                      if (activeVariant) {
                        const colorAdj = activeVariant.priceAdjustment || 0;
                        price += colorAdj;
                        console.log('Color adjustment:', colorAdj, 'Price after color:', price);
                      }

                      // Add size adjustment if size is selected
                      if (selectedSize !== null && selectedSize >= 0 && sizeOptionsToUse && sizeOptionsToUse[selectedSize]) {
                        const sizeOption = sizeOptionsToUse[selectedSize];
                        const sizeAdj = sizeOption.priceAdjustment || 0;
                        price += sizeAdj;
                        console.log('Size adjustment:', sizeAdj, 'Size option:', sizeOption.name, 'Price after size:', price);
                      } else {
                        console.log('Size adjustment skipped - selectedSize:', selectedSize, 'sizeOptionsToUse:', sizeOptionsToUse);
                      }

                      // Apply ceiling rounding to final price
                      price = ceilPrice(price);
                      console.log('Final price (after ceiling):', price);
                      console.log('=== End Modal Price Calculation ===');

                      return formatPrice(price);
                    })()}
                  </p>
                  {selectedProduct.offerPercentage > 0 && (
                    <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg animate-pulse">
                      {selectedProduct.offerPercentage}% OFF
                    </div>
                  )}
                </div>

                {selectedProduct.colorVariants && selectedProduct.colorVariants.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Select Color</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {selectedProduct.colorVariants.map((variant, index) => {
                        const isSelected = selectedColor === index;
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedColor(index);
                              setSelectedSize(null); // Reset size when color changes to avoid index mismatch
                              setCurrentImageIndex(0);
                            }}
                            className={`flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                              isSelected
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-md'
                            } ${variant.stock === 0 ? 'opacity-60 grayscale' : ''}`}
                          >
                            {variant.hexCode && (
                              <div
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 shadow-inner"
                                style={{ backgroundColor: variant.hexCode }}
                              />
                            )}
                            <div className="text-left">
                              <div className="text-xs sm:text-sm font-bold text-gray-800">{variant.name}</div>
                              {variant.priceAdjustment !== 0 && (
                                <div className="text-xs text-gray-600">
                                  {variant.priceAdjustment > 0 ? '+' : ''}{formatPrice(variant.priceAdjustment)}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(() => {
                  // Determine which variant and size options to use based on selection
                  let activeVariant = null;
                  let sizeOptionsToUse = null;

                  if (selectedColor !== null && selectedProduct.colorVariants && selectedProduct.colorVariants[selectedColor]) {
                    // Color explicitly selected - use that color's size options
                    activeVariant = selectedProduct.colorVariants[selectedColor];
                    sizeOptionsToUse = activeVariant.sizeOptions && activeVariant.sizeOptions.length > 0
                      ? activeVariant.sizeOptions
                      : (selectedProduct.sizeOptions && selectedProduct.sizeOptions.length > 0 ? selectedProduct.sizeOptions : null);
                  } else {
                    // No color selected - use product-level size options
                    activeVariant = null;
                    sizeOptionsToUse = selectedProduct.sizeOptions && selectedProduct.sizeOptions.length > 0
                      ? selectedProduct.sizeOptions
                      : null;
                  }

                  return sizeOptionsToUse && sizeOptionsToUse.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Select Size/Weight</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {sizeOptionsToUse.map((sizeOption, index) => {
                          // Calculate price for this size option
                          let price = selectedProduct.offerPercentage > 0
                            ? selectedProduct.price - (selectedProduct.price * selectedProduct.offerPercentage / 100)
                            : selectedProduct.price;

                          // Add color adjustment if color is selected
                          if (activeVariant) {
                            price += activeVariant.priceAdjustment || 0;
                          }

                          // Add size adjustment
                          price += sizeOption.priceAdjustment || 0;

                          const isSelected = selectedSize === index;
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedSize(index)}
                              disabled={sizeOption.stock === 0}
                              className={`px-3 py-3 sm:px-4 sm:py-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                isSelected
                                  ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-blue-300 bg-white text-gray-700 hover:shadow-md'
                              } ${sizeOption.stock === 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                            >
                              <div className="text-xs sm:text-sm font-bold">{sizeOption.name}</div>
                              <div className="text-xs mt-1 opacity-90">{formatPrice(price)}</div>
                              <div className="text-xs mt-1 opacity-75">{sizeOption.stock > 0 ? `${sizeOption.stock} in stock` : 'Out of stock'}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed bg-white/50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 text-sm sm:text-base">{selectedProduct.description}</p>
                </div>

                {selectedProduct.highlights && selectedProduct.highlights.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Key Highlights</h3>
                    <ul className="space-y-2 sm:space-y-3">
                      {selectedProduct.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start text-gray-600 bg-gradient-to-r from-green-50 to-transparent p-2 sm:p-3 rounded-lg text-sm sm:text-base">
                          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center mr-2 sm:mr-3 mt-0.5 text-xs sm:text-sm font-bold shadow-md">✓</span>
                          <span className="leading-relaxed font-medium">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showReviews && (
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Customer Reviews</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 border border-blue-100 shadow-inner">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center">
                          <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{selectedProduct.rating}</p>
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">out of 5</p>
                        </div>
                        <div className="flex flex-col gap-1 sm:gap-2">
                          {renderStars(selectedProduct.rating, 18)}
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">{getReviewCount(selectedProduct)} reviews</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4 max-h-48 sm:max-h-64 overflow-y-auto pr-2">
                      {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                        selectedProduct.reviews.map((review, index) => (
                          <div key={index} className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-md">
                                {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-800 text-xs sm:text-sm">{review.userName || 'Verified Customer'}</p>
                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-1 sm:mb-2">
                              {renderStars(review.rating, 12)}
                            </div>
                            <h4 className="font-bold text-gray-800 text-xs sm:text-sm mb-1 sm:mb-2">{review.title}</h4>
                            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg sm:rounded-xl">
                          <p className="text-gray-500 text-xs sm:text-sm font-medium">No reviews yet. Be the first to review this product!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 sm:pt-8 border-t border-gray-200/50">
                  {addToCartError && (
                    <div className="mb-3 sm:mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium">
                      {addToCartError}
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      setAddToCartError('');
                      const result = await handleAddToCart(selectedProduct);
                      if (result === true) {
                        setSelectedProduct(null);
                        setSelectedColor(null);
                        setSelectedSize(null);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>

  );

}




