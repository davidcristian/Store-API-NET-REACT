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
import { Store, StoreCategory } from "../../models/Store";
import { isAuthorized, getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";

import AddIcon from "@mui/icons-material/Add";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const AllStores = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState<Store[]>([]);

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
        { text: "Category", hide: false },
        { text: "# of Shifts", hide: false },
        { text: "User", hide: false },
        { text: "Operations", hide: false },
    ];

    const fetchStores = async () => {
        setLoading(true);
        try {
            await axios
                .get<Store[]>(
                    `${BACKEND_API_URL}/stores/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setStores(data);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch stores!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch stores due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchStores();
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
                All Stores
            </h1>

            {loading && <CircularProgress />}
            {!loading && (
                <Button
                    component={Link}
                    to={`/stores/add`}
                    disabled={getAccount() === null}
                    variant="text"
                    size="large"
                    sx={{ mb: 2, textTransform: "none" }}
                    startIcon={<AddIcon />}
                >
                    Create
                </Button>
            )}
            {!loading && stores.length === 0 && (
                <p
                    data-testid="test-all-stores-empty"
                    style={{ marginLeft: 16 }}
                >
                    No stores found.
                </p>
            )}
            {!loading &&
                stores.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {stores.map((store, index) => (
                            <Grid item xs={12} sm={6} md={4} key={store.id}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {store.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Category: "}
                                            {StoreCategory[store.category]}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"# of Shifts: "}
                                            {store.storeShifts?.length}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton
                                            component={Link}
                                            to={`/stores/${store.id}/details`}
                                        >
                                            <Tooltip
                                                title="View store details"
                                                arrow
                                            >
                                                <ReadMoreIcon color="primary" />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            sx={{ ml: 1, mr: 1 }}
                                            to={`/stores/${store.id}/edit`}
                                            disabled={
                                                !isAuthorized(store.user?.id)
                                            }
                                        >
                                            <Tooltip title="Edit store" arrow>
                                                <EditIcon />
                                            </Tooltip>
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/stores/${store.id}/delete`}
                                            disabled={
                                                !isAuthorized(store.user?.id)
                                            }
                                            sx={{ color: "red" }}
                                        >
                                            <Tooltip title="Delete store" arrow>
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
                                {stores.map((store, index) => {
                                    const storeData = [
                                        pageIndex * pageSize + index + 1,
                                        store.name,
                                        store.description,
                                        [StoreCategory[store.category]],
                                        store.storeShifts?.length,
                                        store.user?.name ? (
                                            <Link
                                                to={`/users/${store.user?.id}/details`}
                                                title="View user details"
                                            >
                                                {store.user?.name}
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
                                                to={`/stores/${store.id}/details`}
                                            >
                                                <Tooltip
                                                    title="View store details"
                                                    arrow
                                                >
                                                    <ReadMoreIcon color="primary" />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                sx={{ ml: 1, mr: 1 }}
                                                to={`/stores/${store.id}/edit`}
                                                disabled={
                                                    !isAuthorized(
                                                        store.user?.id
                                                    )
                                                }
                                            >
                                                <Tooltip
                                                    title="Edit store"
                                                    arrow
                                                >
                                                    <EditIcon />
                                                </Tooltip>
                                            </IconButton>
                                            <IconButton
                                                component={Link}
                                                to={`/stores/${store.id}/delete`}
                                                disabled={
                                                    !isAuthorized(
                                                        store.user?.id
                                                    )
                                                }
                                                sx={{ color: "red" }}
                                            >
                                                <Tooltip
                                                    title="Delete store"
                                                    arrow
                                                >
                                                    <DeleteForeverIcon />
                                                </Tooltip>
                                            </IconButton>
                                        </Box>,
                                    ];
                                    return (
                                        <TableRow key={store.id}>
                                            {storeData.map((data, i) => {
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
            {!loading && stores.length > 0 && (
                <Paginator
                    route="stores"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
