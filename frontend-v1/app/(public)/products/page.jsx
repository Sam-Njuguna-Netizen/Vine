"use client";
import React, { useEffect, useState } from "react";
import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axios from "@/app/api/axios";
import * as LucideIcons from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ProductsPage() {
    const router = useRouter();
    const user = useSelector((state) => state.auth.user);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDynamicProducts = async () => {
            try {
                const response = await axios.get("/api/public/dynamic-products");
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch dynamic products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDynamicProducts();
    }, []);

    const handleProductClick = (product) => {
        // Navigate to the public detail page
        router.push(`/products/${product.id}`);
    };

    return (
        <main className="w-full bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            {/* Hero Section with Header */}
            <div className="relative w-full bg-[#1a0f30] overflow-hidden pb-16">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                <Header />

                <div className="container mx-auto px-4 pt-48 pb-10 relative z-10 text-center text-white mt-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Vine LMS</h1>
                    <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
                        If you are an educational institution seeking a Learning Management System (LMS) that
                        provides the features you need, Vine LMS is precisely what you need.
                        If you are in the coaching business, Vine LMS is for you.
                        If you are an individual looking to start a training or coaching business, Vine LMS is also for you.
                        Check out Vine LMS to learn about all the great features we offer and book a demo meeting
                        with us today.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16 flex-grow">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product, index) => {
                            const IconComp = LucideIcons[product.icon] || LucideIcons.LayoutDashboard;
                            return (
                                <div
                                    key={product.id || index}
                                    onClick={() => handleProductClick(product)}
                                    className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
                                >
                                    <div className={`mb-4 transform group-hover:scale-110 transition-transform duration-300 ${product.color || 'text-purple-500'}`}>
                                        <IconComp size={48} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-[#701A75] transition-colors">
                                        {product.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 font-medium flex-grow">
                                        {product.description}
                                    </p>
                                    <Button variant="outline" className="w-full dark:text-white dark:border-zinc-700 hover:bg-[#701A75] hover:text-white dark:hover:bg-[#701A75] transition-colors mt-auto">
                                        View More
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
