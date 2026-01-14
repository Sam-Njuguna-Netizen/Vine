"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import axios from "@/app/api/axios";
import {
    Clock,
    Flame,
    Users,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function SocialLeftSidebar({ setSort, currentSort }) {
    const { darkMode } = useTheme();
    const [pinnedGroups, setPinnedGroups] = useState([]);

    useEffect(() => {
        fetchPinnedGroups();
    }, []);

    const fetchPinnedGroups = async () => {
        try {
            const response = await axios.get("/api/allMyInstitutionGroup");
            if (response.data.success) {
                setPinnedGroups(response.data.groups.slice(0, 5)); // Limit to 5
            }
        } catch (error) {
            console.error("Failed to fetch groups", error);
        }
    };

    const menuItems = [
        { key: "newest", label: "Newest and Recent", icon: <Clock className="w-5 h-5" />, color: "bg-green-500", desc: "Find the latest update" },
        { key: "popular", label: "Popular of the day", icon: <Flame className="w-5 h-5" />, color: "bg-orange-500", desc: "Shots featured today" },
        { key: "following", label: "Following", icon: <Users className="w-5 h-5" />, color: "bg-blue-500", desc: "Explore from your favorite person" },
    ];

    return (
        <aside className="w-full md:w-1/4  sticky top-0 h-full">
            <ScrollArea className="h-full pr-2">


                {/* Pinned Groups */}
                {pinnedGroups.length > 0 && (
                    <Card className="border-0 shadow-md bg-gradient-to-br from-[#701A75] to-[#1E3A8A] text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users size={100} />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h3 className="font-bold text-lg mb-6 flex items-center">
                                Groups
                            </h3>
                            <ul className="space-y-4">
                                {pinnedGroups.map((group) => (
                                    <li key={group.id} className="group cursor-pointer hover:bg-white/10 p-2 rounded-lg transition-colors -mx-2">
                                        <Link href={`/group/${group.id}`} className="flex items-center w-full">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 overflow-hidden bg-white shrink-0 shadow-sm text-gray-800">
                                                {group.coverImage ? (
                                                    <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate text-white">{group.name}</p>
                                                <p className="text-xs text-white/70 truncate">{group.members?.length || 0} Members</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </ScrollArea>
        </aside>
    );
}
