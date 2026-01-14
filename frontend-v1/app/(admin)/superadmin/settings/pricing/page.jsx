"use client";

import React, { useState, useEffect } from "react";
import { getPricingPlan, updatePricingPlan } from "../../../../services/pricingService";
import { Save, Plus, Trash2, X } from "lucide-react";

export default function PricingSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [plan, setPlan] = useState({
        name: "",
        description: "",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [],
        featureCategories: [],
        faqs: []
    });

    useEffect(() => {
        fetchPlan();
    }, []);

    const fetchPlan = async () => {
        try {
            const data = await getPricingPlan();
            // Ensure arrays exist even if null
            setPlan({
                ...data,
                features: data.features || [],
                featureCategories: data.featureCategories || [],
                faqs: data.faqs || []
            });
        } catch (error) {
            console.error("Failed to fetch pricing plan", error);
            alert("Failed to load pricing plan");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPlan({ ...plan, [name]: value });
    };

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...plan.features];
        newFeatures[index] = value;
        setPlan({ ...plan, features: newFeatures });
    };

    const addFeature = () => {
        setPlan({ ...plan, features: [...plan.features, ""] });
    };

    const removeFeature = (index) => {
        const newFeatures = plan.features.filter((_, i) => i !== index);
        setPlan({ ...plan, features: newFeatures });
    };

    // --- Feature Categories Handlers ---
    const addCategory = () => {
        setPlan({
            ...plan,
            featureCategories: [...plan.featureCategories, { category: "New Category", features: [""] }]
        });
    };

    const removeCategory = (index) => {
        const newCats = plan.featureCategories.filter((_, i) => i !== index);
        setPlan({ ...plan, featureCategories: newCats });
    };

    const updateCategoryName = (index, name) => {
        const newCats = [...plan.featureCategories];
        newCats[index].category = name;
        setPlan({ ...plan, featureCategories: newCats });
    };

    const addCategoryFeature = (catIndex) => {
        const newCats = [...plan.featureCategories];
        newCats[catIndex].features.push("");
        setPlan({ ...plan, featureCategories: newCats });
    };

    const updateCategoryFeature = (catIndex, featIndex, value) => {
        const newCats = [...plan.featureCategories];
        newCats[catIndex].features[featIndex] = value;
        setPlan({ ...plan, featureCategories: newCats });
    };

    const removeCategoryFeature = (catIndex, featIndex) => {
        const newCats = [...plan.featureCategories];
        newCats[catIndex].features = newCats[catIndex].features.filter((_, i) => i !== featIndex);
        setPlan({ ...plan, featureCategories: newCats });
    };


    // --- FAQ Handlers ---
    const addFaq = () => {
        setPlan({ ...plan, faqs: [...plan.faqs, { question: "", answer: "" }] });
    };

    const removeFaq = (index) => {
        const newFaqs = plan.faqs.filter((_, i) => i !== index);
        setPlan({ ...plan, faqs: newFaqs });
    };

    const updateFaq = (index, field, value) => {
        const newFaqs = [...plan.faqs];
        newFaqs[index][field] = value;
        setPlan({ ...plan, faqs: newFaqs });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updatePricingPlan(plan);
            alert("Pricing plan updated successfully!");
        } catch (error) {
            console.error("Failed to update plan", error);
            alert("Failed to update plan");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6  max-md:px-0 max-md:mx-0 max-w-5xl mx-auto space-y-8 bg-gray-50 dark:bg-[#141414] min-h-screen">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white max-md:text-xl">Pricing Page Settings</h1>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex text-sm items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded-lg disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-800 max-md:p-4 max-md:mx-0    p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Plan Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
                        <input
                            type="text"
                            name="name"
                            value={plan.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={plan.description}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md h-20 dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Price ($)</label>
                        <input
                            type="number"
                            name="monthlyPrice"
                            value={plan.monthlyPrice}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Yearly Price ($)</label>
                        <input
                            type="number"
                            name="yearlyPrice"
                            value={plan.yearlyPrice}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Main Features */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Main Features List</h2>
                    <button onClick={addFeature} className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Feature
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plan.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                className="flex-1 p-2 border rounded-md text-sm dark:bg-slate-900 dark:border-gray-600 dark:text-white"
                                placeholder="Feature name"
                            />
                            <button onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Categories */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feature Categories</h2>
                    <button onClick={addCategory} className="text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 px-3 py-1 rounded-full flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Category
                    </button>
                </div>
                <div className="space-y-6">
                    {plan.featureCategories.map((cat, catIndex) => (
                        <div key={catIndex} className="bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-3">
                                <input
                                    type="text"
                                    value={cat.category}
                                    onChange={(e) => updateCategoryName(catIndex, e.target.value)}
                                    className="font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none w-1/2 text-gray-900 dark:text-white"
                                    placeholder="Category Name"
                                />
                                <button onClick={() => removeCategory(catIndex)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-2 pl-4 border-l-2 border-purple-200 dark:border-purple-700">
                                {cat.features.map((feat, featIndex) => (
                                    <div key={featIndex} className="flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                        <input
                                            type="text"
                                            value={feat}
                                            onChange={(e) => updateCategoryFeature(catIndex, featIndex, e.target.value)}
                                            className="flex-1 p-1 bg-white border rounded text-sm dark:bg-slate-800 dark:border-gray-600 dark:text-white"
                                            placeholder="Feature"
                                        />
                                        <button onClick={() => removeCategoryFeature(catIndex, featIndex)} className="text-gray-400 hover:text-red-500 dark:text-gray-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={() => addCategoryFeature(catIndex)} className="text-xs text-purple-600 hover:underline mt-2 flex items-center gap-1 dark:text-purple-400">
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                    <button onClick={addFaq} className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-3 py-1 rounded-full flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add FAQ
                    </button>
                </div>
                <div className="space-y-4">
                    {plan.faqs.map((faq, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-900 dark:border-gray-700 relative group">
                            <button onClick={() => removeFaq(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="mb-2">
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Question</label>
                                <input
                                    type="text"
                                    value={faq.question}
                                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                                    className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Answer</label>
                                <textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                                    className="w-full p-2 border rounded-md h-20 dark:bg-slate-800 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
