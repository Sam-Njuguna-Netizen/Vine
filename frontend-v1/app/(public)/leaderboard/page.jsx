"use client";
import { useEffect, useState } from "react";
import axios from "@/app/api/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get("/api/leaderboard");
                setLeaderboard(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const topThree = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    // Helper to get podium order: 2nd, 1st, 3rd
    const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

    return (
        <div className="min-h-screen bg-[#FDFBF9] dark:bg-[#070707] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Podium Section */}
                {topThree.length > 0 && (
                    <div className="flex justify-center items-end gap-4 mb-12 min-h-[300px]">
                        {/* 2nd Place */}
                        {topThree[1] && (
                            <div className="flex flex-col items-center">
                                <Avatar className="h-16 w-16 mb-2 border-2 border-white dark:border-gray-800 shadow-md">
                                    <AvatarImage src={topThree[1].user?.profile?.pPic} />
                                    <AvatarFallback>{topThree[1].user?.profile?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {topThree[1].user?.profile?.name || "User"}
                                </span>
                                <div className="w-24 sm:w-32 bg-gray-300 dark:bg-gray-600 rounded-t-2xl flex flex-col items-center justify-center py-4 shadow-sm h-[140px]">
                                    <span className="text-gray-700 dark:text-gray-100 font-bold">2nd</span>
                                    <div className="bg-white/50 dark:bg-black/30 px-3 py-1 rounded-full mt-1">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{topThree[1].points} Pts</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {topThree[0] && (
                            <div className="flex flex-col items-center z-10">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 mb-2 border-4 border-[#FDE047] shadow-lg">
                                        <AvatarImage src={topThree[0].user?.profile?.pPic} />
                                        <AvatarFallback>{topThree[0].user?.profile?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    {/* Crown icon could go here */}
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white mb-2">
                                    {topThree[0].user?.profile?.name || "User"}
                                </span>
                                <div className="w-28 sm:w-40 bg-[#EAB308] rounded-t-2xl flex flex-col items-center justify-center py-6 shadow-md h-[180px]">
                                    <span className="text-white font-bold text-xl">1st</span>
                                    <div className="bg-white/30 dark:bg-black/30 px-4 py-1 rounded-full mt-2">
                                        <span className="text-sm font-bold text-white">{topThree[0].points} Pts</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {topThree[2] && (
                            <div className="flex flex-col items-center">
                                <Avatar className="h-16 w-16 mb-2 border-2 border-white dark:border-gray-800 shadow-md">
                                    <AvatarImage src={topThree[2].user?.profile?.pPic} />
                                    <AvatarFallback>{topThree[2].user?.profile?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {topThree[2].user?.profile?.name || "User"}
                                </span>
                                <div className="w-24 sm:w-32 bg-[#D4A373] rounded-t-2xl flex flex-col items-center justify-center py-4 shadow-sm h-[120px]">
                                    <span className="text-white font-bold">3rd</span>
                                    <div className="bg-white/30 dark:bg-black/30 px-3 py-1 rounded-full mt-1">
                                        <span className="text-xs font-bold text-white">{topThree[2].points} Pts</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {topThree.length > 0 && (
                    <div className="text-center mb-8">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {topThree[0]?.user?.profile?.name} Is On Top Of The Leader Board This Month
                        </p>
                    </div>
                )}

                {/* List Section */}
                <div className="bg-white dark:bg-[#121212] rounded-xl shadow-sm overflow-hidden border dark:border-gray-800">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-[#121212] text-sm font-medium text-gray-500 dark:text-gray-400">
                        <div className="col-span-8 sm:col-span-6">Name</div>
                        <div className="col-span-2 sm:col-span-3 text-center">Place</div>
                        <div className="col-span-2 sm:col-span-3 text-right">Points</div>
                    </div>

                    <div className="divide-y dark:divide-gray-800">
                        {/* We can choose to show top 3 in the list too, or just the rest. 
                The image shows top users in the list as well. 
                Let's show everyone in the list for completeness, matching the image.
            */}
                        {leaderboard.map((entry, index) => (
                            <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                                <div className="col-span-8 sm:col-span-6 flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-gray-100 dark:border-gray-800">
                                        <AvatarImage src={entry.user?.profile?.pPic} />
                                        <AvatarFallback>{entry.user?.profile?.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">
                                        {entry.user?.profile?.name || "Unknown User"}
                                    </span>
                                </div>
                                <div className="col-span-2 sm:col-span-3 text-center font-medium text-gray-500 dark:text-gray-400">
                                    {index + 1}
                                </div>
                                <div className="col-span-2 sm:col-span-3 text-right font-medium text-gray-900 dark:text-gray-200">
                                    {entry.points}
                                </div>
                            </div>
                        ))}

                        {leaderboard.length === 0 && (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No data available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
