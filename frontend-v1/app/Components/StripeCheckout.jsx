"use client";

import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ cartList, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const shipCond = useSelector((state) => state.cart.shipingCondition);

  const createPaymentIntent = useCallback(async () => {
    try {
      setInitializing(true);
      setError("");

      const res = await axios.post("/api/create-payment-intent", {
        cartItems: cartList.map(item => ({
          bookId: item.book?.id,
          courseId: item.course?.id,
          quantity: item.quantity,
          style: item.style,
          shippingAddress: item.shippingAddress
        }))
      });

      setClientSecret(res.data.clientSecret);

      // Calculate order details
      const subtotal = cartList.reduce((sum, item) => {
        const product = item.book || item.course;
        return sum + (Number(product?.salePrice || 0) * Number(item.quantity))
      }, 0);

      const shipping = cartList.reduce((sum, item) => {
        return sum + (!shipCond.includes(item.style) && item.book ? Number(item.book.shippingFee) : 0);
      }, 0);

      setOrderDetails({
        items: cartList.map(item => {
          const product = item.book || item.course;
          return {
            title: product?.title,
            style: item.style,
            price: product?.salePrice,
            quantity: item.quantity,
            shipping: !shipCond.includes(item.style) && item.book ? item.book.shippingFee : 0
          }
        }),
        subtotal,
        shipping,
        total: subtotal + shipping
      });
    } catch (err) {
      console.error(err);
      setError("Failed to initialize payment. Please try again.");
      onError?.("Failed to initialize payment.");
    } finally {
      setInitializing(false);
    }
  }, [cartList, onError]);

  useEffect(() => {
    if (!clientSecret && cartList?.length > 0) {
      createPaymentIntent();
    }
  }, [clientSecret, cartList, createPaymentIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    setError("");

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // Use the first printed copy's address if available
            address: cartList.find(item => item.shippingAddress)?.shippingAddress ? {
              line1: cartList.find(item => item.shippingAddress)?.shippingAddress.street,
              city: cartList.find(item => item.shippingAddress)?.shippingAddress.city,
              state: cartList.find(item => item.shippingAddress)?.shippingAddress.state,
              postal_code: cartList.find(item => item.shippingAddress)?.shippingAddress.zip,
              country: cartList.find(item => item.shippingAddress)?.shippingAddress.country
            } : undefined
          }
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent.status === "succeeded") {
        const res = await axios.post('/api/confirmBookPayment', {
          paymentIntent,
          cartItems: cartList
        });
        if (!res.data.success) {
          throw new Error('Payment verification failed');
        }
        setSuccess(true);
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Setting up payment...</p>
      </div>
    );
  }

  if (error && !initializing) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={createPaymentIntent}
          className="mt-4 w-full"
        >
          Retry Payment Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {/* Items List */}
          <ScrollArea className="h-[200px] pr-4 mb-4">
            {cartList?.map((item, index) => {
              const product = item.book || item.course;
              return (
                <div key={index} className="mb-4 pb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                  <div className="flex justify-between font-medium">
                    <span>
                      {product?.title} <span className="text-muted-foreground text-sm">({item.style})</span>
                    </span>
                    <span>${(Number(product?.salePrice || 0) * Number(item.quantity)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <div>
                      Qty: {item.quantity}
                      {item.shippingAddress && (
                        <div className="text-xs mt-1 max-w-[250px] truncate">
                          {item.shippingAddress}
                        </div>
                      )}
                    </div>

                    {!shipCond.includes(item.style) && item.book && (
                      <span>Shipping: ${item.book.shippingFee}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </ScrollArea>

          {/* Order Totals */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>${orderDetails?.subtotal.toFixed(2)}</span>
            </div>
            {orderDetails?.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span>${orderDetails?.shipping.toFixed(2)}</span>
              </div>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${orderDetails?.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border rounded-md p-4 bg-background">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  '::placeholder': { color: "#aab7c4" },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full h-12 text-base font-semibold bg-[#581c87] hover:bg-[#4c1d95]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${orderDetails?.total.toFixed(2)}`
          )}
        </Button>
      </form>

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle>Payment successful!</AlertTitle>
          <AlertDescription>
            Thank you for your purchase. Your order is being processed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function StripeCheckout({ cartList, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        cartList={cartList}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}