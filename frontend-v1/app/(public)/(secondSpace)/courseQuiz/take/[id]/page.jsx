"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle, Clock, AlertCircle } from "lucide-react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const TakeQuizPage = () => {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id;

    const [quiz, setQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await axios.get(`/api/getQuizQuestions/${quizId}`);
                setQuiz(response.data);
                const [h, m, s] = response.data.duration.split(":").map(Number);
                setTimeLeft(h * 3600 + m * 60 + s);
                setStartTime(Date.now());
            } catch (error) {
                N("Error", "Could not load quiz", "error");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        if (quizId) fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft === 0) {
            handleSubmit();
            return;
        }
        const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const handleAnswerChange = (questionId, value) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);

        // Calculate time taken
        const timeTakenMs = Date.now() - startTime;
        const timeTakenMinutes = Math.floor(timeTakenMs / 60000);
        const timeTakenSeconds = Math.floor((timeTakenMs % 60000) / 1000);
        const timeTaken = `${timeTakenMinutes}m ${timeTakenSeconds}s`;

        const answers = quiz.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: selectedAnswers[q.id] || null,
        }));

        try {
            const response = await axios.post("/api/storeQuizAnswer", {
                answers,
                quizId,
                timeTaken,
            });

            N(
                "Success",
                `Quiz submitted! You scored ${response.data.score}%`,
                "success"
            );

            // Navigate to results page
            router.push(`/courseQuiz/${quizId}/results`);
        } catch (error) {
            N("Error", "Submission failed", "error");
            console.error(error);
            setSubmitting(false);
        }
    };

    const renderQuestion = (q, index) => {
        switch (q.questionType) {
            case "MCQ":
            case "TRUE_FALSE":
                const options = q.options ? JSON.parse(q.options) : [];
                return (
                    <div key={q.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                            {index + 1}. {q.question}
                        </p>
                        <RadioGroup
                            value={selectedAnswers[q.id] || ""}
                            onValueChange={(value) => handleAnswerChange(q.id, value)}
                        >
                            <div className="space-y-3">
                                {options.map((opt, optIndex) => (
                                    <div
                                        key={optIndex}
                                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                    >
                                        <RadioGroupItem
                                            value={opt.name}
                                            id={`q${q.id}-opt${optIndex}`}
                                            className="mr-3"
                                        />
                                        <Label
                                            htmlFor={`q${q.id}-opt${optIndex}`}
                                            className="text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                                        >
                                            {opt.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                    </div>
                );

            case "SHORT_ANSWER":
            case "FILL_BLANK":
                return (
                    <div key={q.id} className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                        <p className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
                            {index + 1}. {q.question}
                        </p>
                        <Input
                            type="text"
                            placeholder="Type your answer here..."
                            value={selectedAnswers[q.id] || ""}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full max-w-md"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-[#141414]">
                <LoaderCircle className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            {quiz.title}
                        </h1>
                        <div
                            className={`text-xl font-mono px-4 py-2 rounded-lg ${timeLeft < 60
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "bg-purple-600 text-white"
                                }`}
                        >
                            <Clock size={20} className="inline-block mr-2" />
                            {dayjs.duration(timeLeft, "seconds").format("HH:mm:ss")}
                        </div>
                    </div>

                    {quiz.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {quiz.description}
                        </p>
                    )}

                    {/* Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800 dark:text-blue-300">
                                <p className="font-semibold mb-2">Instructions:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>Answer ALL questions</li>
                                    <li>Choose ONLY one answer for the Questions</li>
                                    <li>Time is running, Take your time.</li>
                                    <li>Make sure you SUBMIT when you are done.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div className="p-8 space-y-6">
                    {quiz.questions && quiz.questions.length > 0 ? (
                        quiz.questions.map((q, index) => renderQuestion(q, index))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                            No questions available for this quiz.
                        </p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center">
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full max-w-xs py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {submitting ? (
                            <>
                                <LoaderCircle className="animate-spin mr-2" size={20} />
                                Submitting...
                            </>
                        ) : (
                            "Submit Quiz"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TakeQuizPage;
