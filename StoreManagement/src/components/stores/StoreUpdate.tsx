import {
    Box,
    Button,
    Card,
    CircularProgress,
    CardActions,
    CardContent,
    Container,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BACKEND_API_URL, getEnumValues } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";
import { Store, StoreCategory } from "../../models/Store";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const StoreUpdate = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

    const { storeId } = useParams<{ storeId: string }>();

    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<Store>({
        name: "",
        description: "",

        category: 0,
        address: "",

        city: "",
        state: "",

        zipCode: "",
        country: "",

        openDate: "",
        closeDate: "",
    });

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

    const handleUpdate = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .put(`${BACKEND_API_URL}/stores/${storeId}`, store, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then(() => {
                    openSnackbar("success", "Store updated successfully!");
                    navigate("/stores");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to update store!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to update store due to an unknown error!"
            );
        }
    };

    const handleCancel = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        navigate("/stores");
    };

    const convertToInputFormat = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const localDateString = date.toISOString().slice(0, 16);
        return localDateString;
    };

    return (
        <Container>
            {loading && <CircularProgress />}
            {!loading && (
                <Card sx={{ p: 2 }}>
                    <CardContent>
                        <Box
                            display="flex"
                            alignItems="flex-start"
                            sx={{ mb: 4 }}
                        >
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
                                Edit Store
                            </h1>
                        </Box>

                        <form>
                            <TextField
                                id="name"
                                label="Name"
                                value={store.name}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        name: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="description"
                                label="Description"
                                value={store.description}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        description: event.target.value,
                                    })
                                }
                            />

                            <FormControl fullWidth>
                                <InputLabel id="categoryLabel">
                                    Category
                                </InputLabel>
                                <Select
                                    labelId="categoryLabel"
                                    id="category"
                                    label="Category"
                                    value={store.category}
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    onChange={(event) =>
                                        setStore({
                                            ...store,
                                            category: event.target
                                                .value as StoreCategory,
                                        })
                                    }
                                >
                                    {getEnumValues(StoreCategory).map(
                                        (categoryValue) => (
                                            <MenuItem
                                                key={categoryValue}
                                                value={categoryValue}
                                            >
                                                {StoreCategory[categoryValue]}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                id="address"
                                label="Address"
                                value={store.address}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        address: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="city"
                                label="City"
                                value={store.city}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        city: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="state"
                                label="State"
                                value={store.state}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        state: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="zipCode"
                                label="Zip Code"
                                value={store.zipCode}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        zipCode: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="country"
                                label="Country"
                                value={store.country}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        country: event.target.value,
                                    })
                                }
                            />

                            <TextField
                                id="openDate"
                                label="Open Date"
                                value={convertToInputFormat(store.openDate)}
                                InputLabelProps={{ shrink: true }}
                                type="datetime-local"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        openDate: new Date(
                                            event.target.value
                                        ).toISOString(),
                                    })
                                }
                            />

                            <TextField
                                id="closeDate"
                                label="Close Date"
                                value={convertToInputFormat(store.closeDate)}
                                InputLabelProps={{ shrink: true }}
                                type="datetime-local"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setStore({
                                        ...store,
                                        closeDate: new Date(
                                            event.target.value
                                        ).toISOString(),
                                    })
                                }
                            />
                        </form>
                    </CardContent>
                    <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                        <Button
                            onClick={handleUpdate}
                            variant="contained"
                            sx={{ width: 100, mr: 2 }}
                        >
                            Save
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="contained"
                            color="error"
                            sx={{ width: 100 }}
                        >
                            Cancel
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};
