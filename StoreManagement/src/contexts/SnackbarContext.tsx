import { AlertColor } from "@mui/material/Alert";
import { createContext } from "react";

export const SnackbarContext = createContext<
  (severity: AlertColor, message: string) => void
>(() => {});
