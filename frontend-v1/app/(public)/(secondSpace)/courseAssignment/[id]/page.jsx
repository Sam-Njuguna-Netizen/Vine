"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Loader2,
  FileText,
  CheckSquare,
  Award,
  Users,
  Trash2,
} from "lucide-react";
import moment from "moment";
import Countdown from "react-countdown";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { checkObjectFields } from "@/app/utils/common";
import {
  AddAssignmentModal,
  SubmitAssignmentModal,
  SubmissionsListModal,
  ResultModal,
} from "../../../../Components/AssignmentModals";
import FullscreenDocViewer from "@/app/Components/FullscreenDocViewer";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const AssignmentsPage = () => {
  const params = useParams();
  const courseId = params.id;
  const { authUser, apiUrl } = useSelector((state) => ({
    authUser: state.auth.user,
    apiUrl: state.commonGLobal.apiUrl,
  }));
  const isAdmin = authUser?.roleId === 2;

  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Modal states
  const [modalState, setModalState] = useState({
    add: false,
    submit: false,
    list: false,
    result: false,
    docViewer: false,
  });
  const [docViewerUrl, setDocViewerUrl] = useState("");
  const [resultData, setResultData] = useState(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/getCourseAssignments/${courseId}`);
      setAssignments(response.data);
    } catch (error) {
      N("Error", "Failed to fetch assignments", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchAssignments();
  }, [courseId]);

  const handleFileUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "Assignment");
    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      N("Success", "File uploaded", "success");
      console.log("File uploaded successfully:", response.data.publicUrl);
      callback(response.data.publicUrl);
    } catch (error) {
      N("Error", "Upload failed", "error");
    }
  };

  // --- Handlers for Modals ---
  const handleAddAssignment = async (assignmentInfo) => {
    const dataToSend = {
      ...assignmentInfo,
      courseId,
      submissionBefore: moment(assignmentInfo.submissionBefore).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };
    if (!checkObjectFields(dataToSend, ["description", "path"]).success) {
      N("Error", "Please fill all required fields.", "error");
      return;
    }
    try {
      await axios.post("/api/storeAssignmentInfo", dataToSend);
      N("Success", "Assignment created!", "success");
      setModalState({ ...modalState, add: false });
      fetchAssignments();
    } catch (error) {
      N("Error", "Creation failed", "error");
    }
  };

  const handleSubmitWork = async (filePath) => {
    try {
      await axios.post("/api/submitAssignment", {
        assignmentId: selectedAssignment.id,
        path: filePath,
      });
      N("Success", "Assignment submitted!", "success");
      setModalState({ ...modalState, submit: false });
      fetchAssignments();
    } catch (error) {
      N("Error", "Submission failed", "error");
    }
  };

  const handleGradeSubmissions = async (marks) => {
    const submissionsWithMarks = selectedAssignment.submit.map((sub) => ({
      ...sub,
      mark: marks[sub.id] || 0,
    }));
    try {
      await axios.post("/api/submitAssignmentMarkUpdate", {
        submissionData: submissionsWithMarks,
      });
      N("Success", "Marks updated!", "success");
      setModalState({ ...modalState, list: false });
      fetchAssignments();
    } catch (error) {
      N("Error", "Failed to save marks", "error");
    }
  };

  const handleViewResult = async (assignment) => {
    try {
      const response = await axios.post("/api/getMyResult", {
        id: assignment.id,
      });
      if (response.data.submission.mark === 0) {
        N("Info", "Your assignment has not been marked yet.", "info");
        return;
      }
      setResultData(response.data.submission);
      setModalState({ ...modalState, result: true });
    } catch (error) {
      N("Error", "Could not fetch result.", "error");
    }
  };

  const handleDelete = async (assignment) => {
    try {
      await axios.post("/api/deleteAssignment", assignment);
      N("Success", "Assignment deleted.", "success");
      fetchAssignments();
    } catch (error) {
      N("Error", "Deletion failed.", "error");
    }
  };

  const openDocument = (path) => {
    setDocViewerUrl(path);
    setModalState({ ...modalState, docViewer: true });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-none">
        <Loader2 className="animate-spin text-indigo-500 h-10 w-10" />
      </div>
    );

  return (
    <div className="p-0 sm:p-8 bg-none min-h-screen">
      <div className="mx-auto">
        <div className="flex items-center sm:flex-row flex-col justify-between mb-8">
          <div>
            <Link
              href="/courses"
              className="flex items-center text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 mb-2 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center sm:text-start">
              Assignments
            </h1>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setModalState({ ...modalState, add: true })}
              className="mt-4 sm:mt-0"
            >
              <Plus size={20} className="mr-2" /> Add Assignment
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assign) => (
            <Card key={assign?.id} className="flex flex-col h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl font-bold line-clamp-1" title={assign?.title}>
                    {assign?.serialNo}. {assign?.title}
                  </CardTitle>
                  <Badge variant="secondary" className="whitespace-nowrap bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {assign?.mark} Pts
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <span className="font-medium">Due:</span>
                  <Countdown date={moment(assign?.submissionBefore).toDate()} />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {assign?.description}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-4 border-t bg-gray-50/50 dark:bg-gray-900/20">
                {isAdmin ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assign);
                        setModalState({ ...modalState, list: true });
                      }}
                      className="w-full"
                    >
                      <Users size={16} className="mr-2" />
                      Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocument(assign?.path)}
                      className="w-full"
                    >
                      <FileText size={16} className="mr-2" />
                      Document
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="col-span-2 w-full">
                          <Trash2 size={16} className="mr-2" />
                          Delete Assignment
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this assignment? This will also delete all student submissions.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(assign)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDocument(assign.path)}
                      className="w-full"
                    >
                      <FileText size={16} className="mr-2" />
                      View
                    </Button>

                    {assign.submitThisUser ? (
                      <Button variant="secondary" size="sm" disabled className="w-full bg-green-100 text-green-700 opacity-100">
                        <CheckSquare size={16} className="mr-2" />
                        Submitted
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedAssignment(assign);
                          setModalState({ ...modalState, submit: true });
                        }}
                        className="w-full"
                      >
                        <CheckSquare size={16} className="mr-2" />
                        Submit
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewResult(assign)}
                      className="col-span-2 w-full text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    >
                      <Award size={16} className="mr-2" />
                      View Result
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
              No Assignments
            </h2>
            <p className="text-gray-500 mt-2">
              {isAdmin
                ? "Click 'Add Assignment' to create one."
                : "No assignments have been posted yet."}
            </p>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <AddAssignmentModal
        isOpen={modalState.add}
        onClose={() => setModalState({ ...modalState, add: false })}
        onSave={{
          handleSave: handleAddAssignment,
          handleUpload: handleFileUpload,
        }}
      />
      <SubmitAssignmentModal
        isOpen={modalState.submit}
        onClose={() => setModalState({ ...modalState, submit: false })}
        onSave={{
          handleSubmit: handleSubmitWork,
          handleUpload: handleFileUpload,
        }}
        assignmentTitle={selectedAssignment?.title}
      />
      <SubmissionsListModal
        isOpen={modalState.list}
        onClose={() => setModalState({ ...modalState, list: false })}
        submissions={selectedAssignment?.submit || []}
        onSave={handleGradeSubmissions}
        onOpenFile={openDocument}
      />
      <ResultModal
        isOpen={modalState.result}
        onClose={() => setModalState({ ...modalState, result: false })}
        result={resultData}
      />
      <FullscreenDocViewer
        open={modalState.docViewer}
        url={docViewerUrl}
        title="Assignment Document"
        onClose={() => setModalState({ ...modalState, docViewer: false })}
        showContent={true}
      />
    </div>
  );
};

export default AssignmentsPage;
