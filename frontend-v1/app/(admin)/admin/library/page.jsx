"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Trash2, Download, Search } from "lucide-react";
import { getLibraryFiles, deleteLibraryFile } from "@/app/utils/libraryService";
import { AllCourse } from "@/app/utils/courseService";
import { useSelector } from "react-redux";
import { N } from "@/app/utils/notificationService";
import { useRouter } from "next/navigation";

export default function AdminLibraryPage() {
    const router = useRouter();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [fileType, setFileType] = useState("all");
    const [courseId, setCourseId] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [coursesList, setCoursesList] = useState([]);

    const authUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [search, fileType, courseId, sort, page]);

    const fetchCourses = async () => {
        const res = await AllCourse();
        if (res.success) {
            if (Array.isArray(res.courses)) {
                setCoursesList(res.courses);
            } else if (res.courses.data) {
                setCoursesList(res.courses.data);
            }
        }
    };

    const fetchFiles = async () => {
        setLoading(true);
        const params = {
            search,
            file_type: fileType === "all" ? "" : fileType,
            course_id: courseId === "all" ? "" : courseId,
            sort,
            page,
            limit: 10
        };
        const res = await getLibraryFiles(params);
        if (res.success) {
            setFiles(res.data.data);
            setTotalPages(res.data.meta.last_page);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this file?")) {
            const res = await deleteLibraryFile(id);
            if (res.success) {
                N("Success", "File deleted successfully", "success");
                fetchFiles();
            } else {
                N("Error", res.message, "error");
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Library Management</h1>
                    <p className="text-muted-foreground">Manage institute resources and files.</p>
                </div>

                <Button
                    className="bg-[#701A75] hover:bg-[#5a155e] text-white"
                    onClick={() => router.push('/admin/library/upload')}
                >
                    <Upload className="mr-2 h-4 w-4" /> Upload Resources
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-card p-4 rounded-lg shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by Title or keyword"
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {coursesList.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Slides">Slides</SelectItem>
                        <SelectItem value="Document">Document</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="a-z">A-Z</SelectItem>
                        <SelectItem value="z-a">Z-A</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-card rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>TITLE</TableHead>
                            <TableHead>TYPE</TableHead>
                            <TableHead>UPLOADED BY</TableHead>
                            <TableHead>COURSE LINKED</TableHead>
                            <TableHead>DOWNLOAD / VIEW</TableHead>
                            <TableHead>ACTION</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : files.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">No files found</TableCell>
                            </TableRow>
                        ) : (
                            files.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell className="font-medium">{file.title}</TableCell>
                                    <TableCell>{file.fileType}</TableCell>
                                    <TableCell>{file.user?.profile?.name || "Unknown"}</TableCell>
                                    <TableCell>{file.course?.title || "N/A"}</TableCell>
                                    <TableCell>
                                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            <Download className="h-4 w-4" /> Download
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(file.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
        </div>
    );
}
