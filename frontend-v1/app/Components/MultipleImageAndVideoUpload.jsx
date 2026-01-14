'use client';

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, UploadCloud, FileIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have the standard shadcn utils

const MultipleImageAndVideoUpload = ({
    storeFolder = "Default",
    label = "Upload Media",
    files = [],
    handleFilesUpload,
    handleRemoveFile,
    inputId = "media-upload",
    allowedTypes = null,
}) => {
    const onDrop = useCallback(
        (acceptedFiles) => {
            const newFiles = acceptedFiles.map((file) =>
                Object.assign(file, { preview: URL.createObjectURL(file) })
            );
            handleFilesUpload([...files, ...newFiles]);
        },
        [files, handleFilesUpload]
    );

    const defaultAccept = {
        "image/*": [".jpeg", ".png", ".jpg"],
        "video/*": [".mp4", ".mov", ".avi"],
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: allowedTypes || defaultAccept,
        multiple: true,
    });

    return (
        <div className="w-full space-y-4">
            {/* Dropzone Area */}
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed p-6 transition-colors",
                    "cursor-pointer bg-muted/50 hover:bg-muted/80",
                    isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/25 hover:border-primary/50"
                )}
            >
                <input {...getInputProps()} id={inputId} />
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-background rounded-full border shadow-sm mb-4">
                        <UploadCloud className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-foreground">
                        {label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase">
                        JPG, PNG, MP4, MOV, AVI
                    </p>
                </div>
            </div>

            {/* Preview Grid */}
            {files.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {files.map((file) => (
                        <div
                            key={file.name}
                            className="group relative aspect-square rounded-md border bg-background overflow-hidden shadow-sm"
                        >
                            {/* Media Preview */}
                            {file.type.startsWith("image") ? (
                                <img
                                    src={file.preview}
                                    alt={file.name}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted">
                                    <video
                                        src={file.preview}
                                        className="h-full w-full object-cover"
                                        controls={false} // Hide native controls for cleaner preview
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Video className="h-8 w-8 text-white/80 drop-shadow-md" />
                                    </div>
                                </div>
                            )}

                            {/* Remove Button */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-6 w-6 rounded-full shadow-md"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening the file preview if implemented
                                        handleRemoveFile(file.name);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* File Name Overlay (Optional, remove if too cluttered) */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 truncate">
                                <p className="text-[10px] text-white text-center truncate px-1">
                                    {file.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultipleImageAndVideoUpload;