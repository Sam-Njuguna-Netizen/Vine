"use client";


import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Layout,
  FileText,
  Video,
  UploadCloud,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Search,
  Award,
  PlayCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/app/api/axios";
import { allCategories } from "@/app/utils/courseService";
import Step3Curriculum from './_components/step3';
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Main Application ---

function CourseCreatorContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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
    sections: [
      {
        id: 1,
        name: "Section 01: Introduction",
        lectures: [{ id: 1, name: "Welcome to the course", type: "video", content: {} }]
      }
    ],

    // Publish
    welcomeMessage: "",
    congratsMessage: "",
    instructors: [],
    enableCertificate: false
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };




  useEffect(() => {
    const editCourseId = searchParams.get("courseId");
    if (editCourseId) {
      setCourseId(editCourseId);
      const fetchCourse = async () => {
        try {
          const response = await axios.get(`/api/course/${editCourseId}`);
          if (response.data) {
            const course = response.data;


            // Map backend data to frontend state
            setFormData({
              title: course.title || "",
              subtitle: course.subtitle || "",
              category: course.categoryId ? course.categoryId.toString() : "",
              subCategory: course.subCategoryId ? course.subCategoryId.toString() : "",
              topic: course.topic || "",
              language: course.languageId ? course.languageId.toString() : "",
              subtitleLanguage: course.subtitleLanguageId ? course.subtitleLanguageId.toString() : "",
              level: course.difficultyLevel || "",
              duration: course.duration || "",
              pricingModel: course.pricingModel || "Free",
              regularPrice: course.regularPrice || 0,
              salePrice: course.salePrice || 0,
              thumbnail: course.featuredImage || "",
              description: course.description || "",
              whatYouWillTeach: Array.isArray(course.whatYouWillTeach) && course.whatYouWillTeach.length > 0
                ? course.whatYouWillTeach
                : [""],
              targetAudience: Array.isArray(course.targetAudience) && course.targetAudience.length > 0
                ? course.targetAudience
                : [""],

              // FIXED: Map API content array to flat content object structure
              sections: course.sections && course.sections.length > 0
                ? course.sections.map((sec, sIdx) => ({
                  id: sec.id || sIdx + 1,
                  name: sec.title || `Section ${sIdx + 1}`,
                  lectures: sec.lectures && sec.lectures.length > 0
                    ? sec.lectures.map((lec, lIdx) => {


                      // Convert API's content array to flat object structure
                      const lectureContent = {};

                      if (lec.content && Array.isArray(lec.content) && lec.content.length > 0) {
                        lec.content.forEach((item) => {
                          if (item.type === 'video') {
                            lectureContent.video = {
                              url: item.url,
                              duration: item.contentData?.duration || '',
                              fileName: item.contentData?.fileName || '',
                              isUpload: !!item.contentData?.fileName // infer upload if filename exists?
                            };
                          }
                          else if (item.type === 'file') {
                            lectureContent.file = {
                              url: item.url,
                              fileName: item.contentData?.fileName || ''
                            };
                          }
                          else if (item.type === 'desc') {
                            lectureContent.desc = {
                              text: item.contentData?.text || ''
                            };
                          }
                          else if (item.type === 'notes') {
                            lectureContent.notes = {
                              text: item.contentData?.text || ''
                            };
                          }
                          else if (item.type === 'captions') {
                            lectureContent.captions = {
                              url: item.url,
                              fileName: item.contentData?.fileName || ''
                            };
                          }
                        });
                      }

                      // Determine lecture type
                      let lectureType = 'video'; // default
                      if (lectureContent.video) {
                        lectureType = 'video';
                      } else if (lectureContent.desc) {
                        lectureType = 'text'; // or 'desc'?
                      }



                      return {
                        id: lec.id || lIdx + 1,
                        name: lec.title || `Lecture ${lIdx + 1}`,
                        type: lectureType,
                        content: lectureContent // Flat object matching submit format
                      };
                    })
                    : [{ id: 1, name: "New Lecture", type: "video", content: {} }]
                }))
                : [{
                  id: 1,
                  name: "Section 01: Introduction",
                  lectures: [{ id: 1, name: "Welcome to the course", type: "video", content: {} }]
                }],

              welcomeMessage: course.welcomeMessage || "",
              congratsMessage: course.congratsMessage || "",
              instructors: course.instructors || [],
              enableCertificate: course.enableCertificate || false
            });
          }
        } catch (error) {
          console.error("Failed to fetch course data:", error);
          toast.error("Failed to load course data for editing.");
        }
      };
      fetchCourse();
    }
  }, [searchParams]);
  // --- File Upload Logic using your Endpoint ---
  const uploadFile = async (file) => {
    if (!file) return null;
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "course-assets"); // Organizing in S3

    try {
      const response = await axios.post("/api/upload", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        return response.data.publicUrl;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file.");
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

  // --- Navigation Logic ---
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSave = async (preview = false) => {
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

      // Prepare payload
      const payload = {
        ...formData,
        categoryId: Number(formData.category),
        subCategoryId: Number(formData.subCategory),
        languageId: Number(formData.language),
        subtitleLanguageId: Number(formData.subtitleLanguage),
        sections: formattedSections,
        regularPrice: Number(formData.regularPrice) || 0,
        salePrice: Number(formData.salePrice) || 0,
        pricingModel: formData.pricingModel,
        courseVisibility: 'Visible', // Mock
        difficultyLevel: formData.level || 'Beginner',
        featuredImage: formData.thumbnail || 'https://via.placeholder.com/1200x800', // Fallback
      };
      // return console.log(payload)
      let response;
      if (courseId) {
        response = await axios.put(`/api/courses/${courseId}`, payload);
      } else {
        response = await axios.post('/api/courses', payload);
      }

      if (response.status === 201 || response.status === 200) {
        const savedCourse = response.data.course;
        setCourseId(savedCourse.id);
        toast.success(courseId ? "Course Updated!" : "Course Created Successfully!");

        if (preview) {
          router.push(`/courses/${savedCourse.id}`);
        }
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save course: " + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmit = () => handleSave(false);

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* --- Header / Progress Bar --- */}
        <div className="border-b border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {[
              { id: 1, label: "Basic Information", icon: Layout },
              { id: 2, label: "Advance Information", icon: FileText },
              { id: 3, label: "Curriculum", icon: Video },
              { id: 4, label: "Publish Course", icon: PlayCircle },
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center gap-2 relative">
                  <div
                    className={`flex items-center gap-2 text-sm font-medium transition-colors
                      ${isActive ? "text-primary" : "text-muted-foreground"}
                      ${isCompleted ? "text-green-600 dark:text-green-500" : ""}
                    `}
                  >
                    <span className="text-lg">
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </span>
                    {step.label}
                    {isActive && <Badge variant="secondary" className="ml-2 text-xs">{step.id}/4</Badge>}
                  </div>
                  {/* Divider line for desktop */}
                  {index < 3 && (
                    <div className={`hidden md:block h-0.5 w-12 mx-4 ${isCompleted ? "bg-green-600 dark:bg-green-500" : "bg-gray-100 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* --- Main Content Area with Animation --- */}
        <div className="p-6 md:p-10 min-h-[600px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Advance Information"}
              {currentStep === 3 && "Course Curriculum"}
              {currentStep === 4 && "Publish Course"}
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => handleSave(false)}>Save</Button>
              <Button variant="ghost" className="text-primary hover:text-primary/90" onClick={() => handleSave(true)}>Save & Preview</Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <Step1Basic formData={formData} updateField={updateField} />}
              {currentStep === 2 && <Step2Advance formData={formData} updateField={updateField} handleFileUpload={handleFileUpload} uploading={uploading} />}
              {currentStep === 3 && <Step3Curriculum formData={formData} setFormData={setFormData} uploadFile={uploadFile} />}
              {currentStep === 4 && <Step4Publish formData={formData} updateField={updateField} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- Footer Navigation --- */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between bg-gray-50/50 dark:bg-gray-800/50">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={prevStep}>Previous</Button>
          ) : (
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          )}

          {currentStep < 4 ? (
            <Button onClick={nextStep}>Save & Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Submit For Review</Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// --- STEP 1: BASIC INFORMATION ---
// ----------------------------------------------------------------------------
const Step1Basic = ({ formData, updateField }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [subtitleLanguageOptions, setSubtitleLanguageOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, languagesRes, subtitleLanguagesRes] = await Promise.all([
          allCategories(),
          axios.get('/api/course-subcategories'),
          axios.get('/api/course-languages'),
          axios.get('/api/subtitle-languages')
        ]);

        if (categoriesRes && categoriesRes.categories) {
          setCategoryOptions(categoriesRes.categories);
        }
        if (subcategoriesRes.data) {
          setSubcategoryOptions(subcategoriesRes.data);
        }
        if (languagesRes.data) {
          setLanguageOptions(languagesRes.data);
        }
        if (subtitleLanguagesRes.data) {
          setSubtitleLanguageOptions(subtitleLanguagesRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Your course title"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          maxLength={80}
        />
        <div className="text-right text-xs text-muted-foreground">
          {formData.title.length}/80
        </div>
      </div>

      {/* Subtitle Input */}
      <div className="space-y-2">
        <Label>Subtitle</Label>
        <Input
          placeholder="Your course subtitle"
          value={formData.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          maxLength={120}
        />
        <div className="text-right text-xs text-muted-foreground">
          {formData.subtitle.length}/120
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Course Category</Label>
          <Select
            value={formData.category?.toString()}
            onValueChange={(val) => updateField("category", val)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Category"} />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Course Sub-category</Label>
          <Select
            value={formData.subCategory?.toString()}
            onValueChange={(val) => updateField("subCategory", val)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Sub-category"} />
            </SelectTrigger>
            <SelectContent>
              {subcategoryOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Topic Input */}
      <div className="space-y-2">
        <Label>Course Topic</Label>
        <Input
          placeholder="What is primarily taught in your course?"
          value={formData.topic}
          onChange={(e) => updateField("topic", e.target.value)}
        />
      </div>

      {/* Dropdowns Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Course Language</Label>
          <Select
            value={formData.language?.toString()}
            onValueChange={(val) => updateField("language", val)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Language"} />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Subtitle Language</Label>
          <Select
            value={formData.subtitleLanguage?.toString()}
            onValueChange={(val) => updateField("subtitleLanguage", val)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading..." : "Select Subtitle Language"} />
            </SelectTrigger>
            <SelectContent>
              {subtitleLanguageOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Course Level</Label>
          <Select
            value={formData.level}
            onValueChange={(val) => updateField("level", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              {["Beginner", "Intermediate", "Advanced"].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Duration</Label>
          <div className="flex">
            <Input
              placeholder="Duration"
              className="rounded-r-none border-r-0"
              value={formData.duration}
              onChange={(e) => updateField("duration", e.target.value)}
            />
            <div className="bg-muted border border-input px-3 py-2.5 rounded-r-lg text-sm text-muted-foreground flex items-center">
              Hours
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pricing</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Pricing Model</Label>
            <Select
              value={formData.pricingModel}
              onValueChange={(val) => updateField("pricingModel", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.pricingModel === 'Paid' && (
            <>
              <div className="space-y-2">
                <Label>Regular Price ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.regularPrice}
                  onChange={(e) => updateField("regularPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sale Price ($)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.salePrice}
                  onChange={(e) => updateField("salePrice", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// --- STEP 2: ADVANCE INFORMATION ---
// ----------------------------------------------------------------------------
const Step2Advance = ({ formData, updateField, handleFileUpload, uploading }) => {
  // Helper for dynamic lists
  const handleListChange = (index, value, listName) => {
    const newList = [...formData[listName]];
    newList[index] = value;
    updateField(listName, newList);
  };

  const addListItem = (listName) => {
    updateField(listName, [...formData[listName], ""]);
  };

  const removeListItem = (index, listName) => {
    const newList = [...formData[listName]];
    newList.splice(index, 1);
    updateField(listName, newList);
  };

  const fileInputRef = useRef(null);

  return (
    <div className="space-y-8">
      {/* Thumbnail Upload */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-2">
          <Label>Course Thumbnail</Label>
          <DragDropFileUpload
            onFileSelect={(file) => handleFileUpload(file, 'thumbnail')}
            selectedFile={formData.thumbnail ? { name: "Current Thumbnail", previewUrl: formData.thumbnail } : null}
            label="Upload Course Thumbnail"
          />
          <div className="hidden">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], 'thumbnail')}
            />
          </div>
        </div>
        <div className="w-full md:w-2/3 flex flex-col justify-center text-sm text-muted-foreground">
          <p className="mb-4">Upload your course Thumbnail here. <b>Important guidelines:</b> 1200x800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png</p>
          <Button
            variant="secondary"
            className="w-fit"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mr-2 h-4 w-4" /> Upload Image
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Course Descriptions</Label>
        <Textarea
          placeholder="Enter your course descriptions"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className="min-h-[150px]"
        />
        {/* <div className="flex gap-3 mt-2 border-t border-gray-100 pt-2 text-gray-400">
             <span className="font-bold cursor-pointer hover:text-foreground">B</span>
             <span className="italic cursor-pointer hover:text-foreground">I</span>
             <span className="underline cursor-pointer hover:text-foreground">U</span>
        </div> */}
      </div>

      {/* Dynamic List: What you will teach */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <Label>What you will teach in this course ({formData.whatYouWillTeach.length})</Label>
          <Button variant="ghost" size="sm" onClick={() => addListItem('whatYouWillTeach')} className="text-primary h-8">
            <Plus className="h-4 w-4 mr-1" /> Add new
          </Button>
        </div>
        <div className="space-y-3">
          {formData.whatYouWillTeach.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="What you will teach in this course..."
                value={item}
                onChange={(e) => handleListChange(idx, e.target.value, 'whatYouWillTeach')}
              />
              {formData.whatYouWillTeach.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeListItem(idx, 'whatYouWillTeach')}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic List: Target Audience */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <Label>Target Audience ({formData.targetAudience.length})</Label>
          <Button variant="ghost" size="sm" onClick={() => addListItem('targetAudience')} className="text-primary h-8">
            <Plus className="h-4 w-4 mr-1" /> Add new
          </Button>
        </div>
        <div className="space-y-3">
          {formData.targetAudience.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder="Who this course is for..."
                value={item}
                onChange={(e) => handleListChange(idx, e.target.value, 'targetAudience')}
              />
              {formData.targetAudience.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeListItem(idx, 'targetAudience')}>
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// --- STEP 3: CURRICULUM ---
// ----------------------------------------------------------------------------
// Step3Curriculum is imported from ./_components/step3

// ----------------------------------------------------------------------------
// --- STEP 4: PUBLISH COURSE ---
// ----------------------------------------------------------------------------
const Step4Publish = ({ formData, updateField }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-lg font-bold text-foreground mb-4 block">Message</Label>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Textarea
              placeholder="Enter course starting message here..."
              value={formData.welcomeMessage}
              onChange={(e) => updateField('welcomeMessage', e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label>Congratulations Message</Label>
            <Textarea
              placeholder="Enter your course completed message here..."
              value={formData.congratsMessage}
              onChange={(e) => updateField('congratsMessage', e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-bold text-foreground mb-4 block">Add Instructor</Label>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search by username" className="pl-9" />
        </div>

        {/* Mock Instructor List */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">U</div>
              <div>
                <div className="text-sm font-bold">Username</div>
                <div className="text-xs text-muted-foreground">UI/UX Designer</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/100" alt="User" />
              </div>
              <div>
                <div className="text-sm font-bold">Username</div>
                <div className="text-xs text-muted-foreground">UI/UX Designer</div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-bold text-foreground mb-4 block">Enable Certificate</Label>
        <div className="bg-slate-900 dark:bg-black rounded-lg p-6 flex items-center justify-between text-white relative overflow-hidden shadow-lg">
          <div className="flex items-center gap-4 z-10">
            <Award className="w-12 h-12 text-yellow-400" />
            <div>
              <h3 className="font-bold text-lg">Certification of Completion</h3>
              <p className="text-sm text-gray-400">Enable students to receive Certificates/Badges at the end of Course</p>
            </div>
          </div>
          <Button
            variant={formData.enableCertificate ? "default" : "secondary"}
            className={`z-10 ${formData.enableCertificate ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => updateField('enableCertificate', !formData.enableCertificate)}
          >
            {formData.enableCertificate ? "Enabled" : "Enable"}
          </Button>
          {/* Decorative gradient */}
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-gray-800 to-transparent opacity-50 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
const CourseCreator = () => (
  <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>}>
    <CourseCreatorContent />
  </Suspense>
);

export default CourseCreator;