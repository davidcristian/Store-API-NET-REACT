import { createContext } from "react";
import { AlertColor } from "@mui/material/Alert";

export const SnackbarContext = createContext<
    (severity: AlertColor, message: string) => void
>(() => {});
