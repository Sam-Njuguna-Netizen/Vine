"use client";
import { useEffect, useRef, useState } from "react";
import { Spin } from "antd";

const LiveClassRoom = ({
  // --- Existing props ---
  roomName,
  user,
  // --- New props for moderator logic ---
  password,
  isAdmin,
  onMeetingEnd,
  onModeratorJoined,
}) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);

  // Load Jitsi script
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setJitsiLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => setJitsiLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Jitsi when both script and DOM are ready
  useEffect(() => {
    if (!jitsiLoaded || !jitsiContainerRef.current) return;

    // Dispose of any existing meeting to prevent duplicates
    if (apiRef.current) {
      apiRef.current.dispose();
    }

    const options = {
      roomName: roomName, // No need to encode, Jitsi handles it
      parentNode: jitsiContainerRef.current,
      width: "100%",
      height: "100%",
      // --- MODIFICATION: Add password for students ---
      // For students, we pass the password directly.
      // For instructors, we set it after they join to claim moderator status.
      password: !isAdmin ? password : undefined,
      configOverwrite: {
        disableDeepLinking: true,
        disableInviteFunctions: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        disableRemoteMute: true,
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        toolbarConfig: { alwaysVisible: true },
        disableThirdPartyRequests: true,
        enableClosePage: false,
        disableShortcuts: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        DEFAULT_LOGO_URL: "",
        MOBILE_APP_PROMO: false,
      },
      userInfo: {
        displayName: user?.name || "Participant",
        email: user?.email || "",
      },
    };

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", options);
    apiRef.current = api;
    setLoading(false);

    // --- MODIFICATION: Add event listeners for moderator and meeting end ---

    // If the user is an instructor/admin
    if (isAdmin) {
      // This event fires once the instructor is in the call
      api.addEventListener("videoConferenceJoined", () => {
        // Set the password to become the moderator
        api.executeCommand("password", password);
        // Notify the parent component that the moderator is in
        if (onModeratorJoined) {
          onModeratorJoined();
        }
      });
    }

    // Use readyToClose, which is triggered by the hangup button
    api.addEventListener("readyToClose", () => {
      if (onMeetingEnd) {
        onMeetingEnd();
      }
    });

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [jitsiLoaded, roomName, user, password, isAdmin]); // <-- Add new props to dependency array

  if (!jitsiLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Spin size="large" tip="Loading meeting..." />
      </div>
    );
  }

  return <div ref={jitsiContainerRef} className="w-full h-[600px]" />;
};

export default LiveClassRoom;
