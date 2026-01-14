"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import axios from "@/app/api/axios";
import { MessageCircle, UserPlus, UserMinus, Image as ImageIcon } from "lucide-react";


import MiddleNewsFeed from "@/app/(public)/social/components/MiddleNewsFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function UserProfile() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const authUser = useSelector((state) => state.auth.user);

  const [feedSort, setFeedSort] = useState('newest');

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  async function fetchUserProfile() {
    try {
      const res = await axios.get(`/api/userProfile/${id}`);
      if (res.data) {
        setUser(res.data);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }

  const handleFollow = async () => {
    try {
      const res = await axios.get(`/api/followProfile/${id}`);
      if (res.status === 200) {
        fetchUserProfile();
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const isFollowing = user?.followers?.some((f) => f.followedBy === authUser?.id);

  return (
    <div className={cn(
      "min-h-screen p-0 md:p-8",
      darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-sm",
          darkMode ? "bg-zinc-900" : "bg-white"
        )}>
          {/* Cover Photo */}
          <div className="h-48 md:h-64 relative bg-gray-200 dark:bg-zinc-800">
            {user?.profile?.coverImage ? (
              <img
                src={user?.profile?.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          <CardContent className="px-6 max-md:px-0  pb-6 relative">
            {/* Avatar - Overlapping Cover */}
            <div className="-mt-16 md:-mt-20 mb-4 flex justify-center md:justify-start">
              <div className="relative">
                <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-zinc-900 shadow-md">
                  <AvatarImage src={user?.profile?.pPic} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-gray-200 dark:bg-zinc-800">
                    {user?.profile?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {user?.isOnline === 1 && (
                  <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-5 h-5 bg-green-500 border-4 border-white dark:border-zinc-900 rounded-full"></span>
                )}
              </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
              <div className="flex-1 text-center md:text-left space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                  {user?.profile?.name}
                  {user?.profile?.nickName && (
                    <span className="text-lg font-normal text-muted-foreground">
                      ({user?.profile?.nickName})
                    </span>
                  )}
                </h1>
                <p className="text-base text-muted-foreground">{user?.userRole?.roleName}</p>
                {user?.profile?.profession && (
                  <p className="text-sm text-muted-foreground">
                    Profession: {user?.profile?.profession}
                  </p>
                )}
                {user?.profile?.about && (
                  <p className="max-w-xl text-sm text-gray-600 dark:text-gray-300 mt-2 mx-auto md:mx-0">
                    {user.profile.about}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse md:flex-row items-center gap-6 w-full md:w-auto justify-center md:justify-end">
                {/* Stats */}
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.courses?.length || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Courses</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.followers?.length || 0}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Followers</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full md:w-auto justify-center">
                  <Button
                    variant={isFollowing ? "destructive" : "default"}
                    onClick={handleFollow}
                    className="rounded-full shadow-sm"
                  >
                    {isFollowing ? (
                      <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                    )}
                  </Button>
                  <Link href={`/social/messenger?userId=${user?.id}`}>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="  ">
          <MiddleNewsFeed
            param={{ user: { user: user?.id } }}
            className="md:w-full m-0 md:mx-0 p-0 "
            sort={feedSort}
            setSort={setFeedSort}
          />
        </div>
      </div>
    </div>
  );
}
