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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BlogsAdmin() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/blogs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBlogs(response.data);
        } catch (error) {
            console.error("Failed to fetch blogs", error);
            toast.error("Failed to load blogs");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (blog) => {
        router.push(`/superadmin/blogs/edit/${blog.id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Blog deleted");
            fetchBlogs();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Blogs</h1>
                <Button onClick={() => router.push("/superadmin/blogs/add")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Blog
                </Button>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : blogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No blogs found.</TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">{blog.title}</TableCell>
                                    <TableCell>{blog.author || '-'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${blog.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {blog.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(blog.id)}>
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
