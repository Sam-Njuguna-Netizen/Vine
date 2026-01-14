"use client";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Video,
  X,
  Loader2
} from "lucide-react";
import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { checkObjectFields } from "@/app/utils/common";
import Countdown from "react-countdown";
import axios from "@/app/api/axios";
import AppointmentCalendar from "@/app/Components/AppointmentCalendar";
import { useTheme } from "@/context/ThemeContext";
import { N } from "@/app/utils/notificationService";
import { useSelector } from "react-redux";
import { searchProfiles } from "@/app/utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

dayjs.extend(durationPlugin);
dayjs.extend(customParseFormat);

// Custom Responsive DateTime Picker Component using Shadcn
const ResponsiveDateTimePicker = ({ value, onChange }) => {
  const [date, setDate] = useState(value ? value.toDate() : new Date());
  const [time, setTime] = useState(value ? value.format("HH:mm") : "12:00");

  useEffect(() => {
    if (value) {
      setDate(value.toDate());
      setTime(value.format("HH:mm"));
    }
  }, [value]);

  const handleDateSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    updateDateTime(selectedDate, time);
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateDateTime(date, newTime);
  };

  const updateDateTime = (d, t) => {
    const [hours, minutes] = t.split(":").map(Number);
    const newDateTime = dayjs(d).hour(hours).minute(minutes);
    onChange(newDateTime);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="w-full sm:w-[150px]"
      />
    </div>
  );
};

// Fixed ResponsiveDurationPicker Component using Shadcn
const ResponsiveDurationPicker = ({ value, onChange }) => {
  // Value is expected in HH:mm:ss format string
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      setHours(h || 0);
      setMinutes(m || 0);
    }
  }, [value]);

  const updateDuration = (h, m) => {
    const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    onChange(formatted);
  };

  const handleHoursChange = (e) => {
    const val = Math.max(0, Math.min(23, Number(e.target.value)));
    setHours(val);
    updateDuration(val, minutes);
  };

  const handleMinutesChange = (e) => {
    const val = Math.max(0, Math.min(59, Number(e.target.value)));
    setMinutes(val);
    updateDuration(hours, val);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={23}
          value={hours}
          onChange={handleHoursChange}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">hrs</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={59}
          step={5}
          value={minutes}
          onChange={handleMinutesChange}
          className="w-20"
        />
        <span className="text-sm text-muted-foreground">mins</span>
      </div>
    </div>
  );
};

const LiveClassSchedules = () => {
  const isMobile = useSelector((state) => state.commonGLobal.isMobile);
  const { darkMode } = useTheme();
  const authUser = useSelector((state) => state.auth.user);

  const [meetings, setMeetings] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openUserModal, setOpenAddClassModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAllMeeting = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/myAppoinment`);
      if (response.status === 200 && response?.data.success) {
        setAppointmentsData(response?.data.appoinment);
        setMeetings(response?.data.appoinment);
      }
    } catch (error) {
      N("Error", "Failed to fetch appointments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMeeting();
  }, []);

  const filteredMeetings = meetings.filter(meeting =>
    meeting.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [duration, setDuration] = useState("01:00:00"); // Initialize with default 1 hour
  const [isStartedClicked, setIsStartedClicked] = useState(false);

  const [startDateTime, setStartDateTime] = useState(dayjs());

  // Participant Selection for Admins
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantResults, setParticipantResults] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isSearchingParticipants, setIsSearchingParticipants] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (participantQuery.trim()) {
        setIsSearchingParticipants(true);
        const res = await searchProfiles(participantQuery);
        if (res.success) {
          setParticipantResults(res.profiles);
        } else {
          setParticipantResults([]);
        }
        setIsSearchingParticipants(false);
      } else {
        setParticipantResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [participantQuery]);

  const [meetingModel, setMeetingModel] = useState(false);
  const [meetingData, setMeetingData] = useState({});
  const [showAll, setShowAll] = useState(false);

  const joinMeeting = (record) => {
    setMeetingData(record);
    setMeetingModel(true);
  };

  const handleCloseMeeting = async () => {
    try {
      const response = await axios.post("/api/updateTheMeetingIscloseStatus", {
        ...meetingData,
        isClosed: true,
      });
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getAllMeeting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Action failed", "error");
    }
    setMeetingData(null);
    setMeetingModel(false);
  };

  const makeTheMeetingOpen = async () => {
    try {
      const response = await axios.post("/api/makeTheMeetingOpen", meetingData);
      if (response.status === 200) {
        setIsStartedClicked(true);
        N("Success", response.data.message, "success");
        getAllMeeting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Action failed", "error");
    }
  };

  const resetModal = () => {
    setOpenAddClassModal(false);
    setTopic("");
    setDetails("");
    setDuration("01:00:00"); // Reset to default 1 hour
    setStartDateTime(dayjs());
    setParticipantQuery("");
    setParticipantResults([]);
    setSelectedParticipant(null);
  };

  const handleMeeting = async () => {
    const mettingInfo = {
      topic,
      details,
      startDateTime: startDateTime.format("YYYY-MM-DD HH:mm:ss"),
      duration,
    };

    const ch = checkObjectFields(mettingInfo);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    // Enhanced duration validation - accept both HH:mm and HH:mm:ss formats
    const durationRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;
    if (!durationRegex.test(duration)) {
      N("Error", "Please enter a valid duration in HH:mm format", "error");
      return;
    }

    // Check if duration is not zero
    if (duration === "00:00:00" || duration === "00:00") {
      N(
        "Error",
        "Duration cannot be zero. Please select a valid duration.",
        "error"
      );
      return;
    }

    // Ensure duration is in HH:mm:ss frmat before sending
    const formattedDuration =
      duration.split(":").length === 2 ? `${duration}:00` : duration;

    try {
      const response = await axios.post("/api/appoinment", {
        ...mettingInfo,
        duration: formattedDuration,
        participantId: selectedParticipant?.user_id || null,
      });
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getAllMeeting();
        resetModal();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Request failed", "error");
    }
  };

  return (
    <div className={`p-0 sm:p-6  min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div
        className={`rounded-lg max-md:rounded-none ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } shadow-md border overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:p-6 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-xl sm:text-2xl font-semibold dark:text-white sm:text-start text-center">
              Appointments
            </p>
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
            >
              All Meetings
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              onClick={() => setOpenAddClassModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Schedule a meeting
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => getAllMeeting()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto sm:px-3 px-0 pb-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentCalendar
              joinMeeting={joinMeeting}
              appointments={appointmentsData}
            />
          )}
        </div>

        {/* Join Meeting Modal */}
        <Dialog open={meetingModel} onOpenChange={setMeetingModel}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Join Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-4 overflow-y-auto">
              {meetingData && (
                <>
                  {authUser?.roleId === 2 && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                      <strong>Step 1:</strong> Join the meetings as the Instructor
                    </div>
                  )}
                  <div className="jitsi-container mb-4 h-[500px] w-full bg-black rounded-lg overflow-hidden">
                    <iframe
                      title="Meeting"
                      src={meetingData.meetingUrl}
                      width="100%"
                      height="100%"
                      allow="camera; microphone; fullscreen; display-capture"
                      className="border-0"
                    />
                  </div>
                  {authUser?.roleId === 2 &&
                    !isStartedClicked &&
                    !meetingData.isStarted && (
                      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <p className="font-medium mb-2">
                          Step 2: Make the meeting open for students
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button>Open for Students</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will make the meeting accessible to all students.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => makeTheMeetingOpen()}>
                                Yes, Open it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                </>
              )}
            </div>
            <DialogFooter className="p-4 border-t">
              {authUser?.roleId === 2 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Close Meeting</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Close Meeting?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to close this meeting? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCloseMeeting} className="bg-destructive hover:bg-destructive/90">
                        Yes, Close
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button variant="destructive" onClick={() => setMeetingModel(false)}>
                  Leave Meeting
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Schedule Meeting Modal */}
        <Dialog open={openUserModal} onOpenChange={setOpenAddClassModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule a meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Topic*</Label>
                <Input
                  placeholder="Enter Topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Details*</Label>
                <Textarea
                  rows={3}
                  placeholder="Enter Details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date & Time*</Label>
                <ResponsiveDateTimePicker
                  value={startDateTime}
                  onChange={setStartDateTime}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration*</Label>
                <ResponsiveDurationPicker
                  value={duration}
                  onChange={setDuration}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button onClick={handleMeeting}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* All Meetings Modal (Table View) */}
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogContent className="max-w-6xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>Scheduled Meetings</DialogTitle>
            </DialogHeader>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meetings..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {isMobile ? (
                  <div className="space-y-4">
                    {filteredMeetings.map((item) => (
                      <Card key={item.id || item.topic}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold">{item.topic}</h4>
                            {item.participant && (
                              <span className="text-xs text-muted-foreground block">
                                With: {item.participant.profile?.name || item.participant.email}
                              </span>
                            )}
                            <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.details}</p>
                          <div className="text-sm">
                            <strong>Starts in:</strong> <Countdown date={item.startDateTime} />
                          </div>
                          <div className="text-sm">
                            <strong>Duration:</strong> {item.duration}
                          </div>
                          <div className="pt-2">
                            {!item.isClosed ? (
                              item.status === "confirmed" ? (
                                <Button size="sm" onClick={() => joinMeeting(item)} className="w-full">
                                  Join
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not Started</span>
                              )
                            ) : (
                              <Badge variant="destructive">Closed</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Start Date Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMeetings.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.topic}
                            {item.participant && (
                              <div className="text-xs text-muted-foreground">
                                With: {item.participant.profile?.name || item.participant.email}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={item.details}>{item.details}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{dayjs(item.startDateTime).format("MMM D, YYYY h:mm A")}</span>
                              <span className="text-xs text-muted-foreground"><Countdown date={item.startDateTime} /></span>
                            </div>
                          </TableCell>
                          <TableCell>{item.duration}</TableCell>
                          <TableCell>
                            <Badge variant={item.status === 'confirmed' ? 'outline' : 'secondary'} className={item.status === 'confirmed' ? 'border-green-500 text-green-500' : ''}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {!item.isClosed ? (
                              item.status === "confirmed" ? (
                                <Button size="sm" onClick={() => joinMeeting(item)}>
                                  Join
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">Not Started</span>
                              )
                            ) : (
                              <Badge variant="secondary">Closed</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredMeetings.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            No meetings found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="p-4 border-t">
              <Button onClick={() => setShowAll(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LiveClassSchedules;
