'use client'
import { useState } from 'react';
import LiveClassRoom from './LiveClassRoom';
import { useSelector } from 'react-redux';

const LiveClassPage = () => {
  const user = useSelector((state) => state.auth.user);
  const [roomName] = useState(`class_${user?.id}_${Date.now()}`);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Class</h1>
      <LiveClassRoom 
        roomName={roomName}
        user={user}
      />
    </div>
  );
};

export default LiveClassPage;