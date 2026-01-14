
export const getAllTickets = async () => {
  try {
    const axios = (await import('@/app/api/axios')).default;

    const response = await axios.get('/admin/tickets');
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }
};

export const respondToTicket = async (ticketId, answer) => {
  try {
     const axios = (await import('@/app/api/axios')).default;
    const response = await axios.post(`/admin/tickets/${ticketId}/respond`, { answer });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error responding to ticket:", error);
    return { success: false, message: error.response?.data?.message || "Failed to send response" };
  }
};

export const updateTicketStatus = async (ticketId, status) => {
  try {
     const axios = (await import('@/app/api/axios')).default;
    const response = await axios.patch(`/admin/tickets/${ticketId}/status`, { status });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return { success: false, message: error.response?.data?.message || "Failed to update status" };
  }
};