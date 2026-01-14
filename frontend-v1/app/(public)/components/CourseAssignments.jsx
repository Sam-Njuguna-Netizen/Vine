"use client";
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Plus,
  Upload,
  FileText,
  Trash2,
  Download,
  Clock,
  X
} from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import dayjs from "dayjs";
import Countdown from "react-countdown";
import moment from "moment";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";
import FilePreviewModal from "@/app/Components/FilePreviewModal";

const CourseAssignment = ({ course }) => {
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [submissionBefore, setSubmissionBefore] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (course?.id) {
      getCourseAssignments();
    }
  }, [course?.id]);

  const getCourseAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/getCourseAssignments/${course.id}`
      );
      if (response.status === 200) {
        setCourseAssignments(response.data);
      }
    } catch (error) {
      N("Error", "Failed to fetch Assignments", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const [serialNo, setSerialNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [path, setDocument] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const submissionFileInputRef = useRef(null);

  const resetForm = () => {
    setSerialNo("");
    setTitle("");
    setDescription("");
    setDocument("");
    setSubmissionBefore(dayjs().format("YYYY-MM-DDTHH:mm"));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    const assignmentInfo = {
      serialNo,
      title,
      description,
      path,
      mark: totalMarks,
      courseId: course.id,
      submissionBefore: dayjs(submissionBefore).format("YYYY-MM-DD HH:mm:ss"),
    };
    const ch = checkObjectFields(assignmentInfo, ["description", "path"]);
    if (!ch.success) {
      N("Error", ch.message, "error");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await axios.post(
        "/api/storeAssignmentInfo",
        assignmentInfo
      );
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getCourseAssignments();
        resetForm();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    // Note: path here refers to the student's uploaded file path, which is set by handleDocumentUpload
    // But handleDocumentUpload sets the same 'path' state used for creating assignments.
    // This might be a bug in original code or intended reuse of state. 
    // I will reuse the 'path' state but ensure it's cleared correctly.

    const assignmentInfo = { assignmentId, path };
    const ch = checkObjectFields(assignmentInfo);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }
    try {
      const response = await axios.post(
        "/api/submitAssignment",
        assignmentInfo
      );
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getCourseAssignments();
        setDocument(""); // Clear after submission
        if (submissionFileInputRef.current) submissionFileInputRef.current.value = "";
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Upload failed", "error");
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
    formData.append("folder", "Assignment");

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        N("Success", "Uploaded successfully", "success");
        setDocument(data.publicUrl);
      } else {
        N("Error", "Error uploading", "error");
      }
    } catch (error) {
      N("Error", "Error uploading document", "error");
    }
  };

  const [isSubmissionListOpen, setIsSubmissionListOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState([]);

  const listOfSubmission = (doc) => {
    setSubmissionData(doc.submit || []);
    setIsSubmissionListOpen(true);
  };

  const handleCloseSubmissionList = () => {
    setIsSubmissionListOpen(false);
    setSubmissionData([]);
  };

  const handleDownload = (path) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = path.split("/").pop();
    link.click();
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const downloadPromises = submissionData.map(async (submission) => {
      try {
        const response = await fetch(submission.path);
        if (!response.ok) throw new Error("Network response was not ok");
        const blob = await response.blob();
        const fileName = submission.path.split("/").pop();
        zip.file(fileName, blob);
      } catch (e) {
        console.error(`Failed to download: ${submission.path}`, e);
      }
    });

    await Promise.all(downloadPromises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "submissions.zip");
    });
  };

  const handleDelete = async (doc) => {
    try {
      if (doc.path) deleteFile(doc.path);
      if (doc.submit) {
        doc.submit.forEach((submission) => {
          if (submission.path) deleteFile(submission.path);
        });
      }

      const response = await axios.post("/api/deleteAssignment", doc);
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getCourseAssignments();
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      N("Error", "Failed to delete assignment", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            Course Assignments
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage assignments and track student submissions.
          </p>
        </div>
        {course.instructorCall && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Assignment
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : courseAssignments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/50">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">No assignments yet</h3>
          <p className="text-muted-foreground mb-4">
            Create assignments for your students to complete.
          </p>
          {course.instructorCall && (
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              Create First Assignment
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courseAssignments.map((doc) => (
            <Card key={doc.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200 dark:bg-card">
              <div
                className="relative h-48 bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden group"
                onClick={() => handleDocumentOpen(doc)}
              >
                {/* Placeholder Image */}
                <img
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBrhLhNkb1V0U7J0lKI964E9rFMs8ejYb_4A&s"
                  alt="Assignment"
                />
                <div className="absolute top-2 right-2">
                  {course.instructorCall && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/80 hover:bg-white" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => listOfSubmission(doc)}>
                          <FileText className="mr-2 h-4 w-4" /> View Submissions
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{doc.title}"? This will also delete all student submissions.
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
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  #{doc.serialNo}
                </div>
              </div>

              <CardHeader className="pb-2 pt-4">
                <CardTitle className="line-clamp-1 text-lg" title={doc.title}>
                  {doc.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {doc.description || "No description provided."}
                </p>

                {moment(doc.submissionBefore).isAfter(moment()) ? (
                  <div className="flex items-center text-sm text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium mr-1">Due in:</span>
                    <Countdown date={doc.submissionBefore} />
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Submission Closed</span>
                  </div>
                )}

                {!doc.submitThisUser && !course.instructorCall && moment(doc.submissionBefore).isAfter(moment()) && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">Submit Your Work</Label>
                    <div className="flex gap-2">
                      <DragDropFileUpload
                        onFileSelect={(file) => handleDocumentUpload({ target: { files: [file] } })}
                        selectedFile={path ? { name: "Ready to Submit", previewUrl: path } : null}
                        label="Upload Assignment"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        disabled={false}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSubmitAssignment(doc.id)}
                        disabled={!path} // 'path' state is shared for upload
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                )}

                {doc.submitThisUser && (
                  <div className="flex items-center text-sm text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="font-medium">Submitted</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assignment Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
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
                placeholder="Assignment Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assignment..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Assignment File</Label>
              <DragDropFileUpload
                onFileSelect={(file) => handleDocumentUpload({ target: { files: [file] } })}
                selectedFile={path ? { name: path.split('/').pop(), previewUrl: path } : null}
                label="Assignment File"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                disabled={isSubmitting}
              />
              {path && (
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <FileText className="h-3 w-3 mr-1" /> File uploaded
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="submissionBefore">Submission Deadline*</Label>
              <Input
                id="submissionBefore"
                type="datetime-local"
                value={submissionBefore}
                onChange={(e) => setSubmissionBefore(e.target.value)}
                className="block"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMarks">Total Marks*</Label>
              <Input
                id="totalMarks"
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="block"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submissions List Modal */}
      <Dialog open={isSubmissionListOpen} onOpenChange={setIsSubmissionListOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Student Submissions</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {submissionData.length > 0 ? (
              <div className="space-y-2">
                {submissionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                    <div className="flex flex-col min-w-0 flex-1 mr-2">
                      <span className="font-medium text-sm truncate">{item.user?.profile?.name || "Unknown Student"}</span>
                      <span className="text-xs text-muted-foreground truncate">{item.user?.email}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Submitted: {dayjs(item.createdAt).format("MMM D, YYYY h:mm A")}
                      </span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(item.path)}>
                      <Download className="h-4 w-4 mr-2" /> Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No submissions yet.
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="sm:justify-between">
            <div className="text-sm text-muted-foreground self-center">
              Total: {submissionData.length} submissions
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseSubmissionList}>
                Close
              </Button>
              {submissionData.length > 0 && (
                <Button onClick={handleDownloadAll}>
                  <Download className="mr-2 h-4 w-4" /> Download All
                </Button>
              )}
            </div>
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

export default CourseAssignment;
