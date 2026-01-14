"use client";
import { useState, useRef, useEffect } from "react";
import {
    Plus,
    Upload,
    MoreVertical,
    FileText,
    Trash2,
    Eye,
    Download,
    File
} from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields, deleteFile } from "@/app/utils/common";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";
import FilePreviewModal from "@/app/Components/FilePreviewModal";

const CourseDocuments = ({ course }) => {
    const [courseDocuments, setCourseDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (course?.id) {
            getCourseDocuments();
        }
    }, [course?.id]);

    const getCourseDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/getCourseDocuments/${course.id}`);
            if (response.status === 200) {
                setCourseDocuments(response.data);
            }
        } catch (error) {
            N("Error", "Failed to fetch documents", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const [serialNo, setSerialNo] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [path, setDocument] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const resetForm = () => {
        setSerialNo("");
        setTitle("");
        setDescription("");
        setDocument("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsModalOpen(false);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const documentInfo = {
            serialNo,
            title,
            description,
            path,
            courseId: course.id,
        };
        const ch = checkObjectFields(documentInfo, ["description"]);
        if (!ch.success) {
            N("Error", ch.message, "error");
            setIsSubmitting(false);
            return;
        }
        try {
            const response = await axios.post("/api/storeDocumentInfo", documentInfo);
            if (response.status === 201) {
                N("Success", response.data.message, "success");
                getCourseDocuments();
                resetForm();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Upload failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const [docUrl, setDocUrl] = useState(null);
    const [docTitle, setDocTitle] = useState("");
    const [docModalOpen, setDocModalOpen] = useState(false);

    const handleDocumentOpen = (doc) => {
        setDocTitle(doc.title);
        setDocUrl(doc.path);
        setDocModalOpen(true);
    };

    const handleDocumentUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        const folder = "Documents";

        try {
            const response = await axios.post(`/api/upload?folder=${folder}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.status === 200) {
                // Handle both fetch API response (if used in axios interceptor) or axios response
                const data = response.data || await response.json();
                N("Success", data.message || "File uploaded successfully", "success");
                setDocument(data.publicUrl);
            } else {
                N("Error", "Error uploading", "error");
            }
        } catch (error) {
            N("Error", "Error uploading document", "error");
        }
    };

    const handleDelete = async (doc) => {
        try {
            if (doc.path) deleteFile(doc.path);

            const response = await axios.post("/api/deleteDoc", doc);
            if (response.status === 200) {
                N("Success", response.data.message, "success");
                getCourseDocuments();
            }
        } catch (error) {
            console.error("Error deleting document:", error);
            N("Error", "Failed to delete document", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                        Course Documents
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Manage and access course-related materials.
                    </p>
                </div>
                {course.instructorCall && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Document
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : courseDocuments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Upload documents to share with your students.
                    </p>
                    {course.instructorCall && (
                        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                            Upload First Document
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {courseDocuments.map((doc) => (
                        <Card key={doc.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200 dark:bg-card">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    {course.instructorCall && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(doc)} className="bg-destructive hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <CardTitle className="mt-4 line-clamp-1 text-lg" title={doc.title}>
                                    <span className="text-muted-foreground mr-2 text-sm font-normal">#{doc.serialNo}</span>
                                    {doc.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {doc.description || "No description provided."}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-2">
                                <Button
                                    variant="secondary"
                                    className="w-full group"
                                    onClick={() => handleDocumentOpen(doc)}
                                >
                                    <Eye className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                                    View Document
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Upload New Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="serialNo">Serial No*</Label>
                            <Input
                                id="serialNo"
                                type="number"
                                placeholder="e.g. 1"
                                value={serialNo}
                                onChange={(e) => setSerialNo(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="title">Title*</Label>
                            <Input
                                id="title"
                                placeholder="Document Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief description of the document..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="file">File*</Label>
                            <DragDropFileUpload
                                onFileSelect={(file) => handleDocumentUpload({ target: { files: [file] } })}
                                selectedFile={path ? { name: path.split('/').pop(), previewUrl: path } : null}
                                label="Click or Drag Document"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting || !path}>
                            {isSubmitting ? "Uploading..." : "Save Document"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Viewer Modal */}
            <FilePreviewModal
                isOpen={docModalOpen}
                onClose={() => setDocModalOpen(false)}
                fileUrl={docUrl}
                fileTitle={docTitle}
            />
        </div>
    );
};

export default CourseDocuments;
