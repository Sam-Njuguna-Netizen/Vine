import axios from "../api/axios";

export const getLibraryFiles = async (params) => {
  try {
    const response = await axios.get("/api/libraries", { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to fetch library files" };
  }
};

export const uploadLibraryFile = async (data) => {
  try {
    const response = await axios.post("/api/libraries", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to upload file" };
  }
};

export const deleteLibraryFile = async (id) => {
  try {
    const response = await axios.delete(`/api/libraries/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || "Failed to delete file" };
  }
};
