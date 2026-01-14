"use client";
import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { useSelector } from "react-redux";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const AppointmentCalendar = ({ joinMeeting, appointments, changeStatus }) => {
  const authUser = useSelector((state) => state.auth.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState([]);

  // Calendar Navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate Calendar Days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper to get meetings for a day
  const getMeetingsForDay = (date) => {
    return appointments.filter((appointment) =>
      isSameDay(parseISO(appointment.startDateTime), date)
    );
  };

  // Handle Date Click
  const handleDateClick = (date) => {
    const meetings = getMeetingsForDay(date);
    setSelectedDate(date);
    setSelectedMeetings(meetings);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="px-3 h-7 text-xs font-medium"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-semibold text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 dark:bg-gray-800 gap-px border-b dark:border-gray-800">
        {calendarDays.map((date, index) => {
          const dayMeetings = getMeetingsForDay(date);
          const isCurrentMonth = isSameMonth(date, currentDate);
          const isTodayDate = isToday(date);

          return (
            <div
              key={date.toString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                "min-h-[120px] p-2 bg-white dark:bg-gray-900 overflow-hidden cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                !isCurrentMonth && "bg-gray-50/50 dark:bg-gray-900/50 text-gray-400"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isTodayDate
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {format(date, "d")}
                </span>
                {dayMeetings.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {dayMeetings.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayMeetings.slice(0, 2).map((meeting, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-1.5 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 truncate"
                  >
                    <div className="font-semibold text-blue-700 dark:text-blue-300 truncate">
                      {meeting.topic}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(parseISO(meeting.startDateTime), "h:mm a")}
                    </div>
                  </div>
                ))}
                {dayMeetings.length > 2 && (
                  <div className="text-xs text-center text-gray-500 font-medium">
                    +{dayMeetings.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-500" />
              {selectedDate && format(selectedDate, "EEEE, MMMM do, yyyy")}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            {selectedMeetings.length > 0 ? (
              <div className="space-y-4 py-2">
                {selectedMeetings.map((meeting) => (
                  <Card key={meeting.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {meeting.topic}
                          </h3>
                          <Badge
                            variant={
                              meeting.status === "confirmed"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {meeting.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {format(parseISO(meeting.startDateTime), "h:mm a")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {meeting.duration} min
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {meeting.details}
                      </p>

                      {!meeting.isClosed ? (
                        <div className="flex gap-2 justify-end">
                          {authUser?.roleId === 1 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setIsDialogOpen(false);
                                changeStatus("confirmed", meeting);
                              }}
                            >
                              Confirm
                            </Button>
                          )}
                          {meeting.status === "confirmed" ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setIsDialogOpen(false);
                                joinMeeting(meeting);
                              }}
                            >
                              <MapPin className="w-4 h-4 mr-1.5" /> Join Meeting
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="opacity-50"
                            >
                              Not Started
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Badge variant="destructive">Closed</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 flex flex-col items-center">
                <Clock className="w-12 h-12 mb-3 text-gray-300" />
                <p>No meetings scheduled for this day.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;

