"use client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightCircle,
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
import { ScrollArea } from "@/components/ui/scroll-area";

import { N } from "@/app/utils/notificationService";
import axios from "@/app/api/axios";

export default function BookOrders() {
  const authUser = useSelector((state) => state.auth.user);
  const [bookOrders, setBookOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    getAllBookOrders();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = bookOrders.filter((order) => {
      const cartItems = parseCartItems(order.cartItems);
      const title = cartItems[0]?.book?.title || "";
      return (
        order.id.toString().includes(lowerSearch) ||
        title.toLowerCase().includes(lowerSearch) ||
        order.receiveStatus.toLowerCase().includes(lowerSearch)
      );
    });
    setFilteredOrders(filtered);
  }, [searchText, bookOrders]);

  const getAllBookOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/bookOrders");
      if (response.status === 200) {
        setBookOrders(response.data);
        setFilteredOrders(response.data);
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to fetch book orders",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, field, value) => {
    try {
      // Optimistic update
      setBookOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));

      const response = await axios.put(`/api/bookOrders/${orderId}`, {
        [field]: value,
      });

      if (response.status === 200) {
        N("Success", "Status updated successfully", "success");
      }
    } catch (error) {
      getAllBookOrders(); // Revert
      N(
        "Error",
        error?.response?.data?.message || "Failed to update status",
        "error"
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(`/api/bookOrders/${orderId}`);
      if (response.status === 200) {
        N("Success", "Order deleted successfully", "success");
        getAllBookOrders();
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to delete order",
        "error"
      );
    }
  };

  const formatPrice = (price) => {
    if (!price) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(price));
  };

  const parseCartItems = (cartItemsString) => {
    try {
      return JSON.parse(cartItemsString);
    } catch (e) {
      return [];
    }
  };

  const parseOtherInfo = (otherInfoString) => {
    try {
      return JSON.parse(otherInfoString);
    } catch (e) {
      return {};
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 gap-1">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransferStatusBadge = (status) => {
    switch (status) {
      case "transferred":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Transferred</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
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
              <TableHead className="w-[80px]">Cover</TableHead>
              <TableHead>Order Info</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Transfer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const cartItems = parseCartItems(order.cartItems);
                const firstItem = cartItems[0] || {};

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      {firstItem.book?.featuredImage && (
                        <div className="h-12 w-10 rounded overflow-hidden bg-muted">
                          <img
                            src={firstItem.book.featuredImage}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {cartItems.length > 1
                          ? `${cartItems.length} Items`
                          : firstItem.book?.title || "Order"}
                      </div>
                      <div className="text-xs text-muted-foreground">#{order.id}</div>
                    </TableCell>
                    <TableCell>{formatPrice(order.amount)}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.receiveStatus)}</TableCell>
                    <TableCell>
                      {authUser?.roleId === 1 ? (
                        <Select
                          defaultValue={order.transferStatus}
                          onValueChange={(value) =>
                            handleStatusUpdate(order.id, "transferStatus", value)
                          }
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="transferred">Transferred</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getTransferStatusBadge(order.transferStatus)
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {authUser?.roleId === 1 && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete information for Order #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Summary</h4>
                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                      <span className="font-medium">Order ID:</span>
                      <span>{selectedOrder.id}</span>
                      <span className="font-medium">Date:</span>
                      <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      <span className="font-medium">Amount:</span>
                      <span>{formatPrice(selectedOrder.amount)}</span>
                      <span className="font-medium">Status:</span>
                      <span>{getStatusBadge(selectedOrder.receiveStatus)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Payment Info</h4>
                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                      <span className="font-medium">Payment ID:</span>
                      <span className="truncate" title={parseOtherInfo(selectedOrder.otherInfo).stripePaymentIntentId}>
                        {parseOtherInfo(selectedOrder.otherInfo).stripePaymentIntentId || "N/A"}
                      </span>
                      <span className="font-medium">Method:</span>
                      <span>{parseOtherInfo(selectedOrder.otherInfo).paymentMethod ? "Card" : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Items ({parseCartItems(selectedOrder.cartItems).length})
                  </h4>
                  <div className="rounded-lg border divide-y">
                    {parseCartItems(selectedOrder.cartItems).map((item, i) => (
                      <div key={i} className="p-4 flex gap-4">
                        {item.book?.featuredImage && (
                          <div className="h-16 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={item.book.featuredImage}
                              alt={item.book.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{item.book?.title || "Unknown Item"}</h5>
                          <div className="mt-1 text-sm text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Type: {item.style}</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            <div className="flex justify-between font-medium text-foreground">
                              <span>Price: {formatPrice(item.book?.salePrice)}</span>
                            </div>
                            {item.style === "Printed Copy" && item.shippingAddress && (
                              <div className="mt-2 pt-2 border-t text-xs">
                                <span className="font-medium">Shipping to:</span> {item.shippingAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
