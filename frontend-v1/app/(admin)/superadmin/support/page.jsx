"use client";
import MySupportTicket from '@/app/Components/MySupportTicket'
export default function Support() {
  return (
    <MySupportTicket chatLink="/admin/support/messages/" getTicketApi="/api/allMyTicket" />
  );
}