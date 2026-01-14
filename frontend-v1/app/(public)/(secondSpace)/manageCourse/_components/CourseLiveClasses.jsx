"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    Plus,
    LoaderCircle,
    Calendar,
    Clock,
    Radio,
} from "lucide-react";
import moment from "moment";
import axios from "@/app/api/axios";
import { N } from "@/app/utils/notificationService";
import { checkObjectFields } from "@/app/utils/common";

// Import the new modal components
import { AddScheduleModal } from "@/app/Components/LiveClassModals";
import JitsiMeetingModal from "../../courseLiveClass/JitsiClassModel";

// --- Reusable Button (can also be in a central component file) ---
const Button = ({
    children,
    onClick,
    className = "",
    type = "button",
    disabled = false,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const CourseLiveClasses = ({ courseId }) => {
    const authUser = useSelector((state) => state.auth.user);
    const isAdmin = authUser?.roleId === 2;

    const [liveClasses, setLiveClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [joiningMeeting, setJoiningMeeting] = useState(null); // Holds meeting data for the modal

    const fetchLiveClasses = async () => {
        if (!courseId) return;
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/live-classes/${courseId}`);
            setLiveClasses(response.data.liveClasses || []);
        } catch (error) {
            console.error("Failed to fetch live classes", error);
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
        setIsDeleting(true);
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
        } finally {
            setIsDeleting(false);
        }
    };
    const handleCloseMeeting = async () => {
        if (!joiningMeeting) return;
        if (
            !window.confirm("Are you sure you want to end this meeting for everyone?")
        ) {
            setJoiningMeeting(null);
            return;
        }
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

    const getStatus = (liveClass) => {
        if (liveClass.isClosed)
            return { text: "Finished", color: "bg-red-200 text-red-800" };
        if (liveClass.isStarted)
            return {
                text: "Live",
                color: "bg-green-200 text-green-800 animate-pulse",
            };

        // Check if the class time has passed but it hasn't started
        if (moment().isAfter(moment(liveClass.startDateTime))) {
            return { text: "Waiting for Host", color: "bg-blue-200 text-blue-800" };
        }

        return { text: "Upcoming", color: "bg-yellow-200 text-yellow-800" };
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoaderCircle className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border shadow-sm">
            <div className="mx-auto">
                <div className="flex items-center justify-between mb-8  sm:flex-row flex-col">
                    <div className="text-start">
                        <h1 className="text-2xl font-bold dark:text-gray-200">
                            Live Classes
                        </h1>
                    </div>
                    {isAdmin && (
                        <Button
                            onClick={() => setAddModalOpen(true)}
                            className="sm:px-[16px] px-[1px] sm:mt-[1px] mt-[5px]"
                        >
                            <Plus size={20} className="mr-2" /> Schedule Class
                        </Button>
                    )}
                </div>

                {liveClasses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {liveClasses.map((liveClass) => {
                            const status = getStatus(liveClass);

                            // --- MODIFICATION: Updated logic for enabling the join button ---
                            const now = moment();
                            const startTime = moment(liveClass.startDateTime);
                            const isTimeForClass = now.isAfter(startTime);

                            // A student can join if the class is started OR if the start time has passed.
                            const canStudentJoin = liveClass.isStarted || isTimeForClass;
                            const canJoin =
                                !liveClass.isClosed && (isAdmin || canStudentJoin);

                            return (
                                <div
                                    key={liveClass?.id}
                                    className="dark:shadow-white rounded-lg shadow-md p-6 flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 border border-gray-200 dark:border-gray-700"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold dark:text-white">
                                                {liveClass?.serialNo}. {liveClass?.title}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${status?.color}`}
                                            >
                                                {status?.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-500 space-x-4 text-sm mb-4">
                                            <span className="flex items-center">
                                                <Calendar size={14} className="mr-2" />
                                                {moment(liveClass.startDateTime).format(
                                                    "MMMM Do YYYY, h:mm A"
                                                )}
                                            </span>
                                            <span className="flex items-center">
                                                <Clock size={14} className="mr-2" />
                                                {liveClass.duration}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {liveClass.description}
                                        </p>
                                    </div>
                                    <div
                                        className={`mt-6 text-right flex ${isAdmin ? "justify-between" : "justify-end"
                                            }`}
                                    >
                                        {isAdmin ? (
                                            <Button
                                                onClick={() => deleteLiveClass(liveClass.id)}
                                                disabled={deleting}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        ) : (
                                            ""
                                        )}
                                        <Button
                                            onClick={() => setJoiningMeeting(liveClass)}
                                            disabled={!canJoin}
                                            className={`${!canJoin
                                                    ? "bg-gray-400"
                                                    : "bg-green-600 hover:bg-green-700"
                                                }`}
                                        >
                                            <Radio size={16} className="mr-2" />{" "}
                                            {isAdmin ? "Host & Join" : "Join Class"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-700">
                            No Live Classes Scheduled
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isAdmin
                                ? "Click 'Schedule Class' to add the first one."
                                : "Check back later for upcoming classes."}
                        </p>
                    </div>
                )}
            </div>

            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSave={handleAddSchedule}
            />
            {/* --- MODIFICATION: Pass the `user` object to the modal --- */}
            <JitsiMeetingModal
                isOpen={!!joiningMeeting}
                meetingData={joiningMeeting}
                user={authUser} // Pass the full user object
                isAdmin={isAdmin}
                onClose={() => setJoiningMeeting(null)}
                onMakeOpen={handleOpenForStudents}
                onCloseMeeting={handleCloseMeeting}
            />
        </div>
    );
};

export default CourseLiveClasses;
