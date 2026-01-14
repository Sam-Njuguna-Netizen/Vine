'use client'

import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import ButtonSuccess from "@/app/Components/ButtonSuccess"
import { useEffect, useState } from 'react'
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Verifying payment...')

  useEffect(() => {
    if (!session_id) return

    const verifyPayment = async () => {
      try {
        const { data } = await axios.post('/api/confirmSubscriptionPayment', { session_id })
        if (data.success) {
          N('Congratulations', 'Payment successful.', 'success')
          // setMessage('Payment successful! Your course has been unlocked.')
        } else {
          N('Error', 'Payment verification failed.', 'error')
          setMessage('Payment verification failed.')
        }
      } catch (error) {
        N('Error', 'Error verifying payment.', 'error')
        setMessage('Error verifying payment.')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [session_id])

  if (loading) return <p>{message}</p>

  return (
    <div>
      <p>{message}</p>
      <ButtonSuccess onClick={() => router.push('/admin/subscription')}>Go to Subscription</ButtonSuccess>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccess />
    </Suspense>
  )
}
