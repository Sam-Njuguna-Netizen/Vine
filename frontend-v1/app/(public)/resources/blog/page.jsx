"use client";

import React, { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import Header from "@/app/Components/home/header";
import Footer from "@/app/Components/home/footer";
import Link from "next/link";
import { Loader2, Calendar, User, ArrowRight } from "lucide-react";

const Shell = ({ children }) => (
  <main className="w-full min-h-screen flex flex-col bg-slate-50">
    <Header />
    {children}
    <Footer />
  </main>
);

export default function BlogIndexPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // List endpoint – same base as your detail page (/api/public/blogs/[slug])
        const response = await axios.get("/api/public/blogs");
        setBlogs(response.data || []);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Shell>
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            Could not load articles
          </h2>
          <p className="text-slate-600 mb-2 max-w-md">
            Please refresh the page or try again later.
          </p>
        </div>
      </Shell>
    );
  }

  if (!blogs.length) {
    return (
      <Shell>
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            No articles yet
          </h2>
          <p className="text-slate-600 max-w-md">
            When new blog posts are published, they will appear here.
          </p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* HERO */}
      <div className="pt-32 pb-12 bg-[#1a0f30] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/18 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/18 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-center mx-auto text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              Vine LMS Blog
            </h1>
            <p className="text-base md:text-lg text-gray-200/90">
              Stories, best practices, and product updates from schools using
              Vine around the world.
            </p>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-5xl mx-auto space-y-6">
          {blogs.map((blog) => (
            <article
              key={blog.id || blog.slug}
              className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 md:p-7 hover:shadow-md hover:border-purple-300 transition-all duration-200"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 mb-3">
                {blog.createdAt && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(blog.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                {blog.author && (
                  <span className="inline-flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {blog.author}
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
                {blog.title}
              </h2>

              {blog.subtitle && (
                <p className="text-sm md:text-base text-slate-600 mb-4">
                  {blog.subtitle}
                </p>
              )}

              <p className="text-sm text-slate-600 mb-5">
                {blog.excerpt ||
                  blog.summary ||
                  "Read the full article to learn more."}
              </p>

              <Link
                href={`/resources/blog/${blog.slug}`}
                className="inline-flex items-center text-sm font-semibold text-purple-700 hover:text-purple-800 group"
              >
                Read article
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </Shell>
  );
}
