"use client";

import React from "react";
import Link from "next/link";
import { PlayCircle, Clock, Layers, Sparkles } from "lucide-react";
import Header from "../../../Components/home/header";
import Footer from "../../../Components/home/footer";
import DemoVideo from "../../components/DemoVideo";

const tutorials = [
  {
    id: 1,
    title: "Quick Tour of Vine LMS",
    description:
      "A fast walkthrough of the main dashboard, classes, and student views so you can see how everything fits together.",
    duration: "5:32",
    level: "Getting Started",
    status: "live",
  },
  {
    id: 2,
    title: "Setting Up Your First School",
    description:
      "Learn how to create your school, configure terms, and invite your first admins and teachers.",
    duration: "12:10",
    level: "Admin",
    status: "coming-soon",
  },
  {
    id: 3,
    title: "Creating Courses & Enrolling Students",
    description:
      "Step-by-step guide to creating classes, adding content, and enrolling learners.",
    duration: "15:45",
    level: "Teacher",
    status: "coming-soon",
  },
  {
    id: 4,
    title: "Tracking Progress & Reporting",
    description:
      "See how to track student progress, export reports, and share insights with your leadership team.",
    duration: "9:04",
    level: "Analytics",
    status: "coming-soon",
  },
];

export default function VideoTutorialsPage() {
  return (
    <main className="w-full bg-slate-50 min-h-screen flex flex-col">
      {/* HERO – match Solutions/Pricing style */}
      <div className="relative w-full bg-[#1a0f30] overflow-hidden pb-16">
        {/* soft gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/25 rounded-full blur-3xl" />
          <div className="absolute -top-24 -right-10 w-[420px] h-[420px] bg-pink-500/25 rounded-full blur-3xl" />
        </div>

        <Header />

        <div className="container mx-auto px-4 pt-48 pb-10 relative z-10 text-center text-white mt-16 max-w-4xl">
          {/* 🔥 Pill removed completely */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Learn Vine LMS in Minutes
          </h1>

          <p className="text-lg md:text-xl text-gray-100/90 max-w-2xl mx-auto mb-4">
            Short, focused videos that help admins, teachers, and teams get
            productive with Vine LMS — without reading long manuals.
          </p>

          <p className="text-sm text-gray-300">
            Start with the quick tour, then explore deeper topics at your own
            pace.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT – white cards like Solutions/Pricing */}
      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl -mt-12 pb-20 space-y-12 relative z-20">
          {/* FEATURED TUTORIAL */}
          <section
            id="featured-video"
            className="rounded-3xl bg-white shadow-xl border border-slate-200 p-6 md:p-8 lg:p-10"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Video */}
              <div className="w-full lg:w-2/3 rounded-2xl overflow-hidden border border-slate-200 bg-black">
                <DemoVideo />
              </div>

              {/* Details */}
              <div className="w-full lg:w-1/3 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-700">
                    Featured tutorial
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Quick Tour of Vine LMS
                </h2>

                <p className="text-sm text-slate-600">
                  See how Vine is organized, where your most important tools
                  live, and what learners will experience on their side.
                  Perfect for a first look or a quick refresher.
                </p>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800">
                    <Clock className="w-4 h-4" />
                    ~5 minutes
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    Getting Started
                  </span>
                </div>

                <div className="pt-2 text-xs text-slate-500">
                  Tip: Share this video with new staff before your onboarding
                  session so they arrive already familiar with the layout.
                </div>
              </div>
            </div>
          </section>

          {/* ALL TUTORIALS GRID – cleaner, Product-style cards */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  All Video Tutorials
                </h2>
                <p className="text-sm text-slate-600 max-w-xl">
                  Deep dives for admins, teachers, and support teams. We will
                  keep adding more as Vine LMS grows.
                </p>
              </div>

              <Link
                href="/resources"
                className="inline-flex items-center justify-center text-sm font-medium text-purple-700 hover:text-purple-900"
              >
                Browse all resources
                <span className="ml-1">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorials.map((tut) => (
                <article
                  key={tut.id}
                  className="group rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Header / meta row – closer to Product cards */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium">
                          <Layers className="w-3 h-3" />
                          {tut.level}
                        </span>
                        {tut.duration && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px]">
                            <Clock className="w-3 h-3" />
                            {tut.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wide ${
                        tut.status === "live"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {tut.status === "live" ? "Available" : "Coming soon"}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2 group-hover:text-purple-700">
                      {tut.title}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {tut.description}
                    </p>
                  </div>

                  {/* Footer / CTA */}
                  {tut.status === "live" ? (
                    <a
                      href="#featured-video"
                      className="inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-900"
                    >
                      Watch now
                      <PlayCircle className="w-4 h-4 ml-1" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium text-slate-400">
                      Coming soon – will be added to this page
                    </span>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* CTA TO RESOURCES / BLOG */}
          <section className="rounded-2xl bg-white shadow-md border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">
                Prefer step-by-step text guides?
              </h3>
              <p className="text-sm text-slate-600 max-w-xl">
                Combine these videos with our documentation and blog articles
                for a complete onboarding and training experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/resources"
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-800 hover:bg-slate-200"
              >
                Go to Resources
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 shadow-md hover:shadow-lg"
              >
                Visit Blog
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
