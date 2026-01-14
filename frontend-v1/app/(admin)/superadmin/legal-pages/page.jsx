"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "@/app/api/axios";

export default function LegalPagesScreen() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPages() {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get("/api/super-admin/legal-pages", {
          withCredentials: true,
        });

        const payload = res.data;
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        if (isMounted) {
          // 🔥 Filter out old duplicate Terms & Conditions row (slug: "terms-conditions")
          const cleaned = list.filter(
            (page) => page.slug !== "terms-conditions"
          );
          setPages(cleaned);
        }
      } catch (err) {
        console.error("Failed to load legal pages", err);
        if (isMounted) {
          setError("Could not load legal pages. Please refresh and try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPages();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Legal Pages
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage the public legal &amp; marketing pages shown on the
          website (User Agreement, Terms &amp; Conditions, Privacy Policy, About Vine).
        </p>
      </div>

      {loading && (
        <div className="text-sm text-slate-500">Loading legal pages…</div>
      )}

      {error && !loading && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Meta Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Published
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {page.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    {page.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {page.slug}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {page.metaTitle || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    {page.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {page.updatedAt
                      ? new Date(page.updatedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-right">
                    <Link
                      href={`/superadmin/legal-pages/${page.slug}`}
                      className="text-xs font-medium text-violet-600 hover:text-violet-800 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}

              {pages.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No legal pages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
