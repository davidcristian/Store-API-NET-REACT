import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    TextField,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import { Container } from "@mui/system";

import { useEffect, useState, useCallback, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";

import { debounce } from "lodash";
import { StoreShift } from "../../models/StoreShift";
import { Store } from "../../models/Store";
import { Employee } from "../../models/Employee";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const EmployeeShiftAdd = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);

    const { employeeId } = useParams();
    const [employeeName, setEmployeeName] = useState("");
    const [stores, setStores] = useState<Store[]>([]);

    const [shift, setShift] = useState<StoreShift>({
        startDate: "",
        endDate: "",

        storeId: 0,
        storeEmployeeId: 0,
    });

    const addShift = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .post(`${BACKEND_API_URL}/storeshifts`, shift, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then(() => {
                    openSnackbar("success", "Shift added successfully!");
                    navigate("/employees");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to add shift!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to add shift due to an unknown error!"
            );
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const fetchEmployeeData = await axios.get<Employee>(
                `${BACKEND_API_URL}/storeemployees/${employeeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );

            const fetchStoreData = await axios.get<Store[]>(
                `${BACKEND_API_URL}/stores/0/10`,
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );

            const [employeeResponse, storeResponse] = await Promise.all([
                fetchEmployeeData,
                fetchStoreData,
            ]);

            const employeeData = employeeResponse.data;
            setEmployeeName(
                employeeData.firstName + " " + employeeData.lastName ?? ""
            );
            setShift({
                ...shift,
                storeEmployeeId: employeeData.id ?? 0,
            });

            const storeData = storeResponse.data;
            setStores(storeData);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.message);
                openSnackbar(
                    "error",
                    "Failed to fetch data!\n" +
                        (String(error.response?.data).length > 255
                            ? error.message
                            : error.response?.data)
                );
            } else {
                console.log(error);
                openSnackbar(
                    "error",
                    "Failed to fetch data due to an unknown error!"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchSuggestions = async (query: string) => {
        try {
            await axios
                .get<Store[]>(
                    `${BACKEND_API_URL}/stores/search?query=${query}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    const removedDupes = data.filter(
                        (v, i, a) =>
                            a.findIndex((v2) => v2.name === v.name) === i
                    );

                    setStores(removedDupes);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch store suggestions!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch store suggestions due to an unknown error!"
            );
        }
    };

    const debouncedFetchSuggestions = useCallback(
        debounce(fetchSuggestions, 250),
        []
    );

    useEffect(() => {
        return () => {
            debouncedFetchSuggestions.cancel();
        };
    }, [debouncedFetchSuggestions]);

    const handleInputChange = (
        event: React.SyntheticEvent,
        value: string,
        reason: string
    ) => {
        if (value.length < 3) return;
        console.log("input", value, reason);

        if (reason === "input") {
            debouncedFetchSuggestions(value);
        }
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
                                Add Shift
                            </h1>
                        </Box>

                        <form>
                            <TextField
                                id="employeeName"
                                label="Employee Name"
                                value={employeeName}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                disabled={true}
                            />

                            <Autocomplete
                                id="storeName"
                                sx={{ mb: 2 }}
                                options={stores}
                                getOptionLabel={(option) => option.name}
                                renderOption={(props, option) => {
                                    return (
                                        <li {...props} key={option.id}>
                                            {option.name}
                                        </li>
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Store Name"
                                        variant="outlined"
                                    />
                                )}
                                filterOptions={(x) => x}
                                onInputChange={handleInputChange}
                                onChange={(event, value) => {
                                    if (value) {
                                        console.log(value);
                                        setShift({
                                            ...shift,
                                            storeId: value.id ?? 0,
                                        });
                                    }
                                }}
                            />

                            <TextField
                                id="startDate"
                                label="Start Date"
                                InputLabelProps={{ shrink: true }}
                                type="datetime-local"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setShift({
                                        ...shift,
                                        startDate: new Date(
                                            event.target.value
                                        ).toISOString(),
                                    })
                                }
                            />

                            <TextField
                                id="endDate"
                                label="End Date"
                                InputLabelProps={{ shrink: true }}
                                type="datetime-local"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setShift({
                                        ...shift,
                                        endDate: new Date(
                                            event.target.value
                                        ).toISOString(),
                                    })
                                }
                            />
                        </form>
                    </CardContent>
                    <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                        <Button onClick={addShift} variant="contained">
                            Add Shift
                        </Button>
                    </CardActions>
                </Card>
            )}
        </Container>
    );
};
