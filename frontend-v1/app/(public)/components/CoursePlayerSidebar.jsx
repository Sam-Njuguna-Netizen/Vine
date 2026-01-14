"use client";

import React from 'react';
import {
    PlayCircle,
    FileText,
    File,
    AlignLeft,
    Type,
    CheckCircle2,
    Lock,
    CheckCircle,
    Check,
    Clock
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CoursePlayerSidebar = ({ sections: withDurationOfSection, activeContent, onContentSelect, onProgressUpdate, progress, totalLectures = "0", duration = "0" }) => {
    console.log(withDurationOfSection)
    const sections = withDurationOfSection.map(section => {
        const totalDuration = section.lectures.reduce((total, lecture) => {
            const videoContent = lecture.content.find(content => content.type === 'video');
            if (videoContent) {
                const duration = videoContent.contentData.duration;
                const [hours, minutes] = duration?.split(':').map(Number) || [0, 0];
                return total + (hours * 60 + minutes);
            }
            return total;
        }, 0); //seconds
        // const totalDuration = 12000 //seconds
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = totalDuration % 60;

        // 2. Helper to add leading zeros (e.g., "5" becomes "05")
        const pad = (num) => num.toString().padStart(2, '0');

        return {
            ...section,
            // 3. Construct the string: HH:MM:SS
            duration: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
        };
    });
    const isCompleted = (content) => {
        return content.progress && content.progress.length > 0 && content.progress[0].isCompleted;
    };

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircle className="h-4 w-4" />;
            case 'file': return <File className="h-4 w-4" />;
            case 'captions': return <Type className="h-4 w-4" />;
            case 'desc': return <AlignLeft className="h-4 w-4" />;
            case 'notes': return <FileText className="h-4 w-4" />;
            default: return <File className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex flex-col h-full  ">
            <div className="p-4 ">
                <div className="flex items-center text-[#e1cb9e] justify-between">
                    <h3 className=" text-2xl text-[#1D2026] dark:text-white font-bold mb-1">Course Content</h3>
                    <div className="flex items-center gap-2 font-bold">
                        <span>{progress}% Completed</span>
                    </div>
                </div>
                {/* Progress bar could go here */}
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-[#701A75] to-[#1E40AF] h-full  transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <Accordion type="multiple" defaultValue={sections?.map(s => s.id.toString()) || []} className="w-full">
                    {/* Dynamic Sections */}
                    {sections?.map((section, index) => (
                        <AccordionItem key={section.id} value={section.id.toString()} className="border-b border-gray-100">
                            <AccordionTrigger className="px-4 bg-[#f5f7fa] dark:text-white dark:bg-[#1D2026] py-3 hover:bg-gray-50 hover:no-underline">
                                <div className="text-left  flex px-2 flex-row max-md:flex-col justify-between w-full">
                                    <div className="font-medium text-sm text-gray-900 mb-1 dark:text-white">{section.title}</div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-normal">
                                        <div className="flex items-center gap-1">
                                            <PlayCircle className="h-3 w-3 text-[#6b65fd] dark:text-white" />
                                            <span>{section.lectures?.length || 0} lectures</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="h-3 w-3 flex items-center justify-center text-[#fd9c3b] dark:text-white"><Clock /></span>
                                            <span>{section.duration || "0m"}</span>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-0 pb-0 dark:bg-[#1D2026]">
                                <div className="flex flex-col">
                                    {section.lectures?.map((lecture) => (
                                        <div key={lecture.id}>
                                            {lecture.content?.map((content, cIndex) => {
                                                const isActive = activeContent?.id === content.id;
                                                const completed = isCompleted(content);
                                                const isVideo = content.type === 'video';
                                                const duration = content.contentData?.duration || "0m";

                                                return (
                                                    <button
                                                        key={content.id}
                                                        onClick={() => onContentSelect(content, lecture)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 p-3 text-left dark:text-white transition-colors border-l-0 hover:bg-gray-50",
                                                            isActive ? "bg-orange-50" : "bg-white dark:bg-[#1D2026]"
                                                        )}
                                                    >
                                                        {/* Checkbox / Tick Button */}
                                                        <div
                                                            className="shrink-0 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onProgressUpdate) {
                                                                    onProgressUpdate(content);
                                                                }
                                                            }}
                                                        >
                                                            {completed ? (
                                                                <div className="h-5 w-5 bg-[#5b2d92] rounded flex items-center justify-center">
                                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-5 w-5 border border-gray-300  rounded bg-white hover:border-[#5b2d92]"></div>
                                                            )}
                                                        </div>

                                                        {/* Title */}
                                                        <div className="flex-1 min-w-0 dark:text-white">
                                                            <p className={cn(
                                                                "text-sm",
                                                                isActive ? "font-medium text-gray-900 " : "text-gray-600 dark:text-white/70"
                                                            )}>
                                                                {index + 1}.{cIndex + 1} {lecture.title}
                                                            </p>
                                                        </div>

                                                        {/* Right Side: Icon/Duration */}
                                                        <div className="shrink-0 text-xs text-gray-400 dark:text-white flex items-center gap-2">
                                                            {isActive && isVideo ? (
                                                                <div className="flex items-center gap-1">
                                                                    <span className="w-0.5 h-3 bg-gray-400 mx-1 animate-pulse"></span>
                                                                    <span className="w-0.5 h-4 bg-gray-400 mx-1 animate-pulse"></span>
                                                                </div>
                                                            ) : null}

                                                            {isVideo ? (
                                                                <div className="flex items-center gap-1">
                                                                    <PlayCircle className="h-3 w-3 fill-gray-400 text-white" />
                                                                    <span className={`text-xs text-gray-400 ${isActive ? "text-gray-900" : ""}`}>{duration}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    {getContentTypeIcon(content.type)}
                                                                    <span className={`text-xs text-gray-400 ${isActive ? "text-gray-900" : ""}`}>{duration}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </ScrollArea>
        </div>
    );
};

export default CoursePlayerSidebar;
