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

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { StoreShift } from "../../models/StoreShift";
import { isAuthorized, useAuthToken } from "../../utils/authentication";
import { BACKEND_API_URL, formatDate } from "../../utils/constants";

export const ShiftDetails = () => {
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const [loading, setLoading] = useState<boolean>(true);
  const { storeId, employeeId } = useParams();

  const [shift, setShift] = useState<StoreShift>();

  const fetchShift = async () => {
    setLoading(true);
    try {
      await axios
        .get<StoreShift>(
          `${BACKEND_API_URL}/storeshifts/${storeId}/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        )
        .then((response) => {
          const shift = response.data;
          setShift(shift);
          setLoading(false);
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to fetch shift details!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        "Failed to fetch shift details due to an unknown error!"
      );
    }
  };

  useEffect(() => {
    fetchShift();
  }, [employeeId]);

  return (
    <Container>
      {loading && <CircularProgress />}
      {!loading && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="flex-start">
              <IconButton component={Link} sx={{ mb: 2, mr: 3 }} to={`/shifts`}>
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
                Shift Details
              </h1>
            </Box>

            <Box sx={{ ml: 1 }}>
              <p>
                Employee Name: {shift?.storeEmployee?.firstName}{" "}
                {shift?.storeEmployee?.lastName}
              </p>
              <p>Store Name: {shift?.store?.name}</p>
              <p>Start Date: {formatDate(shift?.startDate)}</p>
              <p>End Date: {formatDate(shift?.endDate)}</p>
            </Box>
          </CardContent>
          <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
            <Button
              component={Link}
              to={`/shifts/${storeId}/${employeeId}/edit`}
              variant="text"
              size="large"
              sx={{
                color: "gray",
                textTransform: "none",
              }}
              startIcon={<EditIcon />}
              disabled={!isAuthorized(shift?.user?.id)}
            >
              Edit
            </Button>

            <Button
              component={Link}
              to={`/shifts/${storeId}/${employeeId}/delete`}
              variant="text"
              size="large"
              sx={{
                color: "red",
                textTransform: "none",
              }}
              startIcon={<DeleteForeverIcon />}
              disabled={!isAuthorized(shift?.user?.id)}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
};
