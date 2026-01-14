"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
    Loader2,
    Plus,
    X,
    Filter,
    Book,
    CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MyAllCourse, getAllAssignments } from "@/app/utils/courseService";
import { Button } from "@/components/ui/button";
import AssignmentTable from "@/app/(public)/components/AssignmentTable";
import SubmittedAssignmentsTable from "@/app/(public)/components/SubmittedAssignmentsTable";
import CreateAssignmentDialog from "@/app/(public)/components/CreateAssignmentDialog";
import SubmitAssignmentDialog from "@/app/(public)/components/SubmitAssignmentDialog";
import GradingDialog from "@/app/(public)/components/GradingDialog";
import GradedAssignmentsTable from "@/app/(public)/components/GradedAssignmentsTable";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";

const INITIAL_DISPLAY_COUNT = 5;

const AssignmentPage = () => {
    const authUser = useSelector((state) => state.auth.user);
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isGradingOpen, setIsGradingOpen] = useState(false);
    const [isViewingResult, setIsViewingResult] = useState(false);

    // Selection & Filter States
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [filterAssignmentId, setFilterAssignmentId] = useState(null);

    // Pagination States
    const [showAllAssignments, setShowAllAssignments] = useState(false);
    const [showAllSubmissions, setShowAllSubmissions] = useState(false);
    const [showAllGraded, setShowAllGraded] = useState(false);

    useEffect(() => {
        // If all dialogs are closed, ensure body is unlocked
        if (!isCreateOpen && !isSubmitOpen && !isGradingOpen) {
            const timer = setTimeout(() => {
                if (document.body.style.pointerEvents === 'none') {
                    document.body.style.pointerEvents = '';
                }
                if (document.body.style.overflow === 'hidden') {
                    document.body.style.overflow = '';
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isCreateOpen, isSubmitOpen, isGradingOpen]);

    useEffect(() => {
        fetchData();
    }, [authUser]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const coursesRes = await MyAllCourse();
            if (coursesRes.success) {
                setCourses(coursesRes.courses);
            }

            const assignmentsRes = await getAllAssignments();
            console.log("assignmentsRes", assignmentsRes)
            if (assignmentsRes.success) {
                const fetchedAssignments = assignmentsRes.assignments;
                setAssignments(fetchedAssignments);

                let flatSubmissions = [];

                fetchedAssignments.forEach((assignment) => {
                    // 1. Check for 'submitThisUser' (The single object from your JSON)
                    if (assignment.submitThisUser) {
                        flatSubmissions.push({
                            ...assignment.submitThisUser, // Spread the submission details (id, mark, etc.)
                            assignment: {                 // Attach parent assignment info manually
                                id: assignment.id,
                                title: assignment.title,
                                course: assignment.course
                            }
                        });
                    }

                    // 2. Keep the array check just in case (for instructor view compatibility)
                    if (assignment.submit && Array.isArray(assignment.submit)) {
                        assignment.submit.forEach((sub) => {
                            flatSubmissions.push({
                                ...sub,
                                assignment: {
                                    id: assignment.id,
                                    title: assignment.title,
                                    course: assignment.course
                                }
                            });
                        });
                    }
                });

                console.log("Processed Submissions:", flatSubmissions);
                setAllSubmissions(flatSubmissions);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, item) => {
        console.log("Action:", action, item);

        switch (action) {
            case 'start':
                router.push(`/courseAssignment/${item.id}/submit`);
                break;

            case 'edit':
                setSelectedAssignment(item);
                setIsCreateOpen(true);
                break;

            case 'mark':
                setSelectedSubmission(item);
                setIsViewingResult(false);
                setIsGradingOpen(true);
                break;

            case 'view_submissions':
                setFilterAssignmentId(item.id);
                setShowAllSubmissions(true);
                document.getElementById('submitted-assignments-section')?.scrollIntoView({ behavior: 'smooth' });
                N("Info", `Viewing submissions for ${item.title}`, "info");
                break;

            case 'view_feedback':
            case 'view_result':
                const submissionToView = action === 'view_feedback' ? item : item.submitThisUser;

                if (submissionToView) {
                    setSelectedSubmission(submissionToView);
                    setIsViewingResult(true);
                    setIsGradingOpen(true);
                } else {
                    N("Error", "No submission found", "error");
                }
                break;

            case 'delete':
                if (confirm("Are you sure you want to delete this assignment?")) {
                    try {
                        const response = await axios.post("/api/deleteAssignment", item);
                        if (response.status === 200) {
                            N("Success", "Assignment deleted", "success");
                            fetchData();
                        }
                    } catch (error) {
                        N("Error", "Failed to delete assignment", "error");
                    }
                }
                break;

            default:
                break;
        }
    };

    const displayedAssignments = useMemo(() => {
        return showAllAssignments ? assignments : assignments.slice(0, INITIAL_DISPLAY_COUNT);
    }, [assignments, showAllAssignments]);

    const filteredSubmissions = useMemo(() => {
        if (filterAssignmentId) {
            return allSubmissions.filter(sub => sub.assignment?.id === filterAssignmentId);
        }
        return allSubmissions;
    }, [allSubmissions, filterAssignmentId]);

    // --- UPDATED FILTER LOGIC ---

    const pendingSubmissions = useMemo(() => {
        // Pending if it does NOT have a valid mark or grade
        return filteredSubmissions.filter(sub => {
            const hasMark = sub.mark && sub.mark !== "N/A";
            const hasGrade = sub.grade && sub.grade !== "N/A";
            return !hasMark && !hasGrade;
        });
    }, [filteredSubmissions]);

    const gradedSubmissions = useMemo(() => {
        // Graded only if it HAS a valid mark or grade (and is not "N/A")
        return filteredSubmissions.filter(sub => {
            const hasMark = sub.mark && sub.mark !== "N/A";
            const hasGrade = sub.grade && sub.grade !== "N/A";
            return hasMark || hasGrade;
        });
    }, [filteredSubmissions]);

    // ----------------------------

    const displayedPendingSubmissions = useMemo(() => {
        return showAllSubmissions ? pendingSubmissions : pendingSubmissions.slice(0, INITIAL_DISPLAY_COUNT);
    }, [pendingSubmissions, showAllSubmissions]);

    const displayedGradedSubmissions = useMemo(() => {
        return showAllGraded ? gradedSubmissions : gradedSubmissions.slice(0, INITIAL_DISPLAY_COUNT);
    }, [gradedSubmissions, showAllGraded]);

    const filteredAssignmentTitle = filterAssignmentId
        ? assignments.find(a => a.id === filterAssignmentId)?.title
        : null;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
            </div>
        );
    }

    const isInstructor = authUser?.roleId == "2";

    return (
        <div className="min-h-screen p-6 max-md:p-0 font-sans text-slate-900 dark:text-white ">
            <div className=" mx-auto space-y-8">
                {/* Assignments Section Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Book className="w-6 h-6" />
                            <span className="text-xl">Assignments Board</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {assignments.length > INITIAL_DISPLAY_COUNT && (
                            <Button
                                variant="ghost"
                                className="text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => router.push('/courseAssignment/all')}
                            >
                                View all &gt;
                            </Button>
                        )}
                        {isInstructor && (
                            <Link href="/create-assignment">
                                <Button
                                    className="gradient-button border shadow-sm hover:bg-slate-100 dark:bg-[#1F1F1F] dark:text-white dark:hover:bg-slate-800"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Assignment
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <AssignmentTable
                    assignments={displayedAssignments}
                    role={isInstructor ? "instructor" : "student"}
                    onAction={handleAction}
                />

                {/* Submitted / Pending Section */}
                {pendingSubmissions.length > 0 && (
                    <div id="submitted-assignments-section" className="space-y-4 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 flex-wrap">
                                <Book className="w-6 h-6 max-md:hidden" />
                                Submitted (Pending Grade)
                                {filteredAssignmentTitle && (
                                    <span className="ml-2 text-sm font-normal text-muted-foreground flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                        <Filter className="w-3 h-3" /> Filtered by: {filteredAssignmentTitle}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 ml-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                                            onClick={() => setFilterAssignmentId(null)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </span>
                                )}
                            </h2>
                            {pendingSubmissions.length > INITIAL_DISPLAY_COUNT && (
                                <Button
                                    variant="ghost"
                                    className="text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                                >
                                    {showAllSubmissions ? "Show less" : "View all"} &gt;
                                </Button>
                            )}
                        </div>

                        <SubmittedAssignmentsTable
                            submissions={displayedPendingSubmissions}
                            role={isInstructor ? "instructor" : "student"}
                            onAction={handleAction}
                        />
                    </div>
                )}

                {/* Graded Assignments Section */}
                {gradedSubmissions.length > 0 && (
                    <div id="graded-assignments-section" className="space-y-4 pt-8 border-t dark:border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 flex-wrap">
                                <CheckCircle className="w-6 h-6 max-md:hidden" />
                                Graded Assignments
                            </h2>
                            {gradedSubmissions.length > INITIAL_DISPLAY_COUNT && (
                                <Button
                                    variant="ghost"
                                    className="text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    onClick={() => setShowAllGraded(!showAllGraded)}
                                >
                                    {showAllGraded ? "Show less" : "View all"} &gt;
                                </Button>
                            )}
                        </div>

                        <GradedAssignmentsTable
                            submissions={displayedGradedSubmissions}
                            role={isInstructor ? "instructor" : "student"}
                            onAction={handleAction}
                        />
                    </div>
                )}

            </div>

            <CreateAssignmentDialog
                open={isCreateOpen}
                onOpenChange={(v) => {
                    setIsCreateOpen(v);
                    if (!v) setSelectedAssignment(null);
                }}
                onSuccess={fetchData}
                courses={courses}
                initialData={selectedAssignment}
            />

            <SubmitAssignmentDialog
                open={isSubmitOpen}
                onOpenChange={(v) => {
                    setIsSubmitOpen(v);
                    if (!v) setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                onSuccess={fetchData}
            />

            <GradingDialog
                open={isGradingOpen}
                onOpenChange={(v) => {
                    setIsGradingOpen(v);
                    if (!v) {
                        setIsViewingResult(false);
                        setSelectedSubmission(null);
                    }
                }}
                submission={selectedSubmission}
                onSuccess={fetchData}
                readOnly={isViewingResult}
            />
        </div>
    );
};

export default AssignmentPage;