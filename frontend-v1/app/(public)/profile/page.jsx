"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

import MiddleNewsFeed from "@/app/(public)/social/components/MiddleNewsFeed";
// Utilities & API
import axios from "../../api/axios";
import { createStripeAccount } from "@/app/utils/stripe";
import { N } from "@/app/utils/notificationService";
import { getAuthUser } from "@/app/utils/auth";
import { setAuthUser } from "@/app/store";
import { useTheme } from "@/context/ThemeContext";

// Icons (Lucide React is standard for Shadcn)
import {
  Edit,
  MoreHorizontal,
  CreditCard,
  CheckCircle,
  MapPin,
  Briefcase
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Sub-components
import ProfileOverview from "../components/ProfileOverview";
import MyCourses from "@/app/(public)/(secondSpace)/courses/page";
import MyJoinedGroupsPage from "./_components/groups";

export default function Profile() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux & State
  const authUser = useSelector((state) => state.auth.user);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [feedSort, setFeedSort] = useState('newest');

  // --- Logic: Refresh User ---
  const refreshAuthUser = async () => {
    try {
      const authU = await getAuthUser();
      if (authU && authU.success) {
        dispatch(setAuthUser(authU.user));
      } else {
        N("Error", "Session expired. Please log in again.", "error");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      router.push("/login");
    }
  };

  // --- Logic: Initial Load Checks ---
  useEffect(() => {
    if (!authUser) {
      refreshAuthUser();
    }
  }, [authUser]);

  useEffect(() => {
    async function fetchStripeInfo() {
      try {
        const stripe = await axios.post("/api/stripe/check", {
          withCredentials: true,
        });
        setStripeConnected(true);
      } catch (error) {
        setStripeConnected(false);
      }
    }
    fetchStripeInfo();
  }, []);

  // --- Logic: Handlers ---
  const handleEditProfile = () => {
    // Requirement: Redirect to settings page
    router.push("/setting");
  };

  const handleCreateStripeAccount = async () => {
    setLoadingStripe(true);
    N("Information", "Connecting to Stripe... Please wait.", "info");

    try {
      const res = await createStripeAccount();
      if (!res.success) {
        N("Error", res.message || "Failed to create Stripe account.", "error");
        return;
      }

      await refreshAuthUser();

      if (res.connectUrl) {
        window.location.href = res.connectUrl;
      } else {
        N("Error", "Stripe did not return a redirect URL.", "error");
      }
    } catch (error) {
      N("Error", error.message || "An unexpected error occurred.", "error");
    } finally {
      setLoadingStripe(false);
    }
  };

  // --- Render: Loading State ---
  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Skeleton className="h-48 w-full max-w-7xl rounded-xl" />
        <div className="flex items-center gap-4 w-full max-w-7xl px-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  // --- Render: Main Profile ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141414] pb-10">
      {/* Container to limit width similar to the image */}
      <Card className=" mx-auto mt-6 max-md:mt-0 bg-white dark:bg-[#1e1e1e] border-none shadow-sm overflow-hidden rounded-xl max-md:rounded-none">

        {/* 1. Cover Image */}
        <div
          className="h-48 md:h-64 bg-cover bg-center relative"
          style={{
            backgroundImage: `url(${authUser.profile?.coverImage || "/placeholder-image.jpg"})`,
            backgroundColor: darkMode ? "#262626" : "#e5e7eb",
          }}
        >
          {/* Optional overlay gradient for better text readability if needed */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* 2. Profile Header Content */}
        <div className="px-4 md:px-6 pb-6 relative">

          <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 mb-6 gap-6">

            {/* Avatar (Overlapping) */}
            <div className="relative group">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-[#1e1e1e] shadow-lg">
                <AvatarImage
                  src={authUser.profile?.pPic || "/default-avatar.jpg"}
                  alt={authUser.profile?.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl">
                  {authUser.profile?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Online Indicator */}
              {/* {authUser.isOnline && ( 
                <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-4 border-white dark:border-[#1e1e1e]" />
              )} */}
            </div>

            {/* User Info */}
            <div className="flex-1 mt-2 md:mt-0 md:mb-2 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                {authUser.profile?.name}
                {authUser.profile?.nickName && (
                  <span className="text-lg font-normal text-muted-foreground">
                    ({authUser.profile.nickName})
                  </span>
                )}
              </h1>

              <div className="flex flex-col md:flex-row items-center md:items-center gap-2 mt-1 text-gray-600 dark:text-gray-400 text-sm md:text-base">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {authUser.userRole?.roleName || "User"}
                </span>
                {authUser.profile?.profession && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span>{authUser.profile.profession}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto md:mb-4">
              <Button
                onClick={handleEditProfile}
                className="flex-1 md:flex-none bg-purple-700 hover:bg-purple-800 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="px-3">
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Stripe Logic */}
                  <DropdownMenuItem
                    onClick={stripeConnected ? undefined : handleCreateStripeAccount}
                    disabled={stripeConnected || loadingStripe}
                    className="cursor-pointer"
                  >
                    {stripeConnected ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span>Stripe Connected</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span>Connect Payment</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bio Section (if exists) */}
          {authUser.profile?.about && (
            <div className="mb-6 max-w-3xl">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {authUser.profile.about}
              </p>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-100 dark:border-gray-800 py-4 mb-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {authUser.courses?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {authUser.followers?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {authUser.following?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium">Following</div>
            </div>
          </div>

        </div>

        {/* 3. Tabs Navigation */}
        <div className="">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full grid grid-cols-3 md:flex md:justify-start h-auto p-0 bg-transparent border-b border-gray-200 dark:border-gray-800 rounded-none mb-6">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 px-2 md:px-6 py-3 text-sm"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 px-2 md:px-6 py-3 text-sm"
              >
                My Courses
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 px-2 md:px-6 py-3 text-sm"
              >
                Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0 mx-auto w-full">
              <MiddleNewsFeed
                className="md:w-full max-w-2xl mx-auto "
                param={{ user: { user: authUser.id } }}
                sort={feedSort}
                setSort={setFeedSort}
              />
            </TabsContent>

            <TabsContent value="courses" className="mt-0">
              <MyCourses />
            </TabsContent>

            <TabsContent value="groups" className="mt-0">
              <MyJoinedGroupsPage />
            </TabsContent>
          </Tabs>
        </div>

      </Card>
    </div>
  );
}