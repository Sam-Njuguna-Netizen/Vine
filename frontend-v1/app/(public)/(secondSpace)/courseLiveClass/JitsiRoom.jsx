"use client";
import { useEffect, useRef } from "react";

const JitsiRoom = ({
  roomName,
  user,
  onLoad,
  onMeetingEnd,
  jitsiConfig, // Contains token, domain, appId
  isAdmin,
  onModeratorJoined,
}) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          return resolve();
        }
        const script = document.createElement("script");
        script.src = `https://8x8.vc/${jitsiConfig.appId}/external_api.js`;
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const startMeeting = async () => {
      await loadJitsiScript();

      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }

      // Clean the room name to remove any app ID prefix
      const cleanRoomName = roomName.replace(
        /^vpaas-magic-cookie-[^\/]+\//,
        ""
      );

      const options = {
        roomName: `${jitsiConfig.appId}/${cleanRoomName}`, // Full room path for the API
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        jwt: jitsiConfig.token, // Use JWT token for authentication
        userInfo: {
          displayName: user?.profile?.name || user?.email || "Student",
          email: user?.email,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodevices",
            "hangup",
            "profile",
            "chat",
            "recording",
            "livestreaming",
            "etherpad",
            "sharedvideo",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "tileview",
            "videobackgroundblur",
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          disableDeepLinking: true,
          startWithAudioMuted: !isAdmin, // Admins start unmuted
          startWithVideoMuted: !isAdmin, // Admins start with video
        },
      };

      const api = new window.JitsiMeetExternalAPI(jitsiConfig.domain, options);
      jitsiApiRef.current = api;

      if (onLoad) {
        onLoad();
      }

      // For admins, the moderator status is set via JWT
      if (isAdmin) {
        api.addEventListener("videoConferenceJoined", () => {
          console.log("Admin joined as moderator");
          if (onModeratorJoined) {
            onModeratorJoined();
          }
        });
      }

      api.addEventListener("readyToClose", () => {
        if (onMeetingEnd) {
          onMeetingEnd();
        }
      });
    };

    if (roomName && jitsiContainerRef.current && jitsiConfig?.token) {
      startMeeting();
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, jitsiConfig, isAdmin]);

  return <div ref={jitsiContainerRef} className="w-full h-full" />;
};

export default JitsiRoom;
