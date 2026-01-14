"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import GroupList from "./components/GroupList";
import JoinRequests from "./components/JoinRequests";

export default function GroupPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Group Management
        </h1>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Group List
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Join Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          <GroupList />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <JoinRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
