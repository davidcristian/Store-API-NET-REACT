import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { Container } from "@mui/system";
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { isAuthorized, useAuthToken } from "../../auth";
import { BACKEND_API_URL } from "../../constants";
import { EmployeeRole } from "../../models/EmployeeRole";
import { SnackbarContext } from "../SnackbarContext";

export const RoleDetails = () => {
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const { roleId } = useParams();
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState<EmployeeRole>();

  const fetchRole = async () => {
    setLoading(true);
    try {
      await axios
        .get<EmployeeRole>(`${BACKEND_API_URL}/storeemployeeroles/${roleId}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then((response) => {
          const role = response.data;
          setRole(role);
          setLoading(false);
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to fetch role details!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        "Failed to fetch role details due to an unknown error!"
      );
    }
  };

  useEffect(() => {
    fetchRole();
  }, [roleId]);

  return (
    <Container>
      {loading && <CircularProgress />}
      {!loading && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="flex-start">
              <IconButton component={Link} sx={{ mb: 2, mr: 3 }} to={`/roles`}>
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
                Role Details
              </h1>
            </Box>

            <Box sx={{ ml: 1 }}>
              <p>Name: {role?.name}</p>
              <p>Description: {role?.description}</p>
              <p>Level: {role?.roleLevel}</p>
              <p>Employees:</p>
              {role?.storeEmployees?.length ? (
                <ul style={{ marginBottom: 0 }}>
                  {role?.storeEmployees?.map((employee) => (
                    <li key={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul style={{ marginBottom: 0 }}>
                  <li>N/A</li>
                </ul>
              )}
            </Box>
          </CardContent>
          <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
            <Button
              component={Link}
              to={`/roles/${roleId}/edit`}
              variant="text"
              size="large"
              sx={{
                color: "gray",
                textTransform: "none",
              }}
              startIcon={<EditIcon />}
              disabled={!isAuthorized(role?.user?.id)}
            >
              Edit
            </Button>

            <Button
              component={Link}
              to={`/roles/${roleId}/delete`}
              variant="text"
              size="large"
              sx={{
                color: "red",
                textTransform: "none",
              }}
              startIcon={<DeleteForeverIcon />}
              disabled={!isAuthorized(role?.user?.id)}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
};
