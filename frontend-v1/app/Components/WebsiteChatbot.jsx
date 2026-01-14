"use client";

import { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { MessageCircle, X, Send, Minus } from "lucide-react"; // Removed unused imports
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

// MDX Renderer Component
const MdxRenderer = ({ content }) => {
  if (typeof window !== "undefined" && window.marked) {
    const rawMarkup = window.marked.parse(content || "");
    return (
      <div
        dangerouslySetInnerHTML={{ __html: rawMarkup }}
        className="prose dark:prose-invert prose-sm max-w-none prose-p:text-gray-800 dark:prose-p:text-gray-200"
      />
    );
  }
  return <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{content}</div>;
};

export default function WebsiteChatbot({ isOpen: externalIsOpen, toggleChat: externalToggleChat }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  const toggleChat = () => {
    if (isControlled) {
      externalToggleChat?.();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
    setIsMinimized(false);
  };
  const [isChatStarted, setIsChatStarted] = useState(false);
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkedLoaded, setIsMarkedLoaded] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !window.marked) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
      script.async = true;
      script.onload = () => setIsMarkedLoaded(true);
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else if (window.marked) {
      setIsMarkedLoaded(true);
    }
  }, []);

  // Viewport fix for iOS keyboard
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      );
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "viewport";
      newMeta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
      document.head.appendChild(newMeta);
    }
    return () => {
      if (meta) {
        meta.setAttribute("content", "width=device-width, initial-scale=1");
      }
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatStarted]);



  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleStartChat = () => {
    setIsChatStarted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axiosInstance.post("/chatbot/ask", {
        messages: [...messages, userMessage],
      });

      const assistantResponse = res.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-assistant",
          ...assistantResponse,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: "error-message",
          role: "assistant",
          content: "Sorry, I ran into an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const path = usePathname();
  const isMessenger = path === "/social/messenger";
  const isHome = path === "/";
  const bottomClass = isMessenger
    ? ""
    : isHome
      ? "max-md:bottom-[2em]"
      : "max-md:bottom-[7em]";
  const hide = isMessenger ? "hidden" : "";

  return (
    <>
      {/* Floating Chat Button */}
      {/* {!isOpen && (
        <Button
          onClick={toggleChat}
          // FIX: Added 'translate-z-0' to force hardware acceleration on iOS
          // FIX: Increased z-index to 9998 to be safe
          className={`fixed ${!isMobile ? bottomClass : ""} ${isMobile ? "top-5 left-[29%]" : "right-6 bottom-6"
            } h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-[#5b21b6] hover:bg-[#4c1d95] z-[9998] flex items-center justify-center border border-white/20 transform-gpu ${hide}`}
          size="icon"
        >
          <div className="flex flex-col items-center justify-center">
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="text-[10px] font-bold text-white">AI</span>
          </div>
        </Button>
      )} */}

      {/* Chat Interface */}
      {isOpen && (
        // FIX: Added 'translate-z-0' here as well.
        // FIX: Ensure z-index is higher than the button
        <div className="fixed inset-0 z-[9999] transform-gpu sm:inset-auto sm:bottom-6 sm:right-6 flex items-end sm:items-start justify-center sm:justify-end pointer-events-none">
          <Card
            className={`pointer-events-auto shadow-2xl transition-all duration-300 w-full rounded-t-2xl sm:rounded-2xl sm:w-[380px] bg-white dark:bg-slate-950 border-none overflow-hidden flex flex-col ${isMinimized ? "h-16" : "h-[100dvh] sm:h-[550px]"
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              </div>
              <h3 className="text-gray-700 dark:text-slate-200 font-medium">Chat with us!</h3>
              <div className="flex items-center gap-2 text-gray-400 dark:text-slate-400">
                <button onClick={toggleMinimize} className="hover:text-gray-600 dark:hover:text-slate-200">
                  <Minus className="h-5 w-5" />
                </button>
                <button onClick={toggleChat} className="hover:text-gray-600 dark:hover:text-slate-200">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Agent Info */}
                <div className="px-6 py-4 bg-white dark:bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-slate-900 flex items-center justify-center border border-gray-100 dark:border-slate-800">
                        <MessageCircle className="h-6 w-6 text-blue-600 fill-blue-600" />
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Vine</h2>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Support Agent</p>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50/50 dark:bg-slate-900/50 relative overflow-hidden flex flex-col">
                  {!isChatStarted ? (
                    // Welcome Screen
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <Card className="w-full max-w-xs shadow-sm border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <CardContent className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
                          <div className="h-16 w-16 bg-blue-600 rounded-full mb-6 flex items-center justify-center">
                            <MessageCircle className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-gray-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                            Hello Nice to see you here! By pressing the "Start chat" button you agree to have your personal data processed as described in our Privacy Policy
                          </p>
                          <Button
                            onClick={handleStartChat}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 text-base font-medium"
                          >
                            Start chat
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    // Chat Messages
                    <>
                      {/* FIX: Added 'overscroll-contain' to prevent body scrolling on iOS when hitting top/bottom of chat */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
                        {/* Initial Greeting */}
                        <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none text-sm shadow-sm max-w-[85%]">
                            Hi! How can I help you today?
                          </div>
                        </div>

                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === "user"
                              ? "justify-end"
                              : "justify-start"
                              }`}
                          >
                            <div
                              className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${message.role === "user"
                                ? "bg-blue-600 text-white rounded-br-none"
                                : "bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-gray-800 dark:text-slate-200 rounded-tl-none"
                                }`}
                            >
                              {message.role === "assistant" && isMarkedLoaded ? (
                                <MdxRenderer content={message.content} />
                              ) : (
                                <div className="whitespace-pre-wrap">
                                  {message.content}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 text-gray-800 p-4 rounded-2xl rounded-tl-none text-sm shadow-sm">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="flex w-full space-x-2 relative">
                          <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Write a message..."
                            className="flex-1 pr-10 border-gray-200 dark:border-slate-800 focus-visible:ring-blue-600 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 ios-input-fix"
                            disabled={isLoading}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-1 top-1 h-8 w-8 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-blue-600 shadow-none"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="py-2 text-center bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    Powered by <span className="font-semibold text-gray-600 dark:text-slate-300">Vine</span>
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
      <style jsx global>{`
        .prose { color: inherit; }
        .prose a { color: #3b82f6; text-decoration: underline; }
        .ios-input-fix { font-size: 16px !important; }
      `}</style>
    </>
  );
}