"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react";

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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { addUser, allUsers, updateUser, deleteUser } from "@/app/utils/auth";
import { N } from "@/app/utils/notificationService";

export default function UserManage() {
  const allRoles = useSelector((state) => state.auth.roles);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role_id, setRole] = useState("2");

  useEffect(() => {
    getAllUsers();
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

  const getAllUsers = async () => {
    const response = await allUsers();
    if (response?.success) {
      const formattedUsers = response.users.map((user, index) => ({
        key: index.toString(),
        id: user.id,
        email: user.email,
        role_id: user.userRole.id,
        role: user.userRole.roleName,
        isActive: user.isActive,
      }));
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    }
  };

  const handleStatusChange = async (checked, record) => {
    try {
      const updatedUser = { id: record.id, isActive: checked ? 1 : 0 };
      // Optimistic update
      setUsers(
        users.map((u) =>
          u.id === record.id ? { ...u, isActive: checked ? 1 : 0 } : u
        )
      );

      const response = await updateUser(updatedUser);
      if (response.success) {
        N("Success", "User updated successfully!", "success");
      } else {
        // Revert on failure
        getAllUsers();
        N("Error", "Failed to update user!", "error");
      }
    } catch (error) {
      console.error("Status update error:", error);
      getAllUsers();
      N("error", "Something went wrong");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEmail(user.email);
    setPassword("");
    setRole(user.role_id.toString());
    setOpenUserModal(true);
  };

  const resetModal = () => {
    setOpenUserModal(false);
    setEditingUser(null);
    setEmail("");
    setPassword("");
    setRole("2");
  };

  const handleDelete = async (userId) => {
    const response = await deleteUser(userId);
    if (response.success) {
      getAllUsers();
      N("Success", "User deleted successfully!", "success");
    } else {
      N("Error", "Failed to delete user!", "error");
    }
  };

  const handleSaveUser = async () => {
    if (!email || !role_id) {
      N("Error", "All fields are required!", "error");
      return;
    }

    if (editingUser) {
      const updatedUser = {
        id: editingUser.id,
        email,
        role_id: parseInt(role_id),
        password,
      };
      const response = await updateUser(updatedUser);

      if (response.success) {
        getAllUsers();
        N("Success", "User updated successfully!", "success");
      } else {
        N("Error", "Failed to update user!", "error");
      }
    } else {
      if (!password) {
        N("Error", "All fields are required!", "error");
        return;
      }
      const newUser = { email, password, role_id: parseInt(role_id) };
      const response = await addUser(newUser);
      if (response.success) {
        getAllUsers();
        N("Success", "User added successfully!", "success");
      } else {
        N("Error", response?.message || "Failed to add user!", "error");
      }
    }

    resetModal();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null);
            setOpenUserModal(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Switch
                      checked={!!user.isActive}
                      onCheckedChange={(checked) =>
                        handleStatusChange(checked, user)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
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
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the user account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
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

      <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Make changes to the user profile here."
                : "Add a new user to the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="password"
                className="text-right text-sm font-medium"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editingUser ? "Leave blank to keep current" : "Required"
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right text-sm font-medium">
                Role
              </label>
              <Select value={role_id} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? "Save Changes" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
