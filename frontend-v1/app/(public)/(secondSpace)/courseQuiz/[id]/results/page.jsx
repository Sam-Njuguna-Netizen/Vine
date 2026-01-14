"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle, Award, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { Button } from "@/components/ui/button";

const calculateGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
};

const QuizResultsPage = () => {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id;

    const [result, setResult] = useState(null);
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                // Get the quiz submission for the current user
                const response = await axios.get(`/api/getCourseQuizs/${quizId}`);

                // Find the quiz answer for this specific quiz
                const quizData = response.data.find(q => q.id == quizId);

                if (quizData?.answer) {
                    // Fetch detailed results
                    const resultResponse = await axios.post("/api/myQuizResult", {
                        id: quizData.answer.id
                    });

                    setResult(resultResponse.data.result);
                    setQuizAnswer(resultResponse.data.quizAnswer);
                } else {
                    N("Error", "No submission found for this quiz", "error");
                    router.back();
                }
            } catch (error) {
                console.error("Failed to fetch quiz results", error);
                N("Error", "Failed to load quiz results", "error");
            } finally {
                setIsLoading(false);
            }
        };

        if (quizId) {
            fetchResults();
        }
    }, [quizId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#141414]">
                <LoaderCircle className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    if (!quizAnswer || !result) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#141414]">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No results found
                    </p>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const score = parseInt(quizAnswer.score) || 0;
    const totalQuestions = quizAnswer.quiz?.questions?.length || 0;
    const correctCount = result.filter(r => r.isCorrect).length;
    const grade = calculateGrade(score);
    const isPassed = score >= (quizAnswer.quiz?.passingScore || 70);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141414] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
                    </Button>
                </div>

                {/* Results Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-center text-white">
                        <Award size={64} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
                        <p className="text-purple-100">{quizAnswer.quiz?.title}</p>
                    </div>

                    {/* Score Summary */}
                    <div className="p-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                    Your Score
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {score}%
                                </p>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                                    Grade
                                </p>
                                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                    {grade}
                                </p>
                            </div>

                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                                <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                                    Correct
                                </p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                    {correctCount}/{totalQuestions}
                                </p>
                            </div>

                            <div className={`${isPassed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-4 rounded-lg text-center`}>
                                <p className={`text-sm ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mb-1`}>
                                    Status
                                </p>
                                <p className={`text-2xl font-bold ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {isPassed ? "PASSED" : "FAILED"}
                                </p>
                            </div>
                        </div>

                        {quizAnswer.timeTaken && (
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-8 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Time Spent: <span className="font-semibold text-gray-800 dark:text-gray-200">{quizAnswer.timeTaken}</span>
                                </p>
                            </div>
                        )}

                        {/* Question-by-Question Review */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                                Review Your Answers
                            </h2>

                            <div className="space-y-4">
                                {result.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`border-l-4 ${item.isCorrect
                                                ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                                : "border-red-500 bg-red-50 dark:bg-red-900/10"
                                            } p-6 rounded-lg`}
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            {item.isCorrect ? (
                                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                                    Question {index + 1}: {item.question}
                                                </p>

                                                <div className="space-y-2 text-sm">
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium">Your answer:</span>{" "}
                                                        <span className={item.isCorrect ? "text-green-600 dark:text-green-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                                                            {item.selectedAnswer || "Not answered"}
                                                        </span>
                                                    </p>

                                                    {!item.isCorrect && (
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Correct answer:</span>{" "}
                                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                                {item.correctAnswer}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-center">
                            <Button
                                onClick={() => router.back()}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                            >
                                Back to Course
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizResultsPage;
