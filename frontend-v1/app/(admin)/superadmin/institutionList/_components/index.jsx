"use client";

import { useEffect, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Filter } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import axios from "@/app/api/axios";

export default function TransferRequest() {
  const [transferRequests, setTransferRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTransferRequests();
  }, []);

  useEffect(() => {
    if (searchText) {
      const lower = searchText.toLowerCase();
      const filtered = transferRequests.filter(
        (item) =>
          item.name?.toLowerCase().includes(lower) ||
          item.shortForm?.toLowerCase().includes(lower) ||
          item.contactNumber?.toLowerCase().includes(lower) ||
          item.institutionAddress?.toLowerCase().includes(lower)
      );
      setFilteredRequests(filtered);
    } else {
      setFilteredRequests(transferRequests);
    }
  }, [searchText, transferRequests]);

  const getAllTransferRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/allInstitution");
      if (response.data?.success) {
        setTransferRequests(response.data.institution);
        setFilteredRequests(response.data.institution);
      }
    } catch (error) {
      toast.error("Failed to fetch institutions");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (checked, record) => {
    try {
      const response = await axios.post("/api/institutionUpdate", {
        id: record.id,
        isActive: checked ? 1 : 0,
      });
      if (response.data?.success) {
        toast.success(
          `Institution marked as ${checked ? "Active" : "Inactive"}`
        );
        getAllTransferRequests();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Institutions</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Short Form</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No institutions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.id}</TableCell>
                    <TableCell className="font-medium">{record.name}</TableCell>
                    <TableCell>{record.shortForm}</TableCell>
                    <TableCell>{record.contactNumber}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={record.institutionAddress}>
                      {record.institutionAddress}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!record.isActive}
                          onCheckedChange={(checked) =>
                            handleStatusChange(checked, record)
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {record.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          moment(record.expiryDate).isAfter(moment())
                            ? "text-green-600 dark:text-green-400 font-medium"
                            : "text-red-600 dark:text-red-400 font-medium"
                        }
                      >
                        {moment(record.expiryDate).format("YYYY-MM-DD")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}