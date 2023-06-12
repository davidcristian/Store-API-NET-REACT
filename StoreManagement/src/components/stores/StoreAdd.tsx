import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { Container } from "@mui/system";

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_API_URL, getEnumValues } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";
import { Store, StoreCategory } from "../../models/Store";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const StoreAdd = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

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

    const addStore = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .post(`${BACKEND_API_URL}/stores`, store, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then(() => {
                    openSnackbar("success", "Store added successfully!");
                    navigate("/stores");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to add store!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to add store due to an unknown error!"
            );
        }
    };

    return (
        <Container>
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Box display="flex" alignItems="flex-start" sx={{ mb: 4 }}>
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
                            Add Store
                        </h1>
                    </Box>

                    <form>
                        <TextField
                            id="name"
                            label="Name"
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
                            <InputLabel id="categoryLabel">Category</InputLabel>
                            <Select
                                labelId="categoryLabel"
                                id="category"
                                label="Category"
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
                    <Button onClick={addStore} variant="contained">
                        Add Store
                    </Button>
                </CardActions>
            </Card>
        </Container>
    );
};
