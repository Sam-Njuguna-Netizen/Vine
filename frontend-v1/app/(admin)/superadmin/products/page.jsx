"use client";
import React, { useState, useEffect } from "react";
import axios from "@/app/api/axios";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DynamicProductsAdmin() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("/api/dynamic-products", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        router.push(`/superadmin/products/edit/${product.id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/dynamic-products/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Product deleted");
            fetchProducts();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Dynamic Products</h1>
                <Button onClick={() => router.push("/superadmin/products/add")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="border rounded-md bg-white dark:bg-zinc-900">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Button Text</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No products found.</TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.title}</TableCell>
                                    <TableCell>{product.buttonText}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
