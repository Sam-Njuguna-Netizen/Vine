import React from "react";
import { ChevronDown } from "lucide-react";

export const Label = ({ children, className }) => (
    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${className}`}>
        {children}
    </label>
);

export const Input = ({ className, ...props }) => (
    <input
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all ${className}`}
        {...props}
    />
);

export const TextArea = ({ className, ...props }) => (
    <textarea
        className={`w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all min-h-[120px] ${className}`}
        {...props}
    />
);

export const Select = ({ options, valueKey = "value", labelKey = "label", placeholder = "Select...", ...props }) => (
    <div className="relative">
        <select
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 appearance-none bg-white"
            {...props}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt, index) => {
                // Handle both array of strings and array of objects
                const value = typeof opt === 'object' ? opt[valueKey] : opt;
                const label = typeof opt === 'object' ? opt[labelKey] : opt;

                return (
                    <option key={value || index} value={value}>
                        {label}
                    </option>
                );
            })}
        </select>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
);

export const Button = ({ children, variant = "primary", className, ...props }) => {
    const variants = {
        primary: "bg-[#d1a055] hover:bg-[#b88b46] text-white shadow-sm",
        outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
        ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
        danger: "text-red-500 hover:bg-red-50",
    };

    return (
        <button
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
