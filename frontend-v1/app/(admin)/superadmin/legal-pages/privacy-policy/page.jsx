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
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";

// Use dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function EditPrivacyPolicyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const quillRef = useRef(null);
    const slug = 'privacy-policy';

    const [formData, setFormData] = useState({
        id: null,
        title: "",
        slug: slug,
        metaTitle: "",
        content: "",
        isPublished: false,
    });

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("/api/super-admin/legal-pages", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const pages = response.data;
                const page = pages.find(p => p.slug === slug);
                if (page) {
                    setFormData({
                        id: page.id,
                        title: page.title || "",
                        slug: page.slug,
                        metaTitle: page.metaTitle || "",
                        content: page.content || "",
                        isPublished: page.isPublished || false,
                    });
                } else {
                    // If not found, set default
                    setFormData({
                        id: null,
                        title: "Privacy Policy",
                        slug: slug,
                        metaTitle: "",
                        content: "",
                        isPublished: false,
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load page");
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const data = {
                title: formData.title,
                slug: formData.slug,
                metaTitle: formData.metaTitle,
                content: formData.content,
                isPublished: formData.isPublished,
            };
            if (formData.id) {
                // Update
                await axios.put(`/api/super-admin/legal-pages/${formData.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Page updated successfully");
            } else {
                // Create
                await axios.post("/api/super-admin/legal-pages", data, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                toast.success("Page created successfully");
            }
            router.push("/superadmin/legal-pages");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save page");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-semibold text-slate-900">Edit Privacy Policy</h1>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        readOnly
                    />
                </div>
                <div>
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                        id="metaTitle"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="content">Content</Label>
                    <ReactQuill
                        ref={quillRef}
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        theme="snow"
                        modules={{
                            toolbar: [
                                [{ 'header': [1, 2, 3, false] }],
                                ['bold', 'italic', 'underline', 'strike'],
                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                ['link'],
                                ['clean']
                            ],
                        }}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="isPublished"
                        checked={formData.isPublished}
                        onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                    />
                    <Label htmlFor="isPublished">Published</Label>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Save
                </Button>
            </div>
        </div>
    );
}