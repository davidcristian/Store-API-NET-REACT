import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    TextField,
} from "@mui/material";
import { Container } from "@mui/system";

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";
import { EmployeeRole } from "../../models/EmployeeRole";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const RoleAdd = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

    const [role, setRole] = useState<EmployeeRole>({
        name: "",
        description: "",

        roleLevel: -1,
    });

    const addRole = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .post(`${BACKEND_API_URL}/storeemployeeroles`, role, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then(() => {
                    openSnackbar("success", "Role added successfully!");
                    navigate("/roles");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to add role!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to add role due to an unknown error!"
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
                            to={`/roles`}
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
                            Add Role
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
                                setRole({
                                    ...role,
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
                                setRole({
                                    ...role,
                                    description: event.target.value,
                                })
                            }
                        />

                        <TextField
                            id="roleLevel"
                            label="Level"
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2 }}
                            onChange={(event) =>
                                setRole({
                                    ...role,
                                    roleLevel: Number(event.target.value),
                                })
                            }
                        />
                    </form>
                </CardContent>
                <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
                    <Button onClick={addRole} variant="contained">
                        Add Role
                    </Button>
                </CardActions>
            </Card>
        </Container>
    );
};
