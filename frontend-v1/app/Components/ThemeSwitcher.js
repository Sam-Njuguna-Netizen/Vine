"use client";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const ThemeSwitcher = () => {
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleToggle = () => {
    toggleTheme();
    const newTheme = darkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2"
    >
      {/* Toggle Switch Circle */}
      <div
        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
          darkMode ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {/* Icon inside the circle */}
        <span className="absolute inset-0 flex items-center justify-center text-md">
          {darkMode ? "🌙" : "☀️"}
        </span>
      </div>
    </button>
  );
};

export default ThemeSwitcher;