"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search } from "lucide-react";
import { getLibraryFiles } from "@/app/utils/libraryService";
import { AllCourse } from "@/app/utils/courseService";
import FilePreviewModal from "@/app/Components/FilePreviewModal";

export default function LibraryPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [fileType, setFileType] = useState("all");
    const [courseId, setCourseId] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [coursesList, setCoursesList] = useState([]);

    // File Preview State
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

    const handlePreview = (file) => {
        setSelectedFileForPreview(file);
        setPreviewModalOpen(true);
    };

    const handleClosePreview = () => {
        setPreviewModalOpen(false);
        setSelectedFileForPreview(null);
    };

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

    return (
        <div className="p-4 max-md:p-0 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between  max-md:mt-5 items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl max-md:text-center max-md:mb-3 font-bold">Library</h1>
                    <p className="text-sm sm:text-base max-md:text-center text-muted-foreground">Access a collection of education resources including books, documents, videos and research materials</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-card p-4 rounded-lg shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by Title or keyword"
                        className="pl-10 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <Select value={courseId} onValueChange={setCourseId}>
                        <SelectTrigger className="w-full md:w-[200px]">
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
                        <SelectTrigger className="w-full md:w-[150px]">
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
                </div>
                <div className="w-full md:w-auto">
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full md:w-[150px]">
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
            </div>

            {/* Content Display */}
            <div className="space-y-4">
                {/* Mobile Card View (Visible on small screens) */}
                <div className="block md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center py-10">Loading...</div>
                    ) : files.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No files found</div>
                    ) : (
                        files.map((file) => (
                            <div key={file.id} className="bg-white dark:bg-card p-4 rounded-lg max-md:rounded-none shadow-sm border border-border space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg line-clamp-2">{file.title}</h3>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{file.fileType}</span>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Uploaded by: <span className="text-foreground">{file.user?.profile?.name || "Unknown"}</span></p>
                                    <p>Course: <span className="text-foreground">{file.course?.title || "N/A"}</span></p>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => handlePreview(file)}
                                        className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 py-2 rounded-md transition-colors font-medium text-sm"
                                    >
                                        <Download className="h-4 w-4" /> View / Download
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View (Hidden on small screens) */}
                <div className="hidden md:block bg-white dark:bg-card rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>TITLE</TableHead>
                                <TableHead>TYPE</TableHead>
                                <TableHead>UPLOADED BY</TableHead>
                                <TableHead>COURSE LINKED</TableHead>
                                <TableHead>DOWNLOAD / VIEW</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                                </TableRow>
                            ) : files.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">No files found</TableCell>
                                </TableRow>
                            ) : (
                                files.map((file) => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium">{file.title}</TableCell>
                                        <TableCell>{file.fileType}</TableCell>
                                        <TableCell>{file.user?.profile?.name || "Unknown"}</TableCell>
                                        <TableCell>{file.course?.title || "N/A"}</TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => handlePreview(file)}
                                                className="text-blue-600 hover:underline flex items-center gap-1"
                                            >
                                                <Download className="h-4 w-4" /> View / Download
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center gap-2 pt-4 pb-20 md:pb-0">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={previewModalOpen}
                onClose={handleClosePreview}
                fileUrl={selectedFileForPreview?.fileUrl}
                fileTitle={selectedFileForPreview?.title}
                fileType={selectedFileForPreview?.fileType}
            />
        </div>
    );
}
