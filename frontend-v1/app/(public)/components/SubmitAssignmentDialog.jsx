import { useState, useRef, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields } from "@/app/utils/common";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDropzone } from 'react-dropzone';

// --- FileDropzone Component ---
const FileDropzone = ({ onFileDrop, currentFile, allowedFileTypes, maxFileSize }) => {
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
                flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer 
                transition-colors duration-200 bg-gray-50 dark:bg-gray-800/50
                ${isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                }
            `}
        >
            <input {...getInputProps()} />
            {currentFile ? (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="truncate max-w-[200px]">{currentFile}</span>
                    <span className="ml-2 text-xs text-muted-foreground">(Click to replace)</span>
                </div>
            ) : isDragActive ? (
                <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                    <UploadCloud className="h-5 w-5 mr-2" />
                    Drop the file here...
                </p>
            ) : (
                <div className="flex flex-col items-center text-center">
                    <UploadCloud className="h-8 w-8 mb-2 text-gray-400 dark:text-gray-500" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Upload</span> your Assignment here
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Supported: {allowedFileTypes ? allowedFileTypes.join(', ') : 'PDF, DOC, DOCX'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function SubmitAssignmentDialog({ open, onOpenChange, assignment, onSuccess }) {
    const [answers, setAnswers] = useState({}); // { questionId: { text: "", file: null, uploading: false } }
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setAnswers({});
        } else if (assignment && assignment.questions) {
            const initialAnswers = {};
            assignment.questions.forEach(q => {
                initialAnswers[q.id] = { text: "", file: null, filePath: "", uploading: false };
            });
            setAnswers(initialAnswers);
        }
    }, [open, assignment]);

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
                N("Success", "File uploaded successfully", "success");
            } else {
                setAnswers(prev => ({
                    ...prev,
                    [qId]: { ...prev[qId], uploading: false }
                }));
                N("Error", "Error uploading file", "error");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setAnswers(prev => ({
                ...prev,
                [qId]: { ...prev[qId], uploading: false }
            }));
            N("Error", "Error uploading document", "error");
        }
    };

    const handleSubmit = async () => {
        if (!assignment) return;

        // Validation: Check if all questions have answers
        // if (assignment.questions) {
        //     for (const q of assignment.questions) {
        //         const ans = answers[q.id];
        //         if (q.questionType === 'short_answer' && (!ans || !ans.text.trim())) {
        //             N("Error", `Please answer question #${q.order}`, "error");
        //             return;
        //         }
        //         if (q.questionType === 'file_upload' && (!ans || !ans.filePath)) {
        //             N("Error", `Please upload file for question #${q.order}`, "error");
        //             return;
        //         }
        //     }
        // }

        setIsSubmitting(true);

        const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: parseInt(qId),
            answerText: ans.text,
            filePath: ans.filePath
        }));

        const assignmentInfo = {
            assignmentId: assignment.id,
            answers: formattedAnswers
            // Legacy path is omitted or can be null
        };

        try {
            const response = await axios.post(
                "/api/submitAssignment",
                assignmentInfo
            );
            if (response.status === 201) {
                N("Success", response.data.message, "success");
                onSuccess && onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error("Submission error:", error);
            N("Error", error?.response?.data?.message || "Submission failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const allowedTypes = assignment?.allowedFileTypes ? JSON.parse(assignment.allowedFileTypes) : ['PDF', 'DOC', 'DOCX'];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-w-[95vw] bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="bg-white dark:bg-[#1f1f1f] p-6 -m-6 mb-0 border-b dark:border-slate-800">
                    <DialogTitle className="text-xl">{assignment?.title || "Submit Assignment"}</DialogTitle>
                    <DialogDescription className="mt-2 space-y-1">
                        <p>1. Answer ALL Questions.</p>
                        <p>2. Attempt it in the given time period.</p>
                        <p>3. Make sure you SUBMIT when you are done.</p>
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 -mx-6 px-6 py-4">
                    <div className="space-y-6">
                        {assignment?.questions && assignment.questions.length > 0 ? (
                            assignment.questions.map((q, idx) => (
                                <div key={q.id} className="bg-white dark:bg-[#1f1f1f] p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="mb-3 font-medium text-base flex gap-2">
                                        <span className="opacity-70">{idx + 1}.</span>
                                        <span>{q.questionText}</span>
                                    </div>

                                    {q.questionType === 'short_answer' ? (
                                        <Textarea
                                            placeholder="Write Short Answer...."
                                            className="bg-slate-100 dark:bg-slate-900 border-0 resize-none min-h-[100px]"
                                            value={answers[q.id]?.text || ""}
                                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                                        />
                                    ) : (
                                        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
                                            <FileDropzone
                                                onFileDrop={(file) => handleFileUpload(q.id, file)}
                                                currentFile={answers[q.id]?.file}
                                                allowedFileTypes={allowedTypes}
                                            />
                                            {answers[q.id]?.uploading && (
                                                <div className="mt-2 flex items-center gap-2 text-sm text-blue-500">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            /* Legacy View if no questions but assignment exists (fallback) */
                            <div className="bg-white dark:bg-[#1f1f1f] p-6 rounded-lg text-center">
                                <p className="text-muted-foreground mb-4">Upload your assignment file.</p>
                                <FileDropzone
                                    onFileDrop={(file) => handleFileUpload('legacy', file)} // 'legacy' key needs handling if used
                                    currentFile={answers['legacy']?.file}
                                    allowedFileTypes={allowedTypes}
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="bg-indigo-900 p-4 -mx-6 -mb-6 mt-auto flex justify-center">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-transparent hover:bg-white/10 text-white font-semibold h-auto py-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                            </>
                        ) : "Submit Assignment"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
