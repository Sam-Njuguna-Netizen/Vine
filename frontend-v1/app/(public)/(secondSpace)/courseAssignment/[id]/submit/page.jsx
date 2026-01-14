"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Loader2, UploadCloud, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from 'react-dropzone';
import { toast } from "sonner"; // Assuming sonner is used for notifications
import axios from "@/app/api/axios";
import { getAllAssignments } from "@/app/utils/courseService";

// --- FileDropzone Component (Local) ---
const FileDropzone = ({ onFileDrop, currentFile, allowedFileTypes }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileDrop(acceptedFiles[0]);
        }
    }, [onFileDrop]);

    // Parse allowed types for dropzone
    const accept = {};
    if (allowedFileTypes && Array.isArray(allowedFileTypes)) {
        if (allowedFileTypes.includes('PDF')) accept['application/pdf'] = ['.pdf'];
        if (allowedFileTypes.includes('DOC') || allowedFileTypes.includes('DOCX')) {
            accept['application/msword'] = ['.doc'];
            accept['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
        }
        if (allowedFileTypes.includes('XLS')) {
            accept['application/vnd.ms-excel'] = ['.xls'];
            accept['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
        }
        if (allowedFileTypes.includes('PPT')) {
            accept['application/vnd.ms-powerpoint'] = ['.ppt'];
            accept['application/vnd.openxmlformats-officedocument.presentationml.presentation'] = ['.pptx'];
        }
    }
    // Default if empty
    if (Object.keys(accept).length === 0) {
        accept['application/pdf'] = ['.pdf'];
        accept['application/msword'] = ['.doc'];
        accept['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
    });

    return (
        <div
            {...getRootProps()}
            className={`
                flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer 
                transition-colors duration-200 bg-gray-100 dark:bg-gray-800/50 min-h-[160px]
                ${isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                }
            `}
        >
            <input {...getInputProps()} />
            {currentFile ? (
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 max-w-[250px]">{currentFile}</span>
                    <span className="text-xs text-muted-foreground">(Click to replace)</span>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-3">
                        {/* Custom File Icon SVG as per design if needed, using lucide for now */}
                        <UploadCloud className="h-10 w-10 text-slate-400" />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[300px]">
                        Upload your Assignment here. <span className="font-semibold text-slate-700 dark:text-slate-300">Important guidelines</span>: Supported format: {allowedFileTypes ? allowedFileTypes.join(', ') : '.pdf, .doc, or .docx'}
                    </p>

                    <Button variant="secondary" className="mt-4 bg-[#fff1e0] text-[#d97706] hover:bg-[#ffead1] border border-[#d97706]/20">
                        Upload <UploadCloud className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default function SubmitAssignmentPage() {
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id;

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionId: { text: "", file: null, filePath: "", uploading: false } }
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchAssignment = async () => {
            setLoading(true);
            try {
                // Since we don't have a single assignment fetch endpoint yet, we fetch all and find the one.
                // Optimally this should be a direct API call.
                const res = await getAllAssignments();
                if (res.success) {
                    const found = res.assignments.find(a => a.id.toString() === assignmentId);
                    if (found) {
                        setAssignment(found);

                        // Initialize answers
                        if (found.questions) {
                            const initialAnswers = {};
                            found.questions.forEach(q => {
                                initialAnswers[q.id] = { text: "", file: null, filePath: "", uploading: false };
                            });
                            setAnswers(initialAnswers);
                        }
                    } else {
                        toast.error("Assignment not found");
                        router.push("/courseAssignment");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch assignment", error);
                toast.error("Failed to load assignment details");
            } finally {
                setLoading(false);
            }
        };

        if (assignmentId) {
            fetchAssignment();
        }
    }, [assignmentId, router]);

    const handleTextChange = (qId, text) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: { ...prev[qId], text }
        }));
    };

    const handleFileUpload = async (qId, file) => {
        if (!file) return;

        setAnswers(prev => ({
            ...prev,
            [qId]: { ...prev[qId], uploading: true }
        }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "AssignmentSubmission");

        try {
            const response = await axios.post("/api/upload", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                const data = response.data;
                setAnswers(prev => ({
                    ...prev,
                    [qId]: { ...prev[qId], file: file.name, filePath: data.publicUrl, uploading: false }
                }));
                toast.success("File uploaded successfully");
            } else {
                setAnswers(prev => ({
                    ...prev,
                    [qId]: { ...prev[qId], uploading: false }
                }));
                toast.error("Error uploading file");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setAnswers(prev => ({
                ...prev,
                [qId]: { ...prev[qId], uploading: false }
            }));
            toast.error("Error uploading document");
        }
    };

    const handleSubmit = async () => {
        if (!assignment) return;
        setIsSubmitting(true);

        const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: parseInt(qId),
            answerText: ans.text,
            filePath: ans.filePath
        }));

        const assignmentInfo = {
            assignmentId: assignment.id,
            answers: formattedAnswers
        };

        try {
            const response = await axios.post(
                "/api/submitAssignment",
                assignmentInfo
            );
            if (response.status === 201) {
                toast.success(response.data.message);
                router.push("/courseAssignment");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error(error?.response?.data?.message || "Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const allowedTypes = assignment?.allowedFileTypes ? JSON.parse(assignment.allowedFileTypes) : ['PDF', 'DOC', 'DOCX'];

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
            </div>
        );
    }

    if (!assignment) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#121212] font-sans">
            <div className="max-w-4xl mx-auto p-6 md:p-10">

                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 hover:bg-transparent hover:text-indigo-600"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assignments
                </Button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{assignment.title}</h1>
                    <div className="text-slate-600 dark:text-slate-400 space-y-1">
                        <p>1. Answer ALL Questions.</p>
                        <p>2. Attempt it in the given time period</p>
                        <p>3. Make sure you SUBMIT when you are done.</p>
                    </div>
                </div>

                {/* Questions List */}
                <div className="space-y-10">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Questions</h2>

                    {assignment.questions && assignment.questions.length > 0 ? (
                        assignment.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <div className="text-base text-slate-900 dark:text-slate-100 font-medium">
                                    {idx + 1}. {q.questionText}
                                </div>

                                {q.questionType === 'short_answer' ? (
                                    <Textarea
                                        placeholder="Write Short Answer...."
                                        className="bg-gray-100 dark:bg-gray-800/50 border-0 resize-none min-h-[120px] rounded-xl focus-visible:ring-offset-0 focus-visible:ring-indigo-500"
                                        value={answers[q.id]?.text || ""}
                                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    />
                                ) : (
                                    <FileDropzone
                                        onFileDrop={(file) => handleFileUpload(q.id, file)}
                                        currentFile={answers[q.id]?.file}
                                        allowedFileTypes={allowedTypes}
                                    />
                                )}
                                {answers[q.id]?.uploading && (
                                    <div className="text-sm text-indigo-600 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading file...
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        /* Legacy Layout fallback if needed, but questions should exist */
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                            <p className="text-muted-foreground mb-4">No specific questions configured. Please upload your assignment file.</p>
                            <FileDropzone
                                onFileDrop={(file) => handleFileUpload('legacy', file)}
                                currentFile={answers['legacy']?.file}
                                allowedFileTypes={allowedTypes}
                            />
                        </div>
                    )}
                </div>

                {/* Footer Submit */}
                <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-[#4c1d95] hover:bg-[#3b0764] text-white py-6 text-lg font-semibold rounded-lg shadow-lg shadow-indigo-900/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting Assignment...
                            </>
                        ) : "Submit Assignment"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
