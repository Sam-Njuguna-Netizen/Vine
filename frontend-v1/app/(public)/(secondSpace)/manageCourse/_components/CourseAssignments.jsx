"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Plus,
    LoaderCircle,
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
} from "@/app/Components/AssignmentModals";
import FullscreenDocViewer from "@/app/Components/FullscreenDocViewer";

const CourseAssignments = ({ courseId }) => {
    const { authUser } = useSelector((state) => ({
        authUser: state.auth.user,
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
            console.error("Failed to fetch assignments", error);
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
        if (
            !window.confirm(
                "Are you sure? This will delete the assignment and all student submissions."
            )
        )
            return;
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
            <div className="flex justify-center items-center h-64 bg-none">
                <LoaderCircle className="animate-spin text-indigo-500" size={48} />
            </div>
        );

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            <div className=" mx-auto">
                <div className="flex items-center sm:flex-row flex-col justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center sm:text-start">
                            Assignments
                        </h1>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setModalState({ ...modalState, add: true })}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Plus size={20} className="mr-2" /> Add Assignment
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assign) => (
                        <div
                            key={assign?.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col border border-gray-200 dark:border-gray-700"
                        >
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white pr-2">
                                        {assign?.serialNo}. {assign?.title}
                                    </h3>
                                    <span className="text-xs font-semibold text-white whitespace-nowrap bg-blue-500 px-2 py-1 rounded-full">
                                        {assign?.mark} Pts
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 my-4">
                                    <p className="font-semibold">Due Date:</p>
                                    <Countdown date={moment(assign?.submissionBefore).toDate()} />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                                    {assign?.description}
                                </p>
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2">
                                {isAdmin ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setSelectedAssignment(assign);
                                                setModalState({ ...modalState, list: true });
                                            }}
                                            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center"
                                        >
                                            <Users size={16} className="mr-2" />
                                            View Submissions
                                        </button>
                                        <button
                                            onClick={() => openDocument(assign?.path)}
                                            className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center"
                                        >
                                            <FileText size={16} className="mr-2" />
                                            View Document
                                        </button>
                                        <button
                                            onClick={() => handleDelete(assign)}
                                            className="text-sm font-medium text-red-500 dark:text-red-400 flex items-center col-span-2 justify-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-2"
                                        >
                                            <Trash2 size={16} className="mr-2" />
                                            Delete Assignment
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openDocument(assign.path)}
                                            className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center"
                                        >
                                            <FileText size={16} className="mr-2" />
                                            View Assignment
                                        </button>
                                        {assign.submitThisUser ? (
                                            <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                                                <CheckSquare size={16} className="mr-2" />
                                                Submitted
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedAssignment(assign);
                                                    setModalState({ ...modalState, submit: true });
                                                }}
                                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center"
                                            >
                                                <CheckSquare size={16} className="mr-2" />
                                                Submit Work
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleViewResult(assign)}
                                            className="text-sm font-medium text-yellow-600 dark:text-yellow-400 flex items-center col-span-2 justify-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-2"
                                        >
                                            <Award size={16} className="mr-2" />
                                            View Result
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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

export default CourseAssignments;
