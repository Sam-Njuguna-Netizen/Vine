"use client";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ShoppingCart,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

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

import { N } from "@/app/utils/notificationService";
import BookAddEditModel from "./BookAddEditModel";
import { deleteFile } from "@/app/utils/common";
import axios from "../api/axios";
import { useTheme } from "@/context/ThemeContext";

export default function BookManage() {
  const authUser = useSelector((state) => state.auth.user);
  const pathname = usePathname();
  const { darkMode } = useTheme();
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const addEditBook = useRef(null);
  const [loading, setLoading] = useState(false);

  // Format price with commas
  const formatPrice = (price) => Number(price).toLocaleString();

  const openAddBookModel = (data = null) => {
    if (addEditBook.current) {
      addEditBook.current.openModal(data);
    }
  };

  const responseFromAddEditBook = (message) => {
    getAllBooks();
  };

  useEffect(() => {
    getAllBooks();
  }, []);

  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(lowerSearch)
    );
    setFilteredBooks(filtered);
  }, [searchText, books]);

  const getAllBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/book");
      if (response.status === 200) {
        setBooks(response.data);
        setFilteredBooks(response.data);
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to fetch books",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (book) => {
    setLoading(true);
    const stripe = await stripePromise;
    const res = await axios.post("/api/purchase-book", { bookId: book.id });

    if (stripe && res) {
      setLoading(false);
      await stripe.redirectToCheckout({ sessionId: res.data.sessionId });
    } else {
      setLoading(false);
    }
  };

  const handleDelete = async (book) => {
    try {
      const response = await axios.delete(`/api/book/${book.id}`);
      if (response.status === 200) {
        N("Success", "Book deleted successfully", "success");
        if (book.featuredImage) {
          deleteFile(book.featuredImage);
        }
        getAllBooks();
      }
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to delete book",
        "error"
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-[250px] md:w-[300px]"
            />
          </div>
        </div>
        {/* Add Button */}
        {(authUser?.roleId === 1 || authUser?.roleId === 4) && (
          <Button onClick={() => openAddBookModel()}>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Cover</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    {book.featuredImage && (
                      <div className="h-16 w-12 rounded overflow-hidden bg-muted relative">
                        <img
                          src={book.featuredImage}
                          alt={book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{book.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate" title={book.description}>
                      {book.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={book.pricingModel === "Paid" ? "default" : "secondary"}>
                        {book.pricingModel}
                      </Badge>
                      {book.pricingModel === "Paid" && (
                        <div className="text-sm">
                          <div className="flex gap-2 items-center">
                            <span className="line-through text-muted-foreground">
                              ${formatPrice(book.regularPrice)}
                            </span>
                            <span className="font-bold text-green-600">
                              ${formatPrice(book.salePrice)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ship: ${formatPrice(book.shippingFee)}
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {(authUser?.roleId === 1 || authUser?.roleId === 4) && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openAddBookModel(book)}
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
                                <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this product? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(book)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}

                      {/* Materials Button Logic */}
                      {(authUser?.roleId === 1 || authUser?.roleId === 4) ? (
                        <Link href={`${pathname}/bookMaterial/${book.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Materials
                            {loading && <span className="ml-1">({book.materials?.length || 0})</span>}
                          </Button>
                        </Link>
                      ) : (
                        (book.payment?.length > 0 || book.pricingModel === "Free") ? (
                          <Link href={`${pathname}/bookMaterial/${book.id}`}>
                            <Button size="sm" variant="outline" className="gap-2">
                              <BookOpen className="h-4 w-4" />
                              Materials ({book.materials?.length || 0})
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled size="sm" variant="outline" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Materials ({book.materials?.length || 0})
                          </Button>
                        )
                      )}

                      {/* Purchase Button Logic */}
                      {(authUser?.roleId === 3 || authUser?.roleId === 2) &&
                        book.pricingModel === "Paid" &&
                        (book.payment?.length > 0 ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Access Granted
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCheckout(book)}
                            className="gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Buy
                          </Button>
                        ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BookAddEditModel
        ref={addEditBook}
        sendMessage={responseFromAddEditBook}
        darkMode={darkMode}
      />
    </div>
  );
}
