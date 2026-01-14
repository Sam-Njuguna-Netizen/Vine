"use client";
// The fix is to add useState and useEffect here
import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import JitsiRoom from "./JitsiRoom"; // Assuming JitsiRoom is in the same directory

// Reusable Button
const Button = ({ children, onClick, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`text-xs px-2 py-1 rounded-md text-white font-semibold transition-colors ${className}`}
  >
    {children}
  </button>
);

const JitsiMeetingModal = ({
  isOpen,
  meetingData,
  user,
  isAdmin,
  onClose,
  onMakeOpen,
  onCloseMeeting,
}) => {
  const [loading, setLoading] = useState(true);
  const [confirmingClose, setConfirmingClose] = useState(false);
  console.log("meeting data", meetingData);
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setConfirmingClose(false); // Reset confirmation state when modal opens
    }
  }, [isOpen]);

  if (!isOpen || !meetingData) return null;

  // --- MODIFICATION: This function is now called automatically ---
  // It's triggered by JitsiRoom when the admin successfully becomes a moderator.
  const handleModeratorJoined = () => {
    if (!meetingData.isStarted) {
      onMakeOpen();
    }
  };

  // --- MODIFICATION: This handles the hang-up action ---
  const handleMeetingEnd = () => {
    if (isAdmin) {
      // If the user is an admin, ask for confirmation before ending the meeting for everyone
      setConfirmingClose(true);
    } else {
      // For students, just close the modal immediately
      onClose();
    }
  };

  const renderFooter = () => {
    // --- MODIFICATION: Simplified footer logic ---
    if (isAdmin) {
      if (confirmingClose) {
        return (
          <div className="flex items-center justify-end space-x-2 w-full">
            <span className="text-sm text-gray-700">
              End the meeting for everyone?
            </span>
            {/* "No" just closes the modal, leaving the meeting running */}
            <button
              onClick={onClose}
              className="text-sm px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              No, Just Leave
            </button>
            {/* "Yes" calls the backend to close the meeting for all */}
            <button
              onClick={onCloseMeeting}
              className="text-sm px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600"
            >
              Yes, End for All
            </button>
          </div>
        );
      }
      // The "Open for Students" button is no longer needed here.
      return (
        <div className="flex items-center justify-end w-full">
          <Button
            onClick={handleMeetingEnd}
            className="bg-red-500 hover:bg-red-600"
          >
            End Meeting
          </Button>
        </div>
      );
    } else {
      // Students only have the option to leave
      return (
        <Button onClick={onClose} className="bg-gray-500 hover:bg-gray-600">
          Leave Meeting
        </Button>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col overflow-hidden">
        <div className="bg-gray-100 p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 text-center">
            {meetingData.title}
          </h2>
        </div>
        <div className="w-full h-[75vh] relative bg-gray-900">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <LoaderCircle
                className="animate-spin text-indigo-400"
                size={48}
              />
              <p className="mt-4 text-lg">Joining class, please wait...</p>
            </div>
          )}
          <JitsiRoom
            roomName={meetingData.meetingUrl}
            // --- MODIFICATION: Pass all the new props ---
            password={meetingData.password} // The password from your API
            user={user}
            isAdmin={isAdmin}
            jitsiConfig={meetingData.jitsiConfig}
            onLoad={() => setLoading(false)}
            onMeetingEnd={handleMeetingEnd} // Connect to the new handler
            onModeratorJoined={handleModeratorJoined} // Connect to the new handler
          />
        </div>
        <div className="p-4 bg-gray-100 flex justify-end">
          {/* Only show the footer once the meeting is loaded to prevent premature actions */}
          {!loading && renderFooter()}
        </div>
      </div>
    </div>
  );
};

export default JitsiMeetingModal;
