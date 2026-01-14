"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

const FloatingLabelInput = React.forwardRef(
    ({ className, label, type = "text", error, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const inputType = type === "password" && showPassword ? "text" : type;

        return (
            <div className="relative">
                <Input
                    type={inputType}
                    className={cn(
                        "block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    placeholder=" "
                    ref={ref}
                    {...props}
                />
                <label
                    className={cn(
                        "absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1",
                        error && "text-red-500 peer-focus:text-red-500"
                    )}
                >
                    {label}
                </label>
                {type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
        );
    }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
