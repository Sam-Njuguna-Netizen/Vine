"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import moment from "moment";
import { debounce } from "lodash";
import axios from "@/app/api/axios";
import socket from "@/app/utils/socket";
import { N } from "@/app/utils/notificationService";
import { allCategories, getAvailableCourses } from "@/app/utils/courseService";
import { getAuthUser, logout, allOnlineFriends, searchProfiles } from "@/app/utils/auth";
import {
  logoutUser,
  setAuthUser,
  setCourseCategory,
  setCart,
  setOnlineProfiles,
  setIsMobile,
} from "@/app/store";

// Icons
import {
  Home, User, Mail, Bell, LogOut, Users, MoreHorizontal,
  ChevronsLeft, ChevronsRight, Video, BookOpen, FileText, Calendar,
  FileCheck, MessageSquare, LayoutDashboard, Menu as MenuIcon, Library,
  Search, Settings, HelpCircle, Star, Database, Trophy, Info,
  ArrowRight,
  Settings2,
  MessageCircle,
  Shapes,

} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/app/Components/ThemeSwitcher";

import WebsiteChatbot from "@/app/Components/WebsiteChatbot";

const topNavItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/social", icon: Users, label: "Social" },
  { href: "/social/messenger", icon: Mail, label: "Messenger" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: HelpCircle, label: "Support" },
];

const INITIAL_VISIBLE_COUNT = 10; // Adjust based on your preference (Feeds is the 8th item in the image)
const PublicLayout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // Local UI State
  const [hasMounted, setHasMounted] = useState(false);
  const [adminCollapsed, setAdminCollapsed] = useState(true);

  // Sheet/Drawer States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSecondSpaceOpen, setIsSecondSpaceOpen] = useState(false);
  // --- Added State for Mobile Search Dialog ---
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [profileResults, setProfileResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Data State
  const [notifications, setNotifications] = useState([]);
  const [authUserLocal, setAuthUserLocal] = useState(null);

  // Redux State
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const cardItems = useSelector((state) => state.cart.items);

  // --- Animation Variants ---
  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 250 },
  };
  const menuItems = useMemo(() => [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "black" },
    // { href: "/courseManage", icon: BookOpen, label: "Manage Course",color:"black" },
    { href: "/courses", icon: BookOpen, label: "Courses", color: "black" },
    { href: "/library", icon: Library, label: "Library", color: "black" },
    // { href: "/courseVideo", icon: Video, label: "Video",color:"black" },
    // { href: "/courseDoc", icon: FileText, label: "Document",color:"black" },
    { href: "/live", icon: Calendar, label: "Live", color: "black" },
    { href: "/courseAssignment", icon: FileCheck, label: "Assignment", color: "black" },
    { href: "/courseQuiz", icon: FileText, label: "Quiz", color: "black" },
    // { href: "/courseDiscussion", icon: MessageSquare, label: "Discussion" },
    // { href: "/courseRating", icon: Star, label: "Rating" },
    { href: "/appoinment", icon: Video, label: "Meetings", color: "black" },
    { href: "/book", icon: Database, label: "Store", color: "black" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "black" },
    { href: "/social", icon: Users, label: isMobile ? "Social" : "Community", color: "black" },
    { href: "/social/messenger", icon: Mail, label: "Messenger", color: "black" },
    // { href: "/about", icon: Info, label: "About" },
  ], [isMobile]);

  const bottomMenuItems = useMemo(() => [
    { href: "/support", icon: HelpCircle, label: "Support", color: "black" },
    { href: "/setting", icon: Settings, label: "Settings", color: "black" },
  ], []);


  const [showAllCoreItems, setShowAllCoreItems] = useState(false);

  // Filter out the profile and create page items for the main list
  const coreMenuItems = menuItems.filter(item => !item.special);
  // Get the special items (profile and create page)
  const specialItems = menuItems.filter(item => item.special);

  // Determine which items to display in the main list
  const visibleItems = showAllCoreItems
    ? coreMenuItems
    : coreMenuItems.slice(0, INITIAL_VISIBLE_COUNT);

  const handleSeeMoreClick = () => {
    setShowAllCoreItems(!showAllCoreItems);
  };

  const MenuItem = ({ item, isSpecial = false }) => {
    // Styling for a typical menu item row
    let className = `flex items-center dark:bg-gray-800 p-3 w-full rounded-[1em] bg-white dark:bg-[#141414] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer `;
    let iconClassName = `h-6 w-6 text-${item.color}-500 mr-3`;
    let textClassName = 'font-medium text-lg';

    if (item.special === 'profile') {
      // Styling for the profile row (larger text/icon, maybe a different background)
      className = 'flex items-center p-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-b dark:border-zinc-700 border-gray-200';
      iconClassName = 'h-10 w-10 mr-3 rounded-full object-cover bg-gray-300 dark:bg-zinc-700 p-1'; // Placeholder for the profile pic
      textClassName = 'font-semibold text-xl';
    } else if (item.special === 'create') {
      // Styling for the 'Create' row
      iconClassName = 'h-6 w-6 mr-3 text-blue-500 dark:text-blue-400';
    } else if (item.dropdown) {
      // Styling for Help & Settings items (mimic the dropdown arrow on the right)
      className = 'flex justify-between items-center p-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer';
    }

    return (
      <Link href={item.href} onClick={() => setIsSecondSpaceOpen(false)} className={className}>
        <div className="flex items-center">
          {/* The icon or profile placeholder */}
          <item.icon className={iconClassName} />
          <span className={textClassName}>{item.label}</span>
        </div>
        {/* Dropdown arrow for help/settings sections */}
        {item.dropdown && (
          <ArrowRight className="h-4 w-4 transform rotate-90 text-gray-500 dark:text-gray-400" />
        )}
      </Link>
    );
  };

  const Divider = () => (
    <div className="h-px bg-gray-200 dark:bg-zinc-700 mx-3 my-2" />
  );

  const SectionTitle = ({ label }) => (
    <div className="p-3">
      <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">{label}</h3>
    </div>
  );
  // --- Side Effects & Logic ---

  useEffect(() => {
    setHasMounted(true);
    verifyUser();
    getAllCategories();
    getOnlineFriends();

    const handleResize = debounce(() => {
      dispatch(setIsMobile(window.innerWidth < 900));
    }, 150);

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, []); // eslint-disable-line

  useEffect(() => {
    verifyExpiry();
  }, [authUserLocal]); // eslint-disable-line

  // Scroll to top on pathname change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        const [courseRes, profileRes] = await Promise.all([
          getAvailableCourses(searchQuery, true),
          searchProfiles(searchQuery)
        ]);

        if (courseRes.success) {
          setSearchResults(courseRes.courses);
        } else {
          setSearchResults([]);
        }

        if (profileRes.success) {
          setProfileResults(profileRes.profiles);
        } else {
          setProfileResults([]);
        }

        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setProfileResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const calculateTotalQuantity = () => cardItems.reduce((total, item) => total + item.quantity, 0);

  const verifyExpiry = async () => {
    if (
      authUserLocal?.institution &&
      (authUserLocal?.institution?.isActive === 0 ||
        (authUserLocal?.institution?.expiryDate &&
          moment(authUserLocal?.institution?.expiryDate).isBefore(moment())))
    ) {
      N("Error", "Subscription Expired", "error");
      handleLogOut();
    }
  };

  const verifyUser = async () => {
    const authU = await getAuthUser();
    if (authU?.success) {
      dispatch(setAuthUser(authU.user));
      dispatch(setCart(authU.user.cartItems));
      setAuthUserLocal(authU.user);
    }
  };

  const getAllCategories = async () => {
    const response = await allCategories();
    if (response?.success) dispatch(setCourseCategory(response.categories));
  };

  const loadNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications");
      if (response?.status === 200) {
        verifyUser();
        setNotifications(response.data.notifications);
        setIsNotificationOpen(true);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load notifications";
      N("Error", errorMessage, "error");
    }
  };

  const handleLogOut = async () => {
    if (authUserLocal?.id) socket.emit("logout", authUserLocal.id);
    await logout();
    dispatch(logoutUser());
    socket.disconnect();
    if (typeof window !== "undefined") window.location.href = process.env.NEXT_PUBLIC_SITE_URL + "/login";
  };

  // --- Socket Logic ---
  useEffect(() => {
    if (!authUserLocal?.id) return;
    socket.emit("register", authUserLocal.id);
    return () => {
      socket.emit("logout", authUserLocal.id);
      socket.off("register");
      socket.off("logout");
    };
  }, [authUserLocal]);

  const debouncedGetOnlineFriends = debounce(() => getOnlineFriends(), 1000);

  const getOnlineFriends = async () => {
    const response = await allOnlineFriends();
    if (response?.success) dispatch(setOnlineProfiles(response.profiles));
  };

  useEffect(() => {
    const handleNotification = (data) => {
      if (authUserLocal?.id && data.includes(authUserLocal.id)) verifyUser();
    };
    const handleStatusUpdate = () => debouncedGetOnlineFriends();

    socket.on("createNotification", handleNotification);
    socket.on("updateOnlineStatus", handleStatusUpdate);
    return () => {
      socket.off("createNotification", handleNotification);
      socket.off("updateOnlineStatus", handleStatusUpdate);
    };
  }, [authUserLocal, debouncedGetOnlineFriends]);

  // --- Navigation Config ---

  if (!hasMounted) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;

  return (
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden overscroll-none flex bg-[#f7f6f4] dark:bg-[#141414]">
      {/* --- Desktop Sidebar --- */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={adminCollapsed ? "collapsed" : "expanded"}

          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-50 flex max-w-[200px] flex-col border-r bg-gradient-to-br from-[#312E81] to-[#701A75] dark:bg-[#141414] text-white h-full"
        >
          <div className="flex h-[100px] items-center justify-center py-10">
            <Link href="/dashboard">
              <img
                src={authUserLocal?.institution?.logo ? (authUserLocal.institution.logo.startsWith('http') ? authUserLocal.institution.logo : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${authUserLocal.institution.logo}`) : "/assets/2-2.png"}
                alt="Logo"
                className="h-[4em] object-contain"
              />
            </Link>
          </div>

          <ScrollArea className="flex-1 border-t border-gray-400 border-b  px-2 py-4">
            <div className="space-y-3 ">
              {[...menuItems, ...bottomMenuItems].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div


                    className={cn(
                      "w-full justify-start flex items-center my-4 text-blue-200 hover:text-white hover:bg-white/10",
                      pathname === item.href && "bg-[#701A75] py-2 text-white",
                      adminCollapsed ? "px-2 justify-center" : "px-4"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", !adminCollapsed && "mr-2")} />
                    {!adminCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 text-center text-xs text-gray-400">
            {!adminCollapsed && "2025© Vine"}
          </div>
        </motion.aside>
      )}

      {/* --- Main Content Wrapper --- */}
      <div className="flex flex-1 flex-col overflow-hidden relative bg-[#f7f6f4] dark:bg-[#141414]">

        {/* --- Header --- */}
        <header className={cn(`flex h-[70px] items-center rounded-full mx-2 sm:mx-10 mt-4 justify-between text-white px-5 sm:px-6 shadow-md bg-gradient-to-r from-[#701A75] via-[#1E3A8A] to-[#1E40AF]`, pathname == '/social/messenger' && "")}>

          <div className={cn("flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4", isMobile && "contents")}>
            {!isMobile && <Button
              variant="ghost"
              size="icon"
              onClick={() => setAdminCollapsed(!adminCollapsed)}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              {adminCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>}
            <ThemeSwitcher />
          </div>

          {/* Search Section: Split for Mobile (Dialog) vs Desktop (Input) */}
          {!isMobile && (
            /* Desktop Search Bar */
            <div className="relative flex-1 max-w-md mr-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="search.."
                  className="w-full pl-10 pr-4 py-2 rounded-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50 max-h-[300px] overflow-y-auto text-black">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">Searching...</div>
                  ) : (searchResults.length > 0 || profileResults.length > 0) ? (
                    <>
                      {/* Profiles Section */}
                      {profileResults.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">People</div>
                          {profileResults.map((profile) => (
                            <div
                              key={profile.id}
                              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b last:border-0"
                              onClick={() => {
                                router.push(`/profile/${profile.user?.id}`);
                                setShowResults(false);
                                setSearchQuery("");
                              }}
                            >
                              <img
                                src={profile.pPic || "/default-avatar.jpg"}
                                alt={profile.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm">{profile.name}</p>
                                <p className="text-xs text-gray-500">@{profile.nickName}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Courses Section */}
                      {searchResults.length > 0 && (
                        <>
                          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase mt-2">Courses</div>
                          {searchResults.map((course) => (
                            <div
                              key={course.id}
                              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b last:border-0"
                              onClick={() => {
                                router.push(`/courses/${course.id}/play`);
                                setShowResults(false);
                                setSearchQuery("");
                              }}
                            >
                              <img
                                src={course.featuredImage || "/assets/course_placeholder.png"}
                                alt={course.title}
                                className="h-10 w-10 rounded object-cover"
                              />
                              <div>
                                <p className="font-medium text-sm">{course.title}</p>
                                <p className="text-xs text-gray-500">{course.instructor?.name}</p>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">No results found</div>
                  )}
                </div>
              )}
              {/* Overlay to close search results */}
              {showResults && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setShowResults(false)}
                />
              )}
            </div>
          )}

          <div className={cn("flex items-center gap-3 sm:gap-6", isMobile && "gap-5")}>

            {/* Mobile Search - Moved into Right Group */}
            {isMobile && (
              <div className="contents">
                <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="text-white rounded-[0.6em] p-1 hover:bg-white hover:text-black bg-tranparent border border-white">
                      <Search className="h-6 w-6" /> {/* Reduced size slightly to match others if needed, using w-6 h-6 usually */}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="top-[20%] translate-y-0 w-[95%] sm:max-w-[425px] bg-white dark:bg-[#1f1f1f] text-black dark:text-white border-none shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-left mb-2">Search Courses</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="search.."
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="mt-2 max-h-[300px] overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">Searching...</div>
                      ) : (searchResults.length > 0 || profileResults.length > 0) ? (
                        <>
                          {/* Profiles Section */}
                          {profileResults.length > 0 && (
                            <>
                              <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">People</div>
                              {profileResults.map((profile) => (
                                <div
                                  key={profile.id}
                                  className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 border-b dark:border-zinc-700 last:border-0"
                                  onClick={() => {
                                    router.push(`/profile/${profile.user?.id}`);
                                    setSearchQuery("");
                                    setIsSearchDialogOpen(false);
                                  }}
                                >
                                  <img
                                    src={profile.pPic || "/default-avatar.jpg"}
                                    alt={profile.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-sm text-black dark:text-white">{profile.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">@{profile.nickName}</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {/* Courses Section */}
                          {searchResults.length > 0 && (
                            <>
                              <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mt-2">Courses</div>
                              {searchResults.map((course) => (
                                <div
                                  key={course.id}
                                  className="p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 border-b dark:border-zinc-700 last:border-0"
                                  onClick={() => {
                                    router.push(`/courses/${course.id}/play`);
                                    setSearchQuery("");
                                    setIsSearchDialogOpen(false);
                                  }}
                                >
                                  <img
                                    src={course.featuredImage || "/assets/course_placeholder.png"}
                                    alt={course.title}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                  <div>
                                    <p className="font-medium text-sm text-black dark:text-white">{course.title}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{course.instructor?.profile?.name}</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </>
                      ) : searchQuery ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No results found</div>
                      ) : null}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <div onClick={() => setIsChatOpen((prev) => !prev)} className=" h-9 w-9 border border-white bg-[#3a165c] text-white text-center rounded-[0.7em] flex items-center flex-col  justify-center cursor-pointer hover:bg-[#3a165c]/80 transition-colors">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>

            {/* Cart */}
            <Link href="/book/cart" className="relative">
              <div className="border border-white p-2 rounded-xl text-white hover:bg-white hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart h-5 w-5">
                  <circle cx="8" cy="20" r="1" /><circle cx="19" cy="20" r="1" />
                  <path d="M2.5 2h2l3.3 9.4A1 1 0 0 0 8.8 12h8.7a1 1 0 0 0 .8-.4l3.7-7A1 1 0 0 0 21.5 3H6.5" />
                </svg>
                {cardItems?.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 p-0 flex items-center justify-center text-[10px] text-white border-2 border-[#1E3A8A]">
                    {calculateTotalQuantity()}
                  </Badge>
                )}
              </div>
            </Link>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarImage src={authUserLocal?.profile?.pPic || "/default-avatar.jpg"} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block font-medium">{authUserLocal?.profile?.name || "User"}</span>
                  <ChevronsRight className="h-4 w-4 rotate-90 hidden sm:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/setting")}>
                  <Settings2 className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={loadNotifications}>
                  <Bell className="mr-2 h-4 w-4" /> Notifications
                  {authUserLocal?.notifications > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1.5">
                      {authUserLocal?.notifications}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main
          className={cn(
            "flex-1 bg-[#f7f6f4] dark:bg-[#141414]",
            pathname === "/social/messenger" ? "overflow-hidden p-0" : "overflow-y-auto md:p-4",
            isMobile && pathname !== "/social/messenger" && "pb-20"
          )}
        >
          {children}
        </main>

        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 z-50 gradient-button text-white dark:text-white h-[60px] border-t bg-background flex items-center justify-around shadow-lg">
            <Link href="/dashboard">
              <div className="flex flex-col items-center gap-0.5" >
                <Home className="h-5 w-5" />
                <p className="text-[10px]">Home</p>
              </div>
            </Link>
            <Link href="/profile">

              <div className="flex flex-col items-center gap-0.5" ><User className="h-5 w-5" />
                <p className="text-[10px]">Profile</p>
              </div>
            </Link>
            <Link href="/social">
              <div className="flex flex-col items-center gap-0.5" ><Users className="h-5 w-5" />
                <p className="text-[10px]">Social</p>
              </div>
            </Link>
            <Link href="/social/messenger">
              <div className="flex flex-col items-center gap-0.5" ><Mail className="h-5 w-5" />
                <p className="text-[10px]">Chat</p>
              </div>
            </Link>
            <div>
              <div className="flex flex-col items-center gap-0.5" onClick={() => setIsSecondSpaceOpen(true)} ><MenuIcon className="h-5 w-5" />
                <p className="text-[10px]">Menu</p>
              </div>
            </div>
          </div>
        )}
      </div>


      <Sheet open={isSecondSpaceOpen} onOpenChange={setIsSecondSpaceOpen}>
        <SheetContent side="right" className="w-full dark:bg-[#141414] bg-[#f7f6f4] sm:max-w-sm text-black dark:text-white p-0">
          <ScrollArea className="h-[calc(100vh-70px)] no-scrollbar [&>[data-orientation=vertical]]:hidden" >

            <div className="p-2 flex flex-col gap-1">
              <div className="w-full flex items-center justify-center">
                <img
                  src={authUserLocal?.institution?.logo ? (authUserLocal.institution.logo.startsWith('http') ? authUserLocal.institution.logo : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${authUserLocal.institution.logo}`) : "/assets/2-2.png"}
                  alt="Logo"
                  className="h-[4em] object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold p-3">Menu</h2>
              {specialItems.map((item) => (
                <MenuItem key={item.href} item={item} />
              ))}
              <Divider />
              <div className="grid grid-cols-2 gap-2">
                {visibleItems.map((item) => (
                  <MenuItem key={item.href} item={item} />
                ))}
              </div>

              {coreMenuItems.length > INITIAL_VISIBLE_COUNT && (
                <button
                  onClick={handleSeeMoreClick}
                  className="flex items-center justify-center p-3 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-blue-500 dark:text-blue-400 font-medium"
                >
                  {showAllCoreItems ? 'See less' : 'See more'}
                </button>
              )}

              <Divider />

              <SectionTitle label="Support & Settings" />
              <div className="grid grid-cols-2 gap-2">
                {bottomMenuItems.map((item) => (
                  <MenuItem key={item.href} item={item} />
                ))}
              </div>



              <div className='h-20'></div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* --- Sheet: Notifications --- */}
      <Sheet open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
        <SheetContent side="right" className="w-[350px] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Notifications</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px)]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.link);
                    setIsNotificationOpen(false);
                  }}
                  className="flex items-start gap-3 p-4 border-b hover:bg-muted/50 cursor-pointer transition"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={item.created?.profile?.pPic || "/default-avatar.jpg"} />
                      <AvatarFallback>N</AvatarFallback>
                    </Avatar>
                    {!item.isSeen && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.created?.profile?.name} <span className="text-muted-foreground font-normal">{item.type}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{moment(item.createdAt).fromNow()}</p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* --- Sheet: Mobile "More" Menu --- */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-2">
            {topNavItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={handleLogOut}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 w-full text-center text-xs text-muted-foreground">
            2025© Vine LMS
          </div>
        </SheetContent>
      </Sheet>

      <WebsiteChatbot isOpen={isChatOpen} toggleChat={() => setIsChatOpen((prev) => !prev)} />
    </div>
  );
};

export default PublicLayout;