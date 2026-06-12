import { ShoppingBag, MapPin, CreditCard, Package, Truck, MessageCircle, CheckCircle2 } from 'lucide-react';

const ReviewStep = ({ shippingInfo, billingInfo, paymentInfo, cartItems, subtotal, shipping, tax, total, termsAccepted, setTermsAccepted, errors, formatPrice }) => (
  <div className="space-y-5 mt-4">
    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
      <ShoppingBag size={28} className="mr-3 text-blue-600" />
      Review Your Order
    </h3>

    {/* Shipping Address */}
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <div className="bg-blue-600 p-2.5 rounded-lg mr-3">
          <MapPin size={20} className="text-white" />
        </div>
        <h4 className="font-semibold text-gray-800">Shipping Address</h4>
      </div>
      <div className="bg-white rounded-lg p-4 border border-blue-100">
        <p className="text-gray-700 leading-relaxed text-sm">
          <span className="font-semibold text-gray-900">{shippingInfo.fullName}</span><br />
          {shippingInfo.address}<br />
          {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
          <span className="text-gray-600">{shippingInfo.email}</span><br />
          <span className="text-gray-600">{shippingInfo.phone}</span>
        </p>
      </div>
    </div>

    {/* Billing Address */}
    <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <div className="bg-purple-600 p-2.5 rounded-lg mr-3">
          <CreditCard size={20} className="text-white" />
        </div>
        <h4 className="font-semibold text-gray-800">Billing Address</h4>
      </div>
      <div className="bg-white rounded-lg p-4 border border-purple-100">
        <p className="text-gray-700 leading-relaxed text-sm">
          <span className="font-semibold text-gray-900">{billingInfo.fullName}</span><br />
          {billingInfo.address}<br />
          {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}
        </p>
      </div>
    </div>

    {/* Payment Method */}
    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <div className="bg-green-600 p-2.5 rounded-lg mr-3">
          {paymentInfo.paymentMethod === 'cod' ? <Truck size={20} className="text-white" /> : <MessageCircle size={20} className="text-white" />}
        </div>
        <h4 className="font-semibold text-gray-800">Payment Method</h4>
      </div>
      <div className="bg-white rounded-lg p-4 border border-green-100">
        <p className="text-gray-800 font-semibold capitalize flex items-center">
          {paymentInfo.paymentMethod === 'cod' ? (
            <>
              <Truck className="mr-2 text-green-600" size={18} />
              Cash on Delivery
            </>
          ) : paymentInfo.paymentMethod === 'whatsapp' ? (
            <>
              <MessageCircle className="mr-2 text-green-600" size={18} />
              WhatsApp Payment
            </>
          ) : (
            <>
              <CreditCard className="mr-2 text-green-600" size={18} />
              {paymentInfo.paymentMethod}
            </>
          )}
        </p>
      </div>
    </div>

    {/* Order Items */}
    <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <div className="bg-orange-600 p-2.5 rounded-lg mr-3">
          <Package size={20} className="text-white" />
        </div>
        <h4 className="font-semibold text-gray-800">Order Items ({cartItems.length})</h4>
      </div>
      <div className="space-y-2">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors duration-200">
            <div className="flex items-center">
              <div className="bg-orange-100 p-1.5 rounded mr-3">
                <Package size={14} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.product?.name}</p>
                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
              </div>
            </div>
            <p className="font-semibold text-gray-800">{formatPrice(item.totalPrice)}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Order Summary */}
    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center mb-3">
        <div className="bg-indigo-600 p-2.5 rounded-lg mr-3">
          <Truck size={20} className="text-white" />
        </div>
        <h4 className="font-semibold text-gray-800">Order Summary</h4>
      </div>
      <div className="bg-white rounded-lg p-4 border border-indigo-100 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-800">{formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Tax (18%)</span>
          <span className="font-medium text-gray-800">{formatPrice(tax)}</span>
        </div>
        <div className="border-t border-indigo-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-bold">Total</span>
            <span className="font-bold text-indigo-600 text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Terms and Conditions */}
    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors duration-300">
      <label className="flex items-start space-x-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
          />
          {termsAccepted && (
            <CheckCircle2 className="absolute -top-1 -right-1 text-green-500" size={14} />
          )}
        </div>
        <span className="text-sm text-gray-700 leading-relaxed">
          I agree to the <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <p className="text-red-500 text-sm mt-2 font-medium flex items-center"><span className="mr-2">⚠</span>{errors.terms}</p>}
    </div>
  </div>
);

export default ReviewStep;
