"use client";
import { useEffect, useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransferRequest() {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const [transferRequests, setTransferRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTransferRequests();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = transferRequests.filter((req) => {
      const productTitle = req.book?.title?.toLowerCase() || "";
      const owner = req.book?.createdByUser?.institution?.name?.toLowerCase() || "";
      const buyer = req.paiedBy?.email?.toLowerCase() || "";

      return (
        productTitle.includes(lowerSearch) ||
        owner.includes(lowerSearch) ||
        buyer.includes(lowerSearch)
      );
    });
    setFilteredRequests(filtered);
  }, [searchText, transferRequests]);

  const getAllTransferRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/allTransferRequests");
      if (response.data?.success) {
        setTransferRequests(response.data?.transferRequests);
        setFilteredRequests(response.data?.transferRequests);
      }
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferInstructorShare = async (transferId) => {
    try {
      const response = await axios.post("/api/transferToInstitution", {
        paymentId: transferId,
        status: "complete",
      });

      if (response?.data?.success) {
        getAllTransferRequests();
        N("Success", response.data?.message, "success");
      } else {
        N("Error", response.data?.message || "Something went wrong", "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      N("Error", error.response?.data?.message || "Something went wrong!", "error");
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success"; // You might need a custom variant or use default/secondary
      case "pending":
        return "warning";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Custom Badge component to match Ant Design colors roughly if variants aren't enough
  const StatusBadge = ({ status }) => {
    let classes = "";
    switch (status) {
      case "completed":
        classes = "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
        break;
      case "pending":
        classes = "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200";
        break;
      case "failed":
        classes = "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
        break;
      default:
        classes = "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
    }
    return (
      <Badge variant="outline" className={classes}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Transfer Requests</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No requests found.</div>
          ) : (
            filteredRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {req.book?.title || "N/A"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Product:</span>
                    <span>{req.courseId ? "Course" : req.bookId ? "Book" : "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{req.book?.createdByUser?.institution?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Buyer:</span>
                    <span>{req.paiedBy?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">${req.amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Receive:</span>
                    <StatusBadge status={req.receiveStatus} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transfer:</span>
                    <StatusBadge status={req.transferStatus} />
                  </div>
                  {req.transferStatus === "pending" && (
                    <div className="pt-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full">
                            <CheckCircle className="mr-2 h-4 w-4" /> Transfer Share
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to transfer the share for this request?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleTransferInstructorShare(req.id)}>
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Product Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Receive Status</TableHead>
                <TableHead>Transfer Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.courseId ? "Course" : req.bookId ? "Book" : "N/A"}</TableCell>
                    <TableCell className="font-medium">{req.book?.title || "N/A"}</TableCell>
                    <TableCell>{req.book?.createdByUser?.institution?.name || "N/A"}</TableCell>
                    <TableCell>{req.paiedBy?.email || "N/A"}</TableCell>
                    <TableCell>${req.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={req.receiveStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={req.transferStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      {req.transferStatus === "pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" /> Transfer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Transfer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to transfer the share for this request?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleTransferInstructorShare(req.id)}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}