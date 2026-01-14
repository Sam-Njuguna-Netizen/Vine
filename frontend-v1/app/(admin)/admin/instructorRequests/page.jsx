"use client";
import { useEffect, useState } from "react";
import { Search, CheckCircle } from "lucide-react";

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

import { N } from "@/app/utils/notificationService";
import axiosInstance from "@/app/api/axios";

export default function InstructorRequest() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getAllInstructorRequests();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.email.toLowerCase().includes(lowerSearch) ||
        user.role.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
  }, [searchText, users]);

  const getAllInstructorRequests = async () => {
    const response = await axiosInstance.get("/api/allInstructorRequests");
    if (response.data?.success) {
      const formattedUsers = response.data.users.map((user, index) => ({
        key: index.toString(),
        id: user.id,
        email: user.email,
        role_id: user.userRole.id,
        role: user.userRole.roleName,
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    }
  };

  const handleApprove = async (userId) => {
    const response = await axiosInstance.post(
      "/api/instructorRequestsApprove",
      { userId, status: "Approved" }
    );
    if (response.data?.success) {
      getAllInstructorRequests();
      N("Success", "User Approved successfully!", "success");
    } else {
      N("Error", "Failed to Approve user!", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24">
                  No pending requests found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve Instructor Request?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve this user as an instructor?
                            They will be granted instructor privileges.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleApprove(user.id)}>
                            Approve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
