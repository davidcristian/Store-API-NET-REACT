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

import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_API_URL, formatDate, getEnumValues } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken, logOut } from "../../auth";
import { UserRegisterDTO } from "../../models/UserRegisterDTO";
import { Gender } from "../../models/Employee";
import { MaritalStatus } from "../../models/UserProfile";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const UserRegister = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

    const [user, setUser] = useState<UserRegisterDTO>({
        name: "",
        password: "",

        bio: "",
        location: "",

        birthday: "",
        gender: 0,
        maritalStatus: 0,
    });

    useEffect(() => {
        logOut();
    }, []);

    const userRegister = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .post(`${BACKEND_API_URL}/users/register`, user, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then((response) => {
                    console.log(response);
                    const token = response.data.token;

                    const expirationDateTime = new Date(
                        response.data.expiration
                    );
                    const expirationInMinutes = Math.floor(
                        (expirationDateTime.getTime() -
                            new Date().getTime() +
                            1000 * 59) /
                            (1000 * 60)
                    );

                    openSnackbar(
                        "success",
                        "Registered successfully!" +
                            "\n" +
                            "Please confirm your account using this code: " +
                            token +
                            "\n" +
                            `This code will expire in ${expirationInMinutes} minutes at ${formatDate(
                                expirationDateTime
                            )}.`
                    );
                    navigate(`/users/register/confirm/${token}`);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to register!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to register due to an unknown error!"
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
                            to={`/`}
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
                            Register
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
                                setUser({
                                    ...user,
                                    name: event.target.value,
                                })
                            }
                        />
                        <TextField
                            id="password"
                            label="Password"
                            variant="outlined"
                            type="password"
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    password: event.target.value,
                                })
                            }
                        />

                        <TextField
                            id="bio"
                            label="Bio"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    bio: event.target.value,
                                })
                            }
                        />

                        <TextField
                            id="location"
                            label="Location"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    location: event.target.value,
                                })
                            }
                        />

                        <TextField
                            id="birthDay"
                            label="Birthday"
                            InputLabelProps={{ shrink: true }}
                            type="datetime-local"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(event) =>
                                setUser({
                                    ...user,
                                    birthday: new Date(
                                        event.target.value
                                    ).toISOString(),
                                })
                            }
                        />

                        <FormControl fullWidth>
                            <InputLabel id="genderLabel">Gender</InputLabel>
                            <Select
                                labelId="genderLabel"
                                id="gender"
                                label="Gender"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setUser({
                                        ...user,
                                        gender: event.target.value as Gender,
                                    })
                                }
                            >
                                {getEnumValues(Gender).map((genderValue) => (
                                    <MenuItem
                                        key={genderValue}
                                        value={genderValue}
                                    >
                                        {Gender[genderValue]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel id="maritalStatusLabel">
                                Marital Status
                            </InputLabel>
                            <Select
                                labelId="maritalStatusLabel"
                                id="maritalStatus"
                                label="Marital Status"
                                variant="outlined"
                                fullWidth
                                sx={{ mb: 2 }}
                                onChange={(event) =>
                                    setUser({
                                        ...user,
                                        maritalStatus: event.target
                                            .value as MaritalStatus,
                                    })
                                }
                            >
                                {getEnumValues(MaritalStatus).map(
                                    (maritalStatusValue) => (
                                        <MenuItem
                                            key={maritalStatusValue}
                                            value={maritalStatusValue}
                                        >
                                            {MaritalStatus[maritalStatusValue]}
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>
                    </form>
                </CardContent>
                <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                    <Button onClick={userRegister} variant="contained">
                        Register
                    </Button>
                </CardActions>
            </Card>
        </Container>
    );
};
