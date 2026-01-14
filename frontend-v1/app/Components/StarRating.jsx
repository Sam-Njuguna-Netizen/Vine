import React from "react";
import { Star } from "lucide-react";

const StarRating = ({ value, onChange, readonly = false, size = "md" }) => {
    const stars = [1, 2, 3, 4, 5];
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8",
    };

    return (
        <div className="flex items-center gap-0.5">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onChange && onChange(star)}
                    className={`focus:outline-none transition-transform ${!readonly ? "hover:scale-110" : "cursor-default"
                        }`}
                >
                    <Star
                        className={`${sizeClasses[size]} ${star <= value
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
