"use client";

import "@ant-design/v5-patch-for-react-19";
import { Provider, useSelector } from "react-redux";
import store from "./store";
import PublicLayout from "./(public)/components/PublicLayout";
import MyApp from "@/app/Components/MyApp";
import { useEffect, useState } from "react";
import { ConfigProvider, Spin } from "antd";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { usePathname, useRouter } from "next/navigation";
import { publicPaths } from "@/app/store";
import { Toaster } from "@/components/ui/sonner";

// ✅ Separate component so useTheme works
function FaviconUpdater() {
    const { darkMode } = useTheme();

    useEffect(() => {
        const favicon = document.querySelector("link[rel~='icon']");
        if (favicon) {
            favicon.href = darkMode
                ? "/assets/media/logos/logo.png?v=2" // Dark mode
                : "/assets/media/logos/logo.png?v=2"; // Light mode
        }
    }, [darkMode]); // runs every time darkMode changes

    return null; // no UI, just side-effect
}

function AuthCheck({ children }) {
    const authUser = useSelector((state) => state.auth.user);
    const [isLoading, setIsLoading] = useState(true);

    const pathname = usePathname();
    const router = useRouter();

    // Helper to know if current route is public (supports wildcards like "/assets/*")
    const isPublicPath = publicPaths.some((path) => {
        if (path.endsWith("/*")) {
            // "/assets/*" -> "/assets/"
            const basePath = path.slice(0, -1);
            return pathname.startsWith(basePath);
        }
        return path === pathname;
    });

    useEffect(() => {
        // When authUser is first resolved, stop loading
        if (authUser !== undefined) {
            setIsLoading(false);
        }

        // If user is NOT logged in and this is NOT a public page, send to login
        if (authUser === null && !isPublicPath) {
            router.push("/login");
        }
    }, [authUser, isPublicPath, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return children;
}

export default function ClientProviders({ children }) {
    const path = usePathname();

    return (
        <Provider store={store}>
            <ThemeProvider>
                <ConfigProvider
                    theme={{
                        token: {
                            fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
                        },
                    }}
                >
                    <FaviconUpdater />
                    <AuthCheck>
                        {/* If path is NOT in publicPaths (with wildcard support), wrap in PublicLayout */}
                        {!publicPaths.some(
                            (p) =>
                                p === path ||
                                (p.endsWith("/*") &&
                                    path.startsWith(p.slice(0, -2)))
                        ) ? (
                            <PublicLayout>
                                <MyApp />
                                {children}
                            </PublicLayout>
                        ) : (
                            <div>{children}</div>
                        )}
                    </AuthCheck>
                    <Toaster />
                </ConfigProvider>
            </ThemeProvider>
        </Provider>
    );
}
