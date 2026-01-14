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
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, User } from "lucide-react";
import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";
import dayjs from "dayjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function JoinRequests() {
    const [requests, setRequests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchJoinRequests();
    }, []);

    const fetchJoinRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/allMyInstitutionGroupRequest");
            if (response.status === 200) {
                setRequests(response.data.requests);
            }
        } catch (error) {
            N("Error", "Failed to fetch join requests", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            const response = await axios.post("/api/approveGroupRequest", {
                id: requestId,
            });
            if (response.status === 200) {
                N("Success", "Request approved successfully", "success");
                fetchJoinRequests();
            }
        } catch (error) {
            N(
                "Error",
                error.response?.data?.message || "Failed to approve request",
                "error"
            );
        }
    };

    const handleReject = async (requestId) => {
        try {
            const response = await axios.post(
                `/api/group/reject-request/${requestId}`
            );
            if (response.status === 200) {
                N("Success", "Request rejected successfully", "success");
                fetchJoinRequests();
            }
        } catch (error) {
            N(
                "Error",
                error.response?.data?.message || "Failed to reject request",
                "error"
            );
        }
    };

    const filteredRequests = requests.filter(
        (req) =>
            req.group?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.user?.profile?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search requests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="hidden md:table-cell">Request Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 rounded-md">
                                                <AvatarImage src={req.group?.coverImage} />
                                                <AvatarFallback className="rounded-md">G</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{req.group?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{req.user?.profile?.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {req.user?.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {dayjs(req.createdAt).format("MMM D, YYYY h:mm A")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                req.status === "approved"
                                                    ? "success"
                                                    : req.status === "rejected"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                            className={
                                                req.status === "approved"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                    : req.status === "pending"
                                                        ? "bg-orange-100 text-orange-800 hover:bg-orange-200"
                                                        : ""
                                            }
                                        >
                                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "pending" && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white h-8 px-2"
                                                    onClick={() => handleApprove(req.id)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                </Button>
                                                {/* <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-2"
                          onClick={() => handleReject(req.id)}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button> */}
                                            </div>
                                        )}
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
