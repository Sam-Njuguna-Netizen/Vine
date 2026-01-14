import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2 } from "lucide-react";
import FilePreviewModal from "@/app/Components/FilePreviewModal";

export default function GradingDialog({ open, onOpenChange, submission, onSuccess, readOnly = false }) {
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullSubmission, setFullSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && submission) {
            setGrade(submission.mark || submission.grade || "");
            setFeedback(submission.feedback || "");
            fetchFullDetails(submission.id);
        } else {
            setFullSubmission(null);
        }
    }, [open, submission]);

    const fetchFullDetails = async (id) => {
        setIsLoading(true);
        try {
            const response = await axios.post('/api/getSubmissionDetails', { submissionId: id });
            if (response.status === 200) {
                setFullSubmission(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch submission details", error);
        } finally {
            setIsLoading(false);
        }
    };

    // File Preview State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

    const handlePreview = (url, title = "File Preview") => {
        setSelectedFileForPreview({ fileUrl: url, title });
        setPreviewModalOpen(true);
    };

    const handleClosePreview = () => {
        setPreviewModalOpen(false);
        setSelectedFileForPreview(null);
    };

    const handleSave = async () => {
        if (readOnly) return;
        setIsSubmitting(true);

        if (!submission?.id) {
            N("Error", "Invalid submission data", "error");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post("/api/gradeAssignment", {
                submissionId: submission.id,
                grade,
                feedback
            });

            if (response.status === 200 || response.status === 201) {
                N("Success", response.data.message || "Grade saved successfully", "success");
                onSuccess && onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Grading failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const effectiveSubmission = fullSubmission || submission;

    // Helper to construct full file URL
    const getFileUrl = (path) => {
        console.log("path", path)
        if (!path) return "#";
        if (path.startsWith("http") || path.startsWith("https")) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        return `${apiUrl}/${path.replace(/^\//, '')}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl flex flex-col overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>{readOnly ? "Assignment Result" : "Grade Submission"}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 max-h-[calc(100vh-10rem)] mx-6 max-md:mx-0 max-md:px-0 px-6">
                    <div className="space-y-6 py-4">
                        {/* Student Details */}
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {effectiveSubmission?.user?.profile?.name?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div>
                                <h4 className="font-semibold">{effectiveSubmission?.user?.profile?.name || "Student"}</h4>
                                <p className="text-sm text-muted-foreground">{effectiveSubmission?.user?.email}</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h3 className="font-semibold border-b pb-2">Student Answers</h3>
                                {effectiveSubmission?.answers && effectiveSubmission.answers.length > 0 ? (
                                    effectiveSubmission.answers.map((ans, idx) => (
                                        <div key={ans.id} className="p-4 rounded-lg bg-muted/30 border">
                                            <p className="text-sm font-medium mb-2 text-muted-foreground">
                                                Question {idx + 1}: {ans.question?.questionText || "Question text not available"}
                                            </p>
                                            {ans.answerText ? (
                                                <p className="whitespace-pre-wrap">{ans.answerText}</p>
                                            ) : ans.filePath ? (
                                                <button
                                                    onClick={() => handlePreview(getFileUrl(ans.filePath), `Question ${idx + 1} Answer`)}
                                                    className="inline-flex items-center text-primary hover:underline bg-primary/5 px-3 py-2 rounded-md"
                                                >
                                                    <FileText className="w-4 h-4 mr-2" /> View File
                                                </button>
                                            ) : (
                                                <p className="text-muted-foreground italic">No answer provided.</p>
                                            )}
                                        </div>
                                    ))
                                ) : effectiveSubmission?.path ? (
                                    <div className="p-4 rounded-lg bg-muted/50">
                                        <p className="text-sm font-medium mb-2">Legacy Submission File:</p>
                                        <button
                                            onClick={() => handlePreview(getFileUrl(effectiveSubmission.path), "Submission File")}
                                            className="inline-flex items-center text-primary hover:underline"
                                        >
                                            <FileText className="w-4 h-4 mr-2" /> View Submitted File
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No answers found for this submission.</p>
                                )}
                            </div>
                        )}

                        {/* Grading Inputs */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold">Result</h3>
                            {readOnly && !grade && !feedback ? (
                                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                                    <p>Grades are not added yet.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="grade">Grade / Score</Label>
                                            <Input
                                                id="grade"
                                                placeholder={readOnly ? "-" : "e.g. A, 90/100"}
                                                value={grade}
                                                onChange={(e) => setGrade(e.target.value)}
                                                disabled={readOnly}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="feedback">Feedback</Label>
                                        <Textarea
                                            id="feedback"
                                            placeholder={readOnly ? "No feedback provided." : "Provide feedback..."}
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            rows={4}
                                            disabled={readOnly}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Close
                    </Button>
                    {!readOnly && (
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Grade"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={previewModalOpen}
                onClose={handleClosePreview}
                fileUrl={selectedFileForPreview?.fileUrl}
                fileTitle={selectedFileForPreview?.title}
            />
        </Dialog>
    );
}
