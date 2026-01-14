"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSameDay } from "date-fns"

export default function LiveCalendar({ onSelect, events = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const handleDateClick = (day) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        onSelect?.(selectedDate)
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
    const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1

    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    const prevMonthStartDay = prevMonthDays - adjustedFirstDay + 1

    const days = []
    for (let i = prevMonthStartDay; i <= prevMonthDays; i++) {
        days.push(i)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        days.push(i)
    }

    const getEventsForDate = (day) => {
        const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        return events.filter((event) => {
            // Handle both date objects and string dates
            const eventDate = new Date(event.date)
            return isSameDay(eventDate, checkDate)
        })
    }

    const isCurrentMonth = (index) => {
        return index >= adjustedFirstDay && index < adjustedFirstDay + daysInMonth
    }

    const getEventColor = (type) => {
        const normalizedType = type?.toLowerCase() || ""
        if (normalizedType === "class") return "bg-blue-500"
        if (normalizedType === "quiz") return "bg-red-500"
        if (normalizedType === "assignment") return "bg-green-500" // Added for assignment support
        return "bg-gray-500"
    }

    return (
        <div className="w-full bg-background rounded-lg border border-border p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-9 w-9 bg-transparent">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-9 w-9 bg-transparent">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    const isCurrent = isCurrentMonth(index)
                    // Only get events for current month days to avoid confusion, or handle prev/next month logic if desired.
                    // For now, based on logic, 'day' is just a number. 
                    // If it's prev/next month day, getEventsForDate uses 'currentDate' month. 
                    // This would show events for the *current* month's 'day' on the *prev/next* month's visual slot if numbers overlap.
                    // FIX: We need to know if 'day' belongs to current, prev, or next month.
                    // BUT, existing logic simply renders `days` array which is numbers.
                    // We should only show events if `isCurrent` is true for now to be safe, 
                    // OR calculate the correct full date for each cell.

                    // Improved Logic for safety: Only show events for current month items
                    const dayEvents = (day && isCurrent) ? getEventsForDate(day) : []

                    return (
                        <div
                            key={`${index}-${day}`}
                            onClick={() => day && isCurrent && handleDateClick(day)}
                            className={`
                min-h-20 sm:min-h-24 p-2 border border-border rounded
                flex flex-col items-start justify-start gap-1
                ${isCurrent ? "bg-background cursor-pointer hover:bg-muted/50" : "bg-muted/30"}
                transition-colors
              `}
                        >
                            <span
                                className={`
                  text-sm sm:text-base font-medium
                  ${isCurrent ? "text-foreground" : "text-muted-foreground"}
                `}
                            >
                                {day}
                            </span>
                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                {dayEvents.map((event, i) => (
                                    <span
                                        key={i}
                                        className={`
                      text-xs px-2 py-0.5 rounded text-white font-medium truncate w-full
                      ${getEventColor(event.type)}
                    `}
                                        title={event.label}
                                    >
                                        {event.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
