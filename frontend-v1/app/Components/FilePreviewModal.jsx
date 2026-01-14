"use client";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, X } from "lucide-react";

export default function FilePreviewModal({ isOpen, onClose, fileUrl, fileTitle, fileType }) {
    if (!isOpen) return null;

    const isPdf = fileUrl?.endsWith(".pdf") || fileType === "PDF";
    const isImage = fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || fileType === "Image";
    const isVideo = fileUrl?.match(/\.(mp4|webm|ogg)$/i) || fileType === "Video";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* The [&>button]:hidden class hides the built-in Shadcn Close button 
               because it is a direct child <button>.
            */}
            <DialogContent className="w-[95vw] sm:w-full sm:max-w-5xl min-w-0 min-h-0 h-[80vh] sm:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">

                {/* FIX: We wrap our custom button in a div. 
                    This makes the button a 'grandchild', so the css rule above ignores it.
                */}
                <div className="absolute right-4 top-4 z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-md shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                <div className="flex-1  overflow-hidden relative bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center m-0 p-0 min-w-0 min-h-0 ">
                    {fileUrl ? (
                        isPdf ? (
                            <iframe
                                src={`${fileUrl}#toolbar=0`}
                                className="w-full h-full border-0"
                                title={fileTitle}
                            />
                        ) : isImage ? (
                            <img
                                src={fileUrl}
                                alt={fileTitle}
                                className="max-w-full max-h-full object-contain p-4"
                            />
                        ) : isVideo ? (
                            <video controls className="max-w-full max-h-full">
                                <source src={fileUrl} />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className="bg-white dark:bg-zinc-800 p-6 rounded-full mb-4 shadow-sm">
                                    <FileText className="h-12 w-12 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Preview not available</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                                    This file type cannot be previewed directly. Please download to view.
                                </p>
                                <Button asChild>
                                    <a href={fileUrl} download={fileTitle || "download"} target="_blank" rel="noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Download File
                                    </a>
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="text-muted-foreground text-sm">No file URL provided</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}