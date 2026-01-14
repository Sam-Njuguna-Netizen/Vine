"use client";

import { useSelector } from "react-redux";
import Link from "next/link";
import MySupportTicket from '@/app/Components/MySupportTicket';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageSquare, LifeBuoy } from "lucide-react";

export default function Support() {
  const { user } = useSelector((state) => state.auth);

  return (
    // Added dark:bg-slate-950 and dark:text-slate-50
    <div className="min-h-screen bg-transparent  font-sans text-slate-900 dark:text-slate-50">
      <div className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <LifeBuoy className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">Support Center</h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            We're here to help. Find answers to your questions or get in touch with our support team.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 max-md:px-0 py-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Email Support</CardTitle>
              <CardDescription>Get help via email</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-4">Send us your questions and we'll get back to you within 24 hours.</p>
              <a href="mailto:support@vinelms.com" className="text-indigo-600 font-semibold hover:underline">support@vinelms.com</a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Phone Support</CardTitle>
              <CardDescription>Talk to an agent</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-4">Available Mon-Fri, 9am - 6pm EST.</p>
              <a href="tel:+(951) 394-2214" className="text-indigo-600 font-semibold hover:underline">+(951) 394-2214</a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Live Chat</CardTitle>
              <CardDescription>Real-time assistance</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-600 mb-4">Chat with our support team for immediate help.</p>
              <Link href="/ai-chat">
                <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">Start Chat</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        {/* Ticket System (Logged In Only) */}
        {user ? (
          <div className="space-y-6">
            {/* Added dark:border-slate-800 for visibility */}
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
              {/* Added dark:text-white */}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Support Tickets</h2>
            </div>
            <MySupportTicket chatLink="/support/messages/" getTicketApi="/api/allMyTicket" />
          </div>
        ) : (
          // Added dark:bg-slate-900, dark:border, and dark:border-slate-800
          <div className="bg-indigo-50 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-8 text-center">
            {/* Added dark:text-white */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Need Personalized Help?</h2>
            {/* Added dark:text-slate-400 */}
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Log in to submit a support ticket, track your requests, and view your support history.
            </p>
            <div className="flex justify-center gap-4">
              {/* Added specific dark mode hover state if needed */}
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white">
                <Link href="/login">Log In</Link>
              </Button>
              {/* Added dark:bg-slate-950, dark:text-white and hover adjustments */}
              <Button asChild variant="outline" className="bg-white dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}