"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCategories from "../courseCategories/page";
import CourseSubcategories from "../courseSubcategories/page";
import CourseLanguages from "../courseLanguages/page";
import SubtitleLanguages from "../subtitleLanguages/page";

export default function CourseOptionsPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Course Options</h1>
            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[600px] lg:grid-cols-4">
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
                    <TabsTrigger value="languages">Languages</TabsTrigger>
                    <TabsTrigger value="subtitles">Subtitle Languages</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="mt-6">
                    <CourseCategories />
                </TabsContent>
                <TabsContent value="subcategories" className="mt-6">
                    <CourseSubcategories />
                </TabsContent>
                <TabsContent value="languages" className="mt-6">
                    <CourseLanguages />
                </TabsContent>
                <TabsContent value="subtitles" className="mt-6">
                    <SubtitleLanguages />
                </TabsContent>
            </Tabs>
        </div>
    );
}
