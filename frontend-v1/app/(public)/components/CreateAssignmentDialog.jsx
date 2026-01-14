import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Edit2, Check, X, FileText as FileIcon, Type, Menu, GripVertical, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import dayjs from "dayjs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area";
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

export default function CreateAssignmentDialog({ open, onOpenChange, onSuccess, courses = [], initialData = null }) {
    const [step, setStep] = useState(1); // 1: Details, 2: Questions

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [courseId, setCourseId] = useState("");
    const [totalMarks, setTotalMarks] = useState(0)
    const [allowedFileTypes, setAllowedFileTypes] = useState(["PDF"]);
    const [maxFileSize, setMaxFileSize] = useState("10MB");

    // Questions State
    const [questions, setQuestions] = useState([]);

    // State for new question being added directly in the list
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);

    // Date and Time
    const [selectedDate, setSelectedDate] = useState();
    const [selectedTime, setSelectedTime] = useState("23:59");

    const [isSubmitting, setIsSubmitting] = useState(false);

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

    useEffect(() => {
        if (open) {
            if (initialData) {
                setTitle(initialData.title || "");
                setDescription(initialData.description || "");
                setCourseId(initialData.courseId || initialData.course?.id || "");
                setTotalMarks(initialData.mark || 0);
                setAllowedFileTypes(initialData.allowedFileTypes ? JSON.parse(initialData.allowedFileTypes) : ["PDF"]);
                setMaxFileSize(initialData.maxFileSize || "10MB");
                setQuestions(initialData.questions || []);

                if (initialData.submissionBefore) {
                    const dateObj = new Date(initialData.submissionBefore);
                    setSelectedDate(dateObj);
                    setSelectedTime(dayjs(dateObj).format("HH:mm"));
                } else {
                    setSelectedDate(new Date());
                    setSelectedTime("23:59");
                }
            } else {
                resetForm();
            }
            setStep(1); // Always start at step 1
        }
    }, [open, initialData]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCourseId("");
        setTotalMarks(0);
        setSelectedDate(new Date());
        setSelectedTime("23:59");
        setAllowedFileTypes(["PDF"]);
        setMaxFileSize("10MB");
        setQuestions([]);
        setStep(1);
        setIsAddingQuestion(false);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const effectiveSerialNo = initialData?.serialNo || Math.floor(Math.random() * 100000);

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
            let response;
            if (initialData && initialData.id) {
                response = await axios.post("/api/updateAssignment", { ...assignmentInfo, id: initialData.id });
            } else {
                response = await axios.post("/api/storeAssignmentInfo", assignmentInfo);
            }

            if (response.status === 201 || response.status === 200) {
                N("Success", response.data.message, "success");
                onSuccess && onSuccess();
                onOpenChange(false);
                resetForm();
            }
        } catch (error) {
            N("Error", error?.response?.data?.message || "Operation failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFileType = (type) => {
        if (allowedFileTypes.includes(type)) {
            setAllowedFileTypes(allowedFileTypes.filter(t => t !== type));
        } else {
            setAllowedFileTypes([...allowedFileTypes, type]);
        }
    }

    // --- Question Management Handlers ---

    const addNewQuestionRow = () => {
        // Adds a temporary placeholder or empty question
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-w-[95vw] bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col max-h-[90vh] p-0 gap-0">

                {/* Header Section */}
                <div className="p-6 pb-4 bg-white dark:bg-[#1f1f1f] border-b dark:border-slate-800">
                    <DialogTitle className="text-xl font-bold flex items-center justify-between">
                        {initialData ? "Edit Assignment" : "Creates New Assignments"}
                        <div className="flex gap-1">
                            {/* Stepper Dots */}
                            <div className={cn("h-2 w-2 rounded-full", step === 1 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                            <div className={cn("h-2 w-2 rounded-full", step === 2 ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700")} />
                        </div>
                    </DialogTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {step === 1 ? "Enter assignment details & settings" : "Add and manage questions for this assignment"}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0a0a0a]">
                    {step === 1 && (
                        <div className="p-6 space-y-6">
                            {/* Step 1: Assignment Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Assignment Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Final Project Submission"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="bg-white dark:bg-[#1f1f1f]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="course">Select Course</Label>
                                    <Select onValueChange={setCourseId} value={courseId?.toString()}>
                                        <SelectTrigger className="bg-white dark:bg-[#1f1f1f]">
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
                                            <Button variant="outline" className="w-full justify-between bg-white dark:bg-[#1f1f1f]">
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
                                        <SelectTrigger className="bg-white dark:bg-[#1f1f1f]">
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
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-between text-left font-normal bg-white dark:bg-[#1f1f1f]",
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
                                        <SelectTrigger className="bg-white dark:bg-[#1f1f1f]">
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

                            <div className="space-y-2">
                                <Label htmlFor="totalMarks">Total Marks</Label>
                                <Input
                                    id="totalMarks"
                                    type="number"
                                    min="0"
                                    value={totalMarks}
                                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                                    className="bg-white dark:bg-[#1f1f1f]"
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
                                    className="bg-white dark:bg-[#1f1f1f]"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col min-h-full">
                            {/* Questions List Header */}
                            <div className="px-6 py-4 flex items-center justify-between">
                                <h3 className="font-semibold text-lg">Assignments</h3>
                                <div className="flex gap-2">
                                    {/* Header controls if needed */}
                                    {/* <Button size="icon" variant="ghost"><Plus className="w-5 h-5"/></Button> */}
                                </div>
                            </div>

                            <div className="flex-1 px-4 space-y-3 pb-20"> {/* pb-20 for bottom button space */}
                                {questions.map((q, idx) => (
                                    <div key={idx} className="group flex items-center gap-3 p-3 bg-white dark:bg-[#1f1f1f] border border-slate-100 dark:border-slate-800 rounded-md shadow-sm transition-all hover:shadow-md">
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
                                            {/* Type Selector matching the 'Select' badge design */}
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

                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => {/* Edit triggers focus purely via UI now */ }}>
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => removeQuestion(idx)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                {questions.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/30">
                                        <p className="text-sm">No questions added yet</p>
                                        <p className="text-xs">Click the button below to add one</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-white dark:bg-[#1f1f1f] border-t dark:border-slate-800">
                    {step === 1 ? (
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => {
                                if (!title || !courseId) { N("Error", "Please fill required fields", "error"); return; }
                                setStep(2);
                            }}
                        >
                            Next: Add Questions
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            {/* Add Questions Button - Purple Gradient Style */}
                            <Button
                                onClick={addNewQuestionRow}
                                className="w-full bg-gradient-to-r from-indigo-900 to-purple-900 hover:from-indigo-800 hover:to-purple-800 text-white border-0 py-6 text-base font-semibold shadow-lg"
                            >
                                Add Questions
                            </Button>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleSave}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : "Submit Assignment"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}