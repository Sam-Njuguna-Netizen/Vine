"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/app/api/axios";
import Header from "@/app/Components/home/header";
import Footer from "@/app/Components/home/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/public/dynamic-products/${id}`);
                setProduct(response.data);
            } catch (err) {
                console.error("Failed to fetch product", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAction = () => {
        if (product?.link) {
            router.push(product.link);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-24">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">Product Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">The product you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => router.push("/products")}>Back to Products</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <main className="w-full bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="relative w-full bg-[#1a0f30] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                <Header />

                <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <Button
                        variant="ghost"
                        className="text-white/70 hover:text-white hover:bg-white/10 mb-8"
                        onClick={() => router.push("/products")}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                    </Button>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                                {product.title}
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                                {product.description}
                            </p>
                            <Button
                                size="lg"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-purple-500/25 transition-all"
                                onClick={handleAction}
                            >
                                {product.buttonText || "Access Now"}
                            </Button>
                        </div>
                        {product.image && (
                            <div className="flex-1 w-full max-w-md">
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className=" rounded-3xl  max-md:px-2 md:p-3 shadow-sm dark:border-zinc-800">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none break-words 
                        prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-p:text-gray-600 dark:prose-p:text-gray-300
                        prose-a:text-purple-600 dark:prose-a:text-purple-400
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-li:text-gray-600 dark:prose-li:text-gray-300
                        prose-img:rounded-xl prose-img:shadow-md
                        dark:[&_*]:!bg-transparent dark:[&_*]:!text-gray-100"
                        dangerouslySetInnerHTML={{ __html: product.content || "" }}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}
