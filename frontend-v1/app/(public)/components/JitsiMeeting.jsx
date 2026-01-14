'use client';
import { useEffect, useRef } from 'react';

const JitsiMeeting = ({ roomName, userInfo, onMeetingEnd }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi API not loaded!');
      return;
    }

    const options = {
      roomName: encodeURIComponent(roomName),
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      configOverwrite: {
        disableDeepLinking: true,
        disableInviteFunctions: true,
        prejoinPageEnabled: false,
        enableWelcomePage: false,
        disableRemoteMute: true,
        startWithAudioMuted: true,
        startWithVideoMuted: true,
        toolbarConfig: {
          alwaysVisible: true,
        },
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
        DEFAULT_LOGO_URL: '',
        MOBILE_APP_PROMO: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 
          'fullscreen', 'hangup', 'chat', 'settings'
        ],
      },
      userInfo: {
        displayName: userInfo?.name || 'Participant',
        email: userInfo?.email || '',
      },
    };

    apiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);

    apiRef.current.addListener('readyToClose', () => {
      cleanup();
      onMeetingEnd?.();
    });

    apiRef.current.addListener('videoConferenceLeft', () => {
      cleanup();
      onMeetingEnd?.();
    });

    const cleanup = () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };

    return cleanup;
  }, [roomName, userInfo, onMeetingEnd]);

  return <div ref={jitsiContainerRef} style={{ width: '100%', height: '600px' }} />;
};

export default JitsiMeeting;