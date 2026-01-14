import React, { useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Label, Input, TextArea } from "./FormComponents";
import { DragDropFileUpload } from "@/app/Components/DragDropFileUpload";

const Step2Advance = ({ formData, updateField, handleFileUpload, uploading }) => {
    // Helper for dynamic lists
    const handleListChange = (index, value, listName) => {
        const newList = [...(formData[listName] || [])];
        newList[index] = value;
        updateField(listName, newList);
    };

    const addListItem = (listName) => {
        updateField(listName, [...(formData[listName] || []), ""]);
    };

    const fileInputRef = useRef(null);

    return (
        <div className="space-y-8 p-4">
            {/* Thumbnail Upload */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <Label>Course Thumbnail</Label>
                    <DragDropFileUpload
                        onFileSelect={(file) => handleFileUpload(file, 'thumbnail')}
                        selectedFile={formData.thumbnail ? { name: "Current Thumbnail", previewUrl: formData.thumbnail } : null}
                        label="Upload Thumbnail (1200x800)"
                        accept="image/*"
                        disabled={uploading}
                    />
                </div>
                <div className="w-full md:w-2/3 flex flex-col justify-center text-sm text-gray-500">
                    <p>Upload your course Thumbnail here. <b>Important guidelines:</b> 1200x800 pixels or 12:8 Ratio. Supported format: .jpg, .jpeg, or .png</p>
                    <button
                        className="mt-4 bg-[#fff5e8] text-[#d1a055] px-4 py-2 rounded-lg font-medium w-fit self-start"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload Image <span className="ml-1">↑</span>
                    </button>
                </div>
            </div>

            {/* Description */}
            <div>
                <Label>Course Descriptions</Label>
                <TextArea
                    placeholder="Enter your course descriptions"
                    value={formData.description || ""}
                    onChange={(e) => updateField('description', e.target.value)}
                />
                <div className="flex gap-3 mt-2 border-t border-gray-100 pt-2 text-gray-400">
                    {/* Mock Rich Text Toolbar */}
                    <span className="font-bold cursor-pointer">B</span>
                    <span className="italic cursor-pointer">I</span>
                    <span className="underline cursor-pointer">U</span>
                </div>
            </div>

            {/* Dynamic List: What you will teach */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label>What you will teach in this course ({(formData.whatYouWillTeach || []).length})</Label>
                    <button onClick={() => addListItem('whatYouWillTeach')} className="text-[#d1a055] text-sm flex items-center gap-1">+ Add new</button>
                </div>
                <div className="space-y-3">
                    {(formData.whatYouWillTeach || []).map((item, idx) => (
                        <div key={idx}>
                            <Input
                                placeholder="What you will teach in this course..."
                                value={item}
                                onChange={(e) => handleListChange(idx, e.target.value, 'whatYouWillTeach')}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Dynamic List: Target Audience */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label>Target Audience ({(formData.targetAudience || []).length})</Label>
                    <button onClick={() => addListItem('targetAudience')} className="text-[#d1a055] text-sm flex items-center gap-1">+ Add new</button>
                </div>
                <div className="space-y-3">
                    {(formData.targetAudience || []).map((item, idx) => (
                        <div key={idx}>
                            <Input
                                placeholder="Who this course is for..."
                                value={item}
                                onChange={(e) => handleListChange(idx, e.target.value, 'targetAudience')}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Step2Advance;
