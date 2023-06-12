import {
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Button,
    Box,
    TextField,
    useTheme,
    useMediaQuery,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActions,
} from "@mui/material";

import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { isAuthorized, getAuthToken, getAccount } from "../../auth";
import Paginator from "../Paginator";
import { Employee, Gender } from "../../models/Employee";

import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const EmployeeFilter = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [firstLoad, setFirstLoad] = useState(true);

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    // TODO: fix being able to change the salary text while switching pages
    const [salaryText, setSalaryText] = useState("3000");

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", hide: false },
        { text: "First Name", hide: false },
        { text: "Last Name", hide: false },
        { text: "Gender", hide: isLargeScreen },
        { text: "Salary", hide: false },
        { text: "Role", hide: isLargeScreen },
        { text: "Operations", hide: false },
    ];

    const fetchEmployees = async (minSalary: number) => {
        setLoading(true);
        try {
            await axios
                .get<Employee[]>(
                    `${BACKEND_API_URL}/storeemployees/filter/${pageIndex}/${pageSize}?minSalary=${minSalary}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setEmployees(data);

                    setTimeout(() => {
                        setLoading(false);
                    }, 500);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch employees!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch employees due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        if (firstLoad) {
            setFirstLoad(false);
            return;
        }

        parseData();
    }, [pageIndex, pageSize]);

    function parseData() {
        const value = parseInt(salaryText, 10);

        if (value > 0 && value <= 9999999) {
            fetchEmployees(value);
        } else {
            openSnackbar(
                "error",
                "Please enter a valid number (0 < n <= 9999999)"
            );
        }
    }

    function handleInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        const key = event.key;

        // Only allow digits (0-9) and Enter
        if (
            ![
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "Enter",
            ].includes(key)
        ) {
            event.preventDefault();
        } else if (key === "Enter") {
            parseData();
        }
    }

    return (
        <Container>
            <h1
                style={{
                    paddingTop: 26,
                    marginBottom: 4,
                    textAlign: "center",
                }}
            >
                Filter Employees
            </h1>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 16,
                    marginBottom: 16,
                }}
            >
                <p
                    style={{
                        marginLeft: 16,
                        marginRight: 8,
                        userSelect: "none",
                    }}
                >
                    {`Minimum salary: `}
                </p>
                <TextField
                    value={salaryText}
                    type="text"
                    inputProps={{ min: 1, style: { textAlign: "center" } }}
                    onChange={(event) => setSalaryText(event.target.value)}
                    onKeyPress={handleInputKeyPress}
                    variant="outlined"
                    size="small"
                    style={{
                        width: 100,
                        marginRight: 16,
                    }}
                />
                <Button variant="contained" onClick={parseData}>
                    Filter
                </Button>
            </div>

            {loading && <CircularProgress />}
            {!loading && employees.length === 0 && (
                <p style={{ marginLeft: 16 }}>
                    No employees found. If you haven't clicked on the filter
                    button yet, make sure to do so.
                </p>
            )}
            {!loading &&
                employees.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {employees.map((employee, index) => (
                            <Grid item xs={12} sm={6} md={4} key={employee.id}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {employee.firstName}{" "}
                                            {employee.lastName}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Role: "}
                                            {employee.storeEmployeeRole?.name ??
                                                "Unknown"}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Salary: {employee.salary}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            component={Link}
                                            to={`/employees/${employee.id}/details`}
                                        >
                                            <Tooltip
                                                title="View employee details"
                                                arrow
                                            >
                                                <ReadMoreIcon color="primary" />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            sx={{ ml: 1, mr: 1 }}
                                            to={`/employees/${employee.id}/edit`}
                                            disabled={
                                                !isAuthorized(employee.user?.id)
                                            }
                                        >
                                            <Tooltip
                                                title="Edit employee"
                                                arrow
                                            >
                                                <EditIcon />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/employees/${employee.id}/delete`}
                                            disabled={
                                                !isAuthorized(employee.user?.id)
                                            }
                                            sx={{
                                                color: "red",
                                            }}
                                        >
                                            <Tooltip
                                                title="Delete employee"
                                                arrow
                                            >
                                                <DeleteForeverIcon />
                                            </Tooltip>
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 0 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {headers.map((header, i) => {
                                        if (header.hide) {
                                            return null;
                                        }
                                        return (
                                            <TableCell
                                                key={i}
                                                style={{ userSelect: "none" }}
                                                align={
                                                    header.text === "Operations"
                                                        ? "center"
                                                        : "left"
                                                }
                                            >
                                                {header.text}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {employees.map((employee, index) => {
                                    const employeeData = [
                                        pageIndex * pageSize + index + 1,
                                        employee.firstName,
                                        employee.lastName,
                                        Gender[employee.gender],
                                        employee.salary,
                                        employee.storeEmployeeRole?.name,
                                        <Box
                                            display="flex"
                                            alignItems="flex-start"
                                            justifyContent="center"
                                        >
                                            <IconButton
                                                component={Link}
                                                to={`/employees/${employee.id}/details`}
                                            >
                                                <Tooltip
                                                    title="View employee details"
                                                    arrow
                                                >
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                sx={{ ml: 1, mr: 1 }}
                                                to={`/employees/${employee.id}/edit`}
                                                disabled={
                                                    !isAuthorized(
                                                        employee.user?.id
                                                    )
                                                }
                                            >
                                                <Tooltip
                                                    title="Edit employee"
                                                    arrow
                                                >
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/employees/${employee.id}/delete`}
                                                disabled={
                                                    !isAuthorized(
                                                        employee.user?.id
                                                    )
                                                }
                                                sx={{ color: "red" }}
                                            >
                                                <Tooltip
                                                    title="Delete employee"
                                                    arrow
                                                >
                                                    <DeleteForeverIcon />
                                                </Tooltip>
                                            </IconButton>
                                        </Box>,
                                    ];
                                    return (
                                        <TableRow key={employee.id}>
                                            {employeeData.map((data, i) => {
                                                const header = headers[i];
                                                if (header.hide) {
                                                    return null;
                                                }
                                                return (
                                                    <TableCell
                                                        key={i}
                                                        align={
                                                            header.text ===
                                                            "Operations"
                                                                ? "center"
                                                                : "left"
                                                        }
                                                    >
                                                        {data}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
            {!loading && employees.length > 0 && (
                <Paginator
                    route={`storeemployees/filter`}
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                    query={`?minSalary=${salaryText}`}
                />
            )}
        </Container>
    );
};
