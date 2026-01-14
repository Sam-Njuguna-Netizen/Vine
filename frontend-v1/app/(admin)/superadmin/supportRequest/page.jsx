"use client";
import MySupportTicket from '@/app/Components/MySupportTicket'
export default function SupportRequest() {
  return (
    <MySupportTicket chatLink="/superadmin/support/messages/" getTicketApi="/api/allAdminTicket" newTicket={false} />
  );
}