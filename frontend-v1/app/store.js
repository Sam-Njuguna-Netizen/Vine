import { configureStore, createSlice } from "@reduxjs/toolkit";

// Create a slice (manages part of the state)
const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

// commonGLobal
const commonGLobalSlice = createSlice({
  name: "commonGLobal",
  initialState: {
    isMobile: false,
    apiUrl: apiUrl,
  },
  reducers: {
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
  },
});

export const { setIsMobile } = commonGLobalSlice.actions;

// auth
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    onlineProfiles: [],
    roles: [
      {
        id: 1,
        role_name: "Admin",
      },
      {
        id: 2,
        role_name: "Instructor",
      },
      {
        id: 3,
        role_name: "User/Student",
      },
    ],
    priority: [
      {
        id: 1,
        name: "Low",
      },
      {
        id: 2,
        name: "Medium",
      },
      {
        id: 3,
        name: "High",
      },
    ],
    storeCategory: [
      {
        id: 1,
        name: "Book",
      },
      {
        id: 2,
        name: "Audio",
      },
      {
        id: 3,
        name: "T-shirt",
      },
    ],
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setOnlineProfiles: (state, action) => {
      state.onlineProfiles = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setAuthUser,
  logoutUser,
  setOnlineProfiles,
  setUserLoading,
} = authSlice.actions;

const courseCategorySlice = createSlice({
  name: "courseCategorySlice",
  initialState: {
    courseCategory: [],
  },
  reducers: {
    setCourseCategory: (state, action) => {
      state.courseCategory = action.payload;
    },
  },
});

export const { setCourseCategory } = courseCategorySlice.actions;

// cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    shipingCondition: ["Digital Copy", "MP3", "MP4"],
  },
  reducers: {
    addToCart: (state, action) => {
      if (!Array.isArray(state.items)) {
        state.items = [];
      }

      const existingIndex = state.items.findIndex(
        (item) =>
          item.bookId === action.payload.bookId &&
          item.style === action.payload.style
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart: (state, action) => {
      if (!Array.isArray(state.items)) return;
      state.items = state.items.filter(
        (item) =>
          !(
            item.bookId === action.payload.bookId &&
            item.style === action.payload.style
          )
      );
    },
    updateCartItemQuantity: (state, action) => {
      if (!Array.isArray(state.items)) return;
      const { bookId, style, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.bookId === bookId && item.style === style
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    setCart: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

/**
 * Public routes that do NOT require auth.
 * Used by both proxy middleware and client-side redirect logic.
 */
export const publicPaths = [
  // Core public pages
  "/",
  "/login",
  "/register",
  "/forgotPassword",
  "/verifyEmail",

  // Marketing / public pages
  "/demo-video",
  "/ai-chat",
  "/contact",
  "/support",
  "/features",
  "/pricing",
  "/about",
  "/about-us",
  "/products",
  "/solutions",
  "/resources",

  // Legacy / older paths that may still be linked somewhere
  "/privacyPolicy",
  "/fqa",
  "/eula",

  // New DB-driven legal pages (canonical)
  "/privacy-policy",
  "/terms-and-conditions",
  "/user-agreement",
  "/about-vine",

  // Static assets / media
  "/assets/*",
  "/products/*",
  "/avatars/*",
  "/resources/*",
  "/icons/icon-512x512.png",
  "/icons/icon-192x192.png",
  "/assets/media/logos/logobig.png",
  "/assets/media/logos/logo.png",
];

// Configure store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
    auth: authSlice.reducer,
    courseCategory: courseCategorySlice.reducer,
    commonGLobal: commonGLobalSlice.reducer,
    cart: cartSlice.reducer,
  },
  devTools: true,
});

export default store;
