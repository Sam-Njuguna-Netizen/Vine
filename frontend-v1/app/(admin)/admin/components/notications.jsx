"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import socket from "@/app/utils/socket";

const Notifications = () => {
  const [message, setMessage] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    socket.connect();

    const onAdminEvent = (value) => {
      console.log("Received new_ticket:", value);
      setMessage(value.data);
      setTicket(value.ticket);

      // 🛎️ Show sonner toast
      toast.info("New Ticket Notification", {
        description: `Subject: ${value.ticket.subject}\nPriority: ${value.ticket.priority}`,
        duration: 5000,
      });
    };

    socket.on("new_ticket", onAdminEvent);

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

export default Notifications;
