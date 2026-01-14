"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { SyncOutlined } from "@ant-design/icons";
import { Input, Button } from "antd";
import axiosInstance from "@/app/api/axios"; // Assuming this is your configured axios instance
import { N } from "@/app/utils/notificationService";
import ThemeSwitcher from "@/app/Components/ThemeSwitcher";

const ForgotPassword = () => {
  const router = useRouter();
  const { darkMode } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      N("Error", "Please enter your email address.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/sendResetEmail", {
        email,
      });

      if (response.status === 200) {
        N(
          "Success",
          response.data.message ||
            "Password reset link sent successfully. Please check your email.",
          "success"
        );
        // Optionally redirect or clear form
        // router.push('/login');
        setEmail(""); // Clear email field after successful send
      } else {
        // Handle non-200 success statuses if your API returns them differently
        N(
          "Error",
          response.data.message ||
            "Failed to send reset link. Please try again.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error during password reset request:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";
      N("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const antdInputStyle = {
    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#f9fafb", // Tailwind gray-50
    borderColor: darkMode ? "rgba(255,255,255,0.2)" : "#d1d5db", // Tailwind gray-300
    color: darkMode ? "#e5e7eb" : "#111827", // Tailwind gray-200 and gray-900
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#141414] flex flex-col justify-center items-center px-0 py-4 sm:px-4 sm:py-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md  dark:bg-slate-800 shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 transform transition-all duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-6 animate-fadeIn">
          <Link href="/">
            <img
              alt="VineLMS Logo"
              src="/assets/media/logos/logobig.png" // Ensure this path is relative to the `public` folder
              className="h-16 sm:h-20 dark:brightness-0 dark:invert-[0.85] transition-all duration-300"
            />
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Forgot Your Password?
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            No problem! Enter your email address below and we'll send you a link
            to reset your password.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Email address
            </label>
            <Input
              id="email"
              type="email"
              size="large"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={antdInputStyle}
              className="focus:!ring-blue-500 focus:!border-blue-500"
              autoComplete="email"
              onPressEnter={handleSendResetEmail} // Allow Enter key submission
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="primary"
              size="large"
              className="w-full !font-semibold !tracking-wide"
              loading={loading}
              icon={loading ? <SyncOutlined spin /> : null}
              onClick={handleSendResetEmail}
              style={{
                background: darkMode ? "#2563eb" : "#1d4ed8", // Tailwind blue-600, blue-700
                borderColor: darkMode ? "#2563eb" : "#1d4ed8",
                transition: "background-color 0.3s ease",
              }}
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </Button>
            <Link href="/login" className="w-full">
              <Button
                size="large"
                className="w-full !font-semibold !tracking-wide dark:!text-slate-300 dark:!bg-slate-700 dark:!border-slate-600 dark:hover:!bg-slate-600 dark:hover:!border-blue-500 hover:!border-blue-500 hover:!text-blue-600"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Remember your password? Sign In
          </Link>
        </div>
      </div>
      {/* Basic keyframe animation for logo (if not already global) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }

        /* Styles for Ant Design Inputs in Dark Mode if needed beyond inline styles */
        .ant-input-affix-wrapper-lg,
        .ant-input-lg {
          /* Add any global overrides for antd inputs if style prop is not enough */
        }
        .ant-input-password-icon {
          color: ${darkMode
            ? "rgba(255,255,255,0.45)"
            : "rgba(0,0,0,0.45)"} !important;
        }
        .ant-input-password-icon:hover {
          color: ${darkMode
            ? "rgba(255,255,255,0.85)"
            : "rgba(0,0,0,0.85)"} !important;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
