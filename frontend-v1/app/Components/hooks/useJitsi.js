'use client'
import { useState, useEffect } from 'react';

export default function useJitsi() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return loaded;
}