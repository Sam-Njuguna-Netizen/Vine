"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, Eye, Send, Check, Upload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import axios from "@/app/api/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

// --- PREVIEW MODAL COMPONENT ---
const CertificatePreviewModal = ({
  open,
  onClose,
  template,
  formData,
  elements,
}) => {
  const certRef = useRef(null);

  // This logic is for the actual rendering in the modal
  const [renderedElements, setRenderedElements] = useState([]);

  useEffect(() => {
    if (elements) {
      setRenderedElements(elements);
    }
  }, [elements]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "px", [1123, 794]);
    pdf.addImage(imgData, "PNG", 0, 0, 1123, 794);
    pdf.save(`Certificate-${formData.studentName || "Student"}.pdf`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
          <h2 className="text-xl font-bold">Certificate Preview</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 dark:bg-gray-950 flex justify-center items-center">
          <div
            ref={certRef}
            className="relative bg-white shadow-xl overflow-hidden mx-auto origin-center select-none"
            style={{ width: 1123, height: 794, transform: "scale(0.8)", transformOrigin: "top center" }} // Scale down for view
          >
            {!template && (
              <div className="flex items-center justify-center h-full text-slate-300">
                No Template Selected
              </div>
            )}

            {/* Check for placeholders to conditionally render hardcoded fallbacks */}
            {(() => {
              const hasLogoPlaceholder = renderedElements.some(el => el.placeholderType === 'logo');
              const hasSignaturePlaceholder = renderedElements.some(el => el.placeholderType === 'signature');

              return (
                <>
                  {renderedElements.map((el) => {
                    // RESOLVE PLACEHOLDERS FOR DISPLAY
                    let content = el.value;
                    let imgSrc = el.value;

                    if (el.type === "text") {
                      content = content
                        .replace("{student_name}", formData.studentName || "[Participant Name]")
                        .replace("{course_name}", formData.courseName || "[Course Name]")
                        .replace("{date}", formData.issueDate || "[Date]")
                        .replace("{instructor}", formData.instructorName || "[Instructor]")
                        .replace("{duration}", formData.duration || "[Duration]");
                    } else if (el.type === "image") {
                      if (el.placeholderType === 'logo' && formData.logo) {
                        imgSrc = formData.logo;
                      }
                      if (el.placeholderType === 'signature' && formData.signature) {
                        imgSrc = formData.signature;
                      }
                    }

                    return (
                      <div
                        key={el.id}
                        style={{
                          position: "absolute",
                          left: el.x,
                          top: el.y,
                          transform: "translate(-50%, -50%)",
                          zIndex: 10,
                        }}
                      >
                        {el.type === "text" && (
                          <div
                            style={{
                              fontSize: el.fontSize,
                              fontFamily: el.fontFamily,
                              color: el.color,
                              fontWeight: el.fontWeight,
                              width: el.width,
                              textAlign: el.textAlign,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {content}
                          </div>
                        )}
                        {el.type === "image" && (
                          <img
                            src={imgSrc}
                            style={{
                              width: el.width,
                              height: el.height,
                              objectFit: "contain",
                            }}
                            draggable={false}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Overlays - Fallback if no placeholder in template */}
                  {!hasSignaturePlaceholder && formData.signature && (
                    <div className="absolute bottom-20 right-40 transform translate-x-1/2">
                      <img
                        src={formData.signature}
                        className="h-20 object-contain"
                        alt="Signature"
                        draggable={false}
                      />
                    </div>
                  )}
                  {!hasLogoPlaceholder && formData.logo && (
                    <div className="absolute top-10 right-10">
                      <img
                        src={formData.logo}
                        className="h-24 w-24 object-contain"
                        alt="Logo"
                        draggable={false}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-[#7E22CE] hover:bg-[#6B21A8]" onClick={handleDownload}>
            <Download size={18} className="mr-2" /> Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};


export default function CertificatePage() {
  const { darkMode } = useTheme();

  // --- STATE ---
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [elements, setElements] = useState([]); // Canvas Elements

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({
    courseId: "",
    studentId: "",
    studentName: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    instructorName: "",
    duration: "", // Added duration
    logo: null,
    signature: null,
  });

  const [signatureMode, setSignatureMode] = useState("upload");
  const sigCanvasRef = useRef(null);
  const logoInputRef = useRef(null);
  const signatureInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    // Fetch Templates
    axios
      .get("/api/certificate-templates")
      .then((res) => {
        if (res.data.success) {
          setTemplates(res.data.templates);
          if (res.data.templates.length > 0)
            setSelectedTemplate(res.data.templates[0]);
        }
      })
      .catch((err) => console.log(err));

    // Fetch Courses
    axios
      .get("/api/myAllCourse")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data.courses || [];
        setCourses(list);
      })
      .catch((err) => console.log(err));

    // Fetch Current User
    axios.get("/api/authUser").then((res) => {
      if (res.data) {
        setFormData((prev) => ({ ...prev, instructorName: res.data.name || "" }));
      }
    });
  }, []);

  // Initialize Elements from Template
  useEffect(() => {
    if (selectedTemplate && selectedTemplate.data) {
      try {
        setElements(JSON.parse(selectedTemplate.data));
      } catch (e) {
        console.error("Error parsing template", e);
      }
    }
  }, [selectedTemplate]);

  // When Course Changes, fetch students (Mocked for now as per previous logic)
  useEffect(() => {
    if (!formData.courseId) return;
    // In a real app, you'd fetch students enrolled in this course
    setStudents([
      { id: 1, name: "Alice Johnson" },
      { id: 2, name: "Bob Smith" },
      { id: 3, name: "Charlie Brown" },
      { id: 4, name: "David Miller" },
    ]);

    const course = courses.find((c) => c.id.toString() === formData.courseId);
    if (course) {
      setFormData((prev) => ({
        ...prev,
        courseName: course.title || course.name,
      }));
    }
  }, [formData.courseId, courses]);

  // --- SIGNATURE CANVAS HELPER ---
  useEffect(() => {
    if (signatureMode === "draw" && sigCanvasRef.current) {
      const canvas = sigCanvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
    }
  }, [signatureMode]);

  const startDraw = (e) => {
    const ctx = sigCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = sigCanvasRef.current.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext("2d");
    const rect = sigCanvasRef.current.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
    if (sigCanvasRef.current) {
      setFormData((prev) => ({
        ...prev,
        signature: sigCanvasRef.current.toDataURL(),
      }));
    }
  };

  // --- ACTIONS ---
  const handleIssue = async () => {
    if (!selectedTemplate || !formData.studentId)
      return alert("Select template and student");
    setIssuing(true);
    try {
      await axios.post("/api/issued-certificates", {
        templateId: selectedTemplate.id,
        courseId: formData.courseId,
        studentId: formData.studentId,
        issueDate: formData.issueDate,
      });
      alert("Certificate Issued Successfully!");
    } catch (error) {
      alert("Failed to issue");
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans text-gray-900 dark:text-gray-100">
      <div className=" mx-auto space-y-10">
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Certificate</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Create, customize, and issue course completion certificates for your
            learners. Upload templates, personalize fields, and track issued
            certificates.
          </p>
        </div>

        {/* TEMPLATE SELECTION */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Select Certificate Template</h2>
            <div className="flex gap-4">
              {/* <Button variant="ghost" className="text-sm">
                <Upload className="w-4 h-4 mr-2" /> Upload Template
              </Button> */}
              <Link href="/certificate/templates" className="text-blue-600 text-sm font-medium hover:underline flex items-center">
                View all <span className="ml-1">→</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={cn(
                  "cursor-pointer group flex flex-col items-center",
                  selectedTemplate?.id === t.id ? "" : ""
                )}
              >
                <div className={cn(
                  "w-full aspect-[1.6] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 mb-3 relative transition-all",
                  selectedTemplate?.id === t.id ? "border-blue-600 ring-2 ring-blue-100 dark:ring-blue-900" : "border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-600"
                )}>
                  {t.thumbnail ? (
                    <img
                      src={t.thumbnail}
                      className="w-full h-full object-cover"
                      alt={t.name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Preview
                    </div>
                  )}
                  {selectedTemplate?.id === t.id && (
                    <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                      <div className="bg-blue-600 text-white rounded-full p-1">
                        <Check size={16} />
                      </div>
                    </div>
                  )}
                </div>
                <p className={cn("text-sm font-medium text-center", selectedTemplate?.id === t.id ? "text-blue-600" : "text-gray-600 dark:text-gray-300")}>
                  {t.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FORM SECTION */}
        <section className=" p-8 rounded-xl shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Select Course Name</Label>
              <Select onValueChange={(v) => setFormData(p => ({ ...p, courseId: v }))}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-12"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.title || c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Participant Name</Label>
              <Select onValueChange={(v) => {
                const s = students.find(stu => stu.id.toString() === v);
                setFormData(p => ({ ...p, studentId: v, studentName: s ? s.name : '' }))
              }}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-12"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Issue Date</Label>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={e => setFormData(p => ({ ...p, issueDate: e.target.value }))}
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Instructor Name</Label>
              <Select value={formData.instructorName} onValueChange={(v) => setFormData(p => ({ ...p, instructorName: v }))}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-12"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={formData.instructorName || "Current User"}>{formData.instructorName || "Current User"}</SelectItem>
                  {/* In real app, fetch instructors */}
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Row 3 - Full Width */}
            <div className="md:col-span-2 space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Course Duration</Label>
              <Input
                placeholder="Course duration"
                value={formData.duration}
                onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 h-12"
              />
            </div>
          </div>

          {/* ASSETS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* LOGO */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300 font-medium">Upload Logo</Label>
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 min-h-[160px] relative transition-colors hover:bg-blue-50 dark:hover:bg-gray-800">
                <DragDropFileUpload
                  onFileSelect={(file) => {
                    if (file) {
                      const r = new FileReader();
                      r.onload = () => setFormData(p => ({ ...p, logo: r.result }));
                      r.readAsDataURL(file);
                    }
                  }}
                  selectedFile={formData.logo ? { name: "Current Logo", previewUrl: formData.logo } : null}
                  label="Upload Logo (300x300)"
                  accept="image/*"
                />
                {formData.logo && (
                  <Button
                    size="icon" variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => setFormData(p => ({ ...p, logo: null }))}
                  >
                    <X size={12} />
                  </Button>
                )}
              </div>
            </div>

            {/* SIGNATURE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700 dark:text-gray-300 font-medium">Signature</Label>
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded p-1">
                  <button
                    onClick={() => setSignatureMode('upload')}
                    className={cn("text-xs px-2 py-1 rounded transition-colors", signatureMode === 'upload' ? "bg-white dark:bg-gray-700 shadow text-black dark:text-white" : "text-gray-500")}
                  >Upload</button>
                  <button
                    onClick={() => setSignatureMode('draw')}
                    className={cn("text-xs px-2 py-1 rounded transition-colors", signatureMode === 'draw' ? "bg-white dark:bg-gray-700 shadow text-black dark:text-white" : "text-gray-500")}
                  >Draw</button>
                </div>
              </div>

              {signatureMode === 'upload' ? (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 min-h-[160px] relative transition-colors hover:bg-blue-50 dark:hover:bg-gray-800">
                  <DragDropFileUpload
                    onFileSelect={(file) => {
                      if (file) {
                        const r = new FileReader();
                        r.onload = () => setFormData(p => ({ ...p, signature: r.result }));
                        r.readAsDataURL(file);
                      }
                    }}
                    selectedFile={formData.signature ? { name: "Current Signature", previewUrl: formData.signature } : null}
                    label="Upload Signature (.png)"
                    accept="image/*"
                  />
                  {formData.signature && (
                    <Button
                      size="icon" variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={() => setFormData(p => ({ ...p, signature: null }))}
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 min-h-[160px] relative overflow-hidden">
                  <Label className="absolute top-2 left-2 text-xs text-gray-400 pointer-events-none">Draw Signature</Label>
                  <canvas
                    ref={sigCanvasRef}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    className="w-full h-full cursor-crosshair"
                    style={{ minHeight: '160px' }}
                  />
                  {formData.signature && (
                    <div className="absolute top-2 right-2">
                      <Button size="xs" variant="destructive" onClick={() => {
                        const ctx = sigCanvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, 1000, 1000);
                        setFormData(p => ({ ...p, signature: null }));
                      }}>Clear</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex justify-center gap-6 pt-6">
            <Button
              className="bg-[#7E22CE] hover:bg-[#6B21A8] min-w-[160px] h-12 text-sm font-semibold"
              onClick={() => {
                setShowPreview(true);
                // Trigger download logic from modal is usually better, but here just open modal
              }}
            >
              Download (.PDF)
            </Button>
            <div className="flex gap-4">
              <Button
                className="bg-[#D97706] hover:bg-[#B45309] min-w-[160px] h-12 text-sm font-semibold"
                onClick={() => setShowPreview(true)}
              >
                View Certificates
              </Button>
              <Button
                className="bg-[#312E81] hover:bg-[#2A276B] min-w-[160px] h-12 text-sm font-semibold"
                onClick={handleIssue}
                disabled={issuing}
              >
                {issuing ? 'Issuing...' : 'Issue Certificate'}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* PREVIEW MODAL */}
      <CertificatePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        template={selectedTemplate}
        formData={formData}
        elements={elements}
      />
    </div>
  );
}
