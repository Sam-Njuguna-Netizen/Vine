"use client";
import { useState } from "react";
import { UploadCloud } from "lucide-react";

export const DragDropFileUpload = ({ onFileSelect, selectedFile, label = "Click or Drag to Upload", accept, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative overflow-hidden ${disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${isDragging
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }`}
        >
            {selectedFile?.previewUrl || (selectedFile?.type?.startsWith('image/') && selectedFile instanceof File ? URL.createObjectURL(selectedFile) : null) ? (
                <div className="absolute inset-0 z-0">
                    <img
                        src={selectedFile.previewUrl || URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-50 hover:opacity-40 transition-opacity"
                    />
                </div>
            ) : null}

            <div className="relative z-10 flex flex-col items-center">
                <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    accept={accept}
                    disabled={disabled}
                />
                <label htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`} className="cursor-pointer w-full flex flex-col items-center">
                    <UploadCloud className={`mb-2 h-10 w-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium text-foreground mb-1">{selectedFile ? selectedFile.name : label}</p>
                    <p className="text-xs text-muted-foreground">
                        {selectedFile ? "Click or Drag to replace" : "Supports: PDF, DOCX, IMG, etc."}
                    </p>
                </label>
            </div>
        </div>
    );
};

export default DragDropFileUpload;
