"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@/context/ThemeContext";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  Tag as TagIcon,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import Link from "next/link";
import { addToCart, removeFromCart, updateCartItemQuantity, clearCart } from "@/app/store";
import { applyPromoCode } from "@/app/utils/promoService";
import { loadStripe } from "@stripe/stripe-js";

import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function CartPageContent() {
  const dispatch = useDispatch();
  const stripe = useStripe();
  const elements = useElements();

  // Cart State
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(false);
  const shipCond = useSelector((state) => state.cart?.shipingCondition || []);

  // Form State
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA", // Default or select
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  // Payment State
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const topRef = useRef(null);
  const { darkMode } = useTheme()
  // console.log("theme", darkMode)
  // Checkout Flow State
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Cart, 2 = Checkout

  useEffect(() => {
    // Scroll to top element when step changes
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [checkoutStep]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/cart");
      if (res.data) setCarts(res.data);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      N("Error", "Failed to load cart items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = item.quantity + change;
    if (newQuantity < 1) return;

    setCarts(carts.map(cartItem =>
      cartItem.id === item.id ? { ...cartItem, quantity: newQuantity } : cartItem
    ));

    dispatch(updateCartItemQuantity({
      bookId: item.book.id,
      style: item.style,
      quantity: newQuantity
    }));
  };

  const handleDelete = async (cartItem) => {
    try {
      const response = await axios.delete(`/api/cart/${cartItem.id}`);
      if (response.data.success) {
        // Optimistic update
        const newCarts = carts.filter(c => c.id !== cartItem.id);
        setCarts(newCarts);
        dispatch(removeFromCart({ bookId: cartItem.book.id, style: cartItem.style }));

        // Use Notification service same as before
        N("Success", "Item removed from cart", "success");
      }
    } catch (error) {
      N("Error", "Failed to remove item from cart", "error");
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Calculations
  // Calculations
  const subtotal = carts.reduce((total, item) => total + (parseFloat(item.book.salePrice) * item.quantity), 0);
  const shipping = carts.reduce((total, item) => total + (item.style === "Printed Copy" ? parseFloat(item.book.shippingFee) : 0), 0);

  // Promo Code State
  const [discount, setDiscount] = useState(0);

  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyPromo = async () => {
    if (!promoCode) return;

    try {
      setLoading(true);
      const result = await applyPromoCode(promoCode, subtotal);

      if (result.success) {
        setDiscount(result.data.discountAmount);
        N("Success", `Promo code applied: $${result.data.discountAmount} Off`, "success");
      }
    } catch (error) {
      setDiscount(0);
      N("Error", error.message || "Invalid promo code", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initialize Payment Intent
  const createPaymentIntent = useCallback(async () => {
    if (carts.length === 0 || clientSecret) return;

    try {
      const res = await axios.post("/api/create-payment-intent", {
        cartItems: carts.map(item => ({
          bookId: item.book.id,
          quantity: item.quantity,
          style: item.style,
          shippingAddress: null // We'll send address with confirmCardPayment
        }))
      });
      setClientSecret(res.data.clientSecret);
    } catch (err) {
      console.error("Payment intent error:", err);
      // Don't show error immediately, only on pay attempt if missing
    }
  }, [carts, clientSecret]);

  useEffect(() => {
    if (carts.length > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [carts, createPaymentIntent, clientSecret]);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (carts.length === 0) {
      N("Error", "Your cart is empty", "error");
      return;
    }

    // Validate Address if physical items exist
    const hasPhysicalItems = carts.some(item => item.style === "Printed Copy");
    if (hasPhysicalItems) {
      const requiredFields = ['firstName', 'lastName', 'street', 'city', 'state', 'zip', 'phone'];
      const missing = requiredFields.filter(field => !address[field]);
      if (missing.length > 0) {
        N("Error", "Please fill in all shipping details", "error");
        // Scroll to top or highlight
        document.getElementById("shipping-form").scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    if (paymentMethod === "credit-card") {
      if (!stripe || !elements || !clientSecret) {
        // Try creating intent again if missing
        createPaymentIntent();
        N("Error", "System is initializing payment, please try again in a moment.", "error");
        return;
      }

      setProcessing(true);
      setError("");

      try {
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${address.firstName} ${address.lastName}`,
              email: address.email,
              phone: address.phone,
              address: {
                line1: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.zip,
                country: 'US', // Fixed for now, can be dynamic
              },
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        if (paymentIntent.status === "succeeded") {
          // Confirm with backend
          const fullAddrString = Object.values(address).filter(Boolean).join(", ");
          // Since API might expect shippingAddress PER ITEM in cartItems, we inject it
          const updatedCartItems = carts.map(item => ({
            ...item,
            shippingAddress: fullAddrString
          }));

          const res = await axios.post('/api/confirmBookPayment', {
            paymentIntent,
            cartItems: updatedCartItems
          });

          if (!res.data.success) {
            throw new Error('Payment verification failed');
          }

          setSuccess(true);
          // Clear cart
          carts.forEach(item => {
            dispatch(removeFromCart({ bookId: item.book.id, style: item.style }));
          });
          setCarts([]);
          N("Success", "Order placed successfully!", "success");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Payment processing failed");
      } finally {
        setProcessing(false);
      }
    } else {
      // PayPal Logic placeholder
      N("Info", "PayPal integration coming soon", "info");
    }
  };

  if (loading && carts.length === 0) {
    return <div className="flex h-[50vh] justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center  text-slate-900 dark:text-slate-100">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Thank You for Your Order!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your payment has been processed successfully. A confirmation email has been sent to {address.email}.
        </p>
        <Link href="/book">
          <Button size="lg" className="rounded-full px-8">Return to Store</Button>
        </Link>
      </div>
    )
  }

  return (
    <div ref={topRef} className="min-h-screen  text-slate-900 dark:text-slate-100 container mx-auto px-4 max-md:px-0 py-8 max-md:py-0 max-w-7xl transition-colors duration-300">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="w-8 h-8 text-slate-900 dark:text-white" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {checkoutStep === 1 ? "Your Cart" : "Checkout"}
        </h1>
        {checkoutStep === 1 && (
          <span className="bg-[#4A1D75] text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {carts.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        )}
      </div>

      {carts.length === 0 ? (
        <div className="text-center py-16  rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">Your cart is empty</p>
          <Link href="/book">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Review, Address, Payment */}
          <div className="lg:col-span-2 space-y-8">

            {/* 1. Order Review - Show Only in Step 1 */}
            {/* 1. Order Review - Show Only in Step 1 */}
            {checkoutStep === 1 && (
              <Card className="border-none shadow-sm max-md:rounded-none bg-white dark:bg-zinc-900 dark:border-zinc-800">
                <CardHeader className="pb-4">
                </CardHeader>
                <CardContent className="space-y-6">
                  {carts.map((item) => (
                    <div key={item.id} className="flex gap-4 sm:gap-6">
                      <div className="relative w-24 h-32 flex-shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-md overflow-hidden">
                        <img src={item.book.featuredImage} alt={item.book.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{item.book.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Copy: {item.style}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(item)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-lg font-bold dark:text-gray-100">${item.book.salePrice}</span>
                          <div className="flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button onClick={() => handleQuantityChange(item, -1)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-gray-300" disabled={item.quantity <= 1}>
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium dark:text-white">{item.quantity}</span>
                            <button onClick={() => handleQuantityChange(item, 1)} className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-gray-300">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping and Payment */}
            {checkoutStep === 2 && (
              <>

                {/* 2. Shipping Address */}
                <Card className="border-none shadow-sm max-md:rounded-none bg-white dark:bg-zinc-900 dark:border-zinc-800" id="shipping-form">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="dark:text-gray-300">First Name</Label>
                        <Input id="firstName" name="firstName" value={address.firstName} onChange={handleAddressChange} placeholder="" className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="dark:text-gray-300">Last Name</Label>
                        <Input id="lastName" name="lastName" value={address.lastName} onChange={handleAddressChange} placeholder="" className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="dark:text-gray-300">Email Address</Label>
                      <Input id="email" name="email" type="email" value={address.email} onChange={handleAddressChange} className="dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street" className="dark:text-gray-300">Street Address</Label>
                      <Input id="street" name="street" value={address.street} onChange={handleAddressChange} className="dark:bg-zinc-800 dark:border-zinc-700" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="state" className="dark:text-gray-300">State/Province</Label>
                        <Input id="state" name="state" value={address.state} onChange={handleAddressChange} placeholder="Select Your Region" className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="dark:text-gray-300">City</Label>
                        <Input id="city" name="city" value={address.city} onChange={handleAddressChange} className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="dark:text-gray-300">Zip/Postal Code</Label>
                        <Input id="zip" name="zip" value={address.zip} onChange={handleAddressChange} placeholder="00000" className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="dark:text-gray-300">Phone</Label>
                        <Input id="phone" name="phone" value={address.phone} onChange={handleAddressChange} placeholder="(000) 000-000" className="dark:bg-zinc-800 dark:border-zinc-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Payment Method */}
                <Card className="border-none shadow-sm max-md:rounded-none bg-white dark:bg-zinc-900 dark:border-zinc-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup defaultValue="credit-card" onValueChange={setPaymentMethod} className="space-y-4">

                      {/* PayPal Option */}
                      <div className="flex items-center space-x-2 border dark:border-zinc-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex-1 cursor-pointer font-medium flex items-center justify-between dark:text-gray-200">
                          PayPal
                          {/* Minimal PayPal Icon placeholder */}
                          <span className="text-blue-600 font-bold italic">PayPal</span>
                        </Label>
                        {paymentMethod === 'paypal' && (
                          <p className="text-sm text-gray-500 w-full basis-full mt-2 pl-6">
                            You will be redirected to the PayPal website after submitting your order.
                          </p>
                        )}
                      </div>

                      {/* Credit Card Option */}
                      <div className={`border rounded-lg p-4 space-y-4 ${paymentMethod === 'credit-card' ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900' : 'dark:border-zinc-700'}`}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex-1 cursor-pointer font-medium flex items-center gap-2 dark:text-gray-200">
                            Pay with Credit Card
                            <div className="flex gap-1 ml-auto">
                              <div className="w-8 h-5 bg-gray-200 dark:bg-zinc-700 rounded flex items-center justify-center text-[8px] dark:text-gray-300">VISA</div>
                              <div className="w-8 h-5 bg-gray-200 dark:bg-zinc-700 rounded flex items-center justify-center text-[8px] dark:text-gray-300">MC</div>
                            </div>
                          </Label>
                        </div>

                        {paymentMethod === 'credit-card' && (
                          <div className="pl-6 space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-500 dark:text-gray-400">Card Information</Label>
                              <div className="p-3 border dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800">
                                <CardElement
                                  options={{
                                    style: {
                                      base: {
                                        // fontSize: '16px',
                                        color: darkMode ? '#ffffff' : '#000000',
                                        // '::placeholder': { color: '#aab7c4' },
                                      },
                                    },
                                    hidePostalCode: true,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                    </RadioGroup>
                  </CardContent>
                </Card>
              </>
            )}

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-sm max-md:rounded-none sticky top-6 bg-white dark:bg-zinc-900 dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">${shipping.toFixed(2)}</span>
                  </div>
                </div>

                <Separator className="dark:bg-zinc-800" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg dark:text-white">Total</span>
                  <span className="font-bold text-2xl dark:text-white">${total.toFixed(2)}</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Add promo code"
                        className="pl-9 bg-gray-50 dark:bg-zinc-800 border-none dark:text-white"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                    </div>
                    <Button
                      className="bg-[#1e40af] dark:text-white hover:bg-[#1e3a8a]"
                      onClick={handleApplyPromo}
                      disabled={!promoCode}
                    >
                      Apply
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    className="w-full dark:text-white h-12 text-base rounded-full bg-[#4A1D75] hover:bg-[#3a165c] group"
                    onClick={(e) => {
                      if (checkoutStep === 1) {
                        setCheckoutStep(2);
                      } else {
                        handleCheckout(e);
                      }
                    }}
                    disabled={processing || loading}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : checkoutStep === 1 ? (
                      <>
                        Go to Checkout <ArrowRight className="ml-2  w-4 h-4 group-hover:translate-x-1 transition-transform dark:text-white" />
                      </>
                    ) : (
                      `Pay $${total.toFixed(2)}`
                    )}
                  </Button>

                  {checkoutStep === 2 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setCheckoutStep(1)}
                    >
                      Back to Cart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Elements stripe={stripePromise}>
      <CartPageContent />
    </Elements>
  )
}
