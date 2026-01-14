"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Sample FAQ data
const faqItems = [
  {
    value: "item-1",
    question: "What is Vine?",
    answer:
      "Vine is a comprehensive learning management system designed for educational institutions to create, manage, and deliver online courses with ease and foster student engagement.",
  },
  {
    value: "item-2",
    question: "What are the subscription plans for Vine?",
    answer:
      "Vine offers various flexible subscription plans, including monthly and yearly options, tailored to different institutional sizes and needs. Details are available on our pricing page.",
  },
  {
    value: "item-3",
    question: "Can I try Vine for free?",
    answer:
      "Yes, Vine offers a free trial period allowing you to explore all features and understand how our platform can benefit your school. No credit card required to start.",
  },
  {
    value: "item-4",
    question: "How can I get support?",
    answer:
      "Our dedicated support team is available 24/7 via live chat, email, and phone. We also have an extensive knowledge base and community forums for self-service.",
  },
  {
    value: "item-5",
    question: "Is Vine suitable for small schools?",
    answer:
      "Absolutely! Vine is scalable and designed to cater to institutions of all sizes, from small independent schools to large universities. Our pricing plans are flexible to accommodate this.",
  },
  {
    value: "item-6",
    question: "Can I customize the look and feel of my school?",
    answer:
      "Yes, Vine provides extensive customization options, allowing you to brand your school's online presence with your logos, colors, and unique layout preferences.",
  },
  {
    value: "item-7",
    question: "How do the AI features work?",
    answer:
      "Vine's AI features enhance the learning experience through personalized recommendations, automated grading assistance, and intelligent content suggestions.",
  },
  {
    value: "item-8",
    question: "How do I track my sales and student progress?",
    answer:
      "Vine includes robust analytics and reporting tools that provide insights into student performance, course engagement, and sales data for paid courses.",
  },
  {
    value: "item-9",
    question: "What payment gateways do you support?",
    answer:
      "We support a wide range of popular payment gateways including Stripe, PayPal, and other regional options to ensure smooth transactions for your students.",
  },
];

export function FrequentlyAskedQuestions() {
  // State to track which item is currently open
  const [openItem, setOpenItem] = useState  (null);

  // Toggle function: if clicked item is already open, close it (null), otherwise open it
  const handleToggle = (value) => {
    setOpenItem((prev) => (prev === value ? null : value));
  };

  return (
    <section className="w-full py-16 text-[#00373e] dark:text-white md:py-24 px-4 bg-[#f7f6f4] dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-start">

          {/* --- Left Column (Text & Images) --- */}
          <div className="relative flex flex-col items-start pr-8 md:pr-0">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Need Help?
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#00373e] dark:text-white mb-6 leading-tight">
              Frequently <br /> Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 mb-12 max-w-md">
              Find answers to common questions about our services, therapy, and
              mental well-being.
            </p>

            {/* Image and chat bubbles */}
            <div className="relative w-full h-[450px] flex items-center justify-center">
              {/* Decorative cloud-like shapes */}
              <div className="absolute w-24 h-24 bg-gray-200 dark:bg-slate-800 rounded-full blur-2xl opacity-40 -bottom-8 left-0 z-0 hidden md:block"></div>
              <div className="absolute w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full blur-xl opacity-40 -bottom-12 left-1/4 z-0 hidden md:block"></div>
              <div className="absolute text-gray-300 dark:text-slate-700 text-5xl right-8 top-1/2 rotate-12 z-0 hidden md:block">{`<>`}</div>

              <div>
                <img src="/assets/chat-image.png" alt="" className="" />
              </div>
            </div>
          </div>

          {/* --- Right Column (Custom FAQ Accordion) --- */}
          <div className="pt-8 md:pt-0">
            <div className="w-full space-y-4">
              {faqItems.map((item) => {
                const isOpen = openItem === item.value;
                return (
                  <div
                    key={item.value}
                    className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => handleToggle(item.value)}
                      className="flex flex-1 items-center justify-between w-full py-4 text-left text-lg font-medium text-[#00373e] dark:text-white transition-all hover:opacity-80 focus-visible:outline-none"
                    >
                      {item.question}
                      <ChevronIcon
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* Animated Content Wrapper using Grid Trick */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                    >
                      <div className="overflow-hidden">
                        <div className="text-base text-muted-foreground dark:text-slate-400 pb-4 pr-6">
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Call to Action Button --- */}
        <div className="flex justify-center mt-16 md:mt-24">
          <Button
            size="lg"
            className="bg-gray-900 dark:bg-indigo-600 text-white rounded-full px-8 py-6 text-base font-semibold hover:bg-gray-800 dark:hover:bg-indigo-700"
          >
            Sign up is free
          </Button>
        </div>
      </div>
    </section>
  );
}

// Simple Chevron Icon Component to replace Lucide dependency if needed
function ChevronIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}