"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Radio,
  Trash2,
  Video,
  PlayCircle
} from "lucide-react";
import moment from "moment";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { checkObjectFields } from "@/app/utils/common";

// Import the new modal components
import { AddScheduleModal } from "@/app/Components/LiveClassModals";
import JitsiMeetingModal from "../JitsiClassModel";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const LiveClassesPage = () => {
  const params = useParams();
  const courseId = params.id;
  const authUser = useSelector((state) => state.auth.user);
  const isAdmin = authUser?.roleId === 2;

  const [liveClasses, setLiveClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [joiningMeeting, setJoiningMeeting] = useState(null);

  const fetchLiveClasses = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/live-classes/${courseId}`);
      setLiveClasses(response.data.liveClasses || []);
    } catch (error) {
      N("Error", "Failed to fetch live classes", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveClasses();
  }, [courseId]);

  const handleAddSchedule = async (scheduleInfo) => {
    const dataToSend = {
      ...scheduleInfo,
      courseId,
      startDateTime: moment(scheduleInfo.startDateTime).format(
        "YYYY-MM-DD HH:mm:ss"
      ),
    };

    const ch = checkObjectFields(dataToSend, ["description"]);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    try {
      await axios.post("/api/live-classes", dataToSend);
      N("Success", "Class scheduled successfully", "success");
      setAddModalOpen(false);
      fetchLiveClasses(); // Refresh list
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Failed to schedule class",
        "error"
      );
    }
  };

  const handleOpenForStudents = async () => {
    if (!joiningMeeting) return;
    try {
      await axios.post("/api/makeTheMeetingOpen", { id: joiningMeeting.id });
      N("Success", "Meeting is now open for students", "success");
      setJoiningMeeting((prev) => ({ ...prev, isStarted: true })); // Optimistic update
      fetchLiveClasses();
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Could not open meeting",
        "error"
      );
    }
  };

  const deleteLiveClass = async (Id) => {
    try {
      await axios.delete("/api/deleteMeeting", {
        data: { id: Id },
      });
      N("Success", "Meeting has been deleted", "success");

      fetchLiveClasses();
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Could not delete meeting",
        "error"
      );
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
      fetchLiveClasses();
    } catch (error) {
      N(
        "Error",
        error?.response?.data?.message || "Could not close meeting",
        "error"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
      </div>
    );
  }

  const upcomingMeetings = liveClasses.filter(m => !m.isClosed);
  const pastMeetings = liveClasses.filter(m => m.isClosed);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-900 dark:bg-black dark:text-white">
      <div className="mx-auto">
        <div className="flex flex-col gap-4 mb-8">
          <Link
            href="/courses"
            className="w-fit flex items-center text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Courses
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 dark:text-gray-200">
                Live Classes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                Manage live classes for this course.
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setAddModalOpen(true)}
                className="bg-[#5b30a6] hover:bg-[#4a268a] text-white rounded-full px-6 py-2 flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Plus size={18} />
                Schedule Class
              </Button>
            )}
          </div>
        </div>

        {/* --- Tabs & List --- */}
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex justify-between items-center border-b pb-0 mb-6 dark:border-gray-700">
            <TabsList className="bg-transparent p-0 h-auto gap-6">
              <TabsTrigger
                value="upcoming"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#5b30a6] data-[state=active]:text-[#5b30a6] data-[state=active]:shadow-none rounded-none px-2 pb-3 text-slate-500 font-medium bg-transparent"
              >
                Upcoming
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[#5b30a6] data-[state=active]:text-[#5b30a6] data-[state=active]:shadow-none rounded-none px-2 pb-3 text-slate-500 font-medium bg-transparent"
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
                      className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition-shadow gap-4"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {meeting.serialNo}. {meeting.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {moment(meeting.startDateTime).format("h:mm A")}
                          </span>
                          <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{moment(meeting.startDateTime).format("MMMM Do YYYY")}</span>
                          <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="capitalize text-[#5b30a6] bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded text-xs font-medium">
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
                                <AlertDialogAction onClick={() => deleteLiveClass(meeting.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
      </div>

      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSchedule}
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

export default LiveClassesPage;
