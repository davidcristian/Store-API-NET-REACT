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

import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BACKEND_API_URL, formatDate } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken, isAuthorized } from "../../auth";
import { Store, StoreCategory } from "../../models/Store";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

export const StoreDetails = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);

    const { storeId } = useParams();
    const [store, setStore] = useState<Store>();

    const fetchStore = async () => {
        setLoading(true);
        try {
            await axios
                .get<Store>(`${BACKEND_API_URL}/stores/${storeId}`, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then((response) => {
                    const store = response.data;
                    setStore(store);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch store details!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch store details due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchStore();
    }, [storeId]);

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
                                to={`/stores`}
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
                                Store Details
                            </h1>
                        </Box>

                        <Box sx={{ ml: 1 }}>
                            <p>Name: {store?.name}</p>
                            <p>Description: {store?.description}</p>
                            <p>
                                Category:{" "}
                                {store == null
                                    ? ""
                                    : StoreCategory[store.category]}
                            </p>
                            <p>Address: {store?.address}</p>
                            <p>City: {store?.city}</p>
                            <p>State: {store?.state}</p>
                            <p>Zip Code: {store?.zipCode}</p>
                            <p>Country: {store?.country}</p>
                            <p>Open Date: {formatDate(store?.openDate)}</p>
                            <p>Close Date: {formatDate(store?.closeDate)}</p>
                            <p>Employee shifts:</p>
                            {store?.storeShifts?.length ? (
                                <ul style={{ marginBottom: 0 }}>
                                    {store?.storeShifts?.map((shift) => (
                                        <li key={shift.storeEmployee?.id}>
                                            {shift.storeEmployee?.firstName}{" "}
                                            {shift.storeEmployee?.lastName} -{" "}
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
                            to={`/stores/${storeId}/addshift`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "green",
                                textTransform: "none",
                                mt: 1,
                                ml: 2.4,
                            }}
                            startIcon={<AccessTimeFilledIcon />}
                            disabled={!isAuthorized(store?.user?.id)}
                        >
                            Add Shift
                        </Button>
                    </CardContent>
                    <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                        <Button
                            component={Link}
                            to={`/stores/${storeId}/edit`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "gray",
                                textTransform: "none",
                            }}
                            startIcon={<EditIcon />}
                            disabled={!isAuthorized(store?.user?.id)}
                        >
                            Edit
                        </Button>

                        <Button
                            component={Link}
                            to={`/stores/${storeId}/delete`}
                            variant="text"
                            size="large"
                            sx={{
                                color: "red",
                                textTransform: "none",
                            }}
                            startIcon={<DeleteForeverIcon />}
                            disabled={!isAuthorized(store?.user?.id)}
                        >
                            Delete
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};
