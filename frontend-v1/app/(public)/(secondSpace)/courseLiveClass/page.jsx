"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { MyAllCourse } from "@/app/utils/courseService";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import moment from "moment";
import {
  Calendar as CalendarIcon,
  Video,
  ArrowLeft,
  Trash2,
  PlayCircle,
  Search,
  Clock,
  Radio,
  Plus
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

// Shared Modals
import { AddScheduleModal } from "@/app/Components/LiveClassModals";
import JitsiMeetingModal from "./JitsiClassModel";

const LiveClassSchedules = () => {
  const authUser = useSelector((state) => state.auth.user);
  const isAdmin = authUser?.roleId === 2;
  const [view, setView] = useState('courses'); // 'courses' | 'meetings'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [socket, setSocket] = useState(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [joiningMeeting, setJoiningMeeting] = useState(null);

  // Search State for Courses
  const [courseSearch, setCourseSearch] = useState("");

  // Fetch all courses on component mount
  useEffect(() => {
    getAllCourses();

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:30081");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch videos for the selected course
  useEffect(() => {
    if (selectedCourseId) {
      getAllMetting(selectedCourseId);

      // Join course room
      if (socket) {
        socket.emit("join-room", `course_${selectedCourseId}`);
      }
    }
  }, [selectedCourseId, socket]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("live-class-created", (newClass) => {
      if (selectedCourseId && newClass.courseId === selectedCourseId) {
        setMeetings((prev) => {
          if (prev.some(m => m.id === newClass.id)) return prev;
          return [newClass, ...prev];
        });
        N("Info", "A new live class has been scheduled!", "info");
      }
    });

    socket.on("live-class-deleted", (deletedId) => {
      setMeetings((prev) => prev.filter((m) => m.id !== deletedId));
    });

    return () => {
      socket.off("live-class-created");
      socket.off("live-class-deleted");
    };
  }, [socket, selectedCourseId]);

  const getAllCourses = async () => {
    try {
      const response = await MyAllCourse();
      setCourses(response.courses);
    } catch (error) {
      N("Error", "Failed to fetch courses", "error");
    }
  };

  const getAllMetting = async (courseId) => {
    try {
      const response = await axios.get(`/api/live-classes/${courseId}`);
      if (response.status === 200 && response?.data.success) {
        setMeetings(response.data.liveClasses);
      }
    } catch (error) {
      N("Error", "Failed to fetch meetings", "error");
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourseId(course.id);
    setSelectedCourseTitle(course.title);
    setView('meetings');
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setSelectedCourseTitle("");
    setMeetings([]);
    setView('courses');
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete("/api/live-classes", { data: { id } });
      if (response.status === 200) {
        getAllMetting(selectedCourseId);
        N("Success", "Class deleted successfully!", "success");
      } else {
        N("Error", "Failed to delete class!", "error");
      }
    } catch (error) {
      N("Error", "Failed to delete class!", "error");
    }
  };

  // --- Shared Modal Handlers ---

  const handleScheduleSave = async (scheduleInfo) => {
    const dataToSend = {
      ...scheduleInfo,
      courseId: selectedCourseId,
      // Ensure date format matches backend expectation
      startDateTime: moment(scheduleInfo.startDateTime).format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      const response = await axios.post("/api/live-classes", dataToSend);
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getAllMetting(selectedCourseId);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Creation failed", "error");
    }
  };

  const handleOpenForStudents = async () => {
    if (!joiningMeeting) return;
    try {
      await axios.post("/api/makeTheMeetingOpen", { id: joiningMeeting.id });
      N("Success", "Meeting is now open for students", "success");
      setJoiningMeeting((prev) => ({ ...prev, isStarted: true }));
      getAllMetting(selectedCourseId);
    } catch (error) {
      N("Error", error?.response?.data?.message || "Could not open meeting", "error");
    }
  };

  const handleCloseMeeting = async () => {
    if (!joiningMeeting) return;
    try {
      await axios.post("/api/updateTheMeetingIscloseStatus", {
        id: joiningMeeting.id,
        isClosed: true,
      });
      N("Success", "Meeting has been closed", "success");
      setJoiningMeeting(null);
      getAllMetting(selectedCourseId);
    } catch (error) {
      N("Error", error?.response?.data?.message || "Could not close meeting", "error");
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  // --- RENDER ---

  if (view === 'courses') {
    return (
      <div className="min-h-screen  p-0 md:p-8 font-sans text-slate-900  dark:text-white">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div className="max-md:mt-3 w-full">
            <h1 className="text-3xl max-md:text-2xl  font-bold mb-2 max-md:text-center">Select a Course</h1>
            <p className="text-slate-500 max-md:text-center dark:text-slate-400 ">
              Choose a course to view or schedule live classes.
            </p>
          </div>
          <div className="relative w-full md:w-72 max-md:w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search courses..."
              className="pl-10 bg-white dark:bg-gray-900"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => handleCourseSelect(course)}>
              <CardHeader>
                <CardTitle className="text-lg  line-clamp-1">{course.title}</CardTitle>
                <CardDescription>{course.category || "Course"}</CardDescription>
              </CardHeader>
              <CardContent className="h-32 bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                {course.featuredImage ? (
                  <img src={course.featuredImage} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <Video size={48} className="text-slate-300" />
                )}
              </CardContent>
              <CardFooter className="pt-4">
                <Button className="w-full bg-[#5b30a6] dark:text-white hover:bg-[#4a268a]">
                  View Classes
                </Button>
              </CardFooter>
            </Card>
          ))}
          {filteredCourses.length === 0 && (
            <div className="col-span-full text-center py-10 text-slate-500">
              No courses found.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Meetings View
  const upcomingMeetings = meetings.filter(m => !m.isClosed);
  const pastMeetings = meetings.filter(m => m.isClosed);

  return (
    <div className="min-h-screen  p-0 md:p-8 font-sans text-slate-900  dark:text-white">
      {/* --- Page Header --- */}
      <div className="flex flex-col gap-4 mb-8">
        <Button variant="ghost" onClick={handleBackToCourses} className="w-fit pl-0 hover:bg-transparent hover:text-[#5b30a6]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 w-full max-md:items-center ">
          <div className="w-full">
            <h1 className="text-3xl max-md:text-2xl max-md:text-center font-bold mb-2">{selectedCourseTitle}</h1>
            <p className="text-slate-500 max-md:text-center max-md:text-sm dark:text-slate-400 max-w-lg">
              Manage live classes for this course.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#5b30a6] hover:bg-[#4a268a] dark:shadow-none text-white rounded-full px-6 py-2 flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              Create Meeting
            </Button>
          )}
        </div>
      </div>

      {/* --- Tabs & List --- */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex justify-between items-center border-b pb-0 mb-6 dark:border-gray-700">
          <TabsList className="bg-transparent p-0 h-auto gap-6 max-md:justify-center flex w-full">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:border-b-2 dark:text-white/70 data-[state=active]:border-[#5b30a6] data-[state=active]:text-[#5b30a6] data-[state=active]:shadow-none rounded-none px-2 pb-3 text-slate-500 font-medium bg-transparent"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:border-b-2 dark:text-white/70 data-[state=active]:border-[#5b30a6] data-[state=active]:text-[#5b30a6] data-[state=active]:shadow-none rounded-none px-2 pb-3 text-slate-500 font-medium bg-transparent"
            >
              Past
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-0">
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-gray-800 h-[400px] flex flex-col items-center justify-center shadow-sm">
              <div className="mb-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-full">
                <CalendarIcon size={48} className="text-slate-400" strokeWidth={1} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Upcoming Classes</h3>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => {
                const now = moment();
                const startTime = moment(meeting.startDateTime);
                const isTimeForClass = now.isAfter(startTime);
                const canStudentJoin = meeting.isStarted || isTimeForClass;
                const canJoin = !meeting.isClosed && (isAdmin || canStudentJoin);

                return (
                  <div
                    key={meeting.id}
                    className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl max-md:rounded-none p-6 max-md:p-4 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow gap-4"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {meeting.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {moment(meeting.startDateTime).format("h:mm A")}
                        </span>
                        <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span>{moment(meeting.startDateTime).format("MMMM Do YYYY")}</span>
                        <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="capitalize dark:text-white  max-md:text-black bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded text-xs font-medium">
                          {meeting.platform?.replace('_', ' ') || 'Google Meet'}
                        </span>
                        {meeting.isStarted && <Badge className="bg-green-500">Live</Badge>}
                      </div>
                      {meeting.description && <p className="text-sm text-slate-400 mt-2 line-clamp-1">{meeting.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this class? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(meeting.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <Button
                        onClick={() => {
                          if (meeting.platform === 'google_meet' || meeting.platform === 'zoom') {
                            window.open(meeting.meetingUrl, '_blank');
                          } else {
                            setJoiningMeeting(meeting);
                          }
                        }}
                        disabled={!canJoin}
                        className={`${!canJoin
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white rounded-full"
                          }`}
                      >
                        {isAdmin ? (
                          <><PlayCircle size={16} className="mr-2" /> Host</>
                        ) : (
                          <><Radio size={16} className="mr-2" /> Join Class</>
                        )}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastMeetings.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No past meetings found.</div>
          ) : (
            <div className="grid gap-4">
              {pastMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl p-6 opacity-75">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{meeting.title}</h3>
                  <p className="text-sm text-slate-500">Ended on {moment(meeting.startDateTime).format("MMMM Do YYYY")}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* --- Shared Modals --- */}
      <AddScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleScheduleSave}
      />

      <JitsiMeetingModal
        isOpen={!!joiningMeeting}
        meetingData={joiningMeeting}
        user={authUser}
        isAdmin={isAdmin}
        onClose={() => setJoiningMeeting(null)}
        onMakeOpen={handleOpenForStudents}
        onCloseMeeting={handleCloseMeeting}
      />
    </div>
  );
};

export default LiveClassSchedules;
