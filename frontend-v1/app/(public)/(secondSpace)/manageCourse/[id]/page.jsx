"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import Step1Basic from "../_components/Step1Basic";
import Step2Advance from "../_components/Step2Advance";
import Step3Curriculum from "../../createCourse/_components/step3";
import CourseDocuments from "../_components/CourseDocuments";
import CourseQuizzes from "../_components/CourseQuizzes";
import CourseAssignments from "../_components/CourseAssignments";
import CourseLiveClasses from "../_components/CourseLiveClasses";

const ManageCoursePage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const authUser = useSelector((state) => state.auth.user);
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("info");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Unified Form State
    const [formData, setFormData] = useState({
        // Basic Info
        title: "",
        subtitle: "",
        category: "",
        subCategory: "",
        topic: "",
        language: "",
        subtitleLanguage: "",
        level: "",
        duration: "",

        // Pricing
        pricingModel: "Free",
        regularPrice: 0,
        salePrice: 0,

        // Advance Info
        thumbnail: "", // URL from S3
        description: "",
        whatYouWillTeach: [""],
        targetAudience: [""],

        // Curriculum
        sections: [],

        // Publish
        welcomeMessage: "",
        congratsMessage: "",
        instructors: [],
        enableCertificate: false
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/course/${courseId}`);
                let courseData = null;
                if (response.data.success) {
                    courseData = response.data.course;
                } else {
                    courseData = response.data;
                }
                setCourse(courseData);

                // Populate formData
                if (courseData) {
                    // Map backend sections (title) to component sections (name)
                    const mappedSections = (courseData.sections || []).map(section => ({
                        ...section,
                        name: section.title,
                        lectures: (section.lectures || []).map(lecture => ({
                            ...lecture,
                            name: lecture.title
                        }))
                    }));

                    setFormData({
                        title: courseData.title || "",
                        subtitle: courseData.subtitle || "",
                        category: courseData.categoryId || "",
                        subCategory: courseData.subCategoryId || "",
                        topic: courseData.topic || "",
                        language: courseData.languageId || "",
                        subtitleLanguage: courseData.subtitleLanguageId || "",
                        level: courseData.difficultyLevel || "",
                        duration: courseData.duration || "",
                        pricingModel: courseData.pricingModel || "Free",
                        regularPrice: courseData.regularPrice || 0,
                        salePrice: courseData.salePrice || 0,
                        thumbnail: courseData.featuredImage || "",
                        description: courseData.description || "",
                        whatYouWillTeach: courseData.whatYouWillTeach ? JSON.parse(courseData.whatYouWillTeach) : [""],
                        targetAudience: courseData.targetAudience ? JSON.parse(courseData.targetAudience) : [""],
                        sections: mappedSections,
                        welcomeMessage: courseData.welcomeMessage || "",
                        congratsMessage: courseData.congratsMessage || "",
                        instructors: courseData.instructors || [],
                        enableCertificate: courseData.enableCertificate || false
                    });
                }

            } catch (error) {
                console.error("Failed to fetch course", error);
                N("Error", "Failed to fetch course details", "error");
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const uploadFile = async (file) => {
        if (!file) return null;
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", "course-assets");

        try {
            const response = await axios.post("/api/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (response.data.success) {
                return response.data.publicUrl;
            }
        } catch (error) {
            console.error("Upload failed:", error);
            N("Error", "Failed to upload file.", "error");
        } finally {
            setUploading(false);
        }
        return null;
    };

    const handleFileUpload = async (file, fieldName) => {
        const url = await uploadFile(file);
        if (url) {
            updateField(fieldName, url);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Transform sections to match backend validator (name -> title)
            const formattedSections = formData.sections.map((section, sIdx) => ({
                title: section.name,
                order: sIdx + 1,
                lectures: section.lectures.map((lecture, lIdx) => ({
                    title: lecture.name,
                    order: lIdx + 1,
                    content: lecture.content
                }))
            }));

            const payload = {
                ...formData,
                categoryId: Number(formData.category),
                subCategoryId: Number(formData.subCategory),
                languageId: Number(formData.language),
                subtitleLanguageId: Number(formData.subtitleLanguage),
                regularPrice: Number(formData.regularPrice) || 0,
                salePrice: Number(formData.salePrice) || 0,
                whatYouWillTeach: JSON.stringify(formData.whatYouWillTeach),
                targetAudience: JSON.stringify(formData.targetAudience),
                featuredImage: formData.thumbnail,
                difficultyLevel: formData.level,
                sections: formattedSections,
            };

            const response = await axios.put(`/api/courses/${courseId}`, payload);

            if (response.status === 200 || response.data.success) {
                N("Success", "Course updated successfully!", "success");
            }
        } catch (error) {
            console.error("Submission failed:", error);
            N("Error", "Failed to save course: " + (error.response?.data?.message || error.message), "error");
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Course Not Found</h1>
                <Link href="/courseManage">
                    <Button>Back to Courses</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 dark:bg-gray-950">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/courseManage">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {course.title}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Manage your course content and settings
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => window.open(`/courses/${courseId}`, '_blank')}>
                            Preview Course
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
                        <TabsTrigger value="info">Course Info</TabsTrigger>
                        <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                        <TabsTrigger value="live-classes">Live Classes</TabsTrigger>
                    </TabsList>

                    <div className="rounded-lg border bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 min-h-[500px]">
                        <TabsContent value="info" className="m-0 border-none p-6 space-y-8">
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                                <Step1Basic formData={formData} updateField={updateField} />
                            </div>
                            <div className="border-t pt-8">
                                <h2 className="text-lg font-semibold mb-4">Advance Information</h2>
                                <Step2Advance formData={formData} updateField={updateField} handleFileUpload={handleFileUpload} uploading={uploading} />
                            </div>
                        </TabsContent>
                        <TabsContent value="curriculum" className="m-0 border-none p-6">
                            <Step3Curriculum formData={formData} setFormData={setFormData} uploadFile={uploadFile} />
                        </TabsContent>
                        <TabsContent value="documents" className="m-0 border-none p-0">
                            <CourseDocuments courseId={courseId} />
                        </TabsContent>
                        <TabsContent value="quizzes" className="m-0 border-none p-0">
                            <CourseQuizzes courseId={courseId} />
                        </TabsContent>
                        <TabsContent value="assignments" className="m-0 border-none p-0">
                            <CourseAssignments courseId={courseId} />
                        </TabsContent>
                        <TabsContent value="live-classes" className="m-0 border-none p-0">
                            <CourseLiveClasses courseId={courseId} />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default ManageCoursePage;
