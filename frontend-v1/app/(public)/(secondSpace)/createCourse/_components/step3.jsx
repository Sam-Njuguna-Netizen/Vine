import React, { useState, useRef, useEffect } from "react";
import {
  Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  Video, FileText, Type, File, StickyNote, X, UploadCloud
} from "lucide-react";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

// --- Helper Component: Inline Edit Input ---
const InlineEdit = ({ value, onSave, onCancel, isEditing }) => {
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex gap-2 items-center flex-1">
        <input
          ref={inputRef}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="border border-orange-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(tempValue);
            if (e.key === "Escape") {
              setTempValue(value);
              onCancel();
            }
          }}
        />
        <button onClick={() => onSave(tempValue)} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200">Save</button>
        <button onClick={onCancel} className="text-xs text-gray-500 px-2 py-1">Cancel</button>
      </div>
    );
  }
  return <span className="text-gray-600 font-medium">{value}</span>;
};

// --- Helper Component: Content Modal ---
const ContentModal = ({ isOpen, onClose, type, initialData, onSave, uploadFile }) => {
  const [data, setData] = useState(initialData || {});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setData(initialData || {});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && uploadFile) {
      setIsUploading(true);
      try {
        const url = await uploadFile(file);
        if (url) {
          setData({ ...data, fileName: file.name, url: url });
        }
      } catch (err) {
        console.error("Upload error in modal", err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const renderContent = () => {
    switch (type) {
      case "video":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video Source</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="videoType"
                    checked={!data.isUpload}
                    onChange={() => setData({ ...data, isUpload: false })}
                  /> URL
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="videoType"
                    checked={data.isUpload}
                    onChange={() => setData({ ...data, isUpload: true })}
                  /> Upload
                </label>
              </div>

              {!data.isUpload ? (
                <input
                  type="text"
                  placeholder="https://vimeo.com/..."
                  className="w-full border border-gray-200 rounded p-2 text-sm"
                  value={data.url || ""}
                  onChange={(e) => setData({ ...data, url: e.target.value })}
                />
              ) : (
                <DragDropFileUpload
                  onFileSelect={(file) => handleFileChange({ target: { files: [file] } })}
                  selectedFile={data.fileName ? { name: data.fileName } : null}
                  label={isUploading ? "Uploading..." : "Click or Drag to upload video"}
                  accept="video/*"
                  disabled={isUploading}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mm:ss)</label>
              <input
                type="text"
                placeholder="10:00"
                className="w-full border border-gray-200 rounded p-2 text-sm"
                value={data.duration || ""}
                onChange={(e) => setData({ ...data, duration: e.target.value })}
              />
            </div>
          </div>
        );
      case "file":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <DragDropFileUpload
              onFileSelect={(file) => handleFileChange({ target: { files: [file] } })}
              selectedFile={data.fileName ? { name: data.fileName } : null}
              label={isUploading ? "Uploading..." : "Click or Drag file (PDF, Doc, Zip)"}
              disabled={isUploading}
            />
          </div>
        );
      case "captions":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Captions (.vtt, .srt)</label>
            <DragDropFileUpload
              onFileSelect={(file) => handleFileChange({ target: { files: [file] } })}
              selectedFile={data.fileName ? { name: data.fileName } : null}
              label={isUploading ? "Uploading..." : "Click or Drag captions"}
              accept=".vtt,.srt"
              disabled={isUploading}
            />
          </div>
        );
      case "desc":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Description</label>
            <textarea
              className="w-full border border-gray-200 rounded p-2 text-sm min-h-[150px]"
              placeholder="Enter description..."
              value={data.text || ""}
              onChange={(e) => setData({ ...data, text: e.target.value })}
            />
          </div>
        );
      case "notes":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded p-2 text-sm min-h-[150px]"
              placeholder="Enter notes for students..."
              value={data.text || ""}
              onChange={(e) => setData({ ...data, text: e.target.value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'video': return 'Add Video Content';
      case 'file': return 'Attach File';
      case 'captions': return 'Add Captions';
      case 'desc': return 'Add Description';
      case 'notes': return 'Add Lecture Notes';
      default: return 'Edit Content';
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">{getTitle()}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
          <button onClick={() => onSave(type, data)} className="px-4 py-2 text-sm bg-[#d1a055] text-white rounded hover:bg-[#b88b46]">Save Content</button>
        </div>
      </div>
    </div>
  );
};


// --- Sub-Component: Lecture Item ---
const LectureItem = ({ lecture, sectionId, onUpdate, onDelete, uploadFile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: null });
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (type) => {
    setShowDropdown(false);
    setModalState({ isOpen: true, type });
  };

  const handleModalSave = (type, data) => {
    // Update the lecture content based on type
    const updatedContent = { ...lecture.content, [type]: data };
    onUpdate(sectionId, lecture.id, { content: updatedContent });
    setModalState({ isOpen: false, type: null });
  };

  // Helper to check if content exists
  const hasContent = (type) => {
    return lecture.content && lecture.content[type];
  }

  return (
    <>
      <div className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm relative">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-gray-300 cursor-move">☰</span>
          <div className="flex flex-col">
            <InlineEdit
              value={lecture.name}
              isEditing={isEditing}
              onSave={(newName) => { onUpdate(sectionId, lecture.id, { name: newName }); setIsEditing(false); }}
              onCancel={() => setIsEditing(false)}
            />
            {/* Small indicators for content */}
            <div className="flex gap-2 mt-1">
              {hasContent('video') && <Video className="w-3 h-3 text-blue-500" title="Video added" />}
              {hasContent('file') && <File className="w-3 h-3 text-green-500" title="File attached" />}
              {hasContent('desc') && <FileText className="w-3 h-3 text-gray-500" title="Description added" />}
              {hasContent('notes') && <StickyNote className="w-3 h-3 text-yellow-500" title="Notes added" />}
              {hasContent('captions') && <Type className="w-3 h-3 text-purple-500" title="Captions added" />}
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3">
          {/* Contents Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-colors ${showDropdown ? 'bg-orange-100 text-orange-600' : 'bg-[#fff5e8] text-[#d1a055] hover:bg-orange-100'}`}
            >
              Contents {showDropdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {[
                  { label: "Video", icon: Video, id: "video" },
                  { label: "Attach File", icon: File, id: "file" },
                  { label: "Captions", icon: Type, id: "captions" },
                  { label: "Description", icon: FileText, id: "desc" },
                  { label: "Lecture Notes", icon: StickyNote, id: "notes" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 transition-colors"
                  >
                    <opt.icon className="w-3 h-3" />
                    {opt.label} {hasContent(opt.id) && <span className="ml-auto text-[10px] text-green-500">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Edit2
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-orange-500"
            onClick={() => setIsEditing(true)}
          />
          <Trash2
            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-500"
            onClick={() => onDelete(sectionId, lecture.id)}
          />
        </div>
      </div>

      {/* Modal for Content */}
      <ContentModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null })}
        type={modalState.type}
        initialData={lecture.content?.[modalState.type]}
        onSave={handleModalSave}
        uploadFile={uploadFile}
      />
    </>
  );
};

// --- Sub-Component: Section Item ---
const SectionItem = ({ section, index, onUpdateSection, onDeleteSection, onAddLecture, onUpdateLecture, onDeleteLecture, uploadFile }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-gray-400 cursor-grab">☰</span>
          <span className="font-bold text-gray-700 whitespace-nowrap">Section {String(index + 1).padStart(2, '0')}:</span>

          <div className="flex-1 ml-2">
            <InlineEdit
              value={section.name}
              isEditing={isEditing}
              onSave={(newName) => { onUpdateSection(section.id, { name: newName }); setIsEditing(false); }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        </div>

        <div className="flex gap-2 text-gray-400 ml-4">
          <Plus
            className="w-4 h-4 cursor-pointer hover:text-blue-500"
            title="Add Lecture"
            onClick={() => onAddLecture(section.id)}
          />
          <Edit2
            className="w-4 h-4 cursor-pointer hover:text-orange-500"
            title="Rename Section"
            onClick={() => setIsEditing(true)}
          />
          <Trash2
            className="w-4 h-4 cursor-pointer hover:text-red-500"
            title="Delete Section"
            onClick={() => onDeleteSection(section.id)}
          />
        </div>
      </div>

      <div className="space-y-2 pl-0 md:pl-4">
        {section.lectures.map((lecture) => (
          <LectureItem
            key={lecture.id}
            lecture={lecture}
            sectionId={section.id}
            onUpdate={onUpdateLecture}
            onDelete={onDeleteLecture}
            uploadFile={uploadFile}
          />
        ))}
        {section.lectures.length === 0 && <div className="text-sm text-gray-400 italic px-2">No lectures in this section.</div>}
      </div>
    </div>
  );
};

// --- Main Component ---
const Step3Curriculum = ({ formData, setFormData, uploadFile }) => {

  // 1. Add Section
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      name: "New Section",
      lectures: []
    };
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  };

  // 2. Update Section (Rename)
  const updateSection = (sectionId, updates) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => sec.id === sectionId ? { ...sec, ...updates } : sec)
    }));
  };

  // 3. Delete Section
  const deleteSection = (sectionId) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(sec => sec.id !== sectionId)
      }));
    }
  };

  // 4. Add Lecture
  const addLecture = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === sectionId) {
          return { ...sec, lectures: [...sec.lectures, { id: Date.now(), name: "New Lecture", type: "video", content: {} }] };
        }
        return sec;
      })
    }));
  };

  // 5. Update Lecture (Rename or Content)
  const updateLecture = (sectionId, lectureId, updates) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            lectures: sec.lectures.map(lec => lec.id === lectureId ? { ...lec, ...updates } : lec)
          };
        }
        return sec;
      })
    }));
  };

  // 6. Delete Lecture
  const deleteLecture = (sectionId, lectureId) => {
    if (confirm("Delete this lecture?")) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(sec => {
          if (sec.id === sectionId) {
            return { ...sec, lectures: sec.lectures.filter(lec => lec.id !== lectureId) };
          }
          return sec;
        })
      }));
    }
  };

  return (
    <div className="space-y-6 pb-20"> {/* Added pb-20 for scrolling space */}
      {formData.sections.map((section, idx) => (
        <SectionItem
          key={section.id}
          index={idx}
          section={section}
          onUpdateSection={updateSection}
          onDeleteSection={deleteSection}
          onAddLecture={addLecture}
          onUpdateLecture={updateLecture}
          onDeleteLecture={deleteLecture}
          uploadFile={uploadFile}
        />
      ))}

      <button
        onClick={addSection}
        className="w-full py-3 bg-[#fff9f0] border border-[#d1a055] border-dashed rounded-lg text-[#d1a055] font-medium hover:bg-[#fff0db] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Section
      </button>
    </div>
  );
};

export default Step3Curriculum;