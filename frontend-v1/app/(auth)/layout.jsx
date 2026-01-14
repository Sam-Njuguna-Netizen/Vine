"use client";

// import '../../public/assets/plugins/global/plugins.bundle.css'
// import '../../public/assets/css/style.bundle.css'
import "../globals.css";

import AdminLayout from "./components/AdminLayout";
import { Provider } from "react-redux";
import store, { publicPaths } from "../store";
import "@ant-design/v5-patch-for-react-19";
import MyApp from "@/app/Components/MyApp";
import { ThemeProvider } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";

import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <>
      <Provider store={store}>
        <ThemeProvider>
          <AdminLayout>
            <MyApp />
            {children}
          </AdminLayout>
          <Toaster />
        </ThemeProvider>
      </Provider>
    </>
  );
}
