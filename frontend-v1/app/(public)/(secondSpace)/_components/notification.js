"use client";

import React, {  useEffect } from "react";
import { notification } from "antd"; // ⬅️ Import notification from antd
import socket from "@/app/utils/socket";

const PublicNotifications = () => {

  useEffect(() => {
    socket.connect();

    const onAdminEvent = (value) => {
      console.log("Received new_ticket:", value);
      notification.open({
        message: value.message,
        duration: 5, 
      });
    };

    socket.on("new_post_reply", onAdminEvent);

    return () => {
      console.log("Cleaning up socket listener");
      socket.off("new_ticket", onAdminEvent);
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      
    </div>
  );
};

export default PublicNotifications;
