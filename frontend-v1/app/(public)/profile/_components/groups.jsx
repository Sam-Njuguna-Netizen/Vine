"use client";
import { useState, useEffect } from "react";
import axios from "@/app/api/axios"; // Assuming you have a configured axios instance
import { N } from "@/app/utils/notificationService"; // Assuming you have a notification service
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext"; // Assuming you have a ThemeContext

export default function MyJoinedGroupsPage() {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    getJoinedGroups();
  }, []);

  const getJoinedGroups = async () => {
    try {
      // Use the new API endpoint to get only the groups the user has joined
      const response = await axios.get("/api/myJoinedGroups");
      if (response && response.status === 200) {
        if (response.data && response.data.groups) {
          setJoinedGroups(response.data.groups);
          console.log("Joined Groups:", response.data.groups);
        }
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "An error occurred";
      N("Error", errorMessage, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  return (
    <aside className="w-full">
      <div
        className={`p-6 rounded-lg shadow-md transition-all duration-300 ${
          darkMode ? "bg-gray-1000 text-white" : "bg-white text-gray-900"
        }`}
      >
        <p className="text-2xl font-bold mb-5">My Joined Groups</p>
        {/* Scrollable Container for Joined Groups */}
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide p-2">
          {joinedGroups.length > 0 ? (
            joinedGroups.map((group, index) => (
              <Link href={`/group/${group?.id}`} key={index}>
                <div className="flex flex-col items-center flex-shrink-0 w-32 text-center">
                  <img
                    src={group?.coverImage || "/groups-placeholder.png"}
                    alt={group?.name}
                    className="rounded-full w-28 h-28 object-cover mx-auto border-2 dark:border-[#141414] shadow-md hover:opacity-90 transition-opacity"
                  />
                  <p className="text-lg font-medium mt-2 line-clamp-1">
                    {group?.name}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              You haven't joined any groups yet.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
