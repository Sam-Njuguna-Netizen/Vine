"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { Image as ImageIcon, UserPlus, UserMinus, Users } from "lucide-react";

import MiddleNewsFeed from "@/app/(public)/social/components/MiddleNewsFeed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function Group() {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const authUser = useSelector((state) => state.auth.user);
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    getProfile();
  }, [id]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/group/${id}`);
      if (response?.status === 200) {
        setGroupInfo(response.data.group);
      }
    } catch (error) {
      N("Error", error?.response?.data?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const joinLeaveThisGroup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/groupJoinLeave", { groupId: id });
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getProfile();
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to join group",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const isMember = groupInfo?.members?.some(
    (member) => member.userId === authUser?.id
  );

  return (
    <div className={cn(
      "min-h-screen p-4 md:p-8",
      darkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Group Header Card */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-sm",
          darkMode ? "bg-zinc-900" : "bg-white"
        )}>
          {/* Cover Photo */}
          <div className="h-48 md:h-80 relative bg-gray-200 dark:bg-zinc-800">
            {groupInfo?.coverImage ? (
              <img
                src={groupInfo?.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {groupInfo?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-sm leading-relaxed">
                  {groupInfo?.about}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                  <Users className="w-4 h-4" />
                  <span>{groupInfo?.members?.length || 0} members</span>
                  <span>•</span>
                  <span>Private group</span>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Button
                  variant={isMember ? "destructive" : "default"}
                  size="lg"
                  className="w-full md:w-auto shadow-sm"
                  onClick={joinLeaveThisGroup}
                  disabled={loading}
                >
                  {isMember ? (
                    <><UserMinus className="w-4 h-4 mr-2" /> Leave Group</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-2" /> Join Group</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 h-auto inline-flex w-full md:w-auto justify-start">
                <TabsTrigger
                  value="posts"
                  className="rounded-lg px-6 py-2.5 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary font-medium transition-all flex-1 md:flex-none"
                >
                  Posts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="mt-6">
                {isMember ? (
                  <MiddleNewsFeed group={id} sort={sort} setSort={setSort} />
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Join the group to view and create posts.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          {/* Right Sidebar Placeholder (optional, can be used for group rules or admins) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">

          </div>
        </div>
      </div>
    </div>
  );
}
