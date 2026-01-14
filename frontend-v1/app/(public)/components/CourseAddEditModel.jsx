"use client";
import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import { allCategories } from "@/app/utils/courseService";
import { Loader2, Upload, X, Plus, Image as ImageIcon, Video } from "lucide-react";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const CourseAddEditModel = forwardRef((props, ref) => {
  const [open, setModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [featuredImage, setFeaturedImage] = useState("");
  const [introVideo, setIntroVideo] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("Beginner");
  const [categoryId, setCategoryId] = useState("");
  const [pricingModel, setPricingModel] = useState("Paid");
  const [regularPrice, setRegularPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [courseVisibility, setCourseVisibility] = useState("Visible");

  // File Refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    getAllCategories();
  }, []);

  const getAllCategories = async () => {
    const response = await allCategories();
    if (response?.success) {
      setCategories(response.categories);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setDifficultyLevel(course.difficultyLevel);
      setCategoryId(course.categoryId?.toString());
      setPricingModel(course.pricingModel);
      setRegularPrice(course.regularPrice);
      setSalePrice(course.salePrice);
      setCourseVisibility(course.courseVisibility);
      setTags(course.tags || []);
      setFeaturedImage(course.featuredImage || "");
      setIntroVideo(course.introVideo || "");
    } else {
      resetForm();
    }
    setModalOpen(true);
  };

  const notifyParent = (status = true) => {
    props.sendMessage(status);
  };

  useImperativeHandle(ref, (p) => ({
    openModal,
    notifyParent,
  }));

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficultyLevel("Beginner");
    setCategoryId("");
    setPricingModel("Paid");
    setRegularPrice(0);
    setSalePrice(0);
    setCourseVisibility("Visible");
    setTags([]);
    setFeaturedImage("");
    setIntroVideo("");
    setTagInput("");
  };

  const handleClose = () => {
    setModalOpen(false);
    resetForm();
  };

  // Tag Handling
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // File Upload Handling
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", type === 'image' ? "FeaturedImages" : "IntroVideo");

    try {
      setLoading(true);
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const data = response.data;
        N("Success", data.message, "success");
        if (type === 'image') {
          setFeaturedImage(data.publicUrl);
        } else {
          setIntroVideo(data.publicUrl);
        }
      } else {
        N("Error", "Error uploading", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      N("Error", error?.response?.data?.message || "Upload failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!title || !description || !categoryId) {
      N("Error", "Please fill in all required fields", "error");
      return;
    }

    const courseData = {
      title,
      description,
      categoryId,
      difficultyLevel,
      pricingModel,
      regularPrice,
      salePrice,
      courseVisibility,
      tags,
      featuredImage,
      introVideo,
    };

    if (!courseData.introVideo && (!courseData.tags || courseData.tags.length === 0)) {
      N("Error", "Please add intro video or tags", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/courses", courseData);
      if (response && response.status === 201) {
        notifyParent(true);
        N("Success", response.data.message, "success");
        handleClose();
      }
    } catch (error) {
      notifyParent(false);
      const msg = error.response?.data?.message || "Failed to save course";
      N("Error", msg, "error");
      if (error?.response?.data?.errors?.length) {
        N("Error", error.response.data.errors[0].message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[1000px] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Add New Course</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Category*</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title*</Label>
                <Input
                  placeholder="Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description*</Label>
                <Textarea
                  rows={4}
                  placeholder="Course description..."
                  className="resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Difficulty Level*</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Course Visibility*</Label>
                <RadioGroup
                  value={courseVisibility}
                  onValueChange={setCourseVisibility}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Visible" id="visible" />
                    <Label htmlFor="visible">Visible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Invisible" id="invisible" />
                    <Label htmlFor="invisible">Invisible</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Featured Image*</Label>
                <DragDropFileUpload
                  onFileSelect={(file) => handleFileUpload({ target: { files: [file] } }?.target?.files?.[0], 'image')}
                  selectedFile={featuredImage ? { name: "Current Image", previewUrl: featuredImage } : null}
                  label="Upload Featured Image"
                  accept="image/png, image/jpeg, image/jpg"
                />
              </div>

              <div className="space-y-2">
                <Label>Intro Video</Label>
                <DragDropFileUpload
                  onFileSelect={(file) => handleFileUpload({ target: { files: [file] } }?.target?.files?.[0], 'video')}
                  selectedFile={introVideo ? { name: "Current Video", previewUrl: introVideo } : null}
                  label="Upload Intro Video"
                  accept="video/mp4"
                />
              </div>

              <div className="space-y-2">
                <Label>Pricing Model*</Label>
                <div className="space-y-4">
                  <RadioGroup
                    value={pricingModel}
                    onValueChange={setPricingModel}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Free" id="free" />
                      <Label htmlFor="free">Free</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Paid" id="paid" />
                      <Label htmlFor="paid">Paid</Label>
                    </div>
                  </RadioGroup>

                  {pricingModel === "Paid" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label>Regular Price*</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={regularPrice}
                          onChange={(e) => setRegularPrice(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sale Price*</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={salePrice}
                          onChange={(e) => setSalePrice(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveCourse} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

CourseAddEditModel.displayName = "CourseAddEditModel";

export default CourseAddEditModel;
