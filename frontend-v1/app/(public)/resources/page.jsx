"use client";

import React, { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";
import {
  BookOpen,
  FileText,
  ArrowRight,
  Loader2,
  Search,
  PlayCircle,
  Download,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DemoVideo from "../components/DemoVideo";

export default function ResourcesPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const docsResponse = await axios.get("/api/public/resource-documents");
        setDocuments(docsResponse.data || []);
      } catch (error) {
        console.error("Failed to fetch resource documents", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.title?.toLowerCase().includes(q) ||
      (doc.description || "").toLowerCase().includes(q)
    );
  });

  const brochures = filteredDocs.filter((d) => d.category === "brochure");
  const guides = filteredDocs.filter((d) => d.category === "guide");
  const generalDocs = filteredDocs.filter(
    (d) => !d.category || d.category === "documentation"
  );

  const latestBrochure = brochures[0] || null;
  const latestGuide = guides[0] || null;

  return (
    <main className="relative w-full min-h-screen flex flex-col bg-slate-50">
      {/* HERO */}
      <div className="relative w-full bg-[#1a0f30] overflow-hidden pb-20">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-purple-600/25 rounded-full blur-3xl" />
          <div className="absolute bottom-[-220px] right-[-120px] w-[520px] h-[520px] bg-pink-500/30 rounded-full blur-3xl" />
        </div>

        <Header />

        <div className="relative z-10 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-10">
            <div className="text-center max-w-4xl mx-auto text-white">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-4 leading-tight">
                <span className="block">Resource Hub</span>
                <span className="block text-lg sm:text-xl font-normal text-purple-100 mt-2">
                  Everything you need to launch and grow your online school
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-100/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Brochures, implementation guides, and tutorials – all in one
                place for your leadership team, admins, and teachers.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-purple-500/70 to-pink-500/70 opacity-70 group-hover:opacity-100 blur-sm transition" />
                  <div className="relative rounded-full bg-[#090919]/80 border border-white/15 backdrop-blur">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-12 pr-4 py-3.5 rounded-full bg-transparent text-white placeholder-slate-300 focus:outline-none focus:ring-0 text-sm sm:text-base"
                      placeholder="Search guides, brochures, documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {documents.length || 0}+
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200">
                    Resources
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">
                    {brochures.length + guides.length || 0}+
                  </div>
                  <div className="text-xs sm:text-sm text-slate-200">Guides</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-white">24/7</div>
                  <div className="text-xs sm:text-sm text-slate-200">
                    Access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative -mt-10 z-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 space-y-20">
          {/* FEATURED RESOURCES */}
          <section>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
                Start Here
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                A high-level brochure for decision-makers and a practical
                implementation guide for the team that will run Vine day-to-day.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Brochure Card */}
              <article className="group relative overflow-hidden rounded-3xl bg-white border border-sky-100 p-7 sm:p-8 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-sky-100/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex p-3 rounded-2xl bg-sky-100 mb-6">
                    <BookOpen className="w-7 h-7 text-sky-600" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                    Vine LMS Brochure
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2">
                    For school owners, heads, and boards
                  </p>
                  <p className="text-sm sm:text-base text-slate-700 mb-6 leading-relaxed">
                    A one-pager you can share with stakeholders to explain what
                    Vine does, why it matters, and how it fits into your school
                    strategy.
                  </p>

                  {latestBrochure ? (
                    <a
                      href={latestBrochure.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center group/btn">
                        <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                        Download brochure
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </a>
                  ) : (
                    <Button
                      className="bg-slate-200 text-slate-500 px-6 py-3 rounded-full cursor-default"
                      disabled
                    >
                      Coming soon
                    </Button>
                  )}
                </div>
              </article>

              {/* Implementation Guide */}
              <article className="group relative overflow-hidden rounded-3xl bg-white border border-emerald-100 p-7 sm:p-8 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex p-3 rounded-2xl bg-emerald-100 mb-6">
                    <GraduationCap className="w-7 h-7 text-emerald-600" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                    Implementation Guide
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-2">
                    For project leads & IT teams
                  </p>
                  <p className="text-sm sm:text-base text-slate-700 mb-6 leading-relaxed">
                    A practical rollout checklist – from first login to running
                    your first term on Vine – with timelines, owners, and best
                    practices.
                  </p>

                  {latestGuide ? (
                    <a
                      href={latestGuide.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center group/btn">
                        <Download className="w-4 h-4 mr-2 group-hover/btn:animate-bounce" />
                        Download guide
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </a>
                  ) : (
                    <Button
                      className="bg-slate-200 text-slate-500 px-6 py-3 rounded-full cursor-default"
                      disabled
                    >
                      Coming soon
                    </Button>
                  )}
                </div>
              </article>
            </div>
          </section>

          {/* VIDEO TUTORIALS – pill removed, cleaner cards */}
          <section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2">
                  Video tutorials
                </h2>
                <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                  See Vine in action – short walkthroughs you can share with new
                  staff before training sessions.
                </p>
              </div>

              <Link
                href="/resources/video-tutorials"
                className="hidden md:inline-flex items-center text-sm font-semibold text-purple-700 hover:text-purple-900"
              >
                View full tutorial library
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-stretch">
              {/* Video card – white like other marketing cards */}
              <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm">
                <DemoVideo />
              </div>

              {/* Text card – product-style */}
              <article className="relative overflow-hidden rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold uppercase tracking-wide">
                    <PlayCircle className="w-4 h-4" />
                    <span>Walkthrough series</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                    Learn Vine LMS in minutes
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    Use these videos as a “show and tell” for admins, teachers,
                    and support staff. Pair them with your own policies and
                    training materials.
                  </p>

                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-300" />
                      <span>Quick tour of the dashboard and student view.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-300" />
                      <span>Creating courses, enrolling students, and tracking progress.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-300" />
                      <span>New clips added as we ship major features.</span>
                    </li>
                  </ul>
                </div>

                <div className="relative mt-6 md:mt-8">
                  <Link
                    href="/resources/video-tutorials"
                    className="inline-flex items-center justify-center px-7 py-3.5 rounded-full
                               text-sm sm:text-base font-semibold text-white
                               bg-gradient-to-r from-purple-500 to-pink-500
                               hover:from-purple-600 hover:to-pink-600
                               shadow-lg hover:shadow-xl
                               transition-all duration-300"
                  >
                    View all tutorials
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </article>
            </div>
          </section>

          {/* DOCUMENTATION GRID */}
          <section>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 border border-purple-200 mb-4">
                <FileText className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-medium text-purple-700 tracking-wide uppercase">
                  Documentation
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
                All Resources
              </h2>
              {!loading && generalDocs.length > 0 && (
                <p className="text-sm sm:text-base text-slate-600">
                  {generalDocs.length} document
                  {generalDocs.length > 1 ? "s" : ""} available
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                <p className="text-slate-500 text-sm">Loading resources...</p>
              </div>
            ) : generalDocs.length === 0 ? (
              <div className="text-center py-16 px-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <FileText className="w-14 h-14 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                  No documents yet
                </h3>
                <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                  We are working on adding more resources. Check back soon for
                  updates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generalDocs.map((doc) => (
                  <article
                    key={doc.id}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 rounded bg-slate-100">
                          {doc.fileType || "PDF"}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base sm:text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mb-5 line-clamp-3 flex-1">
                        {doc.description || "No description available."}
                      </p>

                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors group/link"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open document
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* BLOG CTA */}
          <section>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 border border-purple-500 p-7 sm:p-10 lg:p-12 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/40 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/40 rounded-full blur-3xl -z-10" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
                    Looking for articles and product updates?
                  </h2>
                  <p className="text-sm sm:text-base text-purple-50/95 max-w-2xl leading-relaxed">
                    Visit the Vine LMS blog for stories, best practices, case
                    studies, and feature announcements from schools using Vine
                    around the world.
                  </p>
                </div>

                <Link
                  href="/resources/blog"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full
                             text-sm sm:text-base font-semibold text-purple-700
                             bg-white hover:bg-purple-50
                             shadow-lg hover:shadow-xl
                             transition-all duration-300 group whitespace-nowrap"
                >
                  Go to blog
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
