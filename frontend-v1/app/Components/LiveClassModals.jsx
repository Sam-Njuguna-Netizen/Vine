"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

// --- Shadcn UI Imports ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Custom FULL COLOR Brand Icons ---
const PlatformIcons = {
  zoom: (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M18.5 6L13.8 9.53V6.5C13.8 5.67 13.13 5 12.3 5H3.5C2.67 5 2 5.67 2 6.5V17.5C2 18.33 2.67 19 3.5 19H12.3C13.13 19 13.8 18.33 13.8 17.5V14.47L18.5 18C19.05 18.42 19.84 18.03 19.84 17.34V6.66C19.84 5.96 19.05 5.57 18.5 6Z"
        fill="#2D8CFF"
      />
    </svg>
  ),
  google_meet: (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21.5 6L17.5 9V15L21.5 18V6Z" fill="#EA4335" />
      <path d="M10 9H17.5V15H10V9Z" fill="#FBBC04" />
      <path d="M2.5 15H10V9H2.5V15Z" fill="#34A853" />
      <path d="M2.5 15V9L2.5 6L10 9V15L17.5 15V18H2.5C1.67 18 1 17.33 1 16.5V7.5C1 6.67 1.67 6 2.5 6V15Z" fill="#4285F4" />
    </svg>
  ),
  teams: (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="6" width="12" height="12" rx="1" fill="#5059C9" />
      <path d="M16.5 7.5V16.5" stroke="#7B83EB" strokeWidth="5" strokeLinecap="round" />
      <path d="M6 10H10V14H6V10Z" fill="white" />
      <path d="M8 8V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.5 9C19.5 9 19.5 9.5 20 10V14C19.5 14.5 19.5 15 19.5 15" stroke="#5059C9" strokeWidth="2" strokeLinecap="round" />
      <circle cx="19.5" cy="7.5" r="1.5" fill="#5059C9" />
    </svg>
  ),
  jitsi: (props) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.91 16.63L9.16 17.38C8.87 17.67 8.39 17.67 8.1 17.38L6.62 15.9C6.33 15.61 6.33 15.13 6.62 14.84L9.91 11.55C10.2 11.26 10.68 11.26 10.97 11.55L11.72 12.3C12.01 12.59 12.01 13.07 11.72 13.36L9.91 15.17V16.63ZM15.9 14.84L12.61 11.55C12.32 11.26 11.84 11.26 11.55 11.55L10.8 12.3C10.51 12.59 10.51 13.07 10.8 13.36L14.09 16.65C14.38 16.94 14.86 16.94 15.15 16.65L16.63 15.17C16.92 14.88 16.92 14.4 16.63 14.11L15.9 14.84ZM15.9 8.1L12.61 11.39C12.32 11.68 11.84 11.68 11.55 11.39L10.8 10.64C10.51 10.35 10.51 9.87 10.8 9.58L14.09 6.29C14.38 6 14.86 6 15.15 6.29L16.63 7.77C16.92 8.06 16.92 8.54 16.63 8.83L15.9 8.1ZM8.1 6.29L9.58 7.77C9.87 8.06 9.87 8.54 9.58 8.83L6.29 12.12C6 12.41 5.52 12.41 5.23 12.12L4.48 11.37C4.19 11.08 4.19 10.6 4.48 10.31L7.77 7.02C8.06 6.73 8.54 6.73 8.83 7.02L8.1 6.29Z"
        fill="#1D76BC"
      />
    </svg>
  ),
};

// --- UPDATED ANIMATED Time Picker Column (JS) ---
const TimeColumn = ({ value, type, onChange, options }) => {
  const scrollAccumulator = useRef(0);
  const touchStart = useRef(null);

  // Logic for Numeric vs Option Array
  const isList = Array.isArray(options) && options.length > 0;

  // Helpers for numbers
  const isHour = type === "hour";
  const min = isHour ? 1 : 0;
  const max = isHour ? 12 : 59;

  // Track previous value to determine animation direction
  const prevValueRef = useRef(value);
  const [direction, setDirection] = useState(0);

  // Calculate Next/Prev values
  let prevValue, nextValue;

  if (isList) {
    // List Logic (AM/PM)
    const idx = options.indexOf(value);
    const nextIdx = (idx + 1) % options.length;
    const prevIdx = (idx - 1 + options.length) % options.length;
    prevValue = options[prevIdx];
    nextValue = options[nextIdx];
  } else {
    // Number Logic
    prevValue = value <= min ? max : value - 1;
    nextValue = value >= max ? min : value + 1;
  }

  // Formatter
  const fmt = (val) => isList ? val : val.toString().padStart(2, "0");

  useEffect(() => {
    // Determine direction
    if (isList) {
      // Simple toggle direction for binary options or list based
      const idx = options.indexOf(value);
      const prevIdx = options.indexOf(prevValueRef.current);
      if (idx > prevIdx) setDirection(1);
      else if (idx < prevIdx) setDirection(-1);
      // Wrap around check for list
      if (prevIdx === options.length - 1 && idx === 0) setDirection(1);
      if (prevIdx === 0 && idx === options.length - 1) setDirection(-1);
    } else {
      if (value > prevValueRef.current) setDirection(1);
      else if (value < prevValueRef.current) setDirection(-1);
      // Wrap around check for numbers
      if (prevValueRef.current === max && value === min) setDirection(1);
      if (prevValueRef.current === min && value === max) setDirection(-1);
    }

    prevValueRef.current = value;
  }, [value, max, min, isList, options]);

  const handleWheel = (e) => {
    e.stopPropagation();
    scrollAccumulator.current += e.deltaY;
    const SCROLL_THRESHOLD = 50;

    if (scrollAccumulator.current > SCROLL_THRESHOLD) {
      onChange(nextValue);
      scrollAccumulator.current = 0;
    } else if (scrollAccumulator.current < -SCROLL_THRESHOLD) {
      onChange(prevValue);
      scrollAccumulator.current = 0;
    }
  };

  const handleTouchStart = (e) => {
    touchStart.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStart.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStart.current - currentY;
    const SWIPE_THRESHOLD = 30;

    if (diff > SWIPE_THRESHOLD) {
      onChange(nextValue);
      touchStart.current = currentY;
    } else if (diff < -SWIPE_THRESHOLD) {
      onChange(prevValue);
      touchStart.current = currentY;
    }
  };

  const handleTouchEnd = () => {
    touchStart.current = null;
  };

  // Animation Variants
  const variants = {
    enter: (direction) => ({
      y: direction > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      y: direction > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 select-none cursor-ns-resize touch-none",
        isList ? "w-16" : "w-10" // Slightly wider for AM/PM text
      )}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={() => onChange(prevValue)}
        className="text-slate-300 dark:text-slate-600 text-sm hover:text-slate-500 dark:hover:text-slate-400 py-1 transition-colors"
      >
        {fmt(prevValue)}
      </button>

      {/* Animated Number/Text Container */}
      <div className="relative h-9 w-full overflow-hidden flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={value}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "absolute inset-0 flex items-center justify-center font-bold",
              isList ? "text-lg text-[#5b30a6] dark:text-[#9e7aff]" : "text-xl text-slate-900 dark:text-slate-100"
            )}
          >
            {fmt(value)}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={() => onChange(nextValue)}
        className="text-slate-300 dark:text-slate-600 text-sm hover:text-slate-500 dark:hover:text-slate-400 py-1 transition-colors"
      >
        {fmt(nextValue)}
      </button>
    </div>
  );
};

// --- Main Component ---
export const AddScheduleModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("zoom");
  const [durationVal, setDurationVal] = useState("60");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [time, setTime] = useState({
    hour: 9,
    minute: 0,
    ampm: "AM",
  });

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setPlatform("zoom");
      setDurationVal("60");
      setSelectedDate(new Date());
      setTime({ hour: 9, minute: 0, ampm: "AM" });
    }
  }, [isOpen]);

  const updateTime = (field, value) => {
    setTime((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!selectedDate) return;

    let hours24 = time.hour;
    if (time.ampm === "PM" && hours24 !== 12) hours24 += 12;
    if (time.ampm === "AM" && hours24 === 12) hours24 = 0;

    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours24, time.minute, 0, 0);

    const formattedDateStr = format(finalDate, "yyyy-MM-dd HH:mm:ss");

    const durNum = parseInt(durationVal);
    const h = Math.floor(durNum / 60);
    const m = durNum % 60;
    const formattedDuration = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:00`;

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    onSave({
      serialNo: randomNumber,
      title,
      description,
      platform,
      startDateTime: formattedDateStr,
      duration: formattedDuration,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[750px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-2xl block">
        {/* --- Header --- */}
        <DialogHeader className="p-6 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Schedule a New Class
          </DialogTitle>
        </DialogHeader>

        {/* --- Scrollable Body --- */}
        <div className="overflow-y-auto max-h-[70vh] p-6 space-y-6">
          {/* Row 1: Title */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Event Name
              </label>
              <Input
                placeholder="Introduction to React"
                className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#5b30a6] dark:focus-visible:ring-[#7c4dff]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Duration
            </label>
            <Select value={durationVal} onValueChange={setDurationVal}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus:ring-[#5b30a6] dark:focus:ring-[#7c4dff]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                <SelectItem value="15">15 min</SelectItem>
                <SelectItem value="30">30 min</SelectItem>
                <SelectItem value="45">45 min</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 3: Platform Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Platform
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["zoom", "Jitsi", "google_meet", "teams"].map((plat) => {
                const isSelected = platform === plat.toLowerCase();
                const IconComponent =
                  PlatformIcons[plat.toLowerCase()] || PlatformIcons.zoom;

                return (
                  <button
                    key={plat}
                    onClick={() => setPlatform(plat.toLowerCase())}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
                      isSelected
                        ? "border-[#5b30a6] bg-purple-50 ring-1 ring-[#5b30a6] dark:bg-purple-900/20 dark:border-[#7c4dff] dark:ring-[#7c4dff]"
                        : "border-slate-200 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
                    )}
                  >
                    <div className="mb-2 w-8 h-8 flex items-center justify-center">
                      <IconComponent className="w-full h-full" />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium text-center leading-tight capitalize",
                        isSelected
                          ? "text-[#5b30a6] dark:text-[#9e7aff]"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {plat.replace("_", " ")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Date & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Date
              </label>
              <div className="flex-1 border rounded-xl p-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 flex justify-center items-center shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-none"
                  classNames={{
                    day_selected:
                      "bg-[#5b30a6] text-white hover:bg-[#5b30a6] focus:bg-[#5b30a6] dark:bg-[#7c4dff] dark:text-white",
                    day_today:
                      "bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-slate-100",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Start Time
              </label>
              <div className="border rounded-xl p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 h-full flex flex-col justify-center items-center shadow-sm min-h-[250px]">
                <div className="flex justify-center items-center gap-4">
                  {/* Hours */}
                  <TimeColumn
                    value={time.hour}
                    type="hour"
                    onChange={(v) => updateTime("hour", v)}
                  />

                  <span className="text-slate-300 dark:text-slate-600 pb-1 font-light">
                    :
                  </span>

                  {/* Minutes */}
                  <TimeColumn
                    value={time.minute}
                    type="minute"
                    onChange={(v) => updateTime("minute", v)}
                  />

                  {/* Space */}
                  <div className="w-2" />

                  {/* AM/PM - Now using TimeColumn with options! */}
                  <TimeColumn
                    value={time.ampm}
                    options={["AM", "PM"]}
                    onChange={(v) => updateTime("ampm", v)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 5: Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <Textarea
              placeholder="Enter class details..."
              className="resize-none h-24 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 focus-visible:ring-[#5b30a6] dark:focus-visible:ring-[#7c4dff]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="p-6 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 z-10 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 rounded-full border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title}
            className="flex-1 h-12 bg-[#5b30a6] hover:bg-[#4a268a] dark:bg-[#6200ea] dark:hover:bg-[#7c4dff] text-white text-lg font-normal shadow-lg shadow-indigo-100 dark:shadow-none rounded-full"
          >
            <Plus size={20} className="mr-2" />
            Save Schedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};