"use client";
import React, { useState, useRef } from "react";
import axios from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import "react-quill-new/dist/quill.snow.css";

// Use dynamic import for ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const ICONS = [
    "LayoutDashboard",
    "PenTool",
    "Database",
    "Users",
    "Mail",
    "Video",
    "Calendar",
    "Trophy",
    "Library",
    "BookOpen",
];

const COLORS = [
    { label: "Purple", value: "text-purple-500" },
    { label: "Indigo", value: "text-indigo-500" },
    { label: "Teal", value: "text-teal-500" },
    { label: "Green", value: "text-green-500" },
    { label: "Pink", value: "text-pink-500" },
    { label: "Red", value: "text-red-500" },
    { label: "Rose", value: "text-rose-500" },
    { label: "Yellow", value: "text-yellow-500" },
    { label: "Orange", value: "text-orange-500" },
    { label: "Blue", value: "text-blue-500" },
];

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const quillRef = useRef(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        content: "",
        buttonText: "Access Now",
        link: "",
        icon: "LayoutDashboard",
        color: "text-purple-500",
        image: "",
        isActive: true,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked) => {
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content) => {
        setFormData((prev) => ({ ...prev, content }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        form.append("folder", "products/hero");

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
            form.append("folder", "products/content");

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
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            await axios.post("/api/dynamic-products", formData, { headers });
            toast.success("Product created");
            router.push("/superadmin/products");
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save product");
        } finally {
            setLoading(false);
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

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/superadmin/products")}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
                <h1 className="text-3xl font-bold">Add New Product</h1>
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
                        <Label>Button Text</Label>
                        <Input
                            name="buttonText"
                            value={formData.buttonText}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Link (Internal or External)</Label>
                        <Input
                            name="link"
                            value={formData.link}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hero Image (Optional)</Label>
                        <div className="flex items-center gap-2">
                            <Input type="file" onChange={handleImageUpload} disabled={uploading} />
                            {formData.image && <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select
                            value={formData.icon}
                            onValueChange={(val) => handleSelectChange("icon", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Icon" />
                            </SelectTrigger>
                            <SelectContent>
                                {ICONS.map((icon) => (
                                    <SelectItem key={icon} value={icon}>
                                        {icon}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <Select
                            value={formData.color}
                            onValueChange={(val) => handleSelectChange("color", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Color" />
                            </SelectTrigger>
                            <SelectContent>
                                {COLORS.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full ${color.value.replace('text-', 'bg-')}`}></div>
                                            {color.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Short Description (Card)</Label>
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Page Content</Label>
                    {/* Increased height and separate container to prevent scroll jump */}
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
                    <Button type="button" variant="outline" onClick={() => router.push("/superadmin/products")}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || uploading}>
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Save Product
                    </Button>
                </div>
            </form>
        </div>
    );
}
