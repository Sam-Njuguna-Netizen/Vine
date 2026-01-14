"use client";
import React from "react";
import Header from "../../Components/home/header";
import Footer from "../../Components/home/footer";
import { Check } from "lucide-react";

export default function SolutionsPage() {
    return (
        <main className="w-full bg-slate-50 min-h-screen flex flex-col">
            {/* Hero Section */}
            <div className="relative w-full bg-[#1a0f30] overflow-hidden pb-16">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl"></div>
                </div>

                <Header />

                <div className="container mx-auto px-4 pt-48 pb-10 relative z-10 text-center text-white mt-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Solutions for Everyone</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                        Tailored solutions to meet the unique needs of your institution.
                    </p>
                </div>
            </div>

            {/* Solutions Content */}
            <div className="container mx-auto px-4 py-16 flex-grow ">
                <div className="space-y-16">
                    <SolutionSection
                        title="For Schools"
                        description="Automate administrative tasks, manage admissions, and deliver world-class education with our all-in-one platform."
                        features={[
                            "Automated Admissions",
                            "Student Information System",
                            "Gradebook & Report Cards",
                            "Parent Portal"
                        ]}
                        image="/assets/3219080.jpg" // Using existing asset
                        reversed={false}
                    />
                    <SolutionSection
                        title="For Corporate Training"
                        description="Empower your workforce with continuous learning and development programs hosted on your own branded platform."
                        features={[
                            "Employee Onboarding",
                            "Compliance Training",
                            "Skill Assessment",
                            "Progress Tracking"
                        ]}
                        image="/assets/3129768.jpg" // Using existing asset placeholder
                        reversed={true}
                    />
                    <SolutionSection
                        title="For Course Creators"
                        description="Turn your expertise into a thriving business. Create, market, and sell your courses to a global audience."
                        features={[
                            "Course Builder",
                            "Marketing Funnels",
                            "Payment Processing",
                            "Community Building"
                        ]}
                        image="/assets/3196758.jpg" // Using existing asset placeholder
                        reversed={false}
                    />
                </div>
            </div>

            <Footer />
        </main>
    );
}

function SolutionSection({ title, description, features, image, reversed }) {
    return (
        <div className={`flex flex-col lg:flex-row items-center gap-12 ${reversed ? 'lg:flex-row-reverse' : ''}`}>
            <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                <p className="text-lg text-gray-600 leading-relaxed">{description}</p>
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <Check className="w-4 h-4 text-green-600" />
                            </div>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                    {/* Placeholder for actual solution images */}
                    <img src={image} alt={title} className="w-full h-auto object-cover" />
                </div>
            </div>
        </div>
    );
}
