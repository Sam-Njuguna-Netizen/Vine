'use client';
import { useEffect, useRef, useState } from 'react';
import axios from '@/app/api/axios';
import moment from 'moment';
import { N } from "@/app/utils/notificationService";
import { useParams } from "next/navigation";
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  User,
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button"; // Assuming you have this from previous steps

export default function SupportChatPage({ backLink = '/' }) {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages load
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!id) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-500">
        <p>Invalid Ticket ID</p>
      </div>
    );
  }

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const payload = { ticketId: id, message: newMsg };
      const response = await axios.post('/api/supportChat', payload);

      if (response.status === 200) {
        setNewMsg('');
        getAllMessages();
        N("Success", `Message sent successfully!`, "success");
      }
    } catch (error) {
      N("Error", error.response?.data?.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const getAllMessages = async () => {
    try {
      const payload = { ticketId: id };
      const response = await axios.post('/api/allSupportChat', payload);

      if (response.status === 200) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllMessages();
    const interval = setInterval(() => {
      getAllMessages();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Link href={backLink}>
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              <ArrowLeft className="w-4 h-4" />
              Back to list
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 flex items-center gap-2">
            Ticket #{id.substring(0, 8)}...
          </h1>
        </div>

        {/* Input Area (Reply Box) */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Post a Reply
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              rows={4}
              placeholder="Type your message here..."
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-gray-400"
            />
            <div className="flex justify-end">
              <Button
                onClick={sendMessage}
                disabled={sending || !newMsg.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
              >
                {sending ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    Post Reply <Send className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-6 pb-12">
          <div className="flex items-center gap-4 py-4">
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Conversation History</span>
            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-600">
              <p>No messages yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-4 group">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {msg.messageSender?.profile?.pPic ? (
                      <img
                        src={msg.messageSender.profile.pPic}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg rounded-tl-none border border-gray-200 dark:border-gray-800 p-4 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {msg.messageSender?.profile?.name || "Unknown User"}
                        </span>
                        {/* Optional: Add an 'Admin' badge logic here if needed */}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap" title={moment(msg.createdAt).format('LLLL')}>
                        {moment(msg.createdAt).fromNow()}
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}