"use client";

import { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import Header from "../Components/home/header";
import Footer from "../Components/home/footer";
import { Loader2 } from "lucide-react";

export default function LegalPageLayout({ slug, defaultTitle }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(`/api/public/legal-pages/${slug}`);
        setPage(res.data);
      } catch (error) {
        console.error("Failed to load legal page", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  const title = page?.title || defaultTitle;
  const updatedAt = page?.updatedAt;

  return (
    <main className="min-h-screen flex flex-col bg-slate-950">
      {/* Hero */}
      <div className="relative w-full bg-gradient-to-br from-[#1a0f30] via-purple-800 to-blue-700 pb-14 md:pb-20">
        <Header />

        <div className="container mx-auto px-4 pt-40 pb-8 max-w-4xl text-white">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-violet-200/80">
            Legal
          </p>

          <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-violet-100/90">
            <span className="inline-block h-px w-10 bg-violet-300/70" />
            <span>
              Last updated:{" "}
              {updatedAt
                ? new Date(updatedAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Content card */}
      <section className="-mt-8 md:-mt-16 flex-1 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl pb-16">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 p-6 md:p-10">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-500 text-sm">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading content…</span>
              </div>
            ) : (
              <article className="legal-page-content space-y-4 text-slate-700 dark:text-slate-200 leading-relaxed text-[15px] md:text-base">
                {/* The HTML from Super Admin */}
                <div
                  dangerouslySetInnerHTML={{
                    __html: page?.contentHtml || "",
                  }}
                />
              </article>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
