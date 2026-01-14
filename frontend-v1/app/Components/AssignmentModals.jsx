"use client";
import { useState, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Award,
} from "lucide-react";
import { calculateGrade, getOrdinalSuffix } from "@/app/utils/courseService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

import { DragDropFileUpload } from "./DragDropFileUpload";

// --- 1. Modal for Instructors to Add a New Assignment ---
export const AddAssignmentModal = ({ isOpen, onClose, onSave }) => {
  const [assignmentInfo, setAssignmentInfo] = useState({
    serialNo: "",
    mark: "",
    title: "",
    description: "",
    submissionBefore: "",
  });
  const [filePath, setFilePath] = useState("");
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  const handleInputChange = (e) =>
    setAssignmentInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (isOpen) {
      setAssignmentInfo({
        serialNo: "",
        mark: "",
        title: "",
        description: "",
        submissionBefore: "",
      });
      setFilePath("");
      setSelectedFileObj(null);
    }
  }, [isOpen]);

  const handleFileUpload = (file) => {
    setSelectedFileObj(file);
    onSave.handleUpload(file, setFilePath);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Add New Assignment</DialogTitle>
          <DialogDescription>Create a new assignment for your students.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="serialNo">Serial No</Label>
              <Input
                id="serialNo"
                name="serialNo"
                type="number"
                placeholder="1"
                value={assignmentInfo?.serialNo}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mark">Total Score</Label>
              <Input
                id="mark"
                name="mark"
                type="number"
                placeholder="100"
                value={assignmentInfo?.mark}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Midterm Project"
              value={assignmentInfo?.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Details about the assignment..."
              value={assignmentInfo?.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="submissionBefore">Due Date</Label>
            <Input
              id="submissionBefore"
              name="submissionBefore"
              type="datetime-local"
              value={assignmentInfo?.submissionBefore}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label>Resource File</Label>
            <DragDropFileUpload
              onFileSelect={handleFileUpload}
              selectedFile={selectedFileObj}
              label="Upload Assignment Resource"
            />
            {filePath && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <FileText className="h-4 w-4" /> Ready to save
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave.handleSave({ ...assignmentInfo, path: filePath })}
          >
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- 2. Modal for Students to Submit Their Assignment ---
export const SubmitAssignmentModal = ({
  isOpen,
  onClose,
  onSave,
  assignmentTitle,
}) => {
  const [filePath, setFilePath] = useState("");
  const [selectedFileObj, setSelectedFileObj] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFilePath("");
      setSelectedFileObj(null);
    }
  }, [isOpen]);

  const handleFileUpload = (file) => {
    setSelectedFileObj(file);
    onSave.handleUpload(file, setFilePath);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>{assignmentTitle}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-8">
          <DragDropFileUpload
            onFileSelect={handleFileUpload}
            selectedFile={selectedFileObj}
            label="Upload Your Submission"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave.handleSubmit(filePath)}
            disabled={!filePath}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- 3. Modal for Instructors to View & Grade Submissions ---
export const SubmissionsListModal = ({
  isOpen,
  onClose,
  onSave,
  submissions,
  onOpenFile,
}) => {
  const [marks, setMarks] = useState({});
  useEffect(() => {
    if (isOpen) {
      const initialMarks = submissions.reduce((acc, sub) => {
        acc[sub.id] = sub.mark || "";
        return acc;
      }, {});
      setMarks(initialMarks);
    }
  }, [isOpen, submissions]);

  const handleMarkChange = (id, value) => {
    setMarks((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Student Submissions</DialogTitle>
          <DialogDescription>Review and grade student work.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 py-4">
            {submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No submissions yet.</p>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-lg gap-4 shadow-sm"
                >
                  <div className="flex-1 w-full sm:w-auto">
                    <p className="font-semibold text-foreground truncate">
                      {sub.user.profile.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{sub.user.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenFile(sub.path);
                      }}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 w-full sm:w-auto justify-center"
                    >
                      <FileText size={16} className="mr-2" /> Open File
                    </Button>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Label htmlFor={`mark-${sub.id}`} className="sm:sr-only w-16 sm:w-auto text-sm shrink-0">Score:</Label>
                      <Input
                        id={`mark-${sub.id}`}
                        type="number"
                        placeholder="Score"
                        value={marks[sub.id]}
                        onChange={(e) => handleMarkChange(sub.id, e.target.value)}
                        className="flex-1 sm:w-24"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onSave(marks)}>Save All Marks</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- 4. Modal for Students to View Their Result ---
export const ResultModal = ({ isOpen, onClose, result }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full w-fit">
            <Award size={40} className="text-yellow-600 dark:text-yellow-500" />
          </div>
          <DialogTitle className="text-2xl">Your Result</DialogTitle>
        </DialogHeader>

        {result && (
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Score</span>
              <span className="font-bold text-foreground">
                {result.mark} / {result.assignment?.mark}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Rank</span>
              <span className="font-bold text-foreground">
                {getOrdinalSuffix(result.rank)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Grade</span>
              <span className="font-bold text-foreground">
                {calculateGrade(result.mark, result.assignment?.mark)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
