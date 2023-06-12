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
import { isAuthorized, getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";
import { EmployeeRole } from "../../models/EmployeeRole";

import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const AllRoles = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<EmployeeRole[]>([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", hide: false },
        { text: "Name", hide: false },
        { text: "Description", hide: isLargeScreen },
        { text: "Level", hide: false },
        { text: "# of Employees", hide: false },
        { text: "User", hide: false },
        { text: "Operations", hide: false },
    ];

    const fetchRoles = async () => {
        setLoading(true);
        try {
            await axios
                .get<EmployeeRole[]>(
                    `${BACKEND_API_URL}/storeemployeeroles/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setRoles(data);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch roles!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch roles due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchRoles();
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
                All Roles
            </h1>
            {loading && <CircularProgress />}
            {!loading && (
                <Button
                    component={Link}
                    to={`/roles/add`}
                    disabled={getAccount() === null}
                    variant="text"
                    size="large"
                    sx={{ mb: 2, textTransform: "none" }}
                    startIcon={<AddIcon />}
                >
                    Create
                </Button>
            )}
            {!loading && roles.length === 0 && (
                <p
                    data-testid="test-all-roles-empty"
                    style={{ marginLeft: 16 }}
                >
                    No roles found.
                </p>
            )}
            {!loading &&
                roles.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {roles.map((role, index) => (
                            <Grid item xs={12} sm={6} md={4} key={role.id}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {role.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Level: "}
                                            {role.roleLevel}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"# of Employees: "}
                                            {role.storeEmployees?.length}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            component={Link}
                                            to={`/roles/${role.id}/details`}
                                        >
                                            <Tooltip
                                                title="View role details"
                                                arrow
                                            >
                                                <ReadMoreIcon color="primary" />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            sx={{ ml: 1, mr: 1 }}
                                            to={`/roles/${role.id}/edit`}
                                            disabled={
                                                !isAuthorized(role.user?.id)
                                            }
                                        >
                                            <Tooltip title="Edit role" arrow>
                                                <EditIcon />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/roles/${role.id}/delete`}
                                            disabled={
                                                !isAuthorized(role.user?.id)
                                            }
                                            sx={{ color: "red" }}
                                        >
                                            <Tooltip title="Delete role" arrow>
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
                                {roles.map((role, index) => {
                                    const roleData = [
                                        pageIndex * pageSize + index + 1,
                                        role.name,
                                        role.description,
                                        role.roleLevel,
                                        role.storeEmployees?.length,
                                        role.user?.name ? (
                                            <Link
                                                to={`/users/${role.user?.id}/details`}
                                                title="View user details"
                                            >
                                                {role.user?.name}
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
                                                to={`/roles/${role.id}/details`}
                                            >
                                                <Tooltip
                                                    title="View role details"
                                                    arrow
                                                >
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                sx={{ ml: 1, mr: 1 }}
                                                to={`/roles/${role.id}/edit`}
                                                disabled={
                                                    !isAuthorized(role.user?.id)
                                                }
                                            >
                                                <Tooltip
                                                    title="Edit role"
                                                    arrow
                                                >
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/roles/${role.id}/delete`}
                                                disabled={
                                                    !isAuthorized(role.user?.id)
                                                }
                                                sx={{ color: "red" }}
                                            >
                                                <Tooltip
                                                    title="Delete role"
                                                    arrow
                                                >
                                                    <DeleteForeverIcon />
                                                </Tooltip>
                                            </IconButton>
                                        </Box>,
                                    ];
                                    return (
                                        <TableRow key={role.id}>
                                            {roleData.map((data, i) => {
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
            {!loading && roles.length > 0 && (
                <Paginator
                    route="storeemployeeroles"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
