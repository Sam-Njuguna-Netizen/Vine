'use client'

import { useEffect, useState, useRef } from 'react';
import { Modal, Button, Divider } from 'antd';
import { LinkedinOutlined, MailOutlined } from '@ant-design/icons';

export default function MyApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [glowPosition, setGlowPosition] = useState({ x: '50%', y: '50%' });
  const modalRef = useRef(null);

  // Handle Ctrl + Alt + 5 keypress
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.key === '5') {
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle mouse movement within modal
  const handleMouseMove = (e) => {
    if (modalRef.current) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const x = e.clientX - modalRect.left;
      const y = e.clientY - modalRect.top;
      
      // Only update position if cursor is inside modal
      if (x >= 0 && x <= modalRect.width && y >= 0 && y <= modalRect.height) {
        setGlowPosition({
          x: `${(x / modalRect.width) * 100}%`,
          y: `${(y / modalRect.height) * 100}%`
        });
      }
    }
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
        width={400}
        className="[&_.ant-modal-content]:p-0 [&_.ant-modal-content]:overflow-hidden"
      >
        <div 
          ref={modalRef}
          onMouseMove={handleMouseMove}
          className="flex flex-col items-center p-6 relative overflow-hidden"
        >
          {/* Glowing effect that follows the cursor */}
          <div
            className="absolute bg-blue-500 opacity-20 rounded-full pointer-events-none"
            style={{
              width: '120px',
              height: '120px',
              left: glowPosition.x,
              top: glowPosition.y,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.1s ease-out, top 0.1s ease-out',
              filter: 'blur(20px)',
              zIndex: 0,
            }}
          ></div>

          {/* Content with higher z-index */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Profile Avatar with subtle shadow */}
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse"></div>
              <img
                src="https://i.imgur.com/rVwHeP3.jpg"
                alt="Developer"
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg relative"
              />
            </div>

            {/* Name */}
            <p className="text-2xl font-bold mb-1">Bipro Bhowmik Joy</p>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Software Engineer</p>

            {/* Divider */}
            <Divider className="w-16 min-w-0 m-0 border-gray-300 dark:border-gray-600" />

            {/* Contact Info */}
            <div className="w-full mt-6 space-y-3">
              {/* Email */}
              <Button 
                block 
                icon={<MailOutlined />}
                href="mailto:biprobhowmik5@gmail.com"
                className="flex items-center justify-center h-11 hover:!text-blue-500"
              >
                biprobhowmik5@gmail.com
              </Button>

              {/* LinkedIn */}
              <Button 
                block 
                type="primary" 
                icon={<LinkedinOutlined />}
                href="https://www.linkedin.com/in/biprobhowmik0005/"
                target="_blank"
                className="flex items-center justify-center h-11"
              >
                Connect on LinkedIn
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
              Press Ctrl+Alt+5 to open this anytime.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}