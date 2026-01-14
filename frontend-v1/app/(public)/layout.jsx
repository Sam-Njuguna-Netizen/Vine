"use client";
import ClientProviders from "@/app/ClientProviders";
export default function PublicLayout({ children }) {
  return (
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}
