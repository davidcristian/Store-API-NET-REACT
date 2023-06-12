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

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";
import { AccessLevel, User } from "../../models/User";

import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const AllUsers = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", hide: false },
        { text: "User", hide: false },
        { text: "Access Level", hide: false },
        { text: "Operations", hide: false },
    ];

    const fetchUsers = async () => {
        setLoading(true);
        try {
            await axios
                .get<User[]>(
                    `${BACKEND_API_URL}/users/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setUsers(data);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch users!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch users due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchUsers();
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
                All Users
            </h1>

            {loading && <CircularProgress />}
            {!loading && (
                <Button
                    component={Link}
                    to={`/users/add`}
                    disabled={true}
                    variant="text"
                    size="large"
                    sx={{ mb: 2, textTransform: "none" }}
                    startIcon={<AddIcon />}
                >
                    Create
                </Button>
            )}
            {!loading && users.length === 0 && (
                <p style={{ marginLeft: 16 }}>No users found.</p>
            )}
            {!loading &&
                users.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {users.map((user, index) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {user.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Access Level: "}
                                            {user.accessLevel !== undefined
                                                ? AccessLevel[user.accessLevel]
                                                : "Unknown"}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            component={Link}
                                            to={`/users/${user.id}/details`}
                                        >
                                            <Tooltip
                                                title="View user details"
                                                arrow
                                            >
                                                <ReadMoreIcon color="primary" />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            sx={{ ml: 1, mr: 1 }}
                                            to={`/users/${user.id}/edit`}
                                        >
                                            <Tooltip title="Edit user" arrow>
                                                <EditIcon />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/users/${user.id}/delete`}
                                        >
                                            <Tooltip title="Delete user" arrow>
                                                <DeleteForeverIcon
                                                    sx={{
                                                        color: "red",
                                                    }}
                                                />
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
                                {users.map((user, index) => {
                                    const userData = [
                                        pageIndex * pageSize + index + 1,
                                        user.name,
                                        user.accessLevel !== undefined
                                            ? AccessLevel[user.accessLevel]
                                            : "Unknown",
                                        <Box
                                            display="flex"
                                            alignItems="flex-start"
                                            justifyContent="center"
                                        >
                                            <IconButton
                                                component={Link}
                                                to={`/users/${user.id}/details`}
                                            >
                                                <Tooltip
                                                    title="View user details"
                                                    arrow
                                                >
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                sx={{ ml: 1, mr: 1 }}
                                                to={`/users/${user.id}/edit`}
                                            >
                                                <Tooltip
                                                    title="Edit user"
                                                    arrow
                                                >
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/users/${user.id}/delete`}
                                            >
                                                <Tooltip
                                                    title="Delete user"
                                                    arrow
                                                >
                                                    <DeleteForeverIcon
                                                        sx={{
                                                            color: "red",
                                                        }}
                                                    />
                                                </Tooltip>
                                            </IconButton>
                                        </Box>,
                                    ];
                                    return (
                                        <TableRow key={user.id}>
                                            {userData.map((data, i) => {
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
            {!loading && users.length > 0 && (
                <Paginator
                    route="users"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
