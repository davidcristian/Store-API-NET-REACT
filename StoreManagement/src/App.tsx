import * as React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Box } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps, AlertColor } from "@mui/material/Alert";
import { SnackbarContext } from "./components/SnackbarContext";

import { AppHome } from "./components/AppHome";
import { AppMenu } from "./components/AppMenu";
import { Chat } from "./components/Chat";

import { ShowStoreSalaryReport } from "./components/reports/ShowStoreSalaryReport";
import { ShowStoreHeadcountReport } from "./components/reports/ShowStoreHeadcountReport";

import { AllEmployees } from "./components/employees/AllEmployees";
import { EmployeeDetails } from "./components/employees/EmployeeDetails";
import { EmployeeAdd } from "./components/employees/EmployeeAdd";
import { EmployeeDelete } from "./components/employees/EmployeeDelete";
import { EmployeeUpdate } from "./components/employees/EmployeeUpdate";
import { EmployeeFilter } from "./components/employees/EmployeeFilter";
import { EmployeeShiftAdd } from "./components/employees/EmployeeShiftAdd";

import { AllRoles } from "./components/roles/AllRoles";
import { RoleDetails } from "./components/roles/RoleDetails";
import { RoleAdd } from "./components/roles/RoleAdd";
import { RoleDelete } from "./components/roles/RoleDelete";
import { RoleUpdate } from "./components/roles/RoleUpdate";

import { AllStores } from "./components/stores/AllStores";
import { StoreDetails } from "./components/stores/StoreDetails";
import { StoreAdd } from "./components/stores/StoreAdd";
import { StoreDelete } from "./components/stores/StoreDelete";
import { StoreUpdate } from "./components/stores/StoreUpdate";
import { StoreShiftAdd } from "./components/stores/StoreShiftAdd";

import { AllShifts } from "./components/shifts/AllShifts";
import { ShiftDetails } from "./components/shifts/ShiftDetails";
import { ShiftAdd } from "./components/shifts/ShiftAdd";
import { ShiftDelete } from "./components/shifts/ShiftDelete";
import { ShiftUpdate } from "./components/shifts/ShiftUpdate";

import { UserRegister } from "./components/users/UserRegister";
import { UserConfirm } from "./components/users/UserConfirm";
import { UserLogin } from "./components/users/UserLogin";
import { AdminPanel } from "./components/users/AdminPanel";

import { AllUsers } from "./components/users/AllUsers";
import { UserDetails } from "./components/users/UserDetails";
import { UserAdd } from "./components/users/UserAdd";
import { UserDelete } from "./components/users/UserDelete";
import { UserUpdate } from "./components/users/UserUpdate";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>("success");
    const [message, setMessage] = useState("placeholder");

    const openSnackbar = (severity: AlertColor, message: string) => {
        handleClose();

        setTimeout(() => {
            setSeverity(severity);
            setMessage(message);
            setOpen(true);
        }, 250);
    };

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    sx={{ width: "100%", whiteSpace: "pre-wrap" }}
                >
                    {message}
                </Alert>
            </Snackbar>

            <SnackbarContext.Provider value={openSnackbar}>
                <Router>
                    <AppMenu />

                    <Routes>
                        <Route path="/" element={<AppHome />} />
                        <Route path="/chat" element={<Chat />} />

                        <Route
                            path="/users/register"
                            element={<UserRegister />}
                        />
                        <Route
                            path="/users/register/confirm/:code"
                            element={<UserConfirm />}
                        />
                        <Route path="/users/login" element={<UserLogin />} />
                        <Route
                            path="/users/adminpanel"
                            element={<AdminPanel />}
                        />

                        <Route path="/users" element={<AllUsers />} />
                        <Route
                            path="/users/:userId/details"
                            element={<UserDetails />}
                        />
                        <Route path="/users/add" element={<UserAdd />} />
                        <Route
                            path="/users/:userId/delete"
                            element={<UserDelete />}
                        />
                        <Route
                            path="/users/:userId/edit"
                            element={<UserUpdate />}
                        />

                        <Route
                            path="/filteremployees"
                            element={<EmployeeFilter />}
                        />
                        <Route path="/employees" element={<AllEmployees />} />
                        <Route path="/roles" element={<AllRoles />} />
                        <Route path="/stores" element={<AllStores />} />
                        <Route path="/shifts" element={<AllShifts />} />

                        <Route
                            path="/salaryreport"
                            element={<ShowStoreSalaryReport />}
                        />
                        <Route
                            path="/headcountreport"
                            element={<ShowStoreHeadcountReport />}
                        />

                        <Route
                            path="/employees/add"
                            element={<EmployeeAdd />}
                        />
                        <Route
                            path="/employees/:employeeId/details"
                            element={<EmployeeDetails />}
                        />
                        <Route
                            path="/employees/:employeeId/delete"
                            element={<EmployeeDelete />}
                        />
                        <Route
                            path="/employees/:employeeId/edit"
                            element={<EmployeeUpdate />}
                        />
                        <Route
                            path="/employees/:employeeId/addshift"
                            element={<EmployeeShiftAdd />}
                        />

                        <Route path="/roles/add" element={<RoleAdd />} />
                        <Route
                            path="/roles/:roleId/details"
                            element={<RoleDetails />}
                        />
                        <Route
                            path="/roles/:roleId/delete"
                            element={<RoleDelete />}
                        />
                        <Route
                            path="/roles/:roleId/edit"
                            element={<RoleUpdate />}
                        />

                        <Route path="/stores/add" element={<StoreAdd />} />
                        <Route
                            path="/stores/:storeId/details"
                            element={<StoreDetails />}
                        />
                        <Route
                            path="/stores/:storeId/delete"
                            element={<StoreDelete />}
                        />
                        <Route
                            path="/stores/:storeId/edit"
                            element={<StoreUpdate />}
                        />
                        <Route
                            path="/stores/:storeId/addshift"
                            element={<StoreShiftAdd />}
                        />

                        <Route path="/shifts/add" element={<ShiftAdd />} />
                        <Route
                            path="/shifts/:storeId/:employeeId/details"
                            element={<ShiftDetails />}
                        />
                        <Route
                            path="/shifts/:storeId/:employeeId/delete"
                            element={<ShiftDelete />}
                        />
                        <Route
                            path="/shifts/:storeId/:employeeId/edit"
                            element={<ShiftUpdate />}
                        />
                    </Routes>

                    <Box sx={{ mb: 4 }} />
                </Router>
            </SnackbarContext.Provider>
        </React.Fragment>
    );
}

export default App;
