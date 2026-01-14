"use client";

import React, { useEffect, useState } from "react";

import { setIsMobile, setAuthUser } from "@/app/store";
import { useSelector, useDispatch } from "react-redux";
import socket from "@/app/utils/socket";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuthUser } from "@/app/utils/auth";
import Header from "@/app/Components/home/header";
import Footer from "@/app/Components/home/footer";

const AdminLayout = ({ children }) => {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  console.log("AuthUser:", authUser);

  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 900));
    };
    handleResize();
  }, [dispatch]);

  const [links, setLinks] = useState({
    aboutLink: "/about-us",
    terms: "/terms-and-conditions",
    pricing: "/pricing",
    privacy: "/privacy-policy",
  });

  const publicLinks = [
    "/login",
    "/eula",
    "/about-us",
    "/terms-and-conditions",
    "/admin",
    "/privacy-policy",
  ];

  const userLinks = {
    1: {
      aboutLink: "/about-us",
      terms: "/admin/setting#tAndC",
      pricing: "/admin/subscription",
      privacy: "/admin/setting#privacy-policy",
    },
    2: {
      aboutLink: "/about",
      terms: "/setting#tAndC",
      pricing: "/setting#subscription",
      privacy: "/setting#privacy-policy",
    },
    3: {
      aboutLink: "/about",
      terms: "/setting#tAndC",
      pricing: "/setting#subscription",
      privacy: "/setting#subscription",
    },
    4: {
      aboutLink: "/about-us",
      terms: "/terms-and-conditions",
      pricing: "/superadmin/subscription",
      privacy: "/privacy-policy",
    },
  };

  useEffect(() => {
    async function getAuth() {
      const data = await getAuthUser();
      if (data?.success && data?.user) {
        dispatch(setAuthUser(data.user));
      }
      const roleId = data?.user?.roleId;
      console.log("Data", roleId);

      if (roleId && userLinks[roleId]) {
        setLinks(userLinks[roleId]);
      }

      console.log("links", links);
    }
    getAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Ensure we only run this logic when the user is authenticated
    if (authUser?.id) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit("register", authUser.id);

      socket.on("new_notification", (notification) => {
        console.log("Received new notification:", notification);

        N(
          notification.title || "New Notification",
          notification.message || "You have a new update.",
          "info"
        );
      });

      socket.on("receiveMessage", (message) => {
        if (window.location.pathname.includes("/messenger")) return;
        N(
          `New Message from ${message.senderName || "a user"}`,
          message.message,
          "success"
        );
      });
    }

    // Cleanup function to run when the component unmounts or user changes
    return () => {
      socket.off("new_notification");
      socket.off("receiveMessage");

      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [authUser, dispatch]);

  const hideHeaderFooter =
    pathName.startsWith("/admin") ||
    pathName.startsWith("/superadmin") ||
    publicLinks.includes(pathName);

  return (
    <div>
      {hideHeaderFooter ? null : <Header />}
      {children}
      {hideHeaderFooter ? null : <Footer />}
    </div>
  );
};

export default AdminLayout;
