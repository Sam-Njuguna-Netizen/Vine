"use client";
import AddPostModel from "@/app/(public)/social/components/AddPostModel";
import PostShow from "@/app/(public)/social/components/PostShow";
import CreatePostBox from "@/app/(public)/social/components/CreatePostBox";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import InfiniteScroll from "react-infinite-scroll-component";
import { useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MiddleNewsFeed({ param = null, sort = 'newest', setSort, className = "" }) {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const { darkMode } = useTheme();
  const authUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(null);

  // Re-added logic
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const userId = param?.user?.user;
  const groupId = param?.group;
  const pathname = usePathname();

  // New Modal Logic
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalType, setCreateModalType] = useState(null);

  const handleOpenCreateModal = (type = null) => {
    setCreateModalType(type);
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setCreateModalType(null);
  };

  useEffect(() => {
    fetchPosts(null, true); // Reset posts when sort changes or props change
  }, [sort, userId, groupId]);

  const fetchPosts = async (cursor = null, reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await axios.get("/api/posts", {
        params: { cursor, userId, groupId, sort },
      });

      if (cursor === null || reset) {
        setPosts(response.data.posts);
        setNextCursor(response.data.nextCursor);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...response.data.posts]);
        setNextCursor(response.data.nextCursor);
      }
    } catch (error) {
      N("Error", error?.response?.data?.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(currentPosts => currentPosts.filter(p => p.id !== deletedPostId));
  };

  return (
    <section className={cn("w-full md:w-2/3 md:mx-auto h-full flex flex-col", className)}>
      <div id="scrollableDiv" className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Post Creation Box - Fixed at top */}
        {(!userId || (authUser?.id === userId)) && (
          <div className="mb-4">
            <CreatePostBox onOpenModal={handleOpenCreateModal} />
          </div>
        )}

        {/* Filters */}
        <div className="flex justify-between items-center mb-4 gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { key: "newest", label: "Newest", icon: "Clock", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
            { key: "popular", label: "Popular", icon: "Flame", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
            { key: "following", label: "Following", icon: "Users", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          ].map((item) => {
            const Icon = item.icon === "Clock" ? require("lucide-react").Clock : item.icon === "Flame" ? require("lucide-react").Flame : require("lucide-react").Users;
            const isActive = sort === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSort && setSort(sort === item.key ? 'newest' : item.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isActive
                  ? `${item.color} border border-transparent shadow-sm`
                  : "bg-white dark:bg-[#1F1F1F] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "currentColor" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        <InfiniteScroll
          dataLength={posts.length}
          next={() => fetchPosts(nextCursor)}
          hasMore={!!nextCursor}
          loader={<p className="text-gray-400 text-center py-4">Loading...</p>}
          scrollableTarget="scrollableDiv"
          endMessage={
            <p className="text-gray-500 text-center py-4">No more posts to show</p>
          }
        >
          {posts.map((post) => (
            <PostShow post={post} key={post.id} onDelete={handlePostDelete} />
          ))}
        </InfiniteScroll>
      </div>

      <AddPostModel
        isOpen={createModalOpen}
        onClose={handleCloseCreateModal}
        type={createModalType}
        group={groupId}
        profile={profile}
        onPostSuccess={() => fetchPosts(null, true)}
      />
    </section >
  );
}
