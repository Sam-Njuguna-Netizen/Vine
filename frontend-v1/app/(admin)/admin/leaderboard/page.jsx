"use client";
import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Trophy,
} from "lucide-react";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { allUsers } from "@/app/utils/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function LeaderboardAdminPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState("");
    const [points, setPoints] = useState("");
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchLeaderboard();
        fetchUsers();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/leaderboard");
            setLeaderboard(res.data);
        } catch (error) {
            N("Error", "Failed to fetch leaderboard", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        const response = await allUsers();
        if (response?.success) {
            setUsers(response.users);
        }
    };

    const handleSave = async () => {
        if (!selectedUser || !points) {
            N("Error", "Please select a user and enter points", "error");
            return;
        }

        try {
            await axios.post("/api/leaderboard", {
                userId: selectedUser,
                points: parseInt(points),
            });
            N("Success", "Leaderboard updated successfully", "success");
            setOpenModal(false);
            setSelectedUser("");
            setPoints("");
            fetchLeaderboard();
        } catch (error) {
            N("Error", "Failed to update leaderboard", "error");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/leaderboard/${id}`);
            N("Success", "Entry removed successfully", "success");
            fetchLeaderboard();
        } catch (error) {
            N("Error", "Failed to remove entry", "error");
        }
    };

    const handleEdit = (entry) => {
        setSelectedUser(entry.userId.toString());
        setPoints(entry.points.toString());
        setOpenModal(true);
    };

    // Filter users for the dropdown based on search text
    // Also exclude users already in leaderboard (unless editing)
    const availableUsers = users.filter((user) => {
        // If we are editing, we want to show the current user even if they are in the leaderboard
        // But for adding new, we might want to filter out existing ones? 
        // The controller uses updateOrCreate, so selecting an existing one is fine, it just updates.
        // So we just filter by search text if we implement a search inside the select, 
        // but Shadcn Select doesn't have built-in search. 
        // For now, we'll just list all users.
        return true;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leaderboard Management</h1>
                    <p className="text-muted-foreground">Manage student points and rankings.</p>
                </div>
                <Button onClick={() => {
                    setSelectedUser("");
                    setPoints("");
                    setOpenModal(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Student
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No students on the leaderboard yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leaderboard.map((entry, index) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {index < 3 && <Trophy className={`h-4 w-4 ${index === 0 ? "text-yellow-500" :
                                                    index === 1 ? "text-gray-400" :
                                                        "text-amber-600"
                                                }`} />}
                                            #{index + 1}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={entry.user?.profile?.pPic} />
                                                <AvatarFallback>{entry.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{entry.user?.profile?.name || "Unknown"}</span>
                                                <span className="text-xs text-muted-foreground">{entry.user?.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{entry.points}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(entry)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remove from leaderboard?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will remove the student from the leaderboard. Their points data will be lost.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(entry.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Remove
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedUser ? "Update Points" : "Add to Leaderboard"}</DialogTitle>
                        <DialogDescription>
                            Select a student and assign points.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Student</label>
                            <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!!selectedUser && leaderboard.some(l => l.userId.toString() === selectedUser) && false}>
                                {/* We allow changing user if needed, or just keep it simple */}
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.email} ({user.profile?.name || "No Name"})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Points</label>
                            <Input
                                type="number"
                                value={points}
                                onChange={(e) => setPoints(e.target.value)}
                                placeholder="e.g. 1000"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
