"use client";
import "@/app/globals.css";
import AdminLayout from "./components/AdminLayout";
import { ConfigProvider } from "antd";
import { Provider } from "react-redux";
import store from "../../store";
import MyApp from "@/app/Components/MyApp";
import "@ant-design/v5-patch-for-react-19";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
            },
          }}
        >
          <AdminLayout>
            <MyApp />
            {children}
          </AdminLayout>
          <Toaster />
        </ConfigProvider>
      </ThemeProvider>
    </Provider>
  );
}
