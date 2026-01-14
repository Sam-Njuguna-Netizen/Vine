"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowUp, FileText } from 'lucide-react';
import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";

export default function TermsAndConditionsPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${API_BASE}/api/pages/terms-and-conditions`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching terms & conditions:', err);
        setError('Could not load this page from the server. Please try again later.');
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center pt-32">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center pt-32 px-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-red-400 mb-4">
              <FileText className="w-16 h-16 mx-auto mb-4" />
            </div>
            <p className="text-white text-lg mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-white text-purple-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center text-white mb-8">
            {/* LEGAL pill removed */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {page.title}
            </h1>
            {page.metaDescription && (
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                {page.metaDescription}
              </p>
            )}
            {page.updatedAt && (
              <p className="text-sm text-gray-300 mt-4">
                Last updated: {new Date(page.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="bg-gray-50 py-16 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16">
            <div
              className="prose prose-lg prose-purple max-w-none break-words whitespace-normal
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-200
                prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8
                prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-6 prose-ul:space-y-2
                prose-ol:my-6 prose-ol:space-y-2
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-a:text-purple-600 prose-a:no-underline hover:prose-a:text-purple-800 hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Questions about these terms?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you have any questions or concerns about these Terms &amp; Conditions, please do not hesitate to contact us.
                </p>
                <Link
                  href="/contact"
                  className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md font-medium hover:bg-purple-700 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />

      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 z-50 group"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </>
  );
}
