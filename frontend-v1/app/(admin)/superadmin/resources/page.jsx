"use client";
import React, { useState, useEffect } from "react";
import axios from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ResourcesAdmin() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("documentation");
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const token = localStorage.getItem("authToken");
            // Using the public endpoint for reading, but in admin context
            // Or use an admin endpoint if created. The controller method index is public.
            const response = await axios.get("/api/public/resource-documents", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(response.data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
            toast.error("Failed to load documents");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !title) {
            toast.error("Please fill in required fields");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("file", file);

        setUploading(true);
        try {
            const token = localStorage.getItem("authToken");
            await axios.post("/api/super-admin/resource-documents", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
            });
            toast.success("Document uploaded successfully");
            setOpen(false);
            setOpen(false);
            setTitle("");
            setDescription("");
            setCategory("documentation");
            setFile(null);
            fetchDocuments();
        } catch (error) {
            console.error("Upload failed", error);
            toast.error(error.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            const token = localStorage.getItem("authToken");
            await axios.delete(`/api/super-admin/resource-documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Document deleted");
            fetchDocuments();
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Resources</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Upload Document</DialogTitle>
                            <DialogDescription>
                                Upload a new document for the public resources page.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Document Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="documentation">Documentation</SelectItem>
                                        <SelectItem value="brochure">Brochure</SelectItem>
                                        <SelectItem value="guide">Instruction Guide</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="file">File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={uploading}>
                                        {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {uploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No documents found.</TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{doc.title}</span>
                                            <span className="text-xs text-gray-400">{doc.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-md text-xs uppercase font-mono ${doc.category === 'brochure' ? 'bg-blue-100 text-blue-800' :
                                            doc.category === 'guide' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {doc.category || 'doc'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs uppercase font-mono">
                                            {doc.fileType}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(doc.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
