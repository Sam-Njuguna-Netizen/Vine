"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import {
    Plus,
    MoreVertical,
    Trash2,
    Edit,
    Play,
    Award,
    Eye,
    ArrowUpDown
} from "lucide-react";
import moment from "moment";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import {
    AddQuizModal,
    AddQuestionsModal,
    QuizResultModal,
} from "@/app/Components/QuizModals";
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

const CourseQuizzes = ({ courseId }) => {
    const authUser = useSelector((state) => state.auth.user);
    const isAdmin = authUser?.roleId === 2;

    const [quizzes, setQuizzes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const [modalState, setModalState] = useState({
        addQuiz: false,
        addQuestions: false,
        result: false,
    });
    const [resultData, setResultData] = useState(null);

    const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/getCourseQuizs/${courseId}`);
            setQuizzes(response.data);
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
            N("Error", "Failed to fetch quizzes", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchQuizzes();
        }
    }, [courseId]);

    const handleAddQuiz = async (quizInfo) => {
        const dataToSend = {
            ...quizInfo,
            courseId,
            submissionBefore: moment(quizInfo.submissionBefore).format(
                "YYYY-MM-DD HH:mm:ss"
            ),
        };
        try {
            await axios.post("/api/storeQuizInfo", dataToSend);
            N("Success", "Quiz created!", "success");
            setModalState({ ...modalState, addQuiz: false });
            fetchQuizzes();
        } catch (error) {
            N("Error", "Creation failed", "error");
        }
    };

    const handleAddQuestion = async (questionData) => {
        if (!questionData.options.some((opt) => opt.name === questionData.answer)) {
            N("Error", "Correct answer must match an option.", "error");
            return;
        }
        try {
            await axios.post("/api/storeQuizQuestion", {
                ...questionData,
                quizId: selectedQuiz.id,
            });
            N("Success", "Question added!", "success");
        } catch (error) {
            N("Error", "Failed to add question", "error");
        }
    };

    const handleViewResult = async (quiz) => {
        try {
            const response = await axios.post("/api/myQuizResult", { id: quiz.answer.id });
            setResultData(response.data);
            setModalState({ ...modalState, result: true });
        } catch (error) {
            N("Error", "Could not fetch result.", "error");
        }
    };

    const handleDelete = async (quiz) => {
        if (
            !window.confirm(
                "Are you sure? This will delete the quiz and all related questions and answers."
            )
        )
            return;
        try {
            await axios.post("/api/deleteQuiz", quiz);
            N("Success", "Quiz deleted.", "success");
            fetchQuizzes();
        } catch (error) {
            N("Error", "Deletion failed.", "error");
        }
    };

    const submittedQuizzes = quizzes.filter(q => q.answer);

    const StatusBadge = ({ status }) => {
        let bgClass = "bg-gray-100 text-gray-800";
        if (status === "Completed" || status === "Passed") bgClass = "bg-green-100 text-green-800";
        if (status === "Scheduled") bgClass = "bg-blue-100 text-blue-800";
        if (status === "Failed" || status === "Expired") bgClass = "bg-red-100 text-red-800";

        return (
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${bgClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            <div className="space-y-12">

                {/* Quiz Board Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-gray-900 text-white p-1 rounded-md">
                                <span className="font-bold text-xs">QZ</span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quiz Board</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            {isAdmin && (
                                <Button
                                    onClick={() => setModalState({ ...modalState, addQuiz: true })}
                                    className="bg-white text-black border border-gray-300 hover:bg-gray-50 shadow-sm"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Create Quiz
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[250px]">
                                        <div className="flex items-center cursor-pointer">Quiz Title <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center cursor-pointer">Date <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center cursor-pointer">Start Time <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center cursor-pointer">Time Limit <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center cursor-pointer">Status <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                    </TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quizzes.map((quiz) => {
                                    const isExpired = moment().isAfter(moment(quiz.submissionBefore));
                                    const status = quiz.answer ? "Completed" : (isExpired ? "Expired" : "Scheduled");

                                    return (
                                        <TableRow key={quiz.id}>
                                            <TableCell className="font-medium">{quiz.title}</TableCell>
                                            <TableCell className="text-gray-600">{moment(quiz.submissionBefore).format("MMM D, YYYY")}</TableCell>
                                            <TableCell className="text-gray-600">{moment(quiz.submissionBefore).format("hh:mm A")}</TableCell>
                                            <TableCell className="text-gray-600">{quiz.duration} Mins</TableCell>
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
                                                        {isAdmin ? (
                                                            <>
                                                                <DropdownMenuItem onClick={() => { setSelectedQuiz(quiz); setModalState({ ...modalState, addQuestions: true }); }}>
                                                                    <Edit className="mr-2 h-4 w-4" /> Add/Edit Questions
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(quiz)} className="text-red-600">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {quiz.answer ? (
                                                                    <DropdownMenuItem onClick={() => handleViewResult(quiz)}>
                                                                        <Award className="mr-2 h-4 w-4" /> View Result
                                                                    </DropdownMenuItem>
                                                                ) : (
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/courseQuiz/take/${quiz.id}`}>
                                                                            <Play className="mr-2 h-4 w-4" /> Start Quiz
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {quizzes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 h-24">No quizzes found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {quizzes.length === 0 ? (
                            <div className="text-center text-gray-500 py-8 border rounded-lg">
                                No quizzes found.
                            </div>
                        ) : (
                            quizzes.map((quiz) => {
                                const isExpired = moment().isAfter(moment(quiz.submissionBefore));
                                const status = quiz.answer ? "Completed" : (isExpired ? "Expired" : "Scheduled");

                                return (
                                    <div key={quiz.id} className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {quiz.title}
                                            </h3>
                                            <StatusBadge status={status} />
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Date:</span>
                                                <span className="font-medium">{moment(quiz.submissionBefore).format("MMM D, YYYY")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Time:</span>
                                                <span className="font-medium">{moment(quiz.submissionBefore).format("hh:mm A")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="font-medium">{quiz.duration} Mins</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t flex justify-end gap-2">
                                            {isAdmin ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            Manage <MoreVertical className="ml-2 h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedQuiz(quiz); setModalState({ ...modalState, addQuestions: true }); }}>
                                                            <Edit className="mr-2 h-4 w-4" /> Add/Edit Questions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(quiz)} className="text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <>
                                                    {quiz.answer ? (
                                                        <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewResult(quiz)}>
                                                            <Award className="mr-2 h-4 w-4" /> View Result
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" className="w-full" asChild>
                                                            <Link href={`/courseQuiz/take/${quiz.id}`}>
                                                                <Play className="mr-2 h-4 w-4" /> Start Quiz
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Submitted Quiz Section */}
                {!isAdmin && submittedQuizzes.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="bg-gray-900 text-white p-1 rounded-md">
                                    <span className="font-bold text-xs">SQ</span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Submitted Quiz</h2>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer">Student Name <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer">Score <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer">Time Spent <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer">Attempts <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead>
                                            <div className="flex items-center cursor-pointer">Status <ArrowUpDown className="ml-2 h-3 w-3" /></div>
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submittedQuizzes.map((quiz) => {
                                        const score = quiz.answer?.score || 0;
                                        const isPassed = score >= 50; // Assuming 50% is passing
                                        const status = isPassed ? "Passed" : "Failed";

                                        return (
                                            <TableRow key={quiz.id}>
                                                <TableCell className="font-medium">{authUser?.name}</TableCell>
                                                <TableCell className="text-gray-600">{score}%</TableCell>
                                                <TableCell className="text-gray-600">{quiz.answer?.time_taken || "N/A"}</TableCell>
                                                <TableCell className="text-gray-600">{quiz.answer?.attempts || 1}</TableCell>
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
                                                            <DropdownMenuItem onClick={() => handleViewResult(quiz)}>
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {submittedQuizzes.map((quiz) => {
                                const score = quiz.answer?.score || 0;
                                const isPassed = score >= 50;
                                const status = isPassed ? "Passed" : "Failed";

                                return (
                                    <div key={quiz.id} className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {authUser?.name}
                                            </h3>
                                            <StatusBadge status={status} />
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Score:</span>
                                                <span className="font-medium">{score}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Time Spent:</span>
                                                <span className="font-medium">{quiz.answer?.time_taken || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Attempts:</span>
                                                <span className="font-medium">{quiz.answer?.attempts || 1}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t flex justify-end">
                                            <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewResult(quiz)}>
                                                <Eye className="mr-2 h-4 w-4" /> View Details
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* --- Modals --- */}
            <AddQuizModal
                isOpen={modalState.addQuiz}
                onClose={() => setModalState({ ...modalState, addQuiz: false })}
                onSave={handleAddQuiz}
            />
            <AddQuestionsModal
                isOpen={modalState.addQuestions}
                onClose={() => setModalState({ ...modalState, addQuestions: false })}
                onSave={handleAddQuestion}
            />
            <QuizResultModal
                isOpen={modalState.result}
                onClose={() => setModalState({ ...modalState, result: false })}
                result={resultData}
            />
        </div>
    );
};

export default CourseQuizzes;
