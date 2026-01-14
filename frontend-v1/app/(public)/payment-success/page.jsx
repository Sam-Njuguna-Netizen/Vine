"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonSuccess from "@/app/Components/ButtonSuccess";
import { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!session_id) {
      setMessage("Payment session ID not found.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await axios.post("/api/confirm-payment", {
          session_id,
        });
        if (data.success) {
          N("Congratulations", "Payment successful!", "success");
          setMessage("Payment successful!");
        } else {
          N("Error", "Payment verification failed.", "error");
          // Displaying the failure message to the user
          setMessage("Payment verification failed.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        N("Error", "An error occurred while verifying payment.", "error");
        // Displaying the error message to the user
        setMessage("Error verifying payment.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [session_id]);

  // Display a loading message while verifying
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <h1 className="text-xl font-semibold">{message}</h1>
      </div>
    );
  }

  // Display the final status and the button
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center">
      <p className="mb-4 text-lg">{message}</p>
      <ButtonSuccess onClick={() => router.push("/courses")}>
        Back to Courses
      </ButtonSuccess>
    </div>
  );
};

// Main page component with Suspense for better loading UX
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center min-h-screen text-center">
          <h1 className="text-xl font-semibold">Loading...</h1>
        </div>
      }>
      <PaymentSuccess />
    </Suspense>
  );
}
