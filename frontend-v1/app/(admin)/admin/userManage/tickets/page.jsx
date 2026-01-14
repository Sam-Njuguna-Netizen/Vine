"use client";

import { useEffect, useState } from "react";
import { Search, MessageSquare, Send } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

import { N } from "@/app/utils/notificationService";
import { getAllTickets, respondToTicket, updateTicketStatus } from "@/app/utils/ticketService";

export default function TicketsManage() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = tickets.filter(
      (ticket) =>
        ticket.user?.email.toLowerCase().includes(lowerSearch) ||
        ticket.question.toLowerCase().includes(lowerSearch) ||
        ticket.status.toLowerCase().includes(lowerSearch)
    );
    setFilteredTickets(filtered);
  }, [searchText, tickets]);

  const fetchTickets = async () => {
    setLoading(true);
    const response = await getAllTickets();
    if (response) {
      const formattedTickets = response.map((ticket) => ({
        ...ticket,
        key: ticket.id.toString(),
      }));
      setTickets(formattedTickets);
      setFilteredTickets(formattedTickets);
    }
    setLoading(false);
  };

  const handleStatusChange = async (status, record) => {
    // Optimistic update
    setTickets(tickets.map(t => t.id === record.id ? { ...t, status } : t));

    const response = await updateTicketStatus(record.id, status);
    if (response.success) {
      N("Success", `Ticket status updated to ${status}.`, "success");
    } else {
      fetchTickets(); // Revert
      N("Error", "Failed to update status!", "error");
    }
  };

  const handleRespond = (ticket) => {
    setCurrentTicket(ticket);
    setResponseText(ticket.answer || '');
    setIsModalOpen(true);
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      N("Warning", "Response cannot be empty.", "warning");
      return;
    }
    setIsResponding(true);
    const response = await respondToTicket(currentTicket.id, responseText);
    if (response.success) {
      fetchTickets();
      N("Success", "Response sent and ticket updated!", "success");
      setIsModalOpen(false);
      setResponseText('');
    } else {
      N("Error", "Failed to send response!", "error");
    }
    setIsResponding(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'answered': return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Answered</Badge>;
      case 'closed': return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
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
              <TableHead>User</TableHead>
              <TableHead className="w-[30%]">Question</TableHead>
              <TableHead className="w-[30%]">Answer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.user?.email}</TableCell>
                  <TableCell>
                    <div className="line-clamp-2" title={ticket.question}>
                      {ticket.question}
                    </div>
                  </TableCell>
                  <TableCell>
                    {ticket.answer ? (
                      <div className="line-clamp-2" title={ticket.answer}>
                        {ticket.answer}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">Not answered</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {moment(ticket.createdAt).format("MMM DD, YYYY")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRespond(ticket)}
                        className="h-8 w-8 p-0"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="sr-only">Respond</span>
                      </Button>

                      <Select
                        defaultValue={ticket.status}
                        onValueChange={(value) => handleStatusChange(value, ticket)}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
            <DialogDescription>
              Send a response to the user's inquiry.
            </DialogDescription>
          </DialogHeader>

          {currentTicket && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">User</h4>
                <p className="text-sm text-muted-foreground">{currentTicket.user?.email}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Question</h4>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {currentTicket.question}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Your Response</h4>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendResponse} disabled={isResponding}>
              {isResponding ? "Sending..." : "Send Response"}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
