"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import socket from "@/app/utils/socket";
import moment from "moment";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Send,
  ArrowLeft,
  Mic,
  Paperclip,
  Camera,
  Smile,
  MoreHorizontal,
  Phone,
  Video,
  Heart,
  Bell,
  Check,
  CheckCheck,
  Minus,
  X
} from "lucide-react";

// Shadcn UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Child Components ---

const UserListSidebar = React.memo(
  ({
    isMobile,
    selectedUser,
    onlineProfiles,
    chatProfiles,
    onSelectUser,
    onSearch,
  }) => {
    return (
      <div
        className={`
          ${isMobile && selectedUser ? "hidden" : "flex"}
          ${isMobile ? "w-full" : "w-80 md:w-96 flex-shrink-0"}
          flex-col h-full bg-[#5b21b6] text-white
        `}
      >
        {/* Header / Search */}
        <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-white/10 text-white placeholder:text-white/60 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-white/30 text-sm"
            />
          </div>
        </div>

        {/* Online Users (Horizontal) */}
        {onlineProfiles.length > 0 && (
          <div className="px-4 py-4 overflow-x-auto no-scrollbar flex space-x-4">
            {onlineProfiles.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex flex-col items-center space-y-1 cursor-pointer min-w-[60px]"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-white/20">
                    <AvatarImage src={user?.profile?.pPic} />
                    <AvatarFallback className="text-black">{user?.profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-400 border-2 border-[#5b21b6] rounded-full"></span>
                </div>
                <span className="text-xs text-white/90 truncate w-full text-center">
                  {user?.profile?.name?.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Chat List */}
        <ScrollArea className="flex-1 max-md:px-0 px-2">
          <div className="space-y-1 py-2">
            {chatProfiles.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id
                  ? "bg-white/20 backdrop-blur-sm"
                  : "hover:bg-white/10"
                  }`}
              >
                <div className="relative mr-3">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={user?.profile?.pPic} />
                    <AvatarFallback className="text-black">{user?.profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline ">
                    <h3 className="font-semibold text-sm truncate pr-2 text-white">
                      {user?.profile?.name}
                    </h3>
                    <span className="text-[10px] text-white/60 flex-shrink-0">
                      {moment(user.lastMessageTime).format("h:mm A")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-white/70 truncate pr-2">
                      {user.lastMessage || "Start a conversation"}
                    </p>
                    {user.unseen > 0 ? (
                      <Badge className="h-5 w-5 rounded-full bg-green-500 hover:bg-green-600 text-[10px] flex items-center justify-center p-0 border-none text-white">
                        {user.unseen}
                      </Badge>
                    ) : (
                      // Optional: Show checkmarks for sent/read if available in data
                      <CheckCheck className="h-3 w-3 text-white/40" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
);


const ChatWindow = React.memo(
  ({
    isMobile,
    selectedUser,
    onGoBack,
    isTyping,
    messages,
    authUser,
    onSendMessage,
    messageInput,
    onMessageInputChange,
    messagesEndRef,
    messagesContainerRef,
    onlineProfiles,
    onSelectUser,
    onToggleLike,
    onSearchMessages,
    isMuted,
    toggleMute,
    onSendAudio,
    onSendImage,
    onSendFile
  }) => {
    const isOnline = selectedUser && onlineProfiles.some(u => u.id === selectedUser.id);
    const [isRecording, setIsRecording] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSchema, setShowSchema] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Audio Recording Handlers ---
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], "voice_note.webm", { type: 'audio/webm' });
          onSendAudio(audioFile);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        N("Error", "Microphone access denied or not available", "error");
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };

    // --- Search Handler ---
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
      onSearchMessages(e.target.value);
    };

    const toggleSearch = () => {
      setShowSchema(!showSchema)
      if (showSchema) {
        onSearchMessages("") // clear search on close
        setSearchTerm("")
      }
    }


    return (
      <div
        className={`
            ${isMobile && !selectedUser ? "hidden" : "flex"}
            flex-1 flex-col h-full bg-white dark:bg-[#0f172a]
        `}
      >
        {!selectedUser ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <Send className="h-12 w-12 text-gray-300" />
            </div>
            <p className="text-lg font-medium">Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f172a]">
              <div className="flex items-center">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onGoBack}
                    className="mr-2 -ml-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser?.profile?.pPic} />
                    <AvatarFallback>{selectedUser?.profile?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-[#0f172a] rounded-full"></span>
                  )}
                </div>
                <div className="ml-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedUser?.profile?.name}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isTyping ? "Typing..." : isOnline ? "Online" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1 text-gray-400">
                {showSchema && (
                  <div className="mr-2">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Find in chat..."
                      className="bg-gray-100 dark:bg-gray-800 text-sm rounded-full px-3 py-1 focus:outline-none w-32 md:w-48 transition-all"
                    />
                  </div>
                )}
                <Button variant="ghost" size="icon" className={`hover:text-gray-600 ${showSchema ? 'text-blue-500' : ''}`} onClick={toggleSearch}>
                  <Search className="h-5 w-5" />
                </Button>
                {/* Heart Button Removed from Header as it usually applies to messages, not the whole user? Or maybe "Favorite User". Keep for now but maybe no action requested for user favorite. User asked for specific buttons to work. Let's assume generic 'like' or 'favorite' action for user if header button. For chat messages, like is usually per message. Let's make this toggel favorite user for now or disable if no backend. User said "all those work". Let's assume Alert/Bell is Mute. */}
                {/* <Button variant="ghost" size="icon" className="hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button> */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:text-gray-600 ${isMuted ? 'text-red-500' : ''}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <Bell className="h-5 w-5 fill-current" /> : <Bell className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#0f172a]"
            >
              {/* Date Separator Example */}
              <div className="flex items-center justify-center my-4">
                <div className="h-px bg-gray-200 dark:bg-gray-800 w-full max-w-[100px]"></div>
                <span className="px-3 text-xs text-gray-400 font-medium">Today</span>
                <div className="h-px bg-gray-200 dark:bg-gray-800 w-full max-w-[100px]"></div>
              </div>

              {messages.map((msg, index) => {
                const isMe = msg.sender === authUser?.id;
                return (
                  <div
                    key={index}
                    className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarImage src={selectedUser?.profile?.pPic} />
                        <AvatarFallback>{selectedUser?.profile?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%]`}>
                      {/* Audio Message */}
                      {msg.type === 'audio' ? (
                        <div className={`p-2 rounded-2xl shadow-sm ${isMe ? "bg-[#3b82f6] rounded-br-none" : "bg-[#e0e7ff] dark:bg-gray-800 rounded-bl-none"}`}>
                          <audio controls src={msg.fileUrl} className="max-w-[200px] h-8" />
                        </div>
                      ) : msg.type === 'image' ? (
                        <div className={`p-2 rounded-2xl shadow-sm ${isMe ? "bg-[#3b82f6] rounded-br-none" : "bg-[#e0e7ff] dark:bg-gray-800 rounded-bl-none"}`}>
                          <img src={msg.fileUrl} alt="Image" className="max-w-[250px] rounded-lg cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                        </div>
                      ) : msg.type === 'file' ? (
                        <div className={`px-5 py-3 rounded-2xl shadow-sm flex items-center gap-2 ${isMe ? "bg-[#3b82f6] text-white rounded-br-none" : "bg-[#e0e7ff] dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"}`}>
                          <Paperclip className="h-4 w-4" />
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-[150px]">
                            Download File
                          </a>
                        </div>
                      ) : (
                        /* Text Message */
                        <div
                          className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${isMe
                            ? "bg-[#3b82f6] text-white rounded-br-none"
                            : "bg-[#e0e7ff] dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
                            }`}
                        >
                          {msg.message}
                          {/* Like Overlay / Button */}
                          <button
                            onClick={() => onToggleLike(msg, index)}
                            className={`absolute -bottom-2 ${isMe ? '-left-2' : '-right-2'} p-1 bg-white dark:bg-gray-700 rounded-full shadow-sm opacity-0 group-hover:opacity-100 ${msg.isLiked ? 'opacity-100 text-red-500' : 'text-gray-400 hover:text-red-500'} transition-all`}
                          >
                            <Heart className={`w-3 h-3 ${msg.isLiked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      )}
                      {/* Status / Time */}
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {moment(msg.createdAt).format("LT")}
                        </span>
                        {isMe && (
                          msg.isSeen ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-gray-300" />
                        )}
                      </div>
                    </div>

                    {isMe && (
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarImage src={authUser?.profile?.pPic} />
                        <AvatarFallback>Me</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#eef2ff] dark:bg-gray-900/50">
              <div className="bg-white dark:bg-gray-800 rounded-full flex items-center px-2 py-2 shadow-sm border border-gray-100 dark:border-gray-700">

                {/* Record Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full max-md:hidden ${isRecording ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-gray-600'}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <Mic className="h-5 w-5" />
                </Button>

                <input
                  type="text"
                  value={isRecording ? "Recording..." : messageInput}
                  onChange={onMessageInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                  placeholder={isRecording ? "" : "Write Something..."}
                  disabled={isRecording}
                  className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
                />

                <div className="flex items-center space-x-1 mr-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) onSendFile(e.target.files[0]);
                      e.target.value = null;
                    }}
                  />
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) onSendImage(e.target.files[0]);
                      e.target.value = null;
                    }}
                  />
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8" onClick={() => imageInputRef.current?.click()}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={onSendMessage}
                  size="icon"
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white rounded-full h-10 w-10 shadow-md transition-all hover:scale-105"
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

export default function Messenger() {
  const authUser = useSelector((state) => state.auth.user);
  const onlineProfiles = useSelector((state) => state.auth.onlineProfiles);
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // All fetched messages
  const [filteredMessages, setFilteredMessages] = useState([]); // Filtered view
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatProfiles, setChatProfiles] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Local mute state

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const searchParams = useSearchParams();

  // Initialize filteredMessages whenever messages change
  useEffect(() => {
    setFilteredMessages(messages);
  }, [messages]);

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "instant",
        block: "end",
      });
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("chat-open");
    return () => {
      document.body.classList.remove("chat-open");
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      getChatProfiles(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    getChatProfiles();
    const userIdFromParams = searchParams.get("userId");
    if (userIdFromParams) {
      fetchInitialUser(userIdFromParams);
    }
  }, [searchParams]);

  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      if (selectedUser?.id === msg.sender && authUser?.id === msg.receiver) {
        setMessages((prev) => [...prev, msg]);
        markMessagesAsSeen(selectedUser);
      } else if (authUser?.id === msg.receiver) {
        setChatProfiles((prev) =>
          prev.map((p) =>
            p.id === msg.sender
              ? {
                ...p,
                unseen: (p.unseen || 0) + 1,
                lastMessage: msg.message || (msg.type === 'audio' ? 'Voice Message' : msg.type === 'image' ? 'Image' : 'File'),
                lastMessageTime: msg.createdAt,
              }
              : p
          )
        );
      }
    };

    const handleMessageSeen = (msg) => {
      // ... (existing logic)
      setMessages((prev) => prev.map((m) => ({ ...m, isSeen: 1 })));
    };

    const handleMessageLiked = ({ messageId, isLiked, sender, receiver }) => {
      // Update generic like state for real-time
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isLiked: isLiked } : m));
    }

    const handleTyping = (data) => {
      if (data.receiver === authUser?.id && data.sender === selectedUser?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("messageLiked", handleMessageLiked);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messageLiked", handleMessageLiked);
      socket.off("typing", handleTyping);
    };
  }, [selectedUser, authUser]);

  useEffect(() => {
    if (filteredMessages.length > 0) {
      // Logic for scroll to bottom (existing)
      // ... (existing logic)
    }
  }, [filteredMessages, scrollToBottom]);

  // ... (fetchInitialUser, getChatProfiles existing)
  const fetchInitialUser = async (id) => {
    try {
      const res = await axios.get(`/api/users/${id}`);
      if (res.data) {
        handleSelectUser(res.data);
      }
    } catch (error) {
      //   N("Error", "Could not fetch user details.", "error");
    }
  };

  const getChatProfiles = async (query = "") => {
    try {
      const res = await axios.post("/api/getChatProfiles", { search: query });
      setChatProfiles(res.data);
    } catch (error) {
      //   N("Error", "Failed to fetch chat list.", "error");
    }
  };


  const handleSelectUser = async (user) => {
    if (selectedUser?.id === user.id) return;

    setSelectedUser(user);
    setMessages([]);

    try {
      const res = await axios.post("/api/getMessage", { sender: user?.id });
      const newMessages = res.data.messages || [];
      setMessages(newMessages);

      if (newMessages.length > 0) {
        setTimeout(() => scrollToBottom(false), 200);
      }

      markMessagesAsSeen(user);
    } catch (error) {
      N("Error", "Failed to fetch messages.", "error");
    }
  };

  const markMessagesAsSeen = async (user) => {
    // ... (existing logic)
    try {
      await axios.post("/api/markAsSeen", { sender: user.id });
      socket.emit("markAsSeen", { sender: authUser.id, receiver: user.id });
      setChatProfiles((prev) =>
        prev.map((p) => (p.id === user.id ? { ...p, unseen: 0 } : p))
      );
    } catch (error) {
      console.error("Failed to mark messages as seen:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    const messageData = {
      message: message.trim(),
      receiver: selectedUser.id,
      sender: authUser?.id,
      createdAt: new Date().toISOString(),
      type: 'text',
      isSeen: false,
      isLiked: false,
    };

    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    socket.emit("sendMessage", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessage("");
    setTimeout(() => scrollToBottom(true), 50);

    try {
      await axios.post("/api/sendMessage", {
        message: messageData.message,
        receiver: messageData.receiver,
        type: 'text'
      });
    } catch (error) {
      N("Error", "Message failed to send.", "error");
    }
  };

  const handleSendAudio = async (audioFile) => {
    if (!selectedUser) return;

    // Optimistic Update
    const messageData = {
      message: "", // Empty for audio? or use placeholder
      fileUrl: URL.createObjectURL(audioFile), // Temporary Blob URL
      receiver: selectedUser.id,
      sender: authUser?.id,
      createdAt: new Date().toISOString(),
      type: 'audio',
      isSeen: false,
      isLiked: false,
    };

    setMessages((prev) => [...prev, messageData]);

    // Upload Logic
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('folder', 'chat-audio');

    try {
      const uploadRes = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const publicUrl = uploadRes.data.publicUrl;

        // Backend Send Message
        await axios.post("/api/sendMessage", {
          message: "",
          receiver: selectedUser.id,
          type: 'audio',
          fileUrl: publicUrl
        });

        // Emit Socket (with real URL)
        socket.emit("sendMessage", { ...messageData, fileUrl: publicUrl });
      }

    } catch (err) {
      N("Error", "Failed to send audio.", "error");
      console.error(err);
    }
  }

  const handleSendFileGeneric = async (file, type) => {
    if (!selectedUser) return;

    // Optimistic Update
    const messageData = {
      message: "",
      fileUrl: URL.createObjectURL(file),
      receiver: selectedUser.id,
      sender: authUser?.id,
      createdAt: new Date().toISOString(),
      type: type,
      isSeen: false,
      isLiked: false,
    };

    setMessages((prev) => [...prev, messageData]);
    setTimeout(() => scrollToBottom(true), 50);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `chat-${type}s`);

    try {
      const uploadRes = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success) {
        const publicUrl = uploadRes.data.publicUrl;

        await axios.post("/api/sendMessage", {
          message: "",
          receiver: selectedUser.id,
          type: type,
          fileUrl: publicUrl
        });

        socket.emit("sendMessage", { ...messageData, fileUrl: publicUrl });
      }
    } catch (err) {
      N("Error", `Failed to send ${type}.`, "error");
    }
  }

  const handleSendImage = (file) => handleSendFileGeneric(file, 'image');
  const handleSendFile = (file) => handleSendFileGeneric(file, 'file');


  const handleMessageInputChange = (e) => {
    setMessage(e.target.value);
    if (selectedUser) {
      socket.emit("typing", {
        receiver: selectedUser.id,
        sender: authUser?.id,
      });
    }
  };

  // --- New Feature Handlers ---

  const handleToggleLike = async (msg, index) => {
    if (!msg.id) return; // Can't like optimistic messages without ID yet

    // Optimistic
    const newIsLiked = !msg.isLiked;
    setMessages(prev => prev.map((m, i) => i === index ? { ...m, isLiked: newIsLiked } : m));

    try {
      await axios.post('/api/toggleLike', { messageId: msg.id });
      // Socket emit handles real-time update for other user
    } catch (err) {
      // Revert on fail
      setMessages(prev => prev.map((m, i) => i === index ? { ...m, isLiked: !newIsLiked } : m));
      N("Error", "Failed to like message", "error");
    }
  };

  const handleSearchMessages = (term) => {
    if (!term) {
      setFilteredMessages(messages);
      return;
    }
    const lower = term.toLowerCase();
    const filtered = messages.filter(m => m.message && m.message.toLowerCase().includes(lower));
    setFilteredMessages(filtered);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    N("Success", !isMuted ? "Notifications muted for this chat" : "Notifications enabled", "success");
  }

  return (
    <div className="flex max-md:h-[calc(100vh-12rem)] max-md:p-0 max-md:rounded-none m-[2em] max-md:m-0 rounded-[2em] h-[75vh] overflow-hidden bg-white dark:bg-[#0f172a]">
      <UserListSidebar
        isMobile={isMobile}
        selectedUser={selectedUser}
        onlineProfiles={onlineProfiles}
        chatProfiles={chatProfiles}
        onSelectUser={handleSelectUser}
        onSearch={setSearchQuery}
      />
      <ChatWindow
        isMobile={isMobile}
        selectedUser={selectedUser}
        onGoBack={() => setSelectedUser(null)}
        isTyping={isTyping}
        messages={filteredMessages}
        authUser={authUser}
        onSendMessage={handleSendMessage}
        messageInput={message}
        onMessageInputChange={handleMessageInputChange}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        onlineProfiles={onlineProfiles}
        onSelectUser={handleSelectUser}
        // New Props
        onToggleLike={handleToggleLike}
        onSearchMessages={handleSearchMessages}
        isMuted={isMuted}
        toggleMute={toggleMute}
        onSendAudio={handleSendAudio}
        onSendImage={handleSendImage}
        onSendFile={handleSendFile}
      />
    </div>
  );
}
