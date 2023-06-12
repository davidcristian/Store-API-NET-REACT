import {
    Container,
    Card,
    CardContent,
    IconButton,
    CardActions,
    Button,
    Box,
} from "@mui/material";

import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BACKEND_API_URL } from "../../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAuthToken } from "../../auth";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const StoreDelete = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);
    const { storeId } = useParams();

    const handleDelete = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        try {
            await axios
                .delete(`${BACKEND_API_URL}/stores/${storeId}`, {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                })
                .then(() => {
                    openSnackbar("success", "Store deleted successfully!");
                    navigate("/stores");
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to delete store!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to delete store due to an unknown error!"
            );
        }
    };

    const handleCancel = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        navigate("/stores");
    };

    return (
        <Container>
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Box display="flex" alignItems="flex-start">
                        <IconButton
                            component={Link}
                            sx={{ mr: 3 }}
                            to={`/stores`}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <h1
                            style={{
                                flex: 1,
                                textAlign: "center",
                                marginTop: -4,
                                marginLeft: -64,
                            }}
                        >
                            Delete Store
                        </h1>
                    </Box>

                    <p style={{ marginBottom: 0, textAlign: "center" }}>
                        Are you sure you want to delete this store? This cannot
                        be undone!
                    </p>
                </CardContent>
                <CardActions
                    sx={{
                        mb: 1,
                        mt: 1,
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ width: 100, mr: 2 }}
                        onClick={handleDelete}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: 100 }}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </CardActions>
            </Card>
        </Container>
    );
};
