"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageProducts from "@/app/Components/BookManage";
import ProductCategories from "./categories/page";
import ProductOrders from "./bookOrders/page";

export default function ProductsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="products">Manage Products</TabsTrigger>
          <TabsTrigger value="categories">Product Categories</TabsTrigger>
          <TabsTrigger value="orders">Product Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="mt-6">
          <ManageProducts />
        </TabsContent>
        <TabsContent value="categories" className="mt-6">
          <ProductCategories />
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          <ProductOrders />
        </TabsContent>
      </Tabs>
    </div>
  );
}