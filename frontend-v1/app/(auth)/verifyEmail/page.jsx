"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { N } from "@/app/utils/notificationService";
import { useRouter } from "next/navigation";
import { verifyEmail } from "@/app/utils/auth";

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Get token from URL params on mount
  useEffect(() => {
    async function fetchData() {
      if (!token) {
        N("Error", "Token not found.", "error");
        router.push("/login");
      } else {
        const response = await verifyEmail(token);
        if (response && response.success) {
          N("Success", response.message, "success");
          router.push("/login");
        } else {
          N("Error", "Token not found.", "error");
          router.push("/login");
        }
      }
    }
    fetchData();
  }, [token, router]);

  return (
    <div className="d-flex flex-column flex-root">
      <h1>Please Wait...</h1>
    </div>
  );
};

const SuspenseWrapper = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <VerifyEmail />
  </Suspense>
);

export default SuspenseWrapper;
