import { useState, useEffect } from "react";
import { AlertType } from "@/lib/types/types";

export const useAutoDismissAlert = (timeout = 5000) => {
  const [alert, setAlert] = useState<AlertType>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (alert) {
      timer = setTimeout(() => {
        setAlert(null);
      }, timeout);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [alert, timeout]);

  return [alert, setAlert] as const;
};

export default useAutoDismissAlert;
