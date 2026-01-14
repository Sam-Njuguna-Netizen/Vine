"use client";
import { useTheme } from "@/context/ThemeContext";
import { useSelector } from "react-redux";
import { PictureOutlined, VideoCameraOutlined } from "@ant-design/icons";

export default function CreatePostBox({ onOpenModal }) {
    const { darkMode } = useTheme();
    const authUser = useSelector((state) => state.auth.user);

    const containerClass = `rounded-xl p-4 mb-6 shadow-sm ${darkMode ? "bg-[#1F1F1F] text-white" : "bg-white text-gray-900"
        }`;

    const inputClass = `w-full rounded-full px-4 py-3 text-sm outline-none cursor-pointer transition-colors ${darkMode ? "bg-[#2B2B2B] hover:bg-[#333] text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }`;


    return (
        <div className={`rounded-xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-gray-800 ${darkMode ? "bg-[#1F1F1F] text-white" : "bg-white text-gray-900"}`}>
            <div className="flex items-center gap-3 ">
                <img
                    src={authUser?.profile?.pPic || "/default-avatar.jpg"}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-700"
                />
                <div
                    className={`flex-1 rounded-full px-5 py-3 text-sm cursor-pointer transition-colors ${darkMode ? "bg-[#2B2B2B] hover:bg-[#333] text-gray-400" : "bg-gray-100 hover:bg-gray-200 text-gray-500"}`}
                    onClick={() => onOpenModal()}
                >
                    Create Your Post Here.
                </div>
            </div>
            {/* <div className="h-px bg-gray-100 dark:bg-gray-800 mb-3 mx-2"></div> */}
            {/* <div className="flex items-center gap-4 px-2">
                <button
                    onClick={() => onOpenModal('photo')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                    <PictureOutlined className="text-xl text-green-500" /> Photo
                </button>
                <button
                    onClick={() => onOpenModal('video')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                    <VideoCameraOutlined className="text-xl text-red-500" /> Video
                </button>
            </div> */}
        </div>
    );
}
