"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";
import { Check } from "lucide-react";

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [featureCategories, setFeatureCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const { getPublicPricingPlan } = await import("../../services/pricingService");
        const data = await getPublicPricingPlan();
        setPlan({
          name: data.name,
          description: data.description,
          monthlyPrice: Number(data.monthlyPrice),
          yearlyPrice: Number(data.yearlyPrice),
          features: data.features
        });
        setFeatureCategories(data.featureCategories);
        setFaqs(data.faqs);
      } catch (error) {
        console.error("Failed to load pricing", error);
        // Fallback or error state could go here, but for now we basically rely on the API.
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  if (loading) {
    return <div className="w-full h-screen flex items-center justify-center bg-slate-50 dark:bg-[#141414] text-slate-900 dark:text-white">Loading pricing...</div>;
  }

  if (!plan) return null;

  const yearlyDiscount = Math.round(
    ((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) *
    100
  );

  function moveToRegister(link) {
    router.push(link);
  }

  return (
    <main className="w-full bg-slate-50 dark:bg-[#141414] min-h-screen flex flex-col font-sans transition-colors duration-300">

      {/* Hero Section */}
      <div className="relative w-full bg-[#1a0f30] overflow-hidden pb-32">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-800/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>



        <div className="container mx-auto px-4 pt-40 relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            One comprehensive plan with everything you need to create, manage,
            and scale your online education platform.
          </p>

          {/* Billing Toggle in Hero */}
          <div className="flex items-center justify-center mb-8">
            <button
              onClick={() => setIsYearly(false)}
              className={`mr-3 text-base font-medium transition-colors ${!isYearly ? "text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#1a0f30] ${isYearly ? "bg-purple-600" : "bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${isYearly ? "translate-x-7" : "translate-x-1"
                  }`}
              />
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`ml-3 text-base font-medium transition-colors flex items-center gap-2 ${isYearly ? "text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              Yearly
              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                Save {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Pricing Card - Overlapping Hero */}
      <div className="container mx-auto px-0    -mt-20 relative z-20 mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-md:rounded-none shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-8 md:p-12 text-center border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {plan.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                {plan.description}
              </p>

              <div className="mb-8 flex flex-col items-center">
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-xl text-slate-500 dark:text-slate-400 ml-2">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
                {isYearly && (
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-medium bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                    Equivalent to ${Math.round(plan.yearlyPrice / 12)}/month billed annually
                  </p>
                )}
              </div>

              <button
                className="w-full md:w-auto min-w-[200px] py-4 px-8 rounded-full font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg transition-transform hover:scale-105"
                onClick={() => moveToRegister("/login?institution=true")}
              >
                Start Your Institution
              </button>
            </div>

            <div className="p-8 md:p-12 bg-gray-50 dark:bg-slate-900/50">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 text-center">
                Includes everything in Vine:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-300 text-sm">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Categories Section */}
      <div className="container mx-auto max-md:px-0 px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Everything You Need in One Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-md:m-0 shadow-lg max-md:rounded-none border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                {category.category}
              </h3>
              <ul className="space-y-3">
                {category.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2 flex-shrink-0"></div>
                    <span className="text-slate-600 dark:text-slate-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-900 py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 max-md:px-0 py-16">
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-3xl max-md:rounded-none p-8 md:p-16 text-center text-white relative overflow-hidden">
          {/* Abstract shapes */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl transform -translate-x-10 translate-y-10"></div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
            Ready to Launch Your Learning Platform?
          </h2>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto relative z-10">
            Join thousands of educators and organizations building successful
            online learning experiences with Vine
          </p>
          <button
            onClick={() => moveToRegister("/login?institution=true")}
            className="bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg relative z-10"
          >
            Get Started Now
          </button>
        </div>
      </div>


    </main>
  );
}
