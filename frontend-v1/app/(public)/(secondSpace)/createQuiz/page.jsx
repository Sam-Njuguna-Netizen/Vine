"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, GripVertical, ChevronDown, LoaderCircle, Save, X, Check } from "lucide-react";
import { MyAllCourse } from "@/app/utils/courseService";
import { N } from "@/app/utils/notificationService";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/app/api/axios";
import moment from "moment";

const CreateQuizPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCourseId = searchParams.get("courseId") || "";

    const [quizForm, setQuizForm] = useState({
        title: "",
        courseId: initialCourseId,
        timeLimit: "30",
        startDate: moment().format("YYYY-MM-DD"),
        startTime: "12:00",
        shuffle: "no",
        passingScore: "70",
        description: "",
    });

    const [questions, setQuestions] = useState([
        {
            id: 1,
            text: "Question No 01",
            type: "MCQ",
            options: [{ name: "Option 1" }, { name: "Option 2" }, { name: "Option 3" }, { name: "Option 4" }],
            answer: "Option 1"
        },
    ]);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [createdQuizId, setCreatedQuizId] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await MyAllCourse();
                setCourses(data.courses || []);
            } catch (error) {
                console.error("Failed to fetch courses", error);
                N("Error", "Failed to fetch courses", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (initialCourseId) {
            setQuizForm(prev => ({ ...prev, courseId: initialCourseId }));
        }
    }, [initialCourseId]);

    const handleAddQuestion = () => {
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        const newQuestion = {
            id: newId,
            text: `New Question`,
            type: "MCQ",
            options: [{ name: "Option 1" }, { name: "Option 2" }],
            answer: "Option 1"
        };
        setQuestions([...questions, newQuestion]);
        setEditingQuestionId(newId);
    };

    const handleDeleteQuestion = (id) => {
        setQuestions(questions.filter(q => q.id !== id));
        if (editingQuestionId === id) setEditingQuestionId(null);
    };

    const handleQuestionChange = (id, field, value) => {
        setQuestions(questions.map(q => {
            if (q.id === id) {
                const updatedQuestion = { ...q, [field]: value };

                // Reset/Configure based on type change
                if (field === 'type') {
                    if (value === 'True/False') {
                        updatedQuestion.options = [{ name: "True" }, { name: "False" }];
                        updatedQuestion.answer = "True";
                    } else if (value === 'MCQ') {
                        updatedQuestion.options = [{ name: "Option 1" }, { name: "Option 2" }, { name: "Option 3" }, { name: "Option 4" }];
                        updatedQuestion.answer = "Option 1";
                    } else {
                        // Short Answer or Fill in the Blank
                        updatedQuestion.options = [];
                        updatedQuestion.answer = "";
                    }
                }
                return updatedQuestion;
            }
            return q;
        }));
    };

    const handleOptionChange = (qId, optIndex, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[optIndex] = { name: value };

                // If the changed option was the answer, update the answer too (optional, but good UX)
                let newAnswer = q.answer;
                if (q.options[optIndex].name === q.answer) {
                    newAnswer = value;
                }

                return { ...q, options: newOptions, answer: newAnswer };
            }
            return q;
        }));
    };

    const addOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...q.options, { name: `Option ${q.options.length + 1}` }] };
            }
            return q;
        }));
    };

    const removeOption = (qId, optIndex) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = q.options.filter((_, idx) => idx !== optIndex);
                // Reset answer if it was removed
                let newAnswer = q.answer;
                if (q.options[optIndex].name === q.answer) {
                    newAnswer = newOptions.length > 0 ? newOptions[0].name : "";
                }
                return { ...q, options: newOptions, answer: newAnswer };
            }
            return q;
        }));
    };

    const handleSubmit = async () => {
        if (!quizForm.title || !quizForm.courseId) {
            N("Error", "Please fill in all required fields (Title, Course)", "error");
            return;
        }

        setSubmitting(true);
        try {
            let quizId = createdQuizId;

            // 1. Create Quiz (only if not already created in this session)
            if (!quizId) {
                const submissionBefore = moment(`${quizForm.startDate} ${quizForm.startTime}`).format("YYYY-MM-DD HH:mm:ss");

                const quizPayload = {
                    serialNo: 1, // Default or calculated
                    courseId: quizForm.courseId,
                    title: quizForm.title,
                    description: quizForm.description,
                    submissionBefore: submissionBefore,
                    duration: quizForm.timeLimit,
                    passingScore: parseInt(quizForm.passingScore),
                    shuffleQuestions: quizForm.shuffle === 'yes'
                };

                const quizResponse = await axios.post("/api/storeQuizInfo", quizPayload);

                if (quizResponse.data.success && quizResponse.data.quiz) {
                    quizId = quizResponse.data.quiz.id;
                    setCreatedQuizId(quizId);
                } else {
                    throw new Error("Failed to create quiz record");
                }
            }

            // 2. Add Questions
            if (quizId) {
                for (const q of questions) {
                    // Map frontend question type to backend format
                    let questionType = 'MCQ';
                    if (q.type === 'True/False') questionType = 'TRUE_FALSE';
                    else if (q.type === 'Short Answer') questionType = 'SHORT_ANSWER';
                    else if (q.type === 'Fill in the Blank') questionType = 'FILL_BLANK';
                    else if (q.type === 'MCQ') questionType = 'MCQ';

                    await axios.post("/api/storeQuizQuestion", {
                        quizId: quizId,
                        question: q.text,
                        answer: q.answer,
                        options: ['MCQ', 'True/False'].includes(q.type) ? q.options : null,
                        questionType: questionType,
                        points: 1
                    });
                }

                N("Success", "Quiz created successfully!", "success");
                router.push(`/courseQuiz`);
            }

        } catch (error) {
            console.error("Quiz creation failed", error);
            N("Error", "Failed to create quiz. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 max-md:p-0 font-sans text-gray-800 dark:text-gray-200  transition-colors duration-200">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 max-md:flex-col max-md:items-center max-md:gap-y-3 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl  max-md:text-xl font-bold text-gray-900 dark:text-white">Quiz Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
                            Create and manage quizzes to assess learners’ knowledge.
                        </p>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
                    >
                        {submitting ? <LoaderCircle className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Quiz
                    </Button>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Quiz Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quiz Title <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Quiz title...."
                            className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                            value={quizForm.title}
                            onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                        />
                    </div>

                    {/* Course Linked */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Linked <span className="text-red-500">*</span></label>
                        <Select
                            value={quizForm.courseId}
                            onValueChange={(val) => setQuizForm({ ...quizForm, courseId: val })}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder={loading ? "Loading..." : "Select..."} />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-gray-700">
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={String(course.id)} className="dark:text-gray-200 dark:focus:bg-slate-800">{course.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (Minutes)</label>
                        <Input
                            type="number"
                            className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white"
                            value={quizForm.timeLimit}
                            onChange={(e) => setQuizForm({ ...quizForm, timeLimit: e.target.value })}
                        />
                    </div>

                    {/* Start Date & Time */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date & Time</label>
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                value={quizForm.startDate}
                                onChange={(e) => setQuizForm({ ...quizForm, startDate: e.target.value })}
                            />
                            <Input
                                type="time"
                                className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                value={quizForm.startTime}
                                onChange={(e) => setQuizForm({ ...quizForm, startTime: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Shuffle Questions */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shuffle Questions</label>
                        <Select
                            value={quizForm.shuffle}
                            onValueChange={(val) => setQuizForm({ ...quizForm, shuffle: val })}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder="Yes" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-gray-700">
                                <SelectItem value="yes" className="dark:text-gray-200 dark:focus:bg-slate-800">Yes</SelectItem>
                                <SelectItem value="no" className="dark:text-gray-200 dark:focus:bg-slate-800">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Passing Score */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Passing Score (%)</label>
                        <Select
                            value={quizForm.passingScore}
                            onValueChange={(val) => setQuizForm({ ...quizForm, passingScore: val })}
                        >
                            <SelectTrigger className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white">
                                <SelectValue placeholder="70%" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-slate-900 dark:border-gray-700">
                                {[50, 60, 70, 80, 90].map(score => (
                                    <SelectItem key={score} value={String(score)} className="dark:text-gray-200 dark:focus:bg-slate-800">{score}%</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8 space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <Textarea
                        placeholder="write short overview..."
                        className="bg-white dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500 min-h-[100px]"
                        value={quizForm.description}
                        onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    />
                </div>

                {/* Questions Section */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Questions</h2>
                        <Button variant="ghost" size="sm" onClick={handleAddQuestion} className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20">
                            <Plus size={16} className="mr-1" /> Add Question
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={q.id} className={`bg-white dark:bg-slate-900 p-4 rounded-lg border ${editingQuestionId === q.id ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-500 dark:ring-blue-500' : 'border-gray-200 dark:border-gray-800'} shadow-sm transition-all`}>

                                {/* Question Header (Always Visible) */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold">
                                        {index + 1}
                                    </div>

                                    {editingQuestionId === q.id ? (
                                        <Input
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                            className="flex-grow font-medium bg-transparent border-gray-300 dark:border-gray-700 dark:text-white"
                                            placeholder="Enter question text..."
                                        />
                                    ) : (
                                        <span className="flex-grow text-gray-700 dark:text-gray-200 font-medium cursor-pointer" onClick={() => setEditingQuestionId(q.id)}>
                                            {q.text}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Select value={q.type} onValueChange={(val) => handleQuestionChange(q.id, 'type', val)}>
                                            <SelectTrigger className="w-[120px] h-8 text-xs bg-white dark:bg-slate-800 dark:border-gray-700 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-slate-800 dark:border-gray-700">
                                                <SelectItem value="MCQ" className="dark:text-gray-200">MCQ</SelectItem>
                                                <SelectItem value="True/False" className="dark:text-gray-200">True / False</SelectItem>
                                                <SelectItem value="Short Answer" className="dark:text-gray-200">Short Answer</SelectItem>
                                                <SelectItem value="Fill in the Blank" className="dark:text-gray-200">Fill in the Blank</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400"
                                            onClick={() => setEditingQuestionId(editingQuestionId === q.id ? null : q.id)}
                                        >
                                            {editingQuestionId === q.id ? <Check size={16} /> : <Edit2 size={16} />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                                            onClick={() => handleDeleteQuestion(q.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Expanded Edit Area */}
                                {editingQuestionId === q.id && (
                                    <div className="pl-12 pr-4 pb-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {["MCQ", "True/False"].includes(q.type) ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Options</label>
                                                {q.options.map((opt, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <div
                                                            className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center ${q.answer === opt.name ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30' : 'border-gray-300 dark:border-gray-600'}`}
                                                            onClick={() => handleQuestionChange(q.id, 'answer', opt.name)}
                                                        >
                                                            {q.answer === opt.name && <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />}
                                                        </div>
                                                        <Input
                                                            value={opt.name}
                                                            onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                                                            className={`h-9 dark:bg-slate-800 dark:text-white ${q.answer === opt.name ? 'border-green-300 bg-green-50/30 dark:border-green-800 dark:bg-green-900/20' : 'dark:border-gray-700'}`}
                                                            placeholder={`Option ${optIndex + 1}`}
                                                        />
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400" onClick={() => removeOption(q.id, optIndex)}>
                                                            <X size={14} />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {q.type === 'MCQ' && (
                                                    <Button variant="outline" size="sm" onClick={() => addOption(q.id)} className="mt-2 text-xs dark:bg-transparent dark:border-gray-700 dark:text-gray-300 dark:hover:bg-slate-800">
                                                        <Plus size={12} className="mr-1" /> Add Option
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correct Answer</label>
                                                <Input
                                                    value={q.answer}
                                                    onChange={(e) => handleQuestionChange(q.id, 'answer', e.target.value)}
                                                    className="h-9 border-green-300 bg-green-50/30 dark:bg-green-900/20 dark:border-green-800 dark:text-white"
                                                    placeholder="Enter the correct answer here..."
                                                />
                                                {q.type === 'Fill in the Blank' && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        Tip: Use underscores (e.g., "The sky is _____") in your question text.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="pt-2 border-t dark:border-gray-800 mt-4 flex justify-between items-center">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {["MCQ", "True/False"].includes(q.type) ? (
                                                    <>Correct Answer: <span className="font-medium text-green-600 dark:text-green-400">{q.answer || "None selected"}</span></>
                                                ) : (
                                                    <span>Ensure the answer matches exactly what you expect from the student.</span>
                                                )}
                                            </span>
                                            <Button size="sm" onClick={() => setEditingQuestionId(null)} className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Done</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Save Button */}
                <Button
                    className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white py-6 text-lg font-medium rounded-lg shadow-sm mt-8 dark:bg-[#6d28d9] dark:hover:bg-[#5b21b6]"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? "Saving Quiz..." : "Save & Create Quiz"}
                </Button>

            </div>
        </div>
    );
};

export default CreateQuizPage;