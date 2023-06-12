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
import { BACKEND_API_URL, formatDate } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { isAuthorized, getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";
import { StoreShift } from "../../models/StoreShift";

import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const AllShifts = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [shifts, setShifts] = useState<StoreShift[]>([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", hide: false },
        { text: "Employee Name", hide: false },
        { text: "Store Name", hide: false },
        { text: "Start Date", hide: isLargeScreen },
        { text: "End Date", hide: isLargeScreen },
        { text: "User", hide: false },
        { text: "Operations", hide: false },
    ];

    const fetchShifts = async () => {
        setLoading(true);
        try {
            await axios
                .get<StoreShift[]>(
                    `${BACKEND_API_URL}/storeshifts/pages/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setShifts(data);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch shifts!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch shifts due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchShifts();
    }, [pageIndex, pageSize]);

    return (
        <Container>
            <h1
                style={{
                    paddingTop: 26,
                    marginBottom: 4,
                    textAlign: "center",
                }}
            >
                All Shifts
            </h1>

            {loading && <CircularProgress />}
            {!loading && (
                <Button
                    component={Link}
                    to={`/shifts/add`}
                    disabled={true}
                    variant="text"
                    size="large"
                    sx={{ mb: 2, textTransform: "none" }}
                    startIcon={<AddIcon />}
                >
                    Create
                </Button>
            )}
            {!loading && shifts.length === 0 && (
                <p style={{ marginLeft: 16 }}>No shifts found.</p>
            )}
            {!loading &&
                shifts.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {shifts.map((shift, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {shift.storeEmployee?.firstName +
                                                " " +
                                                shift.storeEmployee?.lastName +
                                                " at " +
                                                shift.store?.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Start Date: "}
                                            {formatDate(shift.startDate)}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"End Date: "}
                                            {formatDate(shift.endDate)}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            component={Link}
                                            to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/details`}
                                        >
                                            <Tooltip
                                                title="View shift details"
                                                arrow
                                            >
                                                <ReadMoreIcon color="primary" />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            sx={{ ml: 1, mr: 1 }}
                                            to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/edit`}
                                            disabled={
                                                !isAuthorized(shift.user?.id)
                                            }
                                        >
                                            <Tooltip title="Edit shift" arrow>
                                                <EditIcon />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/delete`}
                                            disabled={
                                                !isAuthorized(shift.user?.id)
                                            }
                                            sx={{ color: "red" }}
                                        >
                                            <Tooltip title="Delete shift" arrow>
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
                                {shifts.map((shift, index) => {
                                    const shiftData = [
                                        pageIndex * pageSize + index + 1,
                                        `${shift.storeEmployee?.firstName} ${shift.storeEmployee?.lastName}`,
                                        shift.store?.name,
                                        formatDate(shift.startDate),
                                        formatDate(shift.endDate),
                                        shift.user?.name ? (
                                            <Link
                                                to={`/users/${shift.user?.id}/details`}
                                                title="View user details"
                                            >
                                                {shift.user?.name}
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
                                                to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/details`}
                                            >
                                                <Tooltip
                                                    title="View shift details"
                                                    arrow
                                                >
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                sx={{ ml: 1, mr: 1 }}
                                                to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/edit`}
                                                disabled={
                                                    !isAuthorized(
                                                        shift.user?.id
                                                    )
                                                }
                                            >
                                                <Tooltip
                                                    title="Edit shift"
                                                    arrow
                                                >
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/shifts/${shift.storeId}/${shift.storeEmployeeId}/delete`}
                                                disabled={
                                                    !isAuthorized(
                                                        shift.user?.id
                                                    )
                                                }
                                                sx={{ color: "red" }}
                                            >
                                                <Tooltip
                                                    title="Delete shift"
                                                    arrow
                                                >
                                                    <DeleteForeverIcon />
                                                </Tooltip>
                                            </IconButton>
                                        </Box>,
                                    ];
                                    return (
                                        <TableRow key={index}>
                                            {shiftData.map((data, i) => {
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
            {!loading && shifts.length > 0 && (
                <Paginator
                    route="storeshifts"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
