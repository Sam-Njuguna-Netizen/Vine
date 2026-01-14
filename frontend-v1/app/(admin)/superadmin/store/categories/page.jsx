"use client";
import React from 'react';
import ProductCategories from "@/app/(admin)/admin/book/categories/page";

export default function SuperAdminCategoriesPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Product Categories</h1>
            <ProductCategories />
        </div>
    );
}
