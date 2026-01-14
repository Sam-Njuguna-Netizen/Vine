"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  FileText,
  HelpCircle,
  Star,
  Video,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

import DeactivateDelete from "@/app/(public)/deactivateDelete/page";
import PrivacyPolicyPage from "@/app/(public)/privacy-policy/page";
import Eula from "@/app/(auth)/eula/page";
import TermsAndConditionsPage from "@/app/(public)/terms-and-conditions/page";
import Fqa from "@/app/(auth)/fqa/page";
import EditProfile from "@/app/(public)/profile/editProfile/page";
import UserSubscription from "@/app/(public)/components/UserSubscription";
import DemoVideo from "@/app/(public)/components/DemoVideo";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Setting() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("edit-profile");
  const router = useRouter();

  const AVAILABLE_TABS = new Set([
    "account",
    "video",
    "privacy-policy",
    "eula",
    "terms-and-conditions",
    "fqa",
    "edit-profile",
    "subscription",
  ]);

  // Detect mobile + always reset scroll when Settings is opened
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.scrollTo({ top: 0, behavior: "auto" });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle initial hash + hash changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const applyFromHashOrDefault = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && AVAILABLE_TABS.has(hash)) {
        setActiveTab(hash);
      } else if (isMobile) {
        // On mobile, start with menu only
        setActiveTab(null);
      } else {
        setActiveTab("edit-profile");
      }
    };

    applyFromHashOrDefault();

    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && AVAILABLE_TABS.has(hash)) {
        setActiveTab(hash);
      } else if (isMobile) {
        setActiveTab(null);
      }
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [isMobile]);

  const baseMenuItems = [
    { label: "Account", key: "account", icon: <User size={20} /> },
    { label: "Demo", key: "video", icon: <Video size={20} /> },
    { label: "Privacy Policy", key: "privacy-policy", icon: <Shield size={20} /> },
    { label: "License Agreement", key: "eula", icon: <FileText size={20} /> },
    {
      label: "Terms and Conditions",
      key: "terms-and-conditions",
      icon: <FileText size={20} />,
    },
    { label: "FAQ", key: "fqa", icon: <HelpCircle size={20} /> },
  ];

  const userMenuItems = [
    {
      label: "Edit Profile",
      key: "edit-profile",
      icon: <SettingsIcon size={20} />,
    },
    ...baseMenuItems.slice(1),
    { label: "Subscription", key: "subscription", icon: <Star size={20} /> },
  ];

  // Account at the bottom (Deactivate / delete)
  const menuItems = [...userMenuItems, baseMenuItems[0]];

  const handleTabClick = (key) => {
    setActiveTab(key);

    if (typeof window !== "undefined") {
      const base = window.location.pathname;
      window.history.replaceState(null, "", `${base}#${key}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <DeactivateDelete />;
      case "edit-profile":
        return <EditProfile />;
      case "privacy-policy":
        return <PrivacyPolicyPage />;
      case "eula":
        return <Eula />;
      case "video":
        return <DemoVideo />;
      case "terms-and-conditions":
        return <TermsAndConditionsPage />;
      case "fqa":
        return <Fqa />;
      case "subscription":
        return <UserSubscription />;
      default:
        return <DeactivateDelete />;
    }
  };

  const handleMobileBack = () => {
    setActiveTab(null);
    if (typeof window !== "undefined") {
      const base = window.location.pathname;
      window.history.replaceState(null, "", base);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return (
    <div
      className="
        relative mx-auto w-full max-w-7xl
        min-h-[80vh]
        px-4 sm:px-6 lg:px-8
        py-6 sm:py-8
      "
    >
      {/* Header row */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            isMobile && activeTab ? handleMobileBack() : router.back()
          }
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
            Manage your profile, subscription, and legal information for Vine LMS.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Navigation */}
        {(!isMobile || !activeTab) && (
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-4 py-3.5 h-auto text-sm md:text-base font-medium rounded-xl transition-colors",
                    activeTab === item.key
                      ? "font-semibold bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                  onClick={() => handleTabClick(item.key)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
          </aside>
        )}

        {/* Content */}
        {(!isMobile || activeTab) && (
          <main
            className="
              flex-1 min-w-0
              md:border-l md:border-gray-100 dark:md:border-gray-800
              md:pl-10
              px-1 sm:px-2 md:px-0  /* padding on small screens so content is not edge-to-edge */
            "
          >
            {renderContent()}
          </main>
        )}
      </div>
    </div>
  );
}
