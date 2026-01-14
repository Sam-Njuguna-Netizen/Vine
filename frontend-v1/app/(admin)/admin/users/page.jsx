"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManage from "../userManage/page";
import InstructorRequest from "../instructorRequests/page";
import TicketsManage from "../userManage/tickets/page";

export default function UsersPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="users">Manage Users</TabsTrigger>
                    <TabsTrigger value="requests">Instructor Requests</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-6">
                    <UserManage />
                </TabsContent>
                <TabsContent value="requests" className="mt-6">
                    <InstructorRequest />
                </TabsContent>

            </Tabs>
        </div>
    );
}
