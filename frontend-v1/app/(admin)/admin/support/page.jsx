"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MySupportTicket from "@/app/Components/MySupportTicket";
import TicketsManage from "../userManage/tickets/page";

export default function SupportPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>

      <Tabs defaultValue="my-tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="requests">Support Requests</TabsTrigger>
          {/* <TabsTrigger value="tickets"> User Tickets</TabsTrigger> */}
        </TabsList>

        <TabsContent value="my-tickets" className="mt-6">
          <div className="rounded-lg border p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">My Tickets</h2>
              <p className="text-sm text-muted-foreground">View and manage tickets you have raised.</p>
            </div>
            <MySupportTicket
              chatLink="/admin/support/messages/"
              getTicketApi="/api/allMyTicket"
              newTicket={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <div className="rounded-lg border p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Support Requests</h2>
              <p className="text-sm text-muted-foreground">View and manage tickets raised by your institution members.</p>
            </div>
            <MySupportTicket
              chatLink="/admin/support/messages/"
              getTicketApi="/api/allMyInstitutionTicket"
              newTicket={false}
              update={true}
            />
          </div>
        </TabsContent>
        <TabsContent value="tickets" className="mt-6">
          <TicketsManage />
        </TabsContent>
      </Tabs>
    </div>
  );
}