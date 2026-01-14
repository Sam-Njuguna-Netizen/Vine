"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    Image as ImageIcon,
} from "lucide-react";
import { N } from "@/app/utils/notificationService";
import ImageUpload from "@/app/Components/ImageUpload";
import { deleteFile } from "@/app/utils/common";
import axios from "@/app/api/axios";
import dayjs from "dayjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GroupList() {
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [openGroupModal, setOpenGroupModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllGroups();
    }, []);

    const getAllGroups = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/allMyInstitutionGroup");
            if (response.status === 200) {
                setGroups(response.data.groups);
            }
        } catch (error) {
            N("Error", "Failed to fetch groups", "error");
        } finally {
            setLoading(false);
        }
    };

    const removeCoverImage = () => {
        if (coverImage && coverImage !== "default.jpg") {
            deleteFile(coverImage);
        }
        setCoverImage(null);
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setName(group.name);
        setAbout(group.about);
        setCoverImage(group.coverImage);
        setOpenGroupModal(true);
    };

    const resetModal = () => {
        setOpenGroupModal(false);
        setEditingGroup(null);
        setName("");
        setAbout("");
        setCoverImage(null);
    };

    const handleDelete = async (groupId) => {
        try {
            const response = await axios.delete(`/api/group/${groupId}`);
            if (response.status === 200) {
                getAllGroups();
                N("Success", "Group deleted successfully!", "success");
            }
        } catch (error) {
            N("Error", "Failed to delete group", "error");
        }
    };

    const handleSaveGroup = async () => {
        if (!name || !coverImage || !about) {
            N("Error", "All fields required!", "error");
            return;
        }

        const groupData = {
            name,
            about,
            coverImage,
        };

        try {
            if (editingGroup) {
                const response = await axios.put(
                    `/api/group/${editingGroup.id}`,
                    groupData
                );
                if (response.status === 200) {
                    getAllGroups();
                    N("Success", "Group updated successfully!", "success");
                }
            } else {
                const response = await axios.post("/api/group", groupData);
                if (response.status === 200) {
                    getAllGroups();
                    N("Success", "Group added successfully!", "success");
                }
            }
            resetModal();
        } catch (error) {
            N(
                "Error",
                error.response?.data?.message || "Failed to save group",
                "error"
            );
        }
    };

    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search groups..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button
                    onClick={() => setOpenGroupModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Group
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cover Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">About</TableHead>
                            <TableHead className="hidden md:table-cell">Created At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredGroups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No groups found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGroups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell>
                                        {group.coverImage ? (
                                            <img
                                                src={group.coverImage}
                                                alt={group.name}
                                                className="h-12 w-20 object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="h-12 w-20 bg-muted rounded-md flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{group.name}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                                        {group.about}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {dayjs(group.createdAt).format("MMM D, YYYY")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={group.deletedAt ? "destructive" : "success"}
                                            className={
                                                !group.deletedAt
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : ""
                                            }
                                        >
                                            {group.deletedAt ? "Deleted" : "Active"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(group)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Are you absolutely sure?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will
                                                                    permanently delete the group.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(group.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={openGroupModal} onOpenChange={setOpenGroupModal}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingGroup ? "Edit Group" : "Add New Group"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                                id="name"
                                placeholder="Enter group name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="about">About</Label>
                            <Textarea
                                id="about"
                                placeholder="Write something about the group..."
                                value={about}
                                onChange={(e) => setAbout(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Cover Image</Label>
                            <ImageUpload
                                storeFolder="GroupPicture"
                                label="Upload Cover Image"
                                imagePreview={coverImage}
                                handleImageUpload={setCoverImage}
                                handleRemoveImage={removeCoverImage}
                                inputId="group-cover-upload"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveGroup}>
                            {editingGroup ? "Update Group" : "Create Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
