"use client";
import BookManagePublic from "@/app/Components/BookManagePublic";

export default function AdminStorePage() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Global Store</h1>
            {/* Fetch ONLY Super Admin items for the Admin Store */}
            <BookManagePublic fetchUrl="/api/allbook?superAdminOnly=true" />
        </div>
    );
}
