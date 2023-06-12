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
    useTheme,
    useMediaQuery,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActions,
} from "@mui/material";

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { isAuthorized, getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";
import { Employee, Gender } from "../../models/Employee";

import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const AllEmployees = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", propName: "", hide: false },
        { text: "First Name", propName: "firstName", hide: false },
        { text: "Last Name", propName: "lastName", hide: false },
        { text: "Gender", propName: "gender", hide: isLargeScreen },
        { text: "Salary", propName: "salary", hide: isLargeScreen },
        { text: "Role", propName: "", hide: false },
        { text: "# of Shifts", propName: "", hide: false },
        { text: "User", propName: "", hide: false },
        { text: "Operations", propName: "", hide: false },
    ];

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            await axios
                .get<Employee[]>(
                    `${BACKEND_API_URL}/storeemployees/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setEmployees(data);
                    setLoading(false);
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
        fetchEmployees();
    }, [pageIndex, pageSize]);

    const [sorting, setSorting] = useState({
        key: "column name",
        ascending: true,
    });

    function applySorting(key: string, ascending: boolean) {
        if (key !== sorting.key) {
            ascending = true;
        }

        setSorting({ key: key, ascending: ascending });
    }

    useEffect(() => {
        if (employees.length === 0) return;

        const currentEmployees = [...employees];
        const sortedCurrentUsers = currentEmployees.sort((a, b) => {
            // Check if the values are numbers
            const aVal = a[sorting.key];
            const bVal = b[sorting.key];
            const isNumeric = !isNaN(aVal) && !isNaN(bVal);

            // If both values are numbers, use subtraction for comparison
            if (isNumeric) {
                return parseFloat(aVal) - parseFloat(bVal);
            } else {
                return aVal.localeCompare(bVal);
            }
        });

        setEmployees(
            sorting.ascending
                ? sortedCurrentUsers
                : sortedCurrentUsers.reverse()
        );
    }, [sorting]);

    return (
        <Container>
            <h1
                style={{
                    paddingTop: 26,
                    marginBottom: 4,
                    textAlign: "center",
                }}
            >
                All Employees
            </h1>

            {loading && <CircularProgress />}
            {!loading && (
                <Button
                    component={Link}
                    to={`/employees/add`}
                    disabled={getAccount() === null}
                    variant="text"
                    size="large"
                    sx={{ mb: 2, textTransform: "none" }}
                    startIcon={<AddIcon />}
                >
                    Create
                </Button>
            )}
            {!loading && employees.length === 0 && (
                <p
                    data-testid="test-all-employees-empty"
                    style={{ marginLeft: 16 }}
                >
                    No employees found.
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
                                        <Typography color="text.secondary">
                                            # of Shifts:{" "}
                                            {employee.storeShifts?.length}
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
                                                style={{
                                                    cursor: header.propName
                                                        ? "pointer"
                                                        : "default",
                                                    whiteSpace: header.propName
                                                        ? "nowrap"
                                                        : "normal",
                                                    userSelect: "none",
                                                }}
                                                align={
                                                    header.text === "Operations"
                                                        ? "center"
                                                        : "left"
                                                }
                                                onClick={() =>
                                                    header.propName &&
                                                    applySorting(
                                                        header.propName,
                                                        sorting.key ===
                                                            header.propName
                                                            ? !sorting.ascending
                                                            : true
                                                    )
                                                }
                                            >
                                                {header.text}
                                                {sorting.key ===
                                                    header.propName &&
                                                    (sorting.ascending
                                                        ? " ↑"
                                                        : " ↓")}
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
                                        employee.storeEmployeeRole?.name ??
                                            "Unknown",
                                        employee.storeShifts?.length,
                                        employee.user?.name ? (
                                            <Link
                                                to={`/users/${employee.user?.id}/details`}
                                                title="View user details"
                                            >
                                                {employee.user?.name}
                                            </Link>
                                        ) : (
                                            <p>N/A</p>
                                        ),
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
                    route="storeemployees"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
