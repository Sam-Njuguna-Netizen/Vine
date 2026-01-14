"use client";

import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Tag, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { N } from "@/app/utils/notificationService";
import { getPromoCodes, createPromoCode, deletePromoCode } from "@/app/utils/promoService";

export default function PromoCodesPage() {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        type: "FIXED", // FIXED or PERCENTAGE
        value: "",
        minOrderAmount: "",
        usageLimit: "",
        expiresAt: ""
    });

    useEffect(() => {
        fetchPromos();
    }, []);

    const fetchPromos = async () => {
        try {
            setLoading(true);
            const data = await getPromoCodes();
            setPromos(data);
        } catch (error) {
            console.error(error);
            N("Error", "Failed to fetch promo codes", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (value) => {
        setFormData(prev => ({ ...prev, type: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code || !formData.value) {
            N("Error", "Code and Value are required", "error");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                value: parseFloat(formData.value),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                // Ensure date is properly formatted if populated, otherwise null
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
            };

            await createPromoCode(payload);
            N("Success", "Promo code created successfully", "success");
            setIsDialogOpen(false);

            // Reset form
            setFormData({
                code: "",
                type: "FIXED",
                value: "",
                minOrderAmount: "",
                usageLimit: "",
                expiresAt: ""
            });

            fetchPromos();
        } catch (error) {
            console.error(error);
            N("Error", error.message || "Failed to create promo code", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this promo code?")) return;

        try {
            await deletePromoCode(id);
            N("Success", "Promo code deleted", "success");
            fetchPromos();
        } catch (error) {
            N("Error", "Failed to delete promo code", "error");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Promo Codes</h1>
                    <p className="text-muted-foreground mt-1">Manage discount codes for your store</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#4A1D75] dark:text-white hover:bg-[#3a165c]">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Promo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Promo Code</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="e.g. SUMMER25"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className="uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={handleSelectChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Value *</Label>
                                    <Input
                                        id="value"
                                        name="value"
                                        type="number"
                                        placeholder="e.g. 10"
                                        value={formData.value}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minOrderAmount">Min. Order Amount ($)</Label>
                                    <Input
                                        id="minOrderAmount"
                                        name="minOrderAmount"
                                        type="number"
                                        placeholder="Optional"
                                        value={formData.minOrderAmount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="usageLimit">Usage Limit</Label>
                                    <Input
                                        id="usageLimit"
                                        name="usageLimit"
                                        type="number"
                                        placeholder="Optional"
                                        value={formData.usageLimit}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="expiresAt">Expires At</Label>
                                    <Input
                                        id="expiresAt"
                                        name="expiresAt"
                                        type="datetime-local"
                                        value={formData.expiresAt}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting} className="bg-[#4A1D75] dark:text-white hover:bg-[#3a165c]">
                                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Create Code
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No promo codes found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promos.map((promo) => (
                                    <TableRow key={promo.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-primary" />
                                                {promo.code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {promo.type === "PERCENTAGE" ? `${promo.value}% Off` : `$${promo.value} Off`}
                                            {promo.minOrderAmount && (
                                                <div className="text-xs text-muted-foreground">
                                                    Min order: ${promo.minOrderAmount}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={promo.isActive ? "success" : "secondary"} className={promo.isActive ? "bg-green-100 text-green-700" : ""}>
                                                {promo.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : "used"}
                                        </TableCell>
                                        <TableCell>
                                            {promo.expiresAt ? (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {format(new Date(promo.expiresAt), "MMM dd, yyyy")}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No expiry</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
