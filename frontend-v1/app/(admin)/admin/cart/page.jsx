"use client";
import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CartPageContent } from "@/app/(public)/book/cart/page";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function AdminCartPage() {
    return (
        <Elements stripe={stripePromise}>
            <div className="p-6">
                <CartPageContent />
            </div>
        </Elements>
    );
}
