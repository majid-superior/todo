import { useState, useCallback } from "react";

const useNotification = () => {
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const showNotification = useCallback((message, type = "success") => {
    setNotification({
      message,
      type,
      isVisible: true,
    });

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  return { notification, showNotification };
};

export default useNotification;
