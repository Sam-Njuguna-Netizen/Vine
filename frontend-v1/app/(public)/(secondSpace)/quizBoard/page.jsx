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
    ArrowUpDown,
    Calendar,
    Clock
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

const QuizBoardPage = () => {
    const authUser = useSelector((state) => state.auth.user);
    const isInstructor = authUser?.roleId === 2;

    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            // Fetch all quizzes created by this instructor across all their courses
            const coursesResponse = await axios.get('/api/myAllCourse');
            const myCourses = coursesResponse.data.courses || [];

            let allQuizzes = [];
            let allSubmissions = [];

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

            setQuizzes(allQuizzes);

            // Extract submissions from quizzes that have answers
            const submissionsData = allQuizzes
                .filter(q => q.answer)
                .map(q => ({
                    ...q.answer,
                    quiz: q,
                    user: authUser // This would ideally come from the API with actual submitter info
                }));

            setSubmissions(submissionsData);
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
            N("Error", "Failed to fetch quizzes", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInstructor) {
            fetchQuizzes();
        }
    }, [isInstructor]);

    const handleDelete = async (quizId) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;

        try {
            await axios.post("/api/deleteQuiz", { id: quizId });
            N("Success", "Quiz deleted successfully", "success");
            fetchQuizzes();
        } catch (error) {
            N("Error", "Failed to delete quiz", "error");
        }
    };

    const StatusBadge = ({ status }) => {
        let bgClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        if (status === "Completed") bgClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        if (status === "Scheduled") bgClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        if (status === "Passed") bgClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        if (status === "Failed") bgClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${bgClass}`}>
                {status}
            </span>
        );
    };

    if (!isInstructor) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Only instructors can access the quiz board.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Quiz Board Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 text-white p-2 rounded-md">
                                <Edit className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Quiz Board
                            </h2>
                        </div>
                        <Link href="/createQuiz">
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Create Quiz
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading quizzes...</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[250px]">
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Quiz Title <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Course <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Date <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Start Time <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Time Limit <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Status <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quizzes.map((quiz) => {
                                        const isExpired = moment().isAfter(moment(quiz.submissionBefore));
                                        const status = isExpired ? "Completed" : "Scheduled";

                                        return (
                                            <TableRow key={quiz.id}>
                                                <TableCell className="font-medium">{quiz.title}</TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {quiz.course?.title || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {moment(quiz.submissionBefore).format("MMM D, YYYY")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {moment(quiz.submissionBefore).format("hh:mm A")}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {quiz.duration} Mins
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={status} />
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/createQuiz?quizId=${quiz.id}`}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(quiz.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {quizzes.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center text-gray-500 dark:text-gray-400 h-24"
                                            >
                                                No quizzes found. Create your first quiz!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Submitted Quiz Section */}
            {submissions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-600 text-white p-2 rounded-md">
                                <Award className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Submitted Quiz
                            </h2>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Student Name <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Course <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Score <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Time Spent <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Attempts <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer hover:text-purple-600">
                                                Status <ArrowUpDown className="ml-2 h-3 w-3" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.map((submission) => {
                                        const score = parseInt(submission.score) || 0;
                                        const isPassed = score >= (submission.quiz?.passingScore || 70);
                                        const status = isPassed ? "Passed" : "Failed";

                                        return (
                                            <TableRow key={submission.id}>
                                                <TableCell className="font-medium">
                                                    {submission.user?.profile?.name || authUser?.name || "Unknown"}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {submission.quiz?.course?.title || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400 font-semibold">
                                                    {score}%
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {submission.timeTaken || "N/A"}
                                                </TableCell>
                                                <TableCell className="text-gray-600 dark:text-gray-400">
                                                    {submission.attempts || 1}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={status} />
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" /> View Details
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizBoardPage;
