import axios from "../api/axios";

export const login = async (email, password) => {
  try {
    const response = await axios.post("/api/login", { email, password });

    // console.log(response)

    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token.token);
      const token = response.data.token.token;
      document.cookie = `authToken=${token}; path=/`;
      return { success: true, user: response.data.user };
    }

    return {
      success: false,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const register = async (email, password, role_id, institution_id) => {
  try {
    const response = await axios.post("/api/register", {
      email,
      password,
      role_id,
      institution_id,
    });

    if (response.status === 201 && response.data) {
      return response.data;
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      error: error,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axios.post("/api/verifyEmail", { token });

    if (response.status === 200 && response.data) {
      return response.data;
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const logout = async () => {
  await axios.get("/api/logout", {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });
  localStorage.removeItem("authToken");
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // window.location.href = '/login'
};

export const getToken = () => {
  return localStorage.getItem("authToken");
};
export const getAuthUser = async () => {
  try {
    const response = await axios.get("/api/authUser");
    console.log("data", response.data.user);
    if (response && response.data.user) {
      return { success: true, user: response.data.user };
    }
    return { success: false };
  } catch (error) {
    console.error("Auth check failed:", error);
    return { success: false };
  }
};

export const checkAuth = async (adminCheck = false, type = "") => {
  try {
    const response = await axios.get("/api/authUser");
    if (response && response.data.user) {
      if (adminCheck) {
        if (type === "superadmin") {
          if (response.data.user.roleId !== 4) {
            return false;
          }
        } else if (response.data.user.roleId !== 1) {
          return false;
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
};

export const allUsers = async () => {
  try {
    const response = await axios.get("/api/users");

    if (response.data) {
      return { success: true, users: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const addUser = async (newUser) => {
  try {
    const response = await axios.post("/api/users", newUser);

    if (response.data) {
      return { success: true, user: response.data };
    }
    return { success: false };
  } catch (error) {
    console.log(error.response?.data.message);
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const updateUser = async (newUser) => {
  try {
    const response = await axios.put(`/api/users/${newUser.id}`, newUser);

    if (response.data.user) {
      return { success: true, user: response.data.user };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/api/users/${userId}`);

    if (response.status == 200) {
      return { success: true };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const roles = async () => {
  try {
    const response = await axios.get("/api/users");

    if (response.data) {
      return { success: true, users: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const allOnlineFriends = async () => {
  try {
    const response = await axios.get("/api/onlineProfiles");

    if (response.data) {
      return { success: true, profiles: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};

export const searchProfiles = async (query) => {
  try {
    const response = await axios.get(`/api/searchProfiles?query=${query}`);

    if (response.data) {
      return { success: true, profiles: response.data };
    }
    return { success: false, profiles: [] };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message
        ? error.response.data.message
        : "Something went wrong. Please try again.",
    };
  }
};
