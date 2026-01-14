"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Loader2,
    Plus,
    Book,
    ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MyAllCourse, getAllAssignments } from "@/app/utils/courseService";
import { Button } from "@/components/ui/button";
import AssignmentTable from "@/app/(public)/components/AssignmentTable";
import CreateAssignmentDialog from "@/app/(public)/components/CreateAssignmentDialog";
import SubmitAssignmentDialog from "@/app/(public)/components/SubmitAssignmentDialog";
import GradingDialog from "@/app/(public)/components/GradingDialog";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";

const AllAssignmentsPage = () => {
    const authUser = useSelector((state) => state.auth.user);
    const router = useRouter();
    const [courses, setCourses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [isGradingOpen, setIsGradingOpen] = useState(false);
    const [isViewingResult, setIsViewingResult] = useState(false);

    // Selection States
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

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
            if (assignmentsRes.success) {
                setAssignments(assignmentsRes.assignments);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, item) => {
        switch (action) {
            case 'start':
                router.push(`/courseAssignment/${item.id}/submit`);
                break;

            case 'edit':
                setSelectedAssignment(item);
                setIsCreateOpen(true);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} />
            </div>
        );
    }

    const isInstructor = authUser?.roleId == "2";

    return (
        <div className="min-h-screen p-6 max-md:p-0 font-sans text-slate-900 dark:text-white">
            <div className="mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Book className="w-6 h-6" />
                            <span className="text-xl">All Assignments</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
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
                    assignments={assignments}
                    role={isInstructor ? "instructor" : "student"}
                    onAction={handleAction}
                />
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

export default AllAssignmentsPage;
