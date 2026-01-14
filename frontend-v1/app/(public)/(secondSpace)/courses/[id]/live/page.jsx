"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { io } from "socket.io-client";
import axios from "axios";
import { Video, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

const CourseLivePage = () => {
  const params = useParams();
  const courseId = params.id;
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    // Fetch initial live classes
    const fetchLiveClasses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3333'}/api/live-classes/${courseId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming token storage
            }
        });
        if (response.data.success) {
          setLiveClasses(response.data.liveClasses);
        }
      } catch (error) {
        console.error("Error fetching live classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveClasses();

    // Socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:30081");
    
    socket.on("connect", () => {
      console.log("Connected to socket");
      socket.emit("join-room", `course_${courseId}`); // Assuming backend handles this or just broadcasting to room
    });

    socket.on("live-class-created", (newClass) => {
      setLiveClasses((prev) => [newClass, ...prev]);
    });

    socket.on("live-class-deleted", (deletedId) => {
      setLiveClasses((prev) => prev.filter((c) => c.id !== deletedId));
    });

    return () => {
      socket.disconnect();
    };
  }, [courseId]);

  const handleJoin = (url) => {
    window.open(url, "_blank");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Live Classes</h1>
      
      {liveClasses.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Video className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No live classes scheduled</h3>
          <p className="text-slate-500">Check back later for upcoming sessions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {liveClasses.map((liveClass) => (
            <Card key={liveClass.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{liveClass.title}</h3>
                  <p className="text-slate-600 mb-4">{liveClass.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(liveClass.startDateTime), "PPP")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(liveClass.startDateTime), "p")}
                    </div>
                    <div className="flex items-center gap-1 capitalize">
                      <Video className="h-4 w-4" />
                      {liveClass.platform?.replace('_', ' ') || 'Google Meet'}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleJoin(liveClass.meetingUrl)}
                  className="w-full md:w-auto bg-[#5b30a6] hover:bg-[#4a268a]"
                >
                  Join Meeting
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseLivePage;
