'use client'
import { useState } from 'react';
import { Modal, Button, Popconfirm, Spin } from 'antd';
import JitsiMeeting from './LiveClassRoom';

const MeetingModal = ({ 
  visible, 
  onClose, 
  roomName, 
  user,
  isInstructor = false,
  onMeetingStart
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <Modal
      title="Live Class"
      open={visible}
      onCancel={onClose}
      width={900}
      footer={[
        isInstructor ? (
          <Popconfirm
            key="end-meeting"
            title="Are you sure you want to end this meeting?"
            onConfirm={onClose}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              End Meeting
            </Button>
          </Popconfirm>
        ) : (
          <Button key="leave-meeting" onClick={onClose}>
            Leave Meeting
          </Button>
        )
      ]}
      destroyOnClose
      closable={false}
    >
      <div className="relative w-full h-[600px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Spin size="large" tip="Loading meeting..." />
          </div>
        )}
        
        <JitsiMeeting
          roomName={roomName}
          user={user}
          onMeetingEnd={onClose}
          onLoad={() => setLoading(false)}
        />
      </div>
    </Modal>
  );
};

export default MeetingModal;