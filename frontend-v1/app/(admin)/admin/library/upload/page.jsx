"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, CloudUpload } from "lucide-react"; // Changed icon to match design better if possible
import { handleMultipleDocumentUpload } from "@/app/utils/common";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";
import { uploadLibraryFile } from "@/app/utils/libraryService";
import { AllCourse } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import { useRouter } from "next/navigation";

export default function UploadResourcePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("none");
    const [selectedType, setSelectedType] = useState("PDF");
    const [visibility, setVisibility] = useState("public");
    const [fileToUpload, setFileToUpload] = useState(null);
    const [coursesList, setCoursesList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            const res = await AllCourse();
            if (res.success) {
                if (Array.isArray(res.courses)) {
                    setCoursesList(res.courses);
                } else if (res.courses.data) {
                    setCoursesList(res.courses.data);
                }
            }
        };
        fetchCourses();
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setFileToUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileToUpload(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!title || !fileToUpload || !selectedType) {
            N("Error", "Please fill all required fields", "error");
            return;
        }

        setUploading(true);

        try {
            // 1. Upload file to S3
            const uploadRes = await handleMultipleDocumentUpload([fileToUpload], "library");
            if (!uploadRes.success) {
                throw new Error("File upload failed");
            }

            const fileUrl = uploadRes.files[0].publicUrl;

            // 2. Save metadata
            const data = {
                title,
                description,
                file_url: fileUrl,
                file_type: selectedType,
                course_id: selectedCourse === "none" ? null : selectedCourse,
                visibility: visibility // Added visibility field
            };

            const res = await uploadLibraryFile(data);
            if (res.success) {
                N("Success", "File uploaded successfully", "success");
                router.push("/admin/library");
            } else {
                throw new Error(res.message || "Failed to save file metadata");
            }
        } catch (error) {
            N("Error", error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#1F2937]">Upload Resource</h1>
                    <p className="text-[#4B5563] mt-1">
                        Add learning materials to the library. You can upload documents, videos, links, or other files to support learners.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Resource Title */}
                    <div className="space-y-2">
                        <Label className="text-[#374151] font-medium">Resource Title</Label>
                        <div className="relative">
                            <Input
                                placeholder="Resource Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                                className="bg-white border-gray-200 focus:ring-purple-500 focus:border-purple-500 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                {title.length}/80
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-[#374151] font-medium">Description</Label>
                        <Textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white border-gray-200 min-h-[120px]"
                        />
                    </div>

                    {/* Additional Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[#374151] font-medium">Course</Label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="bg-white border-gray-200">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Select...</SelectItem>
                                    {coursesList.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[#374151] font-medium">Resource Type</Label>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="bg-white border-gray-200">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="Video">Video</SelectItem>
                                    <SelectItem value="Slides">Slides</SelectItem>
                                    <SelectItem value="Document">Document</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="space-y-2">
                        <Label className="text-[#374151] font-medium">Visibility</Label>
                        <Select value={visibility} onValueChange={setVisibility}>
                            <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Upload Area */}
                    <div className="space-y-2">
                        <Label className="text-xl font-semibold text-[#1F2937]">Upload Resource</Label>
                        <div className="mt-4">
                            <DragDropFileUpload
                                onFileSelect={(file) => setFileToUpload(file)}
                                selectedFile={fileToUpload ? { name: fileToUpload.name, previewUrl: fileToUpload.type.startsWith('image/') ? URL.createObjectURL(fileToUpload) : null } : null}
                                label="Select a file or drag and drop here"
                                accept="*"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    {/* Publish Button */}
                    <div className="flex justify-center pt-6">
                        <Button
                            className="bg-[#5B21B6] hover:bg-[#4C1D95] text-white px-8 py-2 min-w-[120px]"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
