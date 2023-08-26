import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  IconButton,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { useAuthToken } from "../../utils/authentication";
import { BACKEND_API_URL } from "../../utils/constants";

export const EmployeeDelete = () => {
  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const { employeeId } = useParams();

  const handleDelete = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      await axios
        .delete(`${BACKEND_API_URL}/storeemployees/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then(() => {
          openSnackbar("success", "Employee deleted successfully!");
          navigate("/employees");
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to delete employee!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        "Failed to delete employee due to an unknown error!"
      );
    }
  };

  const handleCancel = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    navigate("/employees");
  };

  return (
    <Container>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start">
            <IconButton component={Link} sx={{ mr: 3 }} to={`/employees`}>
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
              Delete Employee
            </h1>
          </Box>

          <p style={{ marginBottom: 0, textAlign: "center" }}>
            Are you sure you want to delete this employee? This cannot be
            undone!
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
