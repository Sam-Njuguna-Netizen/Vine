"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
    Plus,
    MoreVertical,
    Trash2,
    Edit,
    Award,
    Eye,
    Timer,
    Calendar,
    Clock,
    FileText,
    ArrowUpDown
} from "lucide-react";
import moment from "moment";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const QuizBoard = () => {
    const authUser = useSelector((state) => state.auth.user);
    const isInstructor = authUser?.roleId === 2;
    const isStudent = authUser?.roleId === 3;

    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuizData = async () => {
        setIsLoading(true);
        try {
            if (isInstructor) {
                // Fetch all quizzes created by this instructor across all their courses
                const coursesResponse = await axios.get('/api/myAllCourse');
                const myCourses = coursesResponse.data || [];

                let allQuizzes = [];

                // Fetch quizzes for each course
                for (const course of myCourses) {
                    try {
                        const quizResponse = await axios.get(`/api/getCourseQuizs/${course.id}`);
                        const courseQuizzes = quizResponse.data || [];

                        // Add course info to each quiz
                        const quizzesWithCourse = courseQuizzes.map(q => ({
                            ...q,
                            course: { id: course.id, title: course.title }
                        }));

                        allQuizzes = [...allQuizzes, ...quizzesWithCourse];
                    } catch (error) {
                        console.error(`Failed to fetch quizzes for course ${course.id}`, error);
                    }
                }

                // Remove duplicates based on quiz ID
                const uniqueQuizzes = Array.from(new Map(allQuizzes.map(item => [item.id, item])).values());
                setQuizzes(uniqueQuizzes);

                // Extract submissions from quizzes that have answers
                const submissionsData = allQuizzes
                    .filter(q => q.answer)
                    .map(q => ({
                        ...q.answer,
                        quiz: q,
                    }));

                setSubmissions(submissionsData);
            } else if (isStudent) {
                // Fetch enrolled courses for the student
                const coursesResponse = await axios.get('/api/myAllCourse');
                const allCourses = coursesResponse.data || [];

                // Filter only enrolled courses (where payment info exists)
                const enrolledCourses = allCourses.filter(course =>
                    course.payment && course.payment.length > 0
                );

                let allQuizzes = [];

                // Fetch quizzes for each enrolled course
                for (const course of enrolledCourses) {
                    try {
                        const quizResponse = await axios.get(`/api/getCourseQuizs/${course.id}`);
                        const courseQuizzes = quizResponse.data || [];

                        // Add course info to each quiz
                        const quizzesWithCourse = courseQuizzes.map(q => ({
                            ...q,
                            course: { id: course.id, title: course.title }
                        }));

                        allQuizzes = [...allQuizzes, ...quizzesWithCourse];
                    } catch (error) {
                        console.error(`Failed to fetch quizzes for course ${course.id}`, error);
                    }
                }

                // Remove duplicates based on quiz ID
                const uniqueQuizzes = Array.from(new Map(allQuizzes.map(item => [item.id, item])).values());

                // Separate submitted and active quizzes
                const studentSubmissions = uniqueQuizzes
                    .filter(q => q.answer)
                    .map(q => ({
                        ...q.answer,
                        quiz: q
                    }));

                setSubmissions(studentSubmissions);
                setQuizzes(uniqueQuizzes.filter(q => !q.answer));
            }
        } catch (error) {
            console.error("Failed to fetch quiz data", error);
            N("Error", "Failed to load quiz data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuizData();
    }, [isInstructor, isStudent]);

    const handleDelete = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;

        try {
            await axios.post("/api/deleteQuiz", { id: quizId });
            N("Success", "Quiz deleted successfully", "success");
            fetchQuizData();
        } catch (error) {
            N("Error", "Failed to delete quiz", "error");
        }
    };

    const StatusBadge = ({ status }) => {
        let bgClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        if (status === "Completed") bgClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        if (status === "Scheduled") bgClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        if (status === "Passed") bgClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        if (status === "Failed") bgClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        if (status === "Expired") bgClass = "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400";

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass}`}>
                {status}
            </span>
        );
    };

    // Helper Component to determine if actions exist and render menu
    const QuizActions = ({ quiz, hasSubmitted, isExpired }) => {
        // Define availability of actions
        const canEdit = isInstructor;
        const canDelete = isInstructor;
        const canStart = isStudent && !hasSubmitted && !isExpired;
        const canViewResult = isStudent && hasSubmitted;

        // If no actions are available, do not render the DropdownMenu
        if (!canEdit && !canDelete && !canStart && !canViewResult) {
            return null;
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {canEdit && (
                        <DropdownMenuItem asChild>
                            <Link href={`/createQuiz?courseId=${quiz.courseId}&quizId=${quiz.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <DropdownMenuItem
                            onClick={() => handleDelete(quiz.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    )}
                    {canStart && (
                        <DropdownMenuItem asChild>
                            <Link href={`/courseQuiz/take/${quiz.id}`}>
                                Start Quiz
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {canViewResult && (
                        <DropdownMenuItem asChild>
                            <Link href={`/courseQuiz/${quiz.id}/results`}>
                                <Eye className="mr-2 h-4 w-4" /> View Result
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    if (!isInstructor && !isStudent) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Access Restricted
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Quiz board is available for instructors and students only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-0 md:p-6 space-y-6 md:space-y-8">
            {/* Quiz Board Section */}
            <div>
                <div className="p-0 md:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold">
                                Quiz Board
                            </h2>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto flex w-full items-end justify-end">
                            {isInstructor && (
                                <Link href="/createQuiz" className=" md:w-auto">
                                    <div className="flex items-center justify-center px-4 py-2 gradient-button text-white text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">
                                        <Plus className="mr-2 h-4 w-4 " /> Create Quiz
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-0 mt-2 md:p-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View: Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none">
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Quiz Title</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Course</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Start Time</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Time Limit</TableHead>
                                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quizzes.map((quiz) => {
                                            const isExpired = moment().isAfter(moment(quiz.submissionBefore));
                                            const hasSubmitted = !!quiz.answer;
                                            let status = "Scheduled";
                                            if (hasSubmitted) status = "Completed";
                                            else if (isExpired) status = "Expired";

                                            return (
                                                <TableRow key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                    <TableCell className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{quiz.title}</TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400">{quiz.course?.title || "N/A"}</TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{moment(quiz.submissionBefore).format("MMM D, YYYY")}</TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{moment(quiz.submissionBefore).format("hh:mm A")}</TableCell>
                                                    <TableCell className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{quiz.duration} Mins</TableCell>
                                                    <TableCell><StatusBadge status={status} /></TableCell>
                                                    <TableCell>
                                                        <QuizActions quiz={quiz} hasSubmitted={hasSubmitted} isExpired={isExpired} />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {quizzes.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400 h-24">No quizzes available.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View: Cards */}
                            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                                {quizzes.map((quiz) => {
                                    const isExpired = moment().isAfter(moment(quiz.submissionBefore));
                                    const hasSubmitted = !!quiz.answer;
                                    let status = "Scheduled";
                                    if (hasSubmitted) status = "Completed";
                                    else if (isExpired) status = "Expired";

                                    return (
                                        <div key={quiz.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[280px] snap-center shrink-0">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{quiz.course?.title}</p>
                                                </div>
                                                <QuizActions quiz={quiz} hasSubmitted={hasSubmitted} isExpired={isExpired} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{moment(quiz.submissionBefore).format("MMM D")}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{moment(quiz.submissionBefore).format("hh:mm A")}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Timer className="h-3 w-3" />
                                                    <span>{quiz.duration} min</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                                                <StatusBadge status={status} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {quizzes.length === 0 && (
                                    <div className="text-center text-gray-500 py-6">No quizzes available.</div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Submitted Quiz Section */}
            {(isInstructor || isStudent) && submissions.length > 0 && (
                <div>
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                <Award className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                Submitted Quiz
                            </h2>
                        </div>
                    </div>

                    <div className="p-4 md:p-6">
                        {/* Desktop Table for Submissions */}
                        <div className="hidden md:block overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-semibold">{isStudent ? "Quiz Title" : "Student Name"}</TableHead>
                                        <TableHead className="font-semibold">Course</TableHead>
                                        <TableHead className="font-semibold">Score</TableHead>
                                        <TableHead className="font-semibold">Time Spent</TableHead>
                                        <TableHead className="font-semibold">Attempts</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => {
                                        const score = parseInt(submission.score) || 0;
                                        const isPassed = score >= (submission.quiz?.passingScore || 70);
                                        const status = isPassed ? "Passed" : "Failed";

                                        return (
                                            <TableRow key={submission.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                <TableCell className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                                    {isStudent ? submission.quiz?.title : (submission.user?.name || authUser?.name || "Student")}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">{submission.quiz?.course?.title || "N/A"}</TableCell>
                                                <TableCell className="font-semibold text-gray-900 dark:text-gray-100">{score}%</TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">{submission.timeTaken || "N/A"}</TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">{submission.attempts || 1}</TableCell>
                                                <TableCell><StatusBadge status={status} /></TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={isStudent ? `/courseQuiz/${submission.quiz?.id}/results` : "#"}>
                                                                    <Eye className="mr-2 h-4 w-4" /> {isStudent ? "View Result" : "View Details"}
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards for Submissions */}
                        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
                            {submissions.map((submission) => {
                                const score = parseInt(submission.score) || 0;
                                const isPassed = score >= (submission.quiz?.passingScore || 70);
                                const status = isPassed ? "Passed" : "Failed";

                                return (
                                    <div key={submission.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[280px] snap-center shrink-0">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {isStudent ? submission.quiz?.title : (submission.user?.name || authUser?.name || "Student")}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">{submission.quiz?.course?.title || "N/A"}</p>
                                            </div>
                                            <StatusBadge status={status} />
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase">Score</p>
                                                <p className="font-bold text-lg">{score}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase">Time</p>
                                                <p className="font-medium">{submission.timeTaken || "N/A"}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase">Attempts</p>
                                                <p className="font-medium">{submission.attempts || 1}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                            <Link
                                                href={isStudent ? `/courseQuiz/${submission.quiz?.id}/results` : "#"}
                                                className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center hover:underline"
                                            >
                                                <Eye className="mr-2 h-4 w-4" /> {isStudent ? "View Result" : "View Details"}
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizBoard;