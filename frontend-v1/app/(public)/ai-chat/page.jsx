"use client";

import { useState, useRef, useEffect } from "react";
import axiosInstance from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { MessageCircle, Send, User } from "lucide-react";
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

export default function AiChatPage() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMarkedLoaded, setIsMarkedLoaded] = useState(false);
    const [isChatStarted, setIsChatStarted] = useState(false);

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isChatStarted]);

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

    return (
        <div className="min-h-[calc(100vh-200px)] px-4 flex items-center justify-center">
            <Card className="w-full h-[80vh] shadow-xl rounded-2xl border dark:border-gray-800 flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                                <MessageCircle className="h-6 w-6 text-blue-600 fill-blue-600" />
                            </div>
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vine AI Support</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Always online</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-gray-50/50 dark:bg-gray-950/50 relative overflow-hidden flex flex-col">
                    {!isChatStarted ? (
                        // Welcome Screen
                        <div className="absolute inset-0 flex items-center justify-center p-6">
                            <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow border dark:border-gray-800 p-8 text-center">
                                <div className="h-20 w-20 bg-blue-600 rounded-full mb-6 mx-auto flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <MessageCircle className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Support</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                    Our AI assistant is here to help you with common questions, account issues, and more.
                                    <br /><br />
                                    By starting this chat, you agree to our Privacy Policy.
                                </p>
                                <Button
                                    onClick={handleStartChat}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-6 text-lg font-medium shadow-md transition-all hover:scale-[1.02]"
                                >
                                    Start Chatting
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Chat Messages
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Initial Greeting */}
                                <div className="flex justify-start">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                        <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-5 py-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] leading-relaxed">
                                        Hi! How can I help you today?
                                    </div>
                                </div>

                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {message.role !== "user" && (
                                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                                <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${message.role === "user"
                                                    ? "bg-blue-600 text-white rounded-br-none"
                                                    : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none"
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
                                        {message.role === "user" && (
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
                                                <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                            <MessageCircle size={16} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
                                            <div className="flex space-x-1.5">
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
                            <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                <form onSubmit={handleSubmit} className="flex w-full gap-3 relative max-w-4xl mx-auto">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="flex-1 min-h-[50px] border-gray-200 dark:border-gray-700 focus-visible:ring-blue-600 bg-gray-50 dark:bg-black dark:text-gray-100 dark:placeholder:text-gray-500 rounded-xl"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="h-[50px] w-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all hover:scale-105"
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </Card>
            <style jsx global>{`
        .prose { color: inherit; }
        .prose a { color: #3b82f6; text-decoration: underline; }
      `}</style>
        </div>
    );
}
