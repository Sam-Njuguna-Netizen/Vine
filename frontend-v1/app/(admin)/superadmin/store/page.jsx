"use client";
import BookManage from "@/app/Components/BookManage";

export default function SuperAdminStorePage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
            <BookManage />
        </div>
    );
}
