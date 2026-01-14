"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function RightSidebar() {
  const { darkMode } = useTheme();
  const onlineProfiles = useSelector((state) => state.auth.onlineProfiles);

  return (
    <aside className="w-full md:w-1/3 md:sticky md:top-16 md:self-start">
      <div
        className={`p-6 transition-all duration-300 ${darkMode ? "bg-gray-1000 text-white" : "bg-white text-gray-900"
          }`}
      >
        <p className="text-2xl font-bold mb-5">Online Friends</p>

        {/* Horizontal scroll on mobile */}
        <div className="overflow-x-auto md:block scrollbar-hide">
          <ul className="flex md:flex-col space-x-5 md:space-x-0 md:space-y-4">
            {onlineProfiles.map((p, index) => (
              <li
                key={index}
                className="flex items-center space-x-4 border-b pb-3 last:border-none flex-shrink-0"
              >
                <Link href={`/profile/${p?.id}`}>
                  <img
                    src={p?.profile?.pPic}
                    alt="Friend"
                    className="w-20 h-20  rounded-full border-2 dark:border-gray-800 shadow-md"
                  />
                </Link>
                <div>
                  <p className="text-lg font-semibold">{p?.profile?.name}</p>
                  <p className="text-green-500 text-base font-medium dark:text-green-400">● Online</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
