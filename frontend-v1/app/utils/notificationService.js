// utils/notificationService.js

import { toast } from "sonner";

export const N = (message, description, type = "info", pauseOnHover = true) => {
  console.log(pauseOnHover)
  // Map Ant Design types to Sonner types/styles
  switch (type) {
    case "success":
      toast.success(message, {
        description: <div className="text-black dark:text-white"> {description}</div>,
        duration: 3000,
      });
      break;
    case "error":
      toast.error(message, {
        description: <div className="text-black dark:text-white"> {description}</div>,
        duration: 4000, // Slightly longer for errors
      });
      break;
    case "warning":
      toast.warning(message, {
        description: <div className="text-black dark:text-white"> {description}</div>,
        duration: 3000,
      });
      break;
    case "info":
    default:
      toast.info(message, {
        description: <div className="text-black dark:text-white"> {description}</div>,
        duration: 3000,
      });
      break;
  }
};

export const notificationChacker = (data) => {
  return data;
};
