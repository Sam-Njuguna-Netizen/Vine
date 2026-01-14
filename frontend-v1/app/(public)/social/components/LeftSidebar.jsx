"use client";
import ProfileEditModel from "@/app/(public)/social/components/ProfileEditModel";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAuthUser, logout } from "@/app/utils/auth";
import { logoutUser, setAuthUser } from "@/app/store";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";

export default function LeftSidebar() {
  const [profile, setProfile] = useState(null);
  const [sugestedProfiles, setSugestedProfiles] = useState([]);
  const { darkMode } = useTheme();

  useEffect(() => {
    getProfile();
    getSugestedProfiles();
  }, []);

  const getSugestedProfiles = async () => {
    try {
      const response = await axios.get("/api/allMyInstitutionGroup");
      if (response && response.status === 200) {
        if (response.data) {
          setSugestedProfiles(response.data.groups);
          console.log("sugestedProfiles", response.data.groups);
        }
      }
    } catch (error) {
      N("Error", error?.response?.data?.message, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  const getProfile = async () => {
    try {
      const response = await axios.get("/api/myProfile");
      if (response && response.status === 200) {
        if (response.data) {
          setProfile(response.data);
        }
      }
    } catch (error) {
      N("Error", error?.response?.data?.message, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    }
  };

  const dispatch = useDispatch();
  const editProfile = useRef(null);
  const authUser = useSelector((state) => state.auth.user);

  const openEditProfileModel = () => {
    if (editProfile.current) {
      editProfile.current.openModal();
    }
  };

  return (
    <aside className="w-full">
      {/* User Profile Section */}
      {/* <ProfileEditModel
        profile={profile}
        ref={editProfile}
        sendMessage={() => getProfile()}
      />
      <div
        className={`rounded-lg shadow mb-6 transition-colors duration-300 ${darkMode
            ? "bg-gray-1000 border border-gray-900 text-white"
            : "bg-white border border-gray-200 text-gray-900"
          }`}
      >
        <div className="h-32 bg-gray-300 rounded-t-lg relative">
          <img
            src={profile?.coverImage}
            alt="Cover Photo"
            className="w-full h-40 object-cover rounded-t-lg"
          />
          <img
            src={profile?.pPic}
            className="absolute bottom-0 left-4 transform translate-y-1/2 w-44 h-44 rounded-full border-4 border-white dark:border-gray-800"
          />
        </div>
        <div className="mt-24 p-4">
          <p className="text-2xl font-bold dark:text-white">{profile?.name}</p>
          <p className="text-gray-600 dark:text-gray-400">{profile?.profession}</p>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={openEditProfileModel}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
            >
              <i className="bi bi-pencil-fill"></i>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div> */}

      <div
        className={`p-6 transition-all duration-300 ${
          darkMode ? "bg-gray-1000 text-white" : "bg-white text-gray-900"
        }`}
      >
        <p className="text-2xl font-bold mb-5">Groups</p>
        {/* Scrollable Container */}
        <div className="flex overflow-x-auto space-x-4 scrollbar-hide p-2">
          {sugestedProfiles.map((p, index) => (
            <Link href={`/group/${p?.id}`}>
              <div
                key={index}
                className="flex flex-col items-center flex-shrink-0 w-32"
              >
                <img
                  src={p?.coverImage || "/groups-placeholder.png"}
                  alt="User"
                  className="rounded-full w-28 h-28 object-cover mx-auto border-2 dark:border-[#141414] shadow-md"
                />
                <p className="text-xl font-medium mt-2 text-center ">
                  {p?.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
