"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Filter,
  Clock,
  PlayCircle,
  LoaderCircle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import LiveCalendar from "@/components/LiveCalendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddScheduleModal } from "@/app/Components/LiveClassModals";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { MyAllCourse, getAllAssignments } from "@/app/utils/courseService";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import moment from "moment";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const MeetingsDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  // Instructor / Creation States
  const [coursesList, setCoursesList] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCourseSelectOpen, setIsCourseSelectOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const authUser = useSelector((state) => state.auth.user);
  const router = useRouter();
  const isAdmin = authUser?.roleId === 2;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Enrolled Courses
      const courseRes = await MyAllCourse();
      const courses = courseRes.courses || [];
      setCoursesList(courses);

      let allCourseEvents = [];

      // 2. Fetch Assignments
      const assignmentsRes = await getAllAssignments();
      let assignmentEvents = [];
      if (assignmentsRes && assignmentsRes.assignments) {
        assignmentEvents = assignmentsRes.assignments.map(ass => ({
          id: `assignment-${ass.id}`,
          title: ass.title,
          date: new Date(ass.submissionBefore),
          time: moment(ass.submissionBefore).format("h:mm A"),
          rawDate: ass.submissionBefore,
          type: "Assignment",
          platform: "LMS",
          isStarted: false,
          obj: ass
        }));
      }

      if (courses.length > 0) {
        // 3. Fetch Live Classes & Quizzes for each course
        const promises = courses.map(async (course) => {
          const courseId = course.id;

          // Parallel fetch for this course
          const [classesRes, quizzesRes] = await Promise.allSettled([
            axios.get(`/api/live-classes/${courseId}`),
            axios.get(`/api/getCourseQuizs/${courseId}`),
          ]);

          let courseEvents = [];

          // Process Live Classes
          if (
            classesRes.status === "fulfilled" &&
            classesRes.value.data?.success
          ) {
            const classes = classesRes.value.data.liveClasses || [];
            const classEvents = classes.map((cls) => ({
              id: `class-${cls.id}`,
              title: cls.title,
              date: new Date(cls.startDateTime),
              time:
                moment(cls.startDateTime).format("h:mm A") +
                " - " +
                cls.duration,
              rawDate: cls.startDateTime, // useful for sorting
              type: "Class",
              platform: cls.platform,
              meetingUrl: cls.meetingUrl,
              isStarted: cls.isStarted,
              isClosed: cls.isClosed,
              description: cls.description,
              obj: cls, // keep original object if needed
            }));
            courseEvents = [...courseEvents, ...classEvents];
          }

          // Process Quizzes
          if (quizzesRes.status === "fulfilled" && quizzesRes.value.data) {
            const quizzes = Array.isArray(quizzesRes.value.data)
              ? quizzesRes.value.data
              : [];
            const quizEvents = quizzes.map((quiz) => ({
              id: `quiz-${quiz.id}`,
              title: quiz.title,
              date: new Date(quiz.submissionBefore),
              time: moment(quiz.submissionBefore).format("h:mm A"),
              rawDate: quiz.submissionBefore,
              type: "Quiz",
              platform: "LMS",
              duration: quiz.duration + " mins",
              obj: quiz,
            }));
            courseEvents = [...courseEvents, ...quizEvents];
          }

          return courseEvents;
        });

        const allResults = await Promise.all(promises);
        allCourseEvents = allResults.flat();
      }

      const aggregatedEvents = [...allCourseEvents, ...assignmentEvents]
        .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

      // Map for LiveCalendar format (including label)
      const finalEvents = aggregatedEvents.map(e => ({
        ...e,
        label: e.title
      }));

      setEvents(finalEvents);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      N("Error", "Failed to load schedule data", "error");
    } finally {
      setLoading(false);
    }
  };

  const upcomingEvents = events.filter((e) => {
    const now = new Date();
    const isFuture = new Date(e.rawDate) >= new Date(now.setHours(0, 0, 0, 0));

    if (!isFuture) return false;
    if (filterType === "all") return true;
    return e.type === filterType;
  });

  // Removed pastEvents logic as it is no longer shown
  const pastEvents = [];

  // --- Handlers for Creation ---

  const handleCreateClick = () => {
    if (coursesList.length === 0) {
      N("Warning", "No courses found to schedule a class for.", "warning");
      return;
    }
    if (coursesList.length === 1) {
      setSelectedCourseId(coursesList[0].id);
      setIsCreateModalOpen(true);
    } else {
      setIsCourseSelectOpen(true);
    }
  };

  const handleCourseSelectConfirm = () => {
    if (!selectedCourseId) {
      if (coursesList.length > 0) {
        setSelectedCourseId(coursesList[0].id);
      } else {
        return;
      }
    }
    setIsCourseSelectOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleScheduleSave = async (scheduleInfo) => {
    if (!selectedCourseId) return;

    try {
      const dataToSend = {
        ...scheduleInfo,
        courseId: selectedCourseId,
        startDateTime: moment(scheduleInfo.startDateTime).format("YYYY-MM-DD HH:mm:ss"),
      };

      const response = await axios.post("/api/live-classes", dataToSend);
      if (response.status === 201) {
        N("Success", "Class scheduled successfully", "success");
        setIsCreateModalOpen(false);
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      N("Error", error?.response?.data?.message || "Creation failed", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-0 md:p-6 font-sans text-slate-900 dark:text-slate-100  transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meetings & Schedules
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl">
            View your upcoming live classes, quizzes, and assignments.
          </p>
        </div>

        {/* Tabs & List Section */}
        <div className="space-y-6 ">
          <Tabs
            defaultValue="upcoming"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <div className="flex px-4 justify-between items-center border-b border-gray-200 dark:border-zinc-800">
              <TabsList className="bg-transparent  pl-2 p-0 h-auto gap-8">
                <TabsTrigger
                  value="upcoming"
                  className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#5b21b6] data-[state=active]:text-[#5b21b6] data-[state=active]:shadow-none text-gray-500 dark:text-gray-400 font-medium text-base hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Upcoming
                </TabsTrigger>
              </TabsList>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {filterType === 'all' ? 'Filter' : filterType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
                  <DropdownMenuItem onClick={() => setFilterType("all")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("Class")}>Classes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("Assignment")}>Assignments</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType("Quiz")}>Quizzes</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <LoaderCircle
                    className="animate-spin text-[#5b21b6]"
                    size={40}
                  />
                </div>
              ) : (
                <TabsContent value="upcoming" className="mt-0 space-y-4">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                      <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
                      <h3 className="text-gray-500 dark:text-gray-400 font-medium">
                        No upcoming events found
                      </h3>
                    </div>
                  ) : (
                    upcomingEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded",
                                event.type === "Class"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : event.type === "Assignment"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              )}
                            >
                              {event.type}
                            </span>
                            {event.isStarted && (
                              <span className="text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {event.title}
                          </h3>
                          <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                            <span className="flex items-center">
                              <Clock size={14} className="mr-1" /> {event.time}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span>{format(event.date, "EEEE, d MMM yyyy")}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="capitalize">{event.platform}</span>
                          </div>
                        </div>

                        {event.type === "Class" && (
                          <Button
                            variant="outline"
                            className="rounded-full px-6 border-gray-300 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#5b21b6] dark:hover:text-[#7c3aed]"
                            onClick={() => {
                              if (
                                ["zoom", "google_meet"].includes(event.platform)
                              ) {
                                window.open(event.meetingUrl, "_blank");
                              } else {
                                N(
                                  "Info",
                                  "Please join from the course page for full experience",
                                  "info"
                                );
                              }
                            }}
                          >
                            {event.isStarted ? (
                              <PlayCircle className="w-4 h-4 mr-2" />
                            ) : (
                              <LinkIcon className="w-4 h-4 mr-2" />
                            )}
                            {event.isStarted ? "Join Now" : "Class Link"}
                          </Button>
                        )}
                        {event.type === "Quiz" && (
                          <Button
                            variant="outline"
                            className="rounded-full px-6 border-gray-300 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#5b21b6] dark:hover:text-[#7c3aed]"
                            onClick={() => router.push("/courseQuiz")}
                          >
                            View Quiz
                          </Button>
                        )}
                        {event.type === "Assignment" && (
                          <Button
                            variant="outline"
                            className="rounded-full px-6 border-gray-300 dark:border-zinc-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-[#5b21b6] dark:hover:text-[#7c3aed]"
                            onClick={() => router.push(`/courseAssignment`)}
                          >
                            View Assignment
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              )}



            </div>
          </Tabs>
        </div>

        {/* Calendar Section - The Planner View */}
        <div className="bg-white dark:bg-zinc-900 p-0 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-6 px-4 md:px-0 pt-4 md:pt-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendar
            </h2>
            <div className="flex gap-2">
              {isAdmin && (
                <Button
                  onClick={handleCreateClick}
                  className="bg-[#5b30a6] hover:bg-[#4a268a] text-white rounded-full px-4 flex items-center gap-2"
                  size="sm"
                >
                  <Plus size={16} />
                  New Meeting
                </Button>
              )}
            </div>
          </div>

          <div className="w-full">
            <LiveCalendar
              events={events}
              onSelect={(d) => {
                setDate(d);
                const dayEvents = events.filter((e) => isSameDay(new Date(e.rawDate), d));
                if (dayEvents.length > 0) {
                  setSelectedDayEvents(dayEvents);
                  setIsDialogOpen(true);
                }
              }}
            />
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Events for {format(date, "MMMM d, yyyy")}
              </DialogTitle>
              <DialogDescription>
                You have {selectedDayEvents.length} event(s) scheduled for this day.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {selectedDayEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "text-[0.65rem] uppercase font-bold px-2 py-0.5 rounded",
                        event.type === "Class"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : event.type === "Assignment"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                      )}
                    >
                      {event.type}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {event.time}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                      {event.platform}
                    </p>
                  </div>

                  {event.type === "Class" && (
                    <Button
                      size="sm"
                      className="w-full bg-[#5b21b6] hover:bg-[#4c1d95] text-white"
                      onClick={() => {
                        if (["zoom", "google_meet"].includes(event.platform)) {
                          window.open(event.meetingUrl, "_blank");
                        } else {
                          N("Info", "Please join from the course page", "info");
                        }
                      }}
                    >
                      {event.isStarted ? "Join Now" : "Class Link"}
                    </Button>
                  )}
                  {event.type === "Assignment" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/courseAssignment`)}
                    >
                      View Details
                    </Button>
                  )}
                  {event.type === "Quiz" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push("/courseQuiz")}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        {/* --- Instructor Creation Modals --- */}

        {/* Course Selection Dialog */}
        <Dialog open={isCourseSelectOpen} onOpenChange={setIsCourseSelectOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle>Select Course</DialogTitle>
              <DialogDescription>
                Choose the course you want to schedule a class for.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select
                value={selectedCourseId}
                onValueChange={(val) => setSelectedCourseId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {coursesList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCourseSelectOpen(false)}>Cancel</Button>
              <Button onClick={handleCourseSelectConfirm} className="bg-[#5b30a6] text-white">Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Creation Modal */}
        <AddScheduleModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleScheduleSave}
        />

      </div>
    </div>
  );
};

export default MeetingsDashboard;