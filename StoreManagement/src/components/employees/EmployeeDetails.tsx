import {
    Box,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Button,
    CircularProgress,
} from "@mui/material";
import { Container } from "@mui/system";

import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_API_URL, formatDate } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken, isAuthorized } from "../../auth";
import { Employee, Gender } from "../../models/Employee";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

export const EmployeeDetails = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);

    const { employeeId } = useParams();
    const [employee, setEmployee] = useState<Employee>();
    const [salaryPrediction, setSalaryPrediction] = useState<number>(-1);

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            await axios
                .get<Employee>(
                    `${BACKEND_API_URL}/storeemployees/${employeeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const employee = response.data;
                    setEmployee(employee);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch employee details!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch employee details due to an unknown error!"
            );
        }
    };

    const fetchSalaryPrediction = async () => {
        // calculate tenure: number of days between employment date and termination date. If termination date is null, use today's date.
        const tenure = Math.floor(
            (new Date(employee?.terminationDate ?? new Date()).getTime() -
                new Date(employee?.employmentDate!).getTime()) /
                (1000 * 60 * 60 * 24)
        );

        // calculate tenure in 10 years based on the tenure
        const futureTenure = tenure + 365 * 10;

        try {
            await axios
                .get<number>(
                    `${BACKEND_API_URL}/storeemployees/predict?role=${employee?.storeEmployeeRole?.name}&tenure=${futureTenure}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const prediction = response.data;
                    setSalaryPrediction(prediction);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch employee salary prediction!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch employee salary prediction due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchEmployee();
    }, [employeeId]);

    useEffect(() => {
        if (employee) {
            fetchSalaryPrediction();
        }
    }, [employee]);

    return (
        <Container>
            {loading && <CircularProgress />}
            {!loading && (
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <Box display="flex" alignItems="flex-start">
                            <IconButton
                                component={Link}
                                sx={{ mb: 2, mr: 3 }}
                                to={`/employees`}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <h1
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    marginLeft: -64,
                                    marginTop: -4,
                                }}
                            >
                                Employee Details
                            </h1>
                        </Box>

                        <Box sx={{ ml: 1 }}>
                            <p>First Name: {employee?.firstName}</p>
                            <p>Last Name: {employee?.lastName}</p>
                            <p>
                                Gender:{" "}
                                {employee == null
                                    ? ""
                                    : Gender[employee.gender]}
                            </p>
                            <p>
                                Employment Date:{" "}
                                {formatDate(employee?.employmentDate)}
                            </p>
                            <p>
                                Termination Date:{" "}
                                {formatDate(employee?.terminationDate)}
                            </p>
                            <p>Salary: {employee?.salary}</p>
                            <p>
                                Predicted salary in 10 years:{" "}
                                {salaryPrediction < 0
                                    ? "N/A"
                                    : salaryPrediction}
                            </p>
                            <p>
                                Role:{" "}
                                {employee?.storeEmployeeRole?.name ?? "Unknown"}
                            </p>
                            <p>Employee shifts:</p>
                            {employee?.storeShifts?.length ? (
                                <ul style={{ marginBottom: 0 }}>
                                    {employee?.storeShifts?.map((shift) => (
                                        <li key={shift.store?.id}>
                                            {shift.store?.name} -{" "}
                                            {formatDate(shift.startDate)} -{" "}
                                            {formatDate(shift.endDate)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul style={{ marginBottom: 0 }}>
                                    <li>N/A</li>
                                </ul>
                            )}
                        </Box>

                        <Button
                            component={Link}
                            to={`/employees/${employeeId}/addshift`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "green",
                                textTransform: "none",
                                mt: 1,
                                ml: 2.4,
                            }}
                            startIcon={<AccessTimeFilledIcon />}
                            disabled={!isAuthorized(employee?.user?.id)}
                        >
                            Add Shift
                        </Button>
                    </CardContent>
                    <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                        <Button
                            component={Link}
                            to={`/employees/${employeeId}/edit`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "gray",
                                textTransform: "none",
                            }}
                            startIcon={<EditIcon />}
                            disabled={!isAuthorized(employee?.user?.id)}
                        >
                            Edit
                        </Button>

                        <Button
                            component={Link}
                            to={`/employees/${employeeId}/delete`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "red",
                                textTransform: "none",
                            }}
                            startIcon={<DeleteForeverIcon />}
                            disabled={!isAuthorized(employee?.user?.id)}
                        >
                            Delete
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};
