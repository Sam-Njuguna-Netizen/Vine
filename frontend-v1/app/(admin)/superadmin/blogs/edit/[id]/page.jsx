"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";

// Use dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditBlogPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const quillRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        image: "",
        author: "",
        isActive: true,
    });

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`/api/blogs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const blog = response.data;
                setFormData({
                    title: blog.title,
                    description: blog.description || "",
                    content: blog.content || "",
                    image: blog.image || "",
                    author: blog.author || "",
                    isActive: blog.isActive ? true : false,
                });
            } catch (error) {
                console.error("Failed to fetch blog", error);
                toast.error("Failed to load blog");
                router.push("/superadmin/blogs");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlog();
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked) => {
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    const handleContentChange = (content) => {
        setFormData((prev) => ({ ...prev, content }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        form.append("folder", "blogs/hero");

        try {
            setUploading(true);
            const token = localStorage.getItem("token");
            const response = await axios.post("/api/upload", form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setFormData((prev) => ({ ...prev, image: response.data.publicUrl }));
            toast.success("Image uploaded");
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const imageHandler = () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const form = new FormData();
            form.append("file", file);
            form.append("folder", "blogs/content");

            try {
                const token = localStorage.getItem("token");
                const response = await axios.post("/api/upload", form, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const url = response.data.publicUrl;
                const quill = quillRef.current.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, "image", url);
            } catch (error) {
                console.error("Editor image upload failed", error);
                toast.error("Failed to upload image to editor");
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            await axios.put(`/api/blogs/${id}`, formData, { headers });
            toast.success("Blog updated");
            router.push("/superadmin/blogs");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save blog");
        } finally {
            setSaving(false);
        }
    };

    const modules = React.useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                [{ color: [] }, { background: [] }],
                ["link", "image"],
                ["clean"],
            ],
            handlers: {
                image: imageHandler,
            },
        },
    }), []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/superadmin/blogs")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold">Edit Blog</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Author</Label>
                        <Input
                            name="author"
                            value={formData.author}
                            onChange={handleInputChange}
                            placeholder="Optional"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hero Image (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <Input type="file" onChange={handleImageUpload} disabled={uploading} />
                            {formData.image && <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded" />}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Blog Content</Label>
                    <div className="h-[500px] pb-16">
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={formData.content}
                            onChange={handleContentChange}
                            modules={modules}
                            className="h-full flex flex-col"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                    <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
                    <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.push("/superadmin/blogs")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving || uploading}>
                        {saving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Update Blog
                    </Button>
                </div>
            </form>
        </div>
    );
}
