"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { debounce } from "lodash";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { getAuthUser, checkAuth, logout } from "@/app/utils/auth";
import { logoutUser, setAuthUser, setIsMobile } from "@/app/store";
import { useTheme } from "@/context/ThemeContext";
import Notications from "./notications";

// Icons
import {
  LayoutDashboard,
  DollarSign,
  Tag,
  Users,
  BookOpen,
  Library,
  Package,
  CreditCard,
  HelpCircle,
  Settings,
  User,
  LogOut,
  Bell,
  Menu,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Layers,
  FileBox,
  ShoppingCart,
  UserPlus,
  MessageSquareTextIcon,
  Clock1,
} from "lucide-react";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/app/Components/ThemeSwitcher";

// --- Menu Definitions ---

const adminMenuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/revenue", icon: DollarSign, label: "Revenue" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/courseOptions", icon: BookOpen, label: "Course Options" },
  { href: "/admin/library", icon: Library, label: "Library" },
  { href: "/admin/store", icon: ShoppingCart, label: "Store" },
  { href: "/admin/book", icon: Package, label: "My Products" },
  { href: "/admin/subscription", icon: CreditCard, label: "Subscription" },

  { href: "/admin/group", icon: Users, label: "Groups" },
  { href: "/admin/setting", icon: Settings, label: "Settings" },
  { href: "/admin/account", icon: User, label: "Account" },
  { href: "/admin/appointment", icon: Clock1, label: "Appointment" },
  { href: "/admin/integrations", icon: MessageSquareTextIcon, label: "Integrations" },
  { href: "/admin/promos", icon: Tag, label: "Promos" },
  { href: "/admin/student-plans", icon: Tag, label: "Student Pricing" },

];


const adminWithoutSub = [
  { href: "/admin/subscription", icon: CreditCard, label: "Subscription" },
];

const instructorMenuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/revenue", icon: DollarSign, label: "Revenue" },
  {
    label: "Course Management",
    icon: BookOpen,
    children: [
      { href: "/admin/courseManage", label: "My Courses" },
      { href: "/admin/courseVideo", label: "Course Videos" },
      { href: "/admin/courseDoc", label: "Course Documents" },
    ],
  },
  {
    label: "My Products",
    icon: Package,
    children: [
      { href: "/admin/book", label: "Manage Products" },
      { href: "/admin/book/categories", label: "Product Categories" },
      { href: "/admin/book/bookMaterial", label: "Products Materials" },
      { href: "/admin/book/Orders", label: "Products Orders" },
    ],
  },
  { href: "/admin/student-plans", icon: Tag, label: "Student Pricing" },
  { href: "/", icon: User, label: "Second Space" },
];

// --- Sidebar Item Component ---
const SidebarItem = ({ item, collapsed, pathname, router }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = item.href === pathname || item.children?.some(child => child.href === pathname);

  useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  if (item.children) {
    return (
      <div className="mb-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between text-blue-200 hover:text-white hover:bg-white/10",
            isActive && !isOpen && "bg-[#701A75] text-white",
            collapsed ? "px-2 justify-center" : "px-4"
          )}
          onClick={() => !collapsed && setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </div>
          {!collapsed && (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <AnimatePresence>
          {isOpen && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-4 border-l border-white/20 pl-2 mt-1 space-y-1"
            >
              {item.children.map((child) => (
                <Link key={child.href} href={child.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start text-blue-200 hover:text-white hover:bg-white/10 h-8",
                      pathname === child.href && "bg-[#701A75] text-white"
                    )}
                  >
                    <span className="truncate">{child.label}</span>
                  </Button>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start text-blue-200 hover:text-white hover:bg-white/10 mb-1",
          pathname === item.href && "bg-[#701A75] text-white",
          collapsed ? "px-2 justify-center" : "px-4"
        )}
      >
        <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Button>
    </Link>
  );
};

const AdminLayout = ({ children }) => {
  const { darkMode } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  // State
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [authUserLocal, setAuthUserLocal] = useState(null);
  const [currentMenuItems, setCurrentMenuItems] = useState([]);

  // Redux
  const authUser = useSelector((state) => state.auth.user);
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);

  // Animation Variants
  const sidebarVariants = {
    collapsed: { width: 80 },
    expanded: { width: 250 },
  };

  // --- Effects ---

  useEffect(() => {
    const handleResize = debounce(() => {
      dispatch(setIsMobile(window.innerWidth < 900));
    }, 150);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  useEffect(() => {
    const verifyUser = async () => {
      const authenticatedUser = await checkAuth(true);
      if (!authenticatedUser) {
        router.push("/login");
        return;
      }
      const authU = await getAuthUser();
      if (authU && authU.success) {
        dispatch(setAuthUser(authU.user));
        setAuthUserLocal(authU.user);
      }
    };
    verifyUser();
  }, [router, dispatch]);

  useEffect(() => {
    let shouldRedirect = false;
    if (authUserLocal) {
      let baseMenu = [];
      switch (authUserLocal?.roleId) {
        case 1: // Admin
          if (
            authUser?.institution?.expiryDate === null ||
            (authUser?.institution?.expiryDate &&
              new Date(authUser?.institution?.expiryDate) < new Date())
          ) {
            baseMenu = adminWithoutSub;
            const currentPath = window.location.pathname;
            const allowedExpiredPaths = [
              "/admin/subscription",
              "/admin/subscription/plan",
            ];
            if (!allowedExpiredPaths.includes(currentPath)) {
              shouldRedirect = true;
            }
          } else {
            baseMenu = adminMenuItems;
          }
          break;
        case 2: // Instructor
          baseMenu = instructorMenuItems;
          break;
        default:
          baseMenu = [];
          break;
      }
      setCurrentMenuItems(baseMenu);
      if (shouldRedirect) {
        router.push("/admin/subscription");
        return;
      }
    }
  }, [authUserLocal, authUser, router]);

  // --- Handlers ---

  const handleLogOut = async () => {
    try {
      await logout();
      dispatch(logoutUser());
      router.push("/login");
    } catch (err) {
      console.log(err);
      N("error", "Failed to Logout");
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications");
      if (response && response.status === 200) {
        setNotifications(response.data.notifications);
        setIsNotificationOpen(true);
      }
    } catch (error) {
      console.log(error);
      N("Error", error?.response?.data?.message, "error");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f7f6f4] dark:bg-[#141414]">
      <Notications />

      {/* --- Desktop Sidebar (Left) --- */}
      {!isMobile && (
        <motion.aside
          initial={false}
          animate={collapsed ? "collapsed" : "expanded"}
          variants={sidebarVariants}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative z-50 flex flex-col border-r bg-gradient-to-br from-[#312E81] to-[#701A75] dark:bg-[#141414] text-white h-full"
        >
          <div className="flex h-[80px] items-center justify-center py-6">
            <Link href="/admin">
              <img
                src={authUserLocal?.institution?.logo ? (authUserLocal.institution.logo.startsWith('http') ? authUserLocal.institution.logo : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${authUserLocal.institution.logo}`) : "/assets/2-2.png"}
                alt="Logo"
                className="h-[4em] object-contain"
              />
            </Link>
          </div>

          <ScrollArea className="flex-1 px-2 py-4">
            <div className="space-y-1">
              {currentMenuItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  item={item}
                  collapsed={collapsed}
                  pathname={pathname}
                  router={router}
                />
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 text-center text-xs text-gray-400">
            {!collapsed && "2025© Vine"}
          </div>
        </motion.aside>
      )}

      {/* --- Main Content Wrapper --- */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* --- Header --- */}
        <header className="flex h-[60px] items-center rounded-full mx-4 mt-3 justify-between text-white px-4 shadow-sm bg-gradient-to-r from-[#701A75] via-[#1E3A8A] via-[#1E40AF] to-[#312E81]">
          <div className="flex items-center gap-4 w-full max-w-xl">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-6 w-6" />
              </Button>
            )}

            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
                className="hover:bg-white/20 text-white"
              >
                {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
              </Button>
            )}

            {/* Search Bar */}
            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="search.."
                className="w-full bg-white/90 text-black pl-9 rounded-full focus-visible:ring-0 border-none h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Cart Icon */}
            <Link href="/admin/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/20 text-white">
                <ShoppingCart className="h-5 w-5" />
                {/* You might want to connect this to Redux cart count if admin has a cart state?
                     Assuming admin shares the same 'cart' state in Redux as public user since it's the same auth user session.
                  */}
              </Button>
            </Link>

            <Link href="/admin/support">
              <Button variant="ghost" className="hidden md:flex hover:bg-white/20 text-white">
                Support
              </Button>
            </Link>

            <ThemeSwitcher />

            {/* Notifications */}
            <Button variant="ghost" size="icon" onClick={loadNotifications} className="relative hover:bg-white/20 text-white">
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.isSeen) && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-0 hover:bg-white/20 text-white rounded-full pr-2 gap-2">
                  <Avatar className="h-8 w-8 border-2 border-white/50">
                    <AvatarImage src={authUserLocal?.profile?.pPic || "/default-avatar.jpg"} />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block font-medium text-sm">
                    {authUserLocal?.profile?.name || "Admin"}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/admin/account")}>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/admin/setting")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* --- Main Content Area --- */}
        <main className="flex-1 overflow-y-auto p-2">
          {children}
        </main>
      </div>

      {/* --- Sheet: Mobile Menu --- */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0 bg-gradient-to-b from-[#312E81] to-[#701A75] text-white border-none">
          <SheetHeader className="p-6 border-b border-white/10">
            <SheetTitle className="text-white flex justify-center">
              <img
                src={authUserLocal?.institution?.logo ? (authUserLocal.institution.logo.startsWith('http') ? authUserLocal.institution.logo : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${authUserLocal.institution.logo}`) : "/assets/2-2.png"}
                alt="Logo"
                className="h-12 object-contain"
              />
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-100px)] px-2 py-4">
            <div className="space-y-1">
              {currentMenuItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  item={item}
                  collapsed={false}
                  pathname={pathname}
                  router={router}
                />
              ))}
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
    </div>
  );
};

export default AdminLayout;
