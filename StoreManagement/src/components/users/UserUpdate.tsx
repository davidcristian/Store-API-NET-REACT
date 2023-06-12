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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BACKEND_API_URL, getEnumValues } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";
import { User } from "../../models/User";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { AccessLevel } from "../../models/User";

export const UserUpdate = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

    const { userId } = useParams<{ userId: string }>();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>({
        name: "",
        password: "",

        accessLevel: 0,
    });

    const fetchUser = async () => {
        setLoading(true);
        try {
            await axios
                .get<User>(`${BACKEND_API_URL}/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then((response) => {
                    const user = response.data;
                    setUser(user);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch user details!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch user details due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);

    const handleUpdate = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        console.log(user);
        try {
            await axios
                .patch(
                    `${BACKEND_API_URL}/users/${userId}/accesslevel/${user.accessLevel}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then(() => {
                    openSnackbar("success", "User updated successfully!");
                    navigate("/users");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to update user!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to update user due to an unknown error!"
            );
        }
    };

    const handleCancel = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        navigate("/users");
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
                                to={`/users`}
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
                                Edit User
                            </h1>
                        </Box>

                        <form>
                            <TextField
                                id="name"
                                label="Name"
                                value={user.name}
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setUser({
                                        ...user,
                                        name: event.target.value,
                                    })
                                }
                                disabled={true}
                            />

                            <FormControl fullWidth>
                                <InputLabel id="accessLevelLabel">
                                    Access Level
                                </InputLabel>
                                <Select
                                    labelId="accessLevelLabel"
                                    id="accessLevel"
                                    label="Access Level"
                                    value={user.accessLevel}
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 2 }}
                                    onChange={(event) =>
                                        setUser({
                                            ...user,
                                            accessLevel: event.target
                                                .value as AccessLevel,
                                        })
                                    }
                                >
                                    {getEnumValues(AccessLevel).map(
                                        (accessLevelValue) => (
                                            <MenuItem
                                                key={accessLevelValue}
                                                value={accessLevelValue}
                                            >
                                                {AccessLevel[accessLevelValue]}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
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
