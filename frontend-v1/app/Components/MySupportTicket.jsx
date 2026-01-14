"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  AlertCircle,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import moment from "moment";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import CollapsibleLongText from "@/app/Components/CollapsibleLongText";
import { N } from "@/app/utils/notificationService";

export default function MySupportTicket({
  chatLink,
  getTicketApi,
  newTicket = true,
}) {
  const allPriority = useSelector((state) => state.auth.priority) || [];
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [openTicketModal, setOpenTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [discription, setDiscription] = useState("");
  const [priority, setPriority] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAllTickets();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = tickets.filter((ticket) =>
      ticket.subject.toLowerCase().includes(lowerSearch) ||
      ticket.discription.toLowerCase().includes(lowerSearch)
    );
    setFilteredTickets(filtered);
  }, [searchText, tickets]);

  const getAllTickets = async () => {
    setLoading(true);
    try {
      const axios = (await import("@/app/api/axios")).default;
      const response = await axios.get(getTicketApi);
      if (response.status === 200) {
        setTickets(response.data.ticket);
        setFilteredTickets(response.data.ticket);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityName = (priorityId) => {
    const pId = parseInt(priorityId);
    const priority = allPriority.find((p) => p.id === pId);
    return priority ? priority.name : "Normal";
  };

  const getPriorityBadgeVariant = (priorityId) => {
    const pId = parseInt(priorityId);
    switch (pId) {
      case 1: return "destructive"; // High/Critical
      case 2: return "secondary";   // Medium
      case 3: return "outline";     // Low
      default: return "secondary";
    }
  };

  const StatusBadge = ({ status }) => {
    let classes = "";
    // Added dark mode classes for better contrast on dark backgrounds
    switch (status) {
      case "pending":
        classes = "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
        break;
      case "resolved":
        classes = "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
        break;
      case "closed":
        classes = "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
        break;
      case "open":
        classes = "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
        break;
      default:
        classes = "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-400";
        break;
    }
    return <Badge className={classes} variant="outline">{status?.toUpperCase()}</Badge>;
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setDiscription(ticket.discription);
    setPriority(ticket.priority.toString());
    setOpenTicketModal(true);
  };

  const resetModal = () => {
    setOpenTicketModal(false);
    setEditingTicket(null);
    setSubject("");
    setDiscription("");
    setPriority("2");
  };

  const handleUpdate = async (ticketId) => {
    try {
      const axios = (await import("@/app/api/axios")).default;
      const response = await axios.put(`/api/ticket/${ticketId}`, {
        status: "closed",
      });
      if (response.status === 200) {
        getAllTickets();
        N("Success", response.data.message, "success");
      }
    } catch (error) {
      N("Error", "Failed to close ticket", "error");
    }
  };

  const handleSaveTicket = async () => {
    if (!subject || !priority || !discription) {
      N("Error", "All fields are required!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const axios = (await import("@/app/api/axios")).default;
      const payload = { subject, priority: parseInt(priority), discription };
      let response;

      if (editingTicket) {
        response = await axios.put(`/api/ticket/${editingTicket.id}`, payload);
      } else {
        response = await axios.post("/api/ticket", payload);
      }

      if (response.status === 200) {
        getAllTickets();
        resetModal();
        N(
          "Success",
          `Ticket ${editingTicket ? "updated" : "created"} successfully!`,
          "success"
        );
      }
    } catch (error) {
      N(
        "Error",
        error.response?.data?.message || "Failed to save ticket",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          {/* Icon Color Adjusted */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          {/* Input Background Adjusted */}
          <Input
            placeholder="Search tickets..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 w-full sm:w-[300px] bg-white dark:bg-slate-950 dark:border-slate-800"
          />
        </div>
        {newTicket && (
          <Button onClick={() => setOpenTicketModal(true)} className="w-full sm:w-auto gradient-button dark:hover:bg-indigo-500 dark:text-white">
            <Plus className="mr-2 h-4 w-4" /> Create New Ticket
          </Button>
        )}
      </div>

      {/* Tickets List */}
      <Card className="border-none shadow-sm overflow-hidden bg-transparent">
        <div className="overflow-x-auto">
          <Table>
            {/* Table Header Background */}
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-900 border-b dark:border-slate-800">
                <TableHead className="w-[30%] dark:text-slate-300">Subject</TableHead>
                <TableHead className="w-[30%] hidden md:table-cell dark:text-slate-300">Description</TableHead>
                <TableHead className="dark:text-slate-300">Priority</TableHead>
                <TableHead className="dark:text-slate-300">Status</TableHead>
                <TableHead className="hidden md:table-cell dark:text-slate-300">Last Update</TableHead>
                <TableHead className="text-right dark:text-slate-300">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <MessageCircle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      <p>No tickets found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  // Row Hover and Border Colors
                  <TableRow key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 border-b dark:border-slate-800">
                    <TableCell className="font-medium">
                      {/* Link Color */}
                      <Link href={`${chatLink}${ticket.id}`} className="text-indigo-600 hover:underline block truncate max-w-[200px] sm:max-w-none dark:text-indigo-400">
                        {ticket.subject}
                      </Link>
                      <div className="md:hidden text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {ticket.discription}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {/* Description Text Color */}
                      <div className="max-w-[300px] text-slate-600 dark:text-slate-400">
                        <CollapsibleLongText text={ticket.discription} limit={60} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)} className="whitespace-nowrap">
                        {getPriorityName(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {ticket.lastMessageAt ? moment(ticket.lastMessageAt).fromNow() : "Just now"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Action Buttons Colors */}
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                          <Link href={`${chatLink}${ticket.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {ticket.status !== "closed" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-slate-100">Close Ticket?</AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-slate-400">
                                  Are you sure you want to mark this ticket as closed? You won't be able to send more messages.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUpdate(ticket.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Close Ticket
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={openTicketModal} onOpenChange={setOpenTicketModal}>
        <DialogContent className="sm:max-w-[500px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className=" gradient-font">{editingTicket ? "Edit Ticket" : "Create New Ticket"}</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              {editingTicket ? "Update the details of your support request." : "Describe your issue and we'll get back to you."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="dark:text-slate-200">Subject <span className="text-red-500">*</span></Label>
              <Input
                id="subject"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="dark:text-slate-200">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-950 dark:border-slate-800 dark:text-white">
                  {allPriority.length > 0 ? (
                    allPriority.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="1">High</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">Low</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-slate-200">Description <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                placeholder="Detailed explanation..."
                value={discription}
                onChange={(e) => setDiscription(e.target.value)}
                className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetModal} disabled={isSubmitting} className="dark:bg-slate-950 dark:text-white dark:border-slate-800 dark:hover:bg-slate-800">
              Cancel
            </Button>
            <Button onClick={handleSaveTicket} disabled={isSubmitting} className="gradient-button dark:text-white dark:hover:bg-indigo-500">
              {isSubmitting ? "Saving..." : (editingTicket ? "Update Ticket" : "Submit Ticket")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}