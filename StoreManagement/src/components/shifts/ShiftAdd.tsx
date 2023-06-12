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
import { Link, useNavigate } from "react-router-dom";
import { SnackbarContext } from "../SnackbarContext";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const ShiftAdd = () => {
    const navigate = useNavigate();
    const openSnackbar = useContext(SnackbarContext);

    const handleGoButton = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        openSnackbar("info", "Navigating to shifts...");
        navigate("/shifts");
    };

    const handleBackButton = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        openSnackbar("info", "Navigating to shifts...");
        navigate("/shifts");
    };

    return (
        <Container>
            <Card sx={{ p: 2 }}>
                <CardContent>
                    <Box display="flex" alignItems="flex-start">
                        <IconButton
                            component={Link}
                            sx={{ mr: 3 }}
                            to={`/shifts`}
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
                            Add Shift
                        </h1>
                    </Box>

                    <p style={{ marginBottom: 0, textAlign: "center" }}>
                        This page should not be accessible.
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
                        color="primary"
                        sx={{ width: 100, mr: 2 }}
                        onClick={handleGoButton}
                    >
                        Go
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: 100 }}
                        onClick={handleBackButton}
                    >
                        Back
                    </Button>
                </CardActions>
            </Card>
        </Container>
    );
};
