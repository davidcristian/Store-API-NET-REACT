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
  TextField,
} from "@mui/material";
import { Container } from "@mui/system";
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import React from "react";
import { Link, useParams } from "react-router-dom";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { Gender } from "../../models/Employee";
import { AccessLevel, User } from "../../models/User";
import { MaritalStatus } from "../../models/UserProfile";
import {
  getAccount,
  updatePref,
  useAuthToken,
} from "../../utils/authentication";
import { BACKEND_API_URL, formatDate } from "../../utils/constants";

export const UserDetails = () => {
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const { userId } = useParams();
  const [loading, setLoading] = useState<boolean>(true);

  const [user, setUser] = useState<User>();
  const [preferenceText, setPreferenceText] = useState<string>("");

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
          const data = response.data;

          setUser(data);
          setPreferenceText(data.userProfile?.pagePreference?.toString() ?? "");

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

  const savePreference = async (pref: number) => {
    try {
      await axios
        .patch(
          `${BACKEND_API_URL}/users/${userId}/pagepreference/${pref}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        )
        .then(() => {
          openSnackbar("success", "Preference updated successfully!");

          if (user && user.userProfile) {
            user.userProfile.pagePreference = pref;
            updatePref(user.id, pref);
          }
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to update preference!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        "Failed to update preference due to an unknown error!"
      );
    }
  };

  function parseData() {
    const intValue = parseInt(preferenceText, 10);

    if (intValue > 0 && intValue <= 100) {
      savePreference(intValue);
    } else {
      openSnackbar("error", "Please enter a valid number (0 < n <= 100)");
    }
  }

  function handleInputKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const key = event.key;

    // Only allow digits (0-9) and Enter
    if (
      !["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Enter"].includes(key)
    ) {
      event.preventDefault();
    } else if (key === "Enter") {
      parseData();
    }
  }

  return (
    <Container>
      {loading && <CircularProgress />}
      {!loading && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="flex-start">
              <IconButton
                disabled={getAccount()?.accessLevel !== AccessLevel.Admin}
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
                User Details
              </h1>
            </Box>

            <Box sx={{ ml: 1 }}>
              <p>Name: {user?.name}</p>
              <p>
                Access Level:{" "}
                {user === undefined || user.accessLevel === undefined
                  ? ""
                  : AccessLevel[user.accessLevel]}
              </p>
              <p>Bio: {user?.userProfile?.bio}</p>
              <p>Location: {user?.userProfile?.location}</p>
              <p>Birthday: {formatDate(user?.userProfile?.birthday)}</p>
              <p>
                Gender:{" "}
                {user === undefined ||
                user.userProfile === undefined ||
                user.userProfile.gender === undefined
                  ? ""
                  : Gender[user.userProfile.gender]}
              </p>
              <p>
                Marital Status:{" "}
                {user === undefined ||
                user.userProfile === undefined ||
                user.userProfile.maritalStatus === undefined
                  ? ""
                  : MaritalStatus[user.userProfile.maritalStatus]}
              </p>
              {(user?.id === getAccount()?.id ||
                getAccount()?.accessLevel === AccessLevel.Admin) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 16,
                    marginBottom: 16,
                  }}
                >
                  <p
                    style={{
                      marginRight: 8,
                      userSelect: "none",
                    }}
                  >
                    {`Page Preference: `}
                  </p>
                  <TextField
                    value={preferenceText}
                    type="text"
                    inputProps={{
                      min: 1,
                      style: { textAlign: "center" },
                    }}
                    onChange={(event) => setPreferenceText(event.target.value)}
                    onKeyPress={handleInputKeyPress}
                    variant="outlined"
                    size="small"
                    style={{
                      width: 100,
                      marginRight: 16,
                    }}
                  />
                  <Button variant="contained" onClick={parseData}>
                    {user?.id !== getAccount()?.id &&
                    getAccount()?.accessLevel === AccessLevel.Admin
                      ? "Overwrite as Admin"
                      : "Save"}
                  </Button>
                </div>
              )}

              <p>User insertion stats:</p>
              <ul style={{ marginBottom: 0 }}>
                <li key={0}>Roles: {user?.roleCount}</li>
                <li key={1}>Employees: {user?.employeeCount}</li>
                <li key={2}>Stores: {user?.storeCount}</li>
                <li key={3}>Shifts: {user?.shiftCount}</li>
              </ul>
            </Box>
          </CardContent>
          <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
            <Button
              component={Link}
              to={`/users/${userId}/edit`}
              disabled={getAccount()?.accessLevel !== AccessLevel.Admin}
              variant="text"
              size="large"
              sx={{
                color: "gray",
                textTransform: "none",
              }}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>

            <Button
              component={Link}
              to={`/users/${userId}/delete`}
              disabled={getAccount()?.accessLevel !== AccessLevel.Admin}
              variant="text"
              size="large"
              sx={{ color: "red", textTransform: "none" }}
              startIcon={<DeleteForeverIcon />}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
};
