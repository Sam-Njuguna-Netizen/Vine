"use client";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { useSelector } from "react-redux";
import { Search, Settings } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function SocialRightSidebar() {
    const onlineProfiles = useSelector((state) => state.auth.onlineProfiles);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <aside className="w-full md:w-1/4  sticky top-0 h-full">
            <ScrollArea className="h-full pl-2 ">
                <Card className="border-0 shadow-sm bg-white dark:bg-[#1F1F1F] h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-bold">Online Friends</CardTitle>
                        <div className="flex space-x-1 text-gray-400">
                            <Button variant="ghost" size="icon" onClick={() => setShowSearch(!showSearch)} className="h-8 w-8 hover:text-gray-600 dark:hover:text-gray-300">
                                <Search className="h-4 w-4" />
                            </Button>
                            <Link href="/setting">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-gray-600 dark:hover:text-gray-300">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {showSearch && (
                            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <Input
                                    type="text"
                                    placeholder="Search friends..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
                                />
                            </div>
                        )}
                        <ul className="space-y-4 mt-2">
                            {onlineProfiles.map((p, index) => (
                                <li key={index} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg -mx-2 transition-colors">
                                    <Link href={`/profile/${p?.id}`} className="flex items-center flex-1">
                                        <div className="relative mr-3">
                                            <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                                                <AvatarImage src={p?.profile?.pPic || "/default-avatar.jpg"} alt={p?.profile?.name} className="object-cover" />
                                                <AvatarFallback>{p?.profile?.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#1F1F1F] rounded-full ring-1 ring-white dark:ring-[#1F1F1F]"></span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                                                {p?.profile?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                                Online
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            {onlineProfiles.length === 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No friends online right now.
                                </div>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </ScrollArea>
        </aside>
    );
}
