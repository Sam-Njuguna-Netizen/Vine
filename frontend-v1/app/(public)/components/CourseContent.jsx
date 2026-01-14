"use client";

import React, { useState } from 'react';
import axios from '@/app/api/axios';
import { useSelector } from 'react-redux';
import { N } from "@/app/utils/notificationService";
import { useSearchParams } from "next/navigation";

// Icons
import {
  PlayCircle,
  FileText,
  File,
  AlignLeft,
  Type,
  CheckCircle2,
  Circle,
  X
} from "lucide-react";

// Shadcn UI Components
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const CourseContent = ({ courseId, sections, refreshCourse }) => {
  const [activeModal, setActiveModal] = useState(null); // { type, content, title }
  const searchParams = useSearchParams();
  const contentIdParam = searchParams.get('contentId');

  // Deep linking: Open modal if contentId is present in URL
  React.useEffect(() => {
    if (contentIdParam && sections) {
      for (const section of sections) {
        for (const lecture of section.lectures || []) {
          const foundContent = lecture.content?.find(c => c.id.toString() === contentIdParam);
          if (foundContent) {
            setActiveModal({
              type: foundContent.type,
              content: foundContent,
              title: `${lecture.title} - ${foundContent.type.toUpperCase()}`
            });
            return;
          }
        }
      }
    }
  }, [contentIdParam, sections]);

  const user = useSelector((state) => state?.user?.user);

  // --- Logic Helpers ---

  const isCompleted = (content) => {
    return content.progress && content.progress.length > 0 && content.progress[0].isCompleted;
  };

  const calculateProgress = () => {
    let totalContent = 0;
    let completedContent = 0;

    sections?.forEach(section => {
      section.lectures?.forEach(lecture => {
        lecture.content?.forEach(content => {
          totalContent++;
          if (isCompleted(content)) {
            completedContent++;
          }
        });
      });
    });

    return totalContent === 0 ? 0 : Math.round((completedContent / totalContent) * 100);
  };

  const progress = calculateProgress();

  // --- Actions ---

  const markAsComplete = async (contentId) => {
    try {
      await axios.post('/api/courses/progress', {
        courseId: courseId,
        contentId: contentId,
        isCompleted: true
      });
      // Optional: refreshCourse(); 
    } catch (error) {
      console.error("Failed to mark content as complete", error);
      N.error("Failed to save progress");
    }
  };

  const logAccess = async (contentId) => {
    console.log("Logging access for content:", contentId, "Course:", courseId);
    try {
      await axios.post('/api/courses/log-access', {
        courseId: courseId,
        contentId: contentId
      });
      console.log("Access logged successfully");
    } catch (error) {
      console.error("Failed to log access", error);
    }
  };

  const handleContentClick = (content, lectureTitle) => {
    console.log("Content clicked:", content);
    if (content.type === 'file') {
      window.open(content.url, '_blank');
    } else {
      setActiveModal({
        type: content.type,
        content: content,
        title: `${lectureTitle} - ${content.type.toUpperCase()}`
      });
    }

    if (!isCompleted(content)) {
      markAsComplete(content.id);
    }

    logAccess(content.id);
  };

  // --- Render Helpers ---

  const getContentTypeStyles = (type, completed) => {
    const base = "cursor-pointer transition-all duration-200 hover:scale-105 border";

    if (completed) {
      return `${base} bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200`;
    }

    switch (type) {
      case 'video':
        return `${base} bg-indigo-50 text-[#312E81] border-indigo-200 hover:bg-indigo-100`;
      case 'file':
        return `${base} bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200`;
      case 'desc':
        return `${base} bg-fuchsia-50 text-[#701A75] border-fuchsia-200 hover:bg-fuchsia-100`;
      case 'notes':
        return `${base} bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100`;
      case 'captions':
        return `${base} bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100`;
      default:
        return `${base} bg-gray-100 text-gray-700 border-gray-200`;
    }
  };

  const ContentIcon = ({ type }) => {
    switch (type) {
      case 'video': return <PlayCircle className="h-3.5 w-3.5" />;
      case 'file': return <File className="h-3.5 w-3.5" />;
      case 'captions': return <Type className="h-3.5 w-3.5" />;
      case 'desc': return <AlignLeft className="h-3.5 w-3.5" />;
      case 'notes': return <FileText className="h-3.5 w-3.5" />;
      default: return <File className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* 1. Progress Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="text-xl font-bold text-[#312E81]">Course Progress</h2>
            <p className="text-sm text-slate-500 mt-1">Keep up the good work!</p>
          </div>
          <span className="text-2xl font-bold text-[#701A75]">{progress}%</span>
        </div>

        {/* Custom Progress Bar Color */}
        <Progress
          value={progress}
          className="h-3 bg-slate-100"
        />
        <style jsx global>{`
          /* Force the progress indicator to use your purple gradient */
          [data-state="indeterminate"], [data-state="loading"], [role="progressbar"] > div {
            background: linear-gradient(90deg, #312E81 0%, #701A75 100%) !important;
          }
        `}</style>
      </div>

      {/* 2. Curriculum Accordion */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Course Curriculum</h3>
        </div>

        {sections && sections.length > 0 ? (
          <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="w-full">
            {sections.map((section, index) => (
              <AccordionItem key={section.id} value={section.id} className="border-b-slate-100 last:border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 hover:no-underline transition-colors">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium text-slate-900 text-base">
                      Section {index + 1}: {section.title}
                    </span>
                    <span className="text-xs text-slate-500 font-normal mt-0.5">
                      {section.lectures?.length || 0} lectures
                    </span>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="bg-slate-50/50 px-6 pb-6 pt-2">
                  <div className="flex flex-col gap-3">
                    {section.lectures && section.lectures.length > 0 ? (
                      section.lectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          className="bg-white border border-slate-100 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded-full">
                              <PlayCircle className="h-4 w-4 text-[#312E81]" />
                            </div>
                            <span className="font-medium text-slate-800 text-base sm:text-lg">
                              {lecture.title}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {lecture.content && lecture.content.length > 0 ? (
                              lecture.content.map((content) => {
                                const completed = isCompleted(content);
                                return (
                                  <Badge
                                    key={content.id}
                                    variant="outline"
                                    className={`pl-2 pr-3 py-1.5 gap-1.5 ${getContentTypeStyles(content.type, completed)}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleContentClick(content, lecture.title);
                                    }}
                                  >
                                    {completed ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 fill-current opacity-80" />
                                    ) : (
                                      <ContentIcon type={content.type} />
                                    )}
                                    <span className="uppercase tracking-wide text-xs sm:text-sm font-semibold">
                                      {content.type}
                                    </span>
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-xs text-slate-400 italic">No content</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-sm italic">
                        No lectures available in this section yet.
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No curriculum content available.
          </div>
        )}
      </div>

      {/* 3. Content Viewer Modal */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0 bg-white overflow-hidden border-none shadow-2xl">

          {/* Modal Header */}
          <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-lg font-semibold text-[#312E81] flex items-center gap-2">
                {activeModal?.type === 'video' ? <PlayCircle className="h-5 w-5 text-[#701A75]" /> : <FileText className="h-5 w-5 text-[#701A75]" />}
                {activeModal?.title}
              </DialogTitle>
            </DialogHeader>
            {/* Close Button manually placed for better control or use DialogClose */}
            <DialogClose className="rounded-full p-1.5 hover:bg-slate-200 transition-colors">
              <X className="h-5 w-5 text-slate-500" />
            </DialogClose>
          </div>

          {/* Modal Content */}
          <div className="p-0 bg-slate-900/5 min-h-[300px] flex items-center justify-center relative">
            {activeModal && (
              <>
                {/* VIDEO PLAYER */}
                {activeModal.type === 'video' && (
                  activeModal.content.url ? (
                    <div className="w-full h-full bg-black aspect-video">
                      <video controls className="w-full h-full" autoPlay>
                        <source src={activeModal.content.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-100 w-full">
                      <p className="text-slate-500">Video URL unavailable.</p>
                    </div>
                  )
                )}

                {/* TEXT / NOTES / DESC */}
                {['desc', 'notes', 'captions'].includes(activeModal.type) && (
                  <ScrollArea className="h-[60vh] w-full bg-white p-6 sm:p-8">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {activeModal.content.contentData?.text || activeModal.content.contentData || "No textual content available."}
                      </p>
                    </div>
                  </ScrollArea>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-50 px-6 py-3 border-t flex justify-end">
            <Button variant="outline" onClick={() => setActiveModal(null)} className="border-slate-300 text-slate-700 hover:bg-slate-100">
              Close
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseContent;