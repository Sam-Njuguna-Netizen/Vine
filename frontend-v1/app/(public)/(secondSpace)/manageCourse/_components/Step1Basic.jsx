import React, { useState, useEffect } from "react";
import axios from "@/app/api/axios";
import { allCategories } from "@/app/utils/courseService";
import { Label, Input, Select } from "./FormComponents";

const Step1Basic = ({ formData, updateField }) => {
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [subcategoryOptions, setSubcategoryOptions] = useState([]);
    const [languageOptions, setLanguageOptions] = useState([]);
    const [subtitleLanguageOptions, setSubtitleLanguageOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, subcategoriesRes, languagesRes, subtitleLanguagesRes] = await Promise.all([
                    allCategories(),
                    axios.get('/api/course-subcategories'),
                    axios.get('/api/course-languages'),
                    axios.get('/api/subtitle-languages')
                ]);

                if (categoriesRes && categoriesRes.categories) {
                    setCategoryOptions(categoriesRes.categories);
                }
                if (subcategoriesRes.data) {
                    setSubcategoryOptions(subcategoriesRes.data);
                }
                if (languagesRes.data) {
                    setLanguageOptions(languagesRes.data);
                }
                if (subtitleLanguagesRes.data) {
                    setSubtitleLanguageOptions(subtitleLanguagesRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch options:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6 p-4">
            {/* Title Input */}
            <div>
                <Label>Title</Label>
                <Input
                    placeholder="Your course title"
                    value={formData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    maxLength={80}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                    {(formData.title || "").length}/80
                </div>
            </div>

            {/* Subtitle Input */}
            <div>
                <Label>Subtitle</Label>
                <Input
                    placeholder="Your course subtitle"
                    value={formData.subtitle || ""}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                    maxLength={120}
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                    {(formData.subtitle || "").length}/120
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label>Course Category</Label>
                    <Select
                        options={categoryOptions}
                        valueKey="id"
                        labelKey="name"
                        placeholder={isLoading ? "Loading..." : "Select Category"}
                        value={formData.category || ""}
                        onChange={(e) => updateField("category", e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label>Course Sub-category</Label>
                    <Select
                        options={subcategoryOptions}
                        valueKey="id"
                        labelKey="name"
                        placeholder={isLoading ? "Loading..." : "Select Sub-category"}
                        value={formData.subCategory || ""}
                        onChange={(e) => updateField("subCategory", e.target.value)}
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Topic Input */}
            <div>
                <Label>Course Topic</Label>
                <Input
                    placeholder="What is primarily taught in your course?"
                    value={formData.topic || ""}
                    onChange={(e) => updateField("topic", e.target.value)}
                />
            </div>

            {/* Dropdowns Grid */}
            <div className="grid md:grid-cols-4 gap-4">
                <div>
                    <Label>Course Language</Label>
                    <Select
                        options={languageOptions}
                        valueKey="id"
                        labelKey="name"
                        placeholder={isLoading ? "Loading..." : "Select Language"}
                        value={formData.language || ""}
                        onChange={(e) => updateField("language", e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label>Subtitle Language</Label>
                    <Select
                        options={subtitleLanguageOptions}
                        valueKey="id"
                        labelKey="name"
                        placeholder={isLoading ? "Loading..." : "Select Subtitle Language"}
                        value={formData.subtitleLanguage || ""}
                        onChange={(e) => updateField("subtitleLanguage", e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <Label>Course Level</Label>
                    <Select
                        options={["Beginner", "Intermediate", "Advanced"]}
                        value={formData.level || ""}
                        onChange={(e) => updateField("level", e.target.value)}
                    />
                </div>
                <div>
                    <Label>Duration</Label>
                    <div className="flex">
                        <Input
                            placeholder="Duration"
                            className="rounded-r-none border-r-0"
                            value={formData.duration || ""}
                            onChange={(e) => updateField("duration", e.target.value)}
                        />
                        <div className="bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-r-lg text-sm text-gray-500 flex items-center">
                            Hours
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="border-t border-gray-100 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <Label>Pricing Model</Label>
                        <Select
                            options={["Free", "Paid"]}
                            value={formData.pricingModel || "Free"}
                            onChange={(e) => updateField("pricingModel", e.target.value)}
                        />
                    </div>
                    {formData.pricingModel === 'Paid' && (
                        <>
                            <div>
                                <Label>Regular Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.regularPrice || 0}
                                    onChange={(e) => updateField("regularPrice", e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Sale Price ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.salePrice || 0}
                                    onChange={(e) => updateField("salePrice", e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step1Basic;
