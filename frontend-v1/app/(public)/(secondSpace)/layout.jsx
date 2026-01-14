import React from "react";
import PublicNotifications from "./_components/notification";
const Layout = ({ children }) => {
  return (
    <div>
      <PublicNotifications />
      {children}
    </div>
  );
};

export default Layout;
