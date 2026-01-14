"use client"; // Add this if you are using Next.js App Router

import { useEffect, useRef } from 'react';

const JitsiMeeting = ({ roomName, userInfo, onMeetingEnd }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    // Make sure the Jitsi API script is loaded
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not loaded! Make sure the external_api.js script is included.');
      return;
    }

    // --- START: BRANDING CONFIGURATION ---
    
    // This is the configuration object for your "Globalvine" brand.
    const globalvineInterfaceConfig = {
      // Set your app's name
      APP_NAME: 'Globalvine Meetings',
      PROVIDER_NAME: 'Globalvine',
      
      // *** IMPORTANT: Replace this with the URL to your actual logo image ***
      // The logo should be publicly accessible.
      DEFAULT_LOGO_URL: 'https://your-website.com/path/to/your/globalvine-logo.png',
      
      // You can also set a custom logo for the welcome page if you enable it
      // WELCOME_PAGE_LOGO_URL: 'https://your-website.com/path/to/your/globalvine-logo.png',

      // Hide all Jitsi watermarks and branding
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_POWERED_BY: false,
      
      // Set a custom title for the welcome/pre-join screen
      WELCOME_PAGE_TITLE: 'Welcome to your Globalvine Meeting',

      // Keep mobile promotion off
      MOBILE_APP_PROMO: false,

      // Your custom list of toolbar buttons
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'closedcaptions', 'desktop', 
        'fullscreen', 'hangup', 'chat', 'settings'
      ],
      
      // Hides the join/leave notifications for a cleaner interface
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    };
    
    // --- END: BRANDING CONFIGURATION ---


    const options = {
      roomName: encodeURIComponent(roomName),
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      // This object configures the meeting's core functionality
      configOverwrite: {
        disableDeepLinking: true,
        disableInviteFunctions: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        disableRemoteMute: true,
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        disableThirdPartyRequests: true,
        enableClosePage: false,
        disableShortcuts: true,
      },
      // *** This is where you apply your branding ***
      interfaceConfigOverwrite: globalvineInterfaceConfig,
      userInfo: {
        displayName: userInfo?.name || 'Participant',
        email: userInfo?.email || '',
      },
    };

    apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

    // --- Event Listeners and Cleanup (No changes needed here) ---

    const cleanup = () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };

    apiRef.current.addListener('readyToClose', () => {
      cleanup();
      onMeetingEnd?.();
    });

    apiRef.current.addListener('videoConferenceLeft', () => {
      cleanup();
      onMeetingEnd?.();
    });

    return cleanup;
  }, [roomName, userInfo, onMeetingEnd]);

  return <div ref={jitsiContainerRef} style={{ width: '100%', height: '600px' }} />;
};

export default JitsiMeeting;