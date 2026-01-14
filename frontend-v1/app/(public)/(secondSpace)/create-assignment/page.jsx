"use client";
import Link from 'next/link'
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileText as FileIcon, Type, GripVertical, ChevronDown, Check, Trash2, Edit2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { MyAllCourse } from "@/app/utils/courseService";
import dayjs from "dayjs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [courses, setCourses] = useState([]);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courseId, setCourseId] = useState("");
    const [totalMarks, setTotalMarks] = useState(0)
    const [allowedFileTypes, setAllowedFileTypes] = useState(["PDF"]);
    const [maxFileSize, setMaxFileSize] = useState("10MB");

    // Questions State
    const [questions, setQuestions] = useState([]);

    // Date and Time
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState("23:59");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await MyAllCourse();
            if (res.success) {
                setCourses(res.courses);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const timeOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hour = i.toString().padStart(2, "0");
                const minute = j.toString().padStart(2, "0");
                options.push(`${hour}:${minute}`);
            }
        }
        options.push("23:59");
        return Array.from(new Set(options)).sort();
    }, []);

    const toggleFileType = (type) => {
        if (allowedFileTypes.includes(type)) {
            setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
        } else {
            setAllowedFileTypes([...allowedFileTypes, type]);
        }
    }

    // --- Question Management Handlers ---

    const addNewQuestionRow = () => {
        setQuestions([...questions, { questionText: "", questionType: null, isNew: true }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const effectiveSerialNo = Math.floor(Math.random() * 100000);

        let submissionDateTime = null;
        if (selectedDate && selectedTime) {
            const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
            submissionDateTime = `${dateStr} ${selectedTime}:00`;
        }

        const assignmentInfo = {
            serialNo: effectiveSerialNo,
            title,
            description,
            mark: totalMarks,
            courseId,
            submissionBefore: submissionDateTime,
            allowedFileTypes,
            maxFileSize,
            questions
        };

        if (!courseId) {
            N("Error", "Please select a course", "error");
            setIsSubmitting(false);
            return;
        }
        if (!title || totalMarks <= 0 || !submissionDateTime) {
            N("Error", "Title, Total Marks, and Date required", "error");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post("/api/storeAssignmentInfo", assignmentInfo);

            if (response.status === 201 || response.status === 200) {
                N("Success", response.data.message, "success");
                router.push("/courseAssignment"); // Redirect back
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Operation failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen p-6 font-sans text-slate-900 dark:text-white ">
            <div className=" mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Creates New Assignments</h1>
                </div>

                <div className=" overflow-hidden">
                    {/* Step 1: Assignment Details */}
                    <div className="p-6 space-y-6 border-b">
                        <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="title">Assignment Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Final Project Submission"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-slate-50 dark:bg-[#121212]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course">Select Course</Label>
                                <Select onValueChange={setCourseId} value={courseId?.toString()}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-[#121212]">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((c) => (
                                            <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label>Allowed Files</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between bg-slate-50 dark:bg-[#121212]">
                                            <span className="truncate">{allowedFileTypes.length > 0 ? allowedFileTypes.join(", ") : "Select Types"}</span>
                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {['PDF', 'DOC', 'DOCX', 'XLS', 'PPT'].map((type) => (
                                            <DropdownMenuItem key={type} onSelect={(e) => { e.preventDefault(); toggleFileType(type); }}>
                                                <div className="flex items-center">
                                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", allowedFileTypes.includes(type) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    <span>{type}</span>
                                                </div>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="space-y-2">
                                <Label>Max File Size</Label>
                                <Select value={maxFileSize} onValueChange={setMaxFileSize}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-[#121212]">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['1MB', '2MB', '5MB', '10MB', '20MB', '50MB'].map(size => (
                                            <SelectItem key={size} value={size}>{size}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Popover modal={true}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-between text-left font-normal bg-slate-50 dark:bg-[#121212]",
                                                !selectedDate && "text-muted-foreground"
                                            )}
                                        >
                                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-[60]" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label>Due Time</Label>
                                <Select value={selectedTime} onValueChange={setSelectedTime}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-[#121212]">
                                        <SelectValue placeholder="Select..." />
                                    </SelectTrigger>
                                    <SelectContent className="h-[200px]">
                                        {timeOptions.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 md:w-1/3">
                            <Label htmlFor="totalMarks">Total Marks</Label>
                            <Input
                                id="totalMarks"
                                type="number"
                                min="0"
                                value={totalMarks}
                                onChange={(e) => setTotalMarks(Number(e.target.value))}
                                className="bg-slate-50 dark:bg-[#121212]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Write a short overview..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="bg-slate-50 dark:bg-[#121212]"
                            />
                        </div>
                    </div>

                    {/* Step 2: Questions */}
                    <div className="p-6 bg-slate-50 dark:bg-[#121212]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Questions</h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            {questions.map((q, idx) => (
                                <div key={idx} className="group flex items-center gap-3 p-3 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm transition-all hover:shadow-md">
                                    <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1">
                                        <Input
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion(idx, 'questionText', e.target.value)}
                                            placeholder="Enter Question..."
                                            className="border-0 focus-visible:ring-0 px-0 font-medium bg-transparent placeholder:text-slate-400"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className={cn(
                                                    "h-8 px-3 rounded-md text-sm font-medium transition-colors",
                                                    q.questionType ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-200" : "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20"
                                                )}>
                                                    {q.questionType === 'file_upload' ? 'Upload File' : q.questionType === 'short_answer' ? 'Short Answer' : 'Select'}
                                                    <ChevronDown className="w-3 h-3 ml-1 opacity-70" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => updateQuestion(idx, 'questionType', 'short_answer')}>
                                                    <Type className="w-4 h-4 mr-2" /> Short Answer
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateQuestion(idx, 'questionType', 'file_upload')}>
                                                    <FileIcon className="w-4 h-4 mr-2" /> Upload File
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => removeQuestion(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {questions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-white/50 dark:bg-slate-900/30">
                                    <p className="text-sm">No questions added yet</p>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={addNewQuestionRow}
                            className="w-full gradient-button hover:from-indigo-800 hover:to-purple-800 text-white border-0 py-3 text-sm font-semibold shadow-lg mb-6"
                        >
                            Add Questions
                        </Button>

                        <div className='flex items-center justify-end w-full gap-4'>
                            <Button
                                variant="outline"
                                className="font-bold border-gray-300 dark:border-gray-700"
                            >
                                <Link href="/courseAssignment">
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                className="text-white font-bold gradient-button"
                                onClick={handleSave}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Submit Assignment"}
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
