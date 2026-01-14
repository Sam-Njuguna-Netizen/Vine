import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, File, Eye } from "lucide-react";
import LectureComments from "./LectureComments";
import { ScrollArea } from "@/components/ui/scroll-area";
import FilePreviewModal from "@/app/Components/FilePreviewModal";


const CourseLectureDetails = ({ course, activeLecture, activeContent }) => {
    // Helper to find content by type
    console.log("active Lecture", activeLecture)
    const getContentByType = (type) => {
        return activeLecture?.content?.find((c) => c.type === type);
    };

    const descriptionContent = getContentByType("desc");
    const notesContent = getContentByType("notes");
    const fileContent = getContentByType("file");

    // Helper to render content safely
    const renderContent = (content) => {
        if (!content) return null;

        let dataToRender = content.contentData;

        // Handle if contentData is an object
        if (typeof dataToRender === 'object' && dataToRender !== null) {
            dataToRender = dataToRender.text || JSON.stringify(dataToRender);
        }

        // Fallback to URL if no data
        if (!dataToRender && content.url) {
            dataToRender = content.url;
        }

        return (
            // Added dark:text-slate-300
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {dataToRender}
            </div>
        );
    };


    const [docModalOpen, setDocModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState("");

    const handlePreview = (url, title) => {
        setPreviewUrl(url);
        setPreviewTitle(title);
        setDocModalOpen(true);
    };

    return (
        <div className="w-full">
            <Tabs defaultValue="description" className="w-full">
                {/* Added dark:border-slate-800 */}
                <div className="border-y border-slate-200 dark:border-slate-800 mb-8">
                    <ScrollArea className="w-full max-w-screen">
                        <TabsList className="h-auto p-0 bg-transparent flex items-center justify-start md:flex-row md:gap-8 gap-0 w-full">

                            {/* --- Description Tab --- */}
                            <TabsTrigger
                                value="description"
                                className="
            rounded-none 
            /* Mobile: Vertical styles (Left border, full width, left align) */
            w-full justify-start border-l-2 border-transparent py-3 max-md:px-1 
            data-[state=active]:border-b-[#FF5722] 
            
            /* Desktop: Horizontal styles (Bottom border, auto width, center align) */
            md:w-auto md:justify-center border-b-2 md:px-0 
            md:data-[state=active]:border-b-[#FF5722] md:data-[state=active]:border-l-transparent
         
            /* Shared Styles */
            font-medium text-slate-500 dark:text-slate-400 
            data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 
            data-[state=active]:shadow-none 
            data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 
            hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-transparent shadow-none
            max-md:text-[10px]
        "
                            >
                                Description
                            </TabsTrigger>

                            {/* --- Lecture Notes Tab --- */}
                            <TabsTrigger
                                value="notes"
                                className="
            rounded-none 
            w-full justify-start border-l-2 border-transparent px-4 py-3 max-md:px-1 
            data-[state=active]:border-b-[#FF5722] 
            md:w-auto md:justify-center border-b-2 md:px-0 
            md:data-[state=active]:border-b-[#FF5722] md:data-[state=active]:border-l-transparent
            font-medium text-slate          data-[state=active]:px-4-500 dark:text-slate-400 
            data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 
            data-[state=active]:shadow-none 
            data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 
            hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-transparent shadow-none
            max-md:text-[10px]
        "
                            >
                                Lectures Notes
                            </TabsTrigger>

                            {/* --- Attach File Tab --- */}
                            <TabsTrigger
                                value="files"
                                className="
            rounded-none 
            w-full justify-start border-l-2 border-transparent px-4 py-3 max-md:px-1 
            data-[state=active]:border-b-[#FF5722] 
            md:w-auto md:justify-center border-b-2 md:px-0 
            md:data-[state=active]:border-b-[#FF5722] md:data-[state=active]:border-l-transparent
            font-medium text-slate          data-[state=active]:px-4-500 dark:text-slate-400 
            data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 
            data-[state=active]:shadow-none 
            data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 
            hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-transparent shadow-none
            max-md:text-[10px]
        "
                            >
                                Attach File
                                {fileContent && (
                                    <span className="ml-2 bg-[#FF5722]/10 dark:bg-[#FF5722]/20 text-[#FF5722] text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                        01
                                    </span>
                                )}
                            </TabsTrigger>

                            {/* --- Comments Tab --- */}
                            <TabsTrigger
                                value="comments"
                                className="
            rounded-none 
            w-full justify-start border-l-2 border-transparent px-4 py-3 max-md:px-1 
            data-[state=active]:border-b-[#FF5722] 
            md:w-auto md:justify-center border-b-2 md:px-0 
            md:data-[state=active]:border-b-[#FF5722] md:data-[state=active]:border-l-transparent
            font-medium text-slate          data-[state=active]:px-4-500 dark:text-slate-400 
            data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 
            data-[state=active]:shadow-none 
            data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-50 
            hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-transparent shadow-none
            max-md:text-[10px]
        "
                            >
                                Comments
                            </TabsTrigger>

                        </TabsList>
                    </ScrollArea>
                </div>

                <TabsContent value="description" className="space-y-12 animate-in fade-in-50 duration-300">
                    {/* 1. Description Section */}
                    <section>
                        {/* Added dark:text-slate-50 */}
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
                            Lectures Description
                        </h2>
                        {descriptionContent ? (
                            renderContent(descriptionContent)
                        ) : (
                            // Added dark:text-slate-400
                            <p className="text-slate-500 dark:text-slate-400 italic">
                                No description available for this lecture.
                            </p>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="notes" className="animate-in fade-in-50 duration-300">
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            {/* Added dark:text-slate-50 */}
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                                Lecture Notes
                            </h2>
                            {notesContent && (
                                // Adjusted purple button for dark mode: dark:bg-purple-900/20, dark:text-purple-300, etc.
                                <Button variant="outline" className="bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100 hover:text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40 dark:hover:text-purple-200">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Notes
                                </Button>
                            )}
                        </div>
                        {notesContent ? (
                            renderContent(notesContent)
                        ) : (
                            // Empty State: dark:bg-slate-900, dark:border-slate-800
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                {/* Icon: dark:text-slate-700 */}
                                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">No notes available for this lecture.</p>
                            </div>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="files" className="animate-in fade-in-50 duration-300">
                    <section>
                        {/* Added dark:text-slate-50 */}
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-4">
                            Attach Files
                        </h2>
                        {fileContent ? (
                            // File Card: dark:bg-slate-900, dark:hover:bg-slate-800, dark:hover:border-slate-700
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">

                                {/* Icon & Text Section */}
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    {/* Icon Container */}
                                    <div className="h-12 w-12 shrink-0 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                                        <FileText className="h-6 w-6 text-[#312E81] dark:text-indigo-400" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">
                                            {fileContent.title || "Lecture Resource File"}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {fileContent.size || "12.6 MB"}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        className="h-10 px-4 flex-1 sm:flex-none"
                                        onClick={() => handlePreview(fileContent.url, fileContent.title)}
                                    >
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview
                                    </Button>

                                    <Button
                                        className="bg-[#312E81] hover:bg-[#312E81]/90 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 h-10 px-4 flex-1 sm:flex-none"
                                        onClick={() => window.open(fileContent.url, '_blank')}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Empty State: dark:bg-slate-900, dark:border-slate-800
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                {/* Icon: dark:text-slate-700 */}
                                <File className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400">No files attached to this lecture.</p>
                            </div>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="comments" className="mt-12">
                    <LectureComments courseId={course?.id} />
                </TabsContent>

            </Tabs>

            <FilePreviewModal
                isOpen={docModalOpen}
                onClose={() => setDocModalOpen(false)}
                fileUrl={previewUrl}
                fileTitle={previewTitle}
            />
        </div >
    );
};

export default CourseLectureDetails;