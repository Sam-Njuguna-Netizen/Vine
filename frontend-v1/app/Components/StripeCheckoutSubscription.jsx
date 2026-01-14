"use client"

import { useEffect, useState, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import axios from "@/app/api/axios"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

// Shadcn UI
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTheme } from "@/context/ThemeContext"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ plan, onSuccess, onError }) {
  const { darkMode } = useTheme()
  const stripe = useStripe()
  const elements = useElements()
  const [clientSecret, setClientSecret] = useState("")
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)

  const createPaymentIntent = useCallback(async () => {
    try {
      setInitializing(true)
      setError("")
      const res = await axios.post("/api/create-payment-intent-subscription", {
        planId: plan.id,
      })
      // Set order details to display to user
      setOrderDetails({
        title: plan?.name,
        description: plan?.description,
        subtotal: Number(plan?.salePrice),
        total: Number(plan?.salePrice),
      })

      setClientSecret(res.data.clientSecret)

    } catch (err) {
      console.error(err)
      setError("Failed to initialize payment. Please try again.")
      onError?.("Failed to initialize payment.")
    } finally {
      setInitializing(false)
    }
  }, [plan, onError])

  useEffect(() => {
    if (!clientSecret) {
      createPaymentIntent()
    }
  }, [clientSecret, createPaymentIntent])

  const handleSubmit = async (e) => {
    console.log('handleSubmit')
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setLoading(true)
    setError("")

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (paymentIntent.status === "succeeded") {
        const res = await axios.post('/api/confirmUserSubscriptionPayment', paymentIntent)
        if (!res.data.success) {
          throw new Error('Payment verification failed')
        }
        setSuccess(true)
        onSuccess?.(paymentIntent)
      }
    } catch (err) {
      setError(err.message)
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Setting up payment...</p>
      </div>
    )
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
    )
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: darkMode ? "#ffffff" : "#424770",
        "::placeholder": {
          color: darkMode ? "#a1a1aa" : "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true,
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-lg text-slate-900 dark:text-white">Your purchase details</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {/* Order Summary */}
          {orderDetails && (
            <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-lg space-y-2 border border-slate-200 dark:border-zinc-700">
              <div className="font-medium mb-2 text-slate-900 dark:text-white">Order Summary</div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                <span>{orderDetails.title}</span>
                <span>${Number(orderDetails.subtotal).toFixed(2)}</span>
              </div>
              <Separator className="my-2 bg-slate-200 dark:bg-zinc-700" />
              <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                <span>Total</span>
                <span>${Number(orderDetails.total).toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-slate-200 dark:border-zinc-700 rounded-md p-4 bg-white dark:bg-zinc-900">
          <CardElement
            options={cardElementOptions}
          />
        </div>

        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full h-12 text-base font-semibold bg-[#581c87] hover:bg-[#4c1d95] text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${Number(orderDetails?.total).toFixed(2) || ''}`
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
  )
}

export default function StripeCheckout({ plan, onSuccess, onError }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        plan={plan}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}