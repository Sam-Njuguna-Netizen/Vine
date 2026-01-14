'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
  X,
  Loader2,
  Trash2,
  Check,
  Video
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
import { addUser, allUsers, updateUser, deleteUser, searchProfiles } from "@/app/utils/auth";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

dayjs.extend(durationPlugin);
dayjs.extend(customParseFormat);

// Custom Responsive DateTime Picker Component using Shadcn (Reused)
const ResponsiveDateTimePicker = ({ value, onChange }) => {
  const [date, setDate] = useState(value ? value.toDate() : new Date());
  const [time, setTime] = useState(value ? value.format("HH:mm") : "12:00");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (value) {
      setDate(value.toDate());
      setTime(value.format("HH:mm"));
    }
  }, [value]);

  const handleDateSelect = (selectedDate) => {
    // 1. Prevent crashing if user unselects a date (clicks the same date twice)
    if (!selectedDate) return;

    setDate(selectedDate);
    updateDateTime(selectedDate, time);

    // 2. Uncomment this if you want it to close immediately after picking date
    // setIsOpen(false); 

    // OR keep it open so they can verify the date before clicking away manually
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    updateDateTime(date, newTime);
  };

  const updateDateTime = (d, t) => {
    if (!d || !t) return;
    const [hours, minutes] = t.split(":").map(Number);
    const newDateTime = dayjs(d).hour(hours).minute(minutes);
    onChange(newDateTime);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        modal={true} // <--- VITAL: Keeps focus inside the popover
      >
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
        <PopoverContent className="w-auto p-0" align="start">
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
// Fixed ResponsiveDurationPicker Component using Shadcn (Reused)
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [openUserModal, setOpenAddClassModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Form State
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [duration, setDuration] = useState("01:00:00");
  const [startDateTime, setStartDateTime] = useState(dayjs());

  // Meeting State
  const [meetingModel, setMeetingModel] = useState(false);
  const [meetingData, setMeetingData] = useState(null);
  const [isStartedClicked, setIsStartedClicked] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null); // Kept for compatibility if needed

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

  useEffect(() => {
    getAllMetting();
  }, []);

  const getAllMetting = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/adminAppoinment`);
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

  const filteredMeetings = meetings.filter(meeting =>
    meeting.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const joinMeeting = (record) => {
    setMeetingData(record);
    setMeetingModel(true);
  };

  const handleCloseMeeting = async () => {
    try {
      const response = await axios.post('/api/updateTheMeetingIscloseStatus', { ...meetingData, isClosed: true });
      if (response.status === 200) {
        N("Success", response.data.message, "success");
        getAllMetting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Action failed", "error");
    }
    setMeetingData(null);
    setMeetingModel(false);
  };

  const changeStatus = async (status, record) => {
    try {
      const response = await axios.post('/api/changeAppoinmentStatus', { status, id: record.id });
      if (response.status === 200) {
        getAllMetting();
        N("Success", response.data.message, "success");
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Action failed", "error");
    }
  };

  const makeTheMeetingOpen = async () => {
    try {
      const response = await axios.post('/api/makeTheMeetingOpen', meetingData);
      if (response.status === 200) {
        setIsStartedClicked(true);
        N("Success", response.data.message, "success");
        getAllMetting();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Action failed", "error");
    }
  };

  const resetModal = () => {
    setOpenAddClassModal(false);
    setTopic('');
    setDetails('');
    setDuration("01:00:00");
    setStartDateTime(dayjs());
    setParticipantQuery("");
    setParticipantResults([]);
    setSelectedParticipant(null);
  };

  const handleMeeting = async () => {
    const mettingInfo = {
      topic,
      details,
      startDateTime: startDateTime.format('YYYY-MM-DD HH:mm:ss'),
      duration
    };

    const ch = checkObjectFields(mettingInfo);
    if (!ch.success) {
      N("Error", ch.message, "error");
      return;
    }

    // Reuse validation logic from public page if needed, currently reusing basic check
    // Enhanced duration validation - accept both HH:mm and HH:mm:ss formats
    const durationRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:([0-5][0-9]))?$/;
    if (!durationRegex.test(duration)) {
      N("Error", "Please enter a valid duration in HH:mm format", "error");
      return;
    }

    const formattedDuration = duration.split(":").length === 2 ? `${duration}:00` : duration;

    try {
      const response = await axios.post('/api/appoinment', {
        ...mettingInfo,
        duration: formattedDuration,
        participantId: selectedParticipant?.user_id || null, // Admins typically create for themselves OR with someone
      });
      if (response.status === 201) {
        N("Success", response.data.message, "success");
        getAllMetting();
        resetModal();
      }
    } catch (error) {
      N("Error", error?.response?.data?.message || "Request failed", "error");
    }
  };


  return (
    <div className={`p-0 sm:p-6 min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className={`rounded-lg ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-md border overflow-hidden`}>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:p-6 p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-xl sm:text-2xl font-semibold dark:text-white sm:text-start text-center">
              Appointments
            </p>
            <Button variant="outline" onClick={() => setShowAll(true)}>
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
            <Button variant="secondary" onClick={() => getAllMetting()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="overflow-x-auto sm:px-3 px-0 pb-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentCalendar
              joinMeeting={joinMeeting}
              changeStatus={changeStatus}
              appointments={appointmentsData}
            />
          )}
        </div>

        {/* --- Modals --- */}

        {/* 1. Join Meeting Modal */}
        <Dialog open={meetingModel} onOpenChange={setMeetingModel}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-black border-gray-800">
            <DialogHeader className="p-4 border-b border-gray-800 bg-gray-900">
              <DialogTitle className="text-white">Join Meeting</DialogTitle>
            </DialogHeader>
            <div className="flex-1 p-4 overflow-y-auto bg-black">
              {meetingData && (
                <>
                  {authUser?.roleId === 2 && (
                    <div className="mb-4 p-3 bg-blue-900/40 text-blue-200 border border-blue-800 rounded-lg text-sm">
                      <strong>Step 1:</strong> Join the meetings as the Instructor
                    </div>
                  )}
                  <div className="jitsi-container mb-4 h-full w-full bg-gray-900 rounded-lg overflow-hidden relative">
                    <iframe
                      title="Meeting"
                      src={meetingData.meetingUrl}
                      width="100%"
                      height="100%"
                      allow="camera; microphone; fullscreen; display-capture"
                      className="border-0 absolute inset-0"
                    />
                  </div>
                  {/* Step 2 for Instructors */}
                  {authUser?.roleId === 2 && !isStartedClicked && !meetingData.isStarted && (
                    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="font-bold shadow-lg" size="lg">Step 2: Open for Students</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Open Meeting to Students?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will make the meeting accessible to all students. Ensure you have joined first.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => makeTheMeetingOpen()}>Yes, Open it</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </>
              )}
            </div>
            <DialogFooter className="p-4 border-t border-gray-800 bg-gray-900">
              {authUser?.roleId === 2 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Close Meeting (End for All)</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Meeting?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently close this meeting? This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCloseMeeting} className="bg-destructive hover:bg-destructive/90">
                        Yes, End Meeting
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

        {/* 2. Schedule Meeting Modal (Admin) */}
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

              <div className="space-y-2 relative">
                <Label>Participant (Optional)</Label>
                {selectedParticipant ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedParticipant.pPic} />
                        <AvatarFallback>{selectedParticipant.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{selectedParticipant.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedParticipant(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search for a student or instructor..."
                        className="pl-8"
                        value={participantQuery}
                        onChange={(e) => setParticipantQuery(e.target.value)}
                      />
                    </div>
                    {participantResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto">
                        {participantResults.map((profile) => (
                          <div
                            key={profile.id}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-2"
                            onClick={() => {
                              setSelectedParticipant(profile);
                              setParticipantQuery("");
                              setParticipantResults([]);
                            }}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile.pPic} />
                              <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{profile.name}</p>
                              <p className="text-xs text-muted-foreground">{profile.profession}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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

        {/* 3. All Meetings Search/List Modal */}
        <Dialog open={showAll} onOpenChange={setShowAll}>
          <DialogContent className="max-w-7xl h-[85vh] flex flex-col p-0">
            <DialogHeader className="p-4 border-b">
              <DialogTitle>All Scheduled Meetings</DialogTitle>
            </DialogHeader>

            <div className="p-4 border-b bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topic or details..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Desktop Table View */}
                <div className="hidden md:block border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                          <TableCell className="max-w-[250px] truncate">{item.details}</TableCell>
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
                          <TableCell className="text-right">
                            {!item.isClosed ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="secondary" onClick={() => changeStatus('confirmed', item)}>
                                  <Check className="w-4 h-4 mr-1" /> Confirm
                                </Button>
                                {item.status === 'confirmed' ? (
                                  <Button size="sm" onClick={() => joinMeeting(item)}>Join</Button>
                                ) : (
                                  <span className="text-muted-foreground text-sm flex items-center px-3">Pending</span>
                                )}
                              </div>
                            ) : (
                              <Badge variant="destructive">Closed</Badge>
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
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredMeetings.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold">{item.topic}</h4>
                            <p className="text-xs text-muted-foreground">{dayjs(item.startDateTime).format("MMM D, h:mm A")}</p>
                          </div>
                          <Badge variant={item.status === 'confirmed' ? 'default' : 'secondary'}>{item.status}</Badge>
                        </div>
                        <p className="text-sm">{item.details}</p>

                        {!item.isClosed ? (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => changeStatus('confirmed', item)}>
                              Confirm
                            </Button>
                            {item.status === 'confirmed' && (
                              <Button size="sm" className="flex-1" onClick={() => joinMeeting(item)}>
                                Join
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="pt-2">
                            <Badge variant="destructive" className="w-full justify-center">Closed</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
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