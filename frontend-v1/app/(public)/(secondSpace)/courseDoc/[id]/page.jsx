"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Eye,
  FileText,
  FolderPlus,
  Loader2,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FullscreenDocViewer from "@/app/Components/FullscreenDocViewer";
import { checkObjectFields, deleteFile } from "@/app/utils/common";
import Link from "next/link";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SingleCourseDocumentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { id: courseId } = params;

  const authUser = useSelector((state) => state.auth.user);
  const isInstructor = authUser?.roleId === 2;

  const [course, setCourse] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentTopics, setDocumentTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTopicManagementModalOpen, setIsTopicManagementModalOpen] = useState(false);

  // Form States
  const [serialNo, setSerialNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [path, setDocumentPath] = useState("");
  const [documentTopicId, setDocumentTopicId] = useState(null);

  // Viewer States
  const [docUrl, setDocUrl] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const fileInputRef = useRef(null);
  const [newTopicName, setNewTopicName] = useState("");

  const fetchCourseData = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseRes = await axios.get(`/api/course/${courseId}`);
      setCourse(courseRes.data);
      await fetchDocuments(courseId, selectedTopicId);
      await fetchDocumentTopics(courseId);
    } catch (error) {
      N("Error", "Failed to load course data.", "error");
      router.push("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (currentCourseId, currentTopicId = null) => {
    try {
      const params = currentTopicId ? { documentTopicId: currentTopicId } : {};
      const docsRes = await axios.get(
        `/api/getCourseDocuments/${currentCourseId}`,
        { params }
      );
      const sortedDocs = docsRes.data.sort((a, b) => a.serialNo - b.serialNo);
      setDocuments(sortedDocs);
    } catch (error) {
      N("Error", "Failed to fetch documents.", "error");
      setDocuments([]);
    }
  };

  const fetchDocumentTopics = async (currentCourseId) => {
    try {
      const response = await axios.get(
        `/api/courses/${currentCourseId}/topics`
      );
      if (response.status === 200 && response.data.success) {
        setDocumentTopics(response.data.topics);
      }
    } catch (error) {
      N("Error", "Failed to fetch document topics", "error");
      setDocumentTopics([]);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchDocuments(courseId, selectedTopicId);
    }
  }, [selectedTopicId, courseId]);

  const resetDocumentModal = () => {
    setIsModalOpen(false);
    setSerialNo("");
    setTitle("");
    setDescription("");
    setDocumentPath("");
    setDocumentTopicId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "Documents");

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200 && response.data.publicUrl) {
        N("Success", "Document file uploaded successfully", "success");
        setDocumentPath(response.data.publicUrl);
      } else {
        N("Error", "File upload failed: No file path returned.", "error");
        setDocumentPath("");
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Document file upload failed",
        "error"
      );
      setDocumentPath("");
    }
  };

  const handleSaveDocument = async () => {
    setIsSubmitting(true);
    const docInfo = {
      serialNo,
      title,
      description,
      path,
      courseId,
      documentTopicId,
    };
    const check = checkObjectFields(docInfo, [
      "serialNo",
      "title",
      "path",
      "courseId",
      "documentTopicId",
    ]);

    if (!check.success) {
      N("Error", check.message, "error");
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post("/api/storeDocumentInfo", docInfo);
      N("Success", "Document added successfully.", "success");
      resetDocumentModal();
      await fetchDocuments(courseId, selectedTopicId);
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to save document.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docToDelete) => {
    try {
      await axios.post("/api/deleteDoc", docToDelete);
      deleteFile(docToDelete.path);
      N("Success", "Document deleted successfully", "success");
      await fetchDocuments(courseId, selectedTopicId);
    } catch (error) {
      N("Error", "Failed to delete document.", "error");
    }
  };

  const handleDocumentOpen = (doc) => {
    setShowContent(false);
    setDocUrl(`${doc.path}`);
    setDocTitle(doc.title);
    setIsViewerOpen(true);
    setTimeout(() => setShowContent(true), 100);
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !courseId) {
      N("Warning", "Topic name and course selection are required.", "warning");
      return;
    }
    try {
      const response = await axios.post("/api/topics", {
        name: newTopicName.trim(),
        courseId: courseId,
      });
      if (response.status === 201 && response.data.success) {
        N("Success", "Topic added successfully", "success");
        setNewTopicName("");
        await fetchDocumentTopics(courseId);
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to add topic",
        "error"
      );
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      const response = await axios.delete(`/api/topics/${topicId}`);
      if (response.status === 200 && response.data.success) {
        N("Success", "Topic deleted successfully", "success");
        await fetchDocumentTopics(courseId);

        if (selectedTopicId === topicId) {
          setSelectedTopicId(null);
        }
        await fetchDocuments(
          courseId,
          selectedTopicId === topicId ? null : selectedTopicId
        );
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to delete topic",
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#141414]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen p-0 sm:p-8 gap-6">
      {/* Sidebar - Modules */}
      <aside className="lg:w-1/4 xl:w-1/5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-4 flex flex-col h-fit">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Modules</h2>
        <Link
          href="/courses"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>

        {isInstructor && (
          <Button
            variant="outline"
            className="w-full mb-4 justify-start"
            onClick={() => setIsTopicManagementModalOpen(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" /> Manage Modules
          </Button>
        )}

        <div className="space-y-1">
          <Button
            variant={selectedTopicId === null ? "default" : "ghost"}
            className={`w-full justify-start ${selectedTopicId === null ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
            onClick={() => setSelectedTopicId(null)}
          >
            All Documents
          </Button>

          {documentTopics.length > 0 ? (
            documentTopics.map((topic) => (
              <div key={topic.id} className="flex items-center group">
                <Button
                  variant={selectedTopicId === topic.id ? "default" : "ghost"}
                  className={`w-full justify-start truncate ${selectedTopicId === topic.id ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={() => setSelectedTopicId(topic.id)}
                >
                  <span className="truncate">{topic.name}</span>
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No modules yet.
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">
              {course?.title || "Course Documents"}
            </h1>
            {selectedTopicId &&
              documentTopics.find((t) => t.id === selectedTopicId) && (
                <Badge variant="secondary" className="mt-2 text-sm">
                  {documentTopics.find((t) => t.id === selectedTopicId).name}
                </Badge>
              )}
          </div>
          {isInstructor && (
            <Button onClick={() => setIsModalOpen(true)} disabled={documentTopics.length === 0}>
              <Plus className="mr-2 h-4 w-4" /> Add New Document
            </Button>
          )}
        </header>

        <AnimatePresence>
          {documents.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                          <FileText className="h-6 w-6" />
                        </div>
                        {isInstructor && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
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
                                    <AlertDialogAction onClick={() => handleDeleteDocument(doc)} className="bg-red-600 hover:bg-red-700">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2 line-clamp-1" title={doc.title}>
                        {doc.serialNo}. {doc.title}
                      </CardTitle>
                      {doc.topic && (
                        <Badge variant="outline" className="mt-1">
                          {doc.topic.name}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {doc.description || "No description provided."}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="secondary" className="w-full" onClick={() => handleDocumentOpen(doc)}>
                        <Eye className="mr-2 h-4 w-4" /> Open Document
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                {selectedTopicId
                  ? "No documents found for this topic."
                  : "No documents added yet."}
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Document Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Topic*</label>
              <Select
                value={documentTopicId?.toString()}
                onValueChange={(val) => setDocumentTopicId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a topic" />
                </SelectTrigger>
                <SelectContent>
                  {documentTopics.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {documentTopics.length === 0 && (
                <p className="text-xs text-red-500">
                  Please add Modules first using "Manage Modules".
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial No*</label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={serialNo}
                  onChange={(e) => setSerialNo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title*</label>
                <Input
                  placeholder="Document Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter Document Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File*</label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleDocumentUpload}
                ref={fileInputRef}
              />
              {path && (
                <p className="text-xs text-green-600">
                  File uploaded: {path.split("/").pop()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDocumentModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveDocument} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Topics Modal */}
      <Dialog open={isTopicManagementModalOpen} onOpenChange={setIsTopicManagementModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Course Modules</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-2">
              <Input
                placeholder="New Topic Name"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
              <Button onClick={handleAddTopic} disabled={!newTopicName.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic Name</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentTopics.length > 0 ? (
                    documentTopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell>{topic.name}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{topic.name}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTopic(topic.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No modules added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FullscreenDocViewer
        open={isViewerOpen}
        url={docUrl}
        title={docTitle}
        onClose={() => setIsViewerOpen(false)}
        showContent={showContent}
      />
    </div>
  );
};

export default SingleCourseDocumentsPage;
