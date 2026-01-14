"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/app/api/axios";
import Header from "@/app/Components/home/header";
import Footer from "@/app/Components/home/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Calendar, User } from "lucide-react";

// Reusable shell so we keep the same layout for loading/error/normal
const Shell = ({ children }) => (
  <main className="w-full min-h-screen flex flex-col bg-slate-50">
    <Header />
    {children}
    <Footer />
  </main>
);

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug; // dynamic part of /resources/blog/[slug]

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/public/blogs/${slug}`);
        setBlog(response.data);
      } catch (err) {
        console.error("Failed to fetch blog", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // LOADING
  if (loading) {
    return (
      <Shell>
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        </div>
      </Shell>
    );
  }

  // ERROR / NOT FOUND
  if (error || !blog) {
    return (
      <Shell>
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">
            Article Not Found
          </h2>
          <p className="text-slate-600 mb-6 max-w-md">
            The article you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => router.push("/resources/blog")}>
            Back to Blog
          </Button>
        </div>
      </Shell>
    );
  }

  // NORMAL RENDER
  return (
    <Shell>
      {/* HERO – dark purple like Pricing/Solutions */}
      <div className="pt-32 pb-12 bg-[#1a0f30] relative overflow-hidden">
        {/* soft glows */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/18 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/18 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 mb-8"
            onClick={() => router.push("/resources/blog")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-200 mb-6 text-xs sm:text-sm md:text-base">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {blog.createdAt
                  ? new Date(blog.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </span>

              {blog.author && (
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {blog.author}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              {blog.title}
            </h1>

            {blog.subtitle && (
              <p className="text-base md:text-lg text-gray-200/90 max-w-2xl mx-auto">
                {blog.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FEATURED IMAGE */}
      {blog.image && (
        <div className="container mx-auto px-4 -mt-12 relative z-20">
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-100">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-auto max-h-[600px] object-cover"
            />
          </div>
        </div>
      )}

      {/* CONTENT CARD – white like the marketing pages */}
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="max-w-5xl mx-auto rounded-2xl bg-white shadow-lg border border-slate-200 p-6 md:p-10">
          <div
            className="prose prose-lg max-w-none
                       prose-headings:text-slate-900
                       prose-p:text-slate-700
                       prose-a:text-purple-600 hover:prose-a:text-purple-700
                       prose-strong:text-slate-900
                       prose-li:text-slate-700
                       prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </div>
      </div>
    </Shell>
  );
}