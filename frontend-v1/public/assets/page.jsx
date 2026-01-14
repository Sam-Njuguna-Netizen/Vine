'use client';
import { useEffect, useRef, useState } from 'react';
import {
    Input, Avatar, List, Button, Badge, Typography, Drawer

} from 'antd';
import {
    SearchOutlined, SendOutlined, MenuOutlined, ArrowLeftOutlined
    , PlusOutlined, SettingOutlined
} from '@ant-design/icons';
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { useSelector } from "react-redux";
import socket from "@/app/utils/socket";
import moment from 'moment';
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from 'next/navigation'
import Link from 'next/link';

const { Text } = Typography;

export default function Messenger() {
    const { darkMode } = useTheme();
    const authUser = useSelector((state) => state.auth.user);
    const onlineProfiles = useSelector((state) => state.auth.onlineProfiles);
    const isMobile = useSelector((state) => state.commonGLobal.isMobile);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatProfiles, setChatProfiles] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false); // State for sidebar visibility
    const [showChatWindow, setShowChatWindow] = useState(false); // State to toggle between user list and chat window
    const [searchUser, setSearchUser] = useState(false); // State to toggle between user list and chat window
    const messagesEndRef = useRef(null);
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchData = async () => {
          const id = searchParams.get('userId');
          if (id) {
            try {
              const res = await axios.get(`/api/users/${id}`);
              if (res.data) {
                getMessages(res.data);
              }
            } catch (error) {
              N("Error", error?.response?.data?.message, "error");
              if (error?.response?.data?.errors?.length) {
                N("Error", error.response.data.errors[0].message, "error");
              }
            }
          }
        };
      
        fetchData(); // call the async function
      }, [searchParams]);
      

    useEffect(() => {
        getChatProfiles();
    }, []);

    const getChatProfiles = async () => {
        try {
            const res = await axios.post("/api/getChatProfiles");
            if (res.data) {
                setChatProfiles(res.data);
            }
        } catch (error) {
            N("Error", error?.response?.data?.message, "error");
            if (error?.response?.data?.errors?.length) {
                N("Error", error.response.data.errors[0].message, "error");
            }
        }
    };

    const handleSearchPeople = async () => {
        try {
            const res = await axios.post('/api/searchUserChatlist', { search });
            if (res.data) {
                setUserList(res.data);
            }
        } catch (error) {
            console.error("Error searching users:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        const messageData = { message: message.trim(), receiver: selectedUser.id };

        socket.emit("sendMessage", messageData);
        setMessages(prev => [...prev, { ...messageData, sender: authUser?.id }]);
        setMessage('');

        try {
            await axios.post('/api/sendMessage', messageData);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const getMessages = async (user) => {
        setSelectedUser(user);
        markMessagesAsSeen(user);
        setIsSidebarVisible(false); // Close sidebar on mobile when a user is selected
        setShowChatWindow(true); // Show chat window on mobile
        try {
            const res = await axios.post('/api/getMessage', { sender: user?.id });
            if (res.data) setMessages(res.data.messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const markMessagesAsSeen = async (user) => {
        await axios.post("/api/markAsSeen", { sender: user.id });
    };

    const handleTyping = () => {
        socket.emit("typing", { receiver: selectedUser.id, sender: authUser?.id });
    };

    useEffect(() => {
        socket.on("receiveMessage", (msg) => {
            if (selectedUser?.id === msg.sender && authUser?.id === msg.receiver) {
                setMessages(prev => [...prev, msg]);
            } else if (authUser?.id === msg.receiver) {
                setUserList((prevList) =>
                    prevList.map((user) =>
                        user.id === msg.sender
                            ? { ...user, unseen: [...(user.unseen || []), msg] }
                            : user
                    )
                );
            }
        });

        socket.on("messageSeen", (msg) => {
            if (authUser?.id === msg.sender && selectedUser?.id === msg.receiver) {
                setMessages(prevMessages => {
                    const updatedMessages = [...prevMessages];
                    for (let i = updatedMessages.length - 1; i >= 0; i--) {
                        if (updatedMessages[i].sender === msg.sender) {
                            updatedMessages[i] = { ...updatedMessages[i], isSeen: 1 };
                            break;
                        }
                    }
                    return updatedMessages;
                });
            }
        });

        socket.on("typing", (data) => {
            if (data.receiver === authUser?.id) {
                setIsTyping(true);
                setTypingUser(data.sender);
                setTimeout(() => {
                    setIsTyping(false);
                    setTypingUser(null);
                }, 2000);
            }
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("typing");
        };
    }, [selectedUser]);

    useEffect(() => {
        handleSearchPeople();
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);



    return (
        <div className={`flex h-[calc(100vh-64px)] ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
            
            {/* Sidebar for Desktop */}
            <div className={`hidden md:block w-1/4 ${darkMode ? "bg-gray-950 border-gray-900" : "bg-white border-gray-200"} border-r flex flex-col`}>
            <div className="overflow-x-auto whitespace-nowrap px-4 py-3 ">
                                <div className="flex space-x-4">
                                    {onlineProfiles.map((user) => (
                                        <div onClick={() => getMessages(user)} key={user.id} className="flex flex-col items-center">
                                            <div className="relative">
                                                <Avatar className="w-20 h-20" src={user?.profile?.pPic} />
                                                {/* {user.online && ( */}
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2"></span>
                                                {/* )} */}
                                            </div>
                                            <Text className="text-sm truncate w-16 text-center">{user?.profile?.name}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                <div className={`p-4 ${darkMode ? "bg-gray-950 border-gray-900" : "bg-white border-gray-200"} `}>
                    <div className="flex">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onPressEnter={handleSearchPeople}
                            className={`${darkMode ? "bg-gray-900 text-white" : "bg-white"} flex-1`}
                            prefix={<SearchOutlined className={darkMode ? "text-white" : ""} />}
                        />
                        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearchPeople} className="ml-2 bg-[#C106FE]">
                            Search
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <List
                        dataSource={userList}
                        renderItem={(user) => (
                            <List.Item
                                className={`p-4 cursor-pointer ${darkMode ? 'hover:bg-gray-600 bg-gray-950' : 'hover:bg-gray-100'} transition-all ${selectedUser?.id === user?.id && darkMode ? 'bg-gray-500' : 'bg-blue-50'
                                    }`}
                                onClick={() => getMessages(user)}
                            >
                                <List.Item.Meta
                                    avatar={<Badge dot={user?.unseen?.length > 0} color="blue">
                                        <Avatar src={user?.profile?.pPic} className={darkMode ? "border-gray-800 w-20 h-20" : "w-20 h-20"} />
                                    </Badge>}
                                    title={<Text strong className={darkMode ? "text-white" : ""}>{user?.profile?.name}</Text>}
                                    description={
                                        <Text type="secondary" className={darkMode ? "text-gray-400" : ""}>
                                            {user?.unseen?.length > 0 ? `(${user.unseen.length}) new messages` : (user?.sentMessages[0]?.message || user?.receiveMessages[0]?.message).substring(0, 15)}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-full md:w-3/4 flex flex-col mb-10">
                {/* Mobile Back Button */}
                {isMobile && showChatWindow && (
                    <div className={`p-4 ${darkMode ? "bg-gray-950 border-gray-900" : "bg-white border-gray-200"}  flex items-center`}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => setShowChatWindow(false)}
                            className="mr-2"
                        />
                        <Link href={`/profile/${selectedUser.id}`} className="flex items-center">
  <Avatar className="w-20 h-20" src={selectedUser?.profile?.pPic} />
  <div className="ml-4">
    <div className="font-semibold">{selectedUser?.profile?.name}</div>
  </div>
</Link>

                    </div>
                )}

                {/* Chat Messages */}
                {(!isMobile || showChatWindow) && (
                    <div>
                        {selectedUser && !isMobile && (
                            <Link href={`/profile/${selectedUser.id}`}>
                            <div className={`p-4 ${darkMode ? "bg-gray-950 border-gray-900" : "bg-white border-gray-200"}  flex items-center`}>
                                <Avatar className='w-20 h-20' src={selectedUser?.profile?.pPic} />
                                <div className="ml-4">
                                    <div className="font-semibold">{selectedUser?.profile?.name}</div>
                                    {/* <div className="text-sm text-gray-500">
                                        {isTyping && typingUser === selectedUser.id ? 'Typing...' : 'Online'}
                                    </div> */}
                                </div>
                            </div>
                            </Link>
                        )}

                        <div className="flex-1 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 160px)' }}>
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === authUser?.id ? 'justify-end' : 'justify-start'} mb-2`}>
                                    <div
                                        className={`max-w-xs p-3 rounded-lg ${msg.sender === authUser?.id
                                            ? 'bg-[#C106FE] text-white'
                                            : darkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        {msg.message}  {msg.sender === authUser?.id && (messages.length) - 1 === index && (msg.isSeen ? '(Seen)' : '(Unseen)')}
                                        <div className={`text-xs mt-1 ${msg.sender === authUser?.id
                                            ? ' text-white'
                                            : darkMode ? 'text-gray-400' : 'text-gray-900'
                                            }`}>{moment(msg.createdAt).format('LT')}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                    </div>


                )}

                {/* Message Input */}
                {(!isMobile || showChatWindow) && selectedUser && (
                    // <div className={isMobile ? (darkMode ? "fixed bottom-[80px] w-full pb-1 bg-gray-900" : "pb-1 border-t bg-gray-50") : (darkMode ? "p-4 bg-gray-900" : "p-4 border-t bg-gray-50")}>
                    <div className={isMobile ? `z-[100] h-[60px] fixed bottom-0 left-0 right-0 border-t md:hidden pt-4 pb-4 ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                    }` : (darkMode ? "p-4 bg-gray-900" : "p-4 border-t bg-gray-50")}>
                        <div className="flex items-center">
                            <Input
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    handleTyping();
                                }}
                                onPressEnter={handleSendMessage}
                                className="flex-1 px-4 py-2 rounded-full border focus:outline-none"
                            />
                            <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} className="ml-2 bg-[#C106FE]">
                                Send
                            </Button>
                        </div>
                    </div>
                )}

                {(
                    isMobile && !showChatWindow && (
                        <div className="flex flex-col h-screen">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 ">
                                {/* <MenuOutlined className="text-white text-xl cursor-pointer" /> */}
                                <p className="text-lg font-bold">Chat</p>
                                <div className="flex space-x-4">
                                    {/* <PlusOutlined className="text-white text-xl cursor-pointer" /> */}
                                    <SearchOutlined onClick={() => { setSearchUser(!searchUser) }} className="text-xl cursor-pointer" />
                                    {/* <SettingOutlined className="text-white text-xl cursor-pointer" /> */}
                                </div>
                            </div>

                            {/* Active Users - Horizontal Scroll */}
                            <div className="overflow-x-auto whitespace-nowrap px-4 py-3 ">
                                <div className="flex space-x-4">
                                    {onlineProfiles.map((user) => (
                                        <div onClick={() => getMessages(user)} key={user.id} className="flex flex-col items-center">
                                            <div className="relative">
                                                <Avatar className="w-20 h-20" src={user?.profile?.pPic} />
                                                {/* {user.online && ( */}
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2"></span>
                                                {/* )} */}
                                            </div>
                                            <Text className="text-sm truncate w-16 text-center">{user?.profile?.name}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Search Bar */}
                            {searchUser && <div className="p-4 ">
                                <div className="flex">
                                    <Input
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onPressEnter={handleSearchPeople}
                                        className="flex-1 border-none"
                                        prefix={<SearchOutlined />}
                                    />
                                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearchPeople} className="ml-2 bg-[#C106FE]">
                                        Search
                                    </Button>
                                </div>
                            </div>}

                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto">
                                <List
                                    dataSource={userList}
                                    renderItem={(user) => (
                                        <List.Item
                                            className={`p-4 cursor-pointer transition-all ${darkMode ? "bg-gray-900 hover:bg-gray-800" : "bg-gray-100 hover:bg-gray-200"
                                                }`}
                                            onClick={() => getMessages(user)}
                                        >
                                            <List.Item.Meta
                                                avatar={
                                                    <Badge dot={user?.unseen?.length > 0} color="blue">
                                                        <Avatar className="w-20 h-20" src={user?.profile?.pPic} />
                                                    </Badge>
                                                }
                                                title={<Text strong className={`${darkMode ? "text-white" :"text-black"}`}>{user?.profile?.name}</Text>}
                                                description={
                                                    <Text type="secondary" className={`${darkMode ? "text-white" :"text-black"}`}>
                                                        {user?.unseen?.length > 0
                                                            ? `(${user.unseen.length}) new messages`
                                                            : (user?.sentMessages[0]?.message || user?.receiveMessages[0]?.message).substring(0, 15)}
                                                    </Text>
                                                }
                                            />
                                            <span className="text-gray-500 text-xs">{user?.lastMessageTime}</span>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}