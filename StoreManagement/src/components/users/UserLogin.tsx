import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
import axios, { AxiosError } from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { logOut, setAuthToken, useAuthToken } from "../../auth";
import { BACKEND_API_URL } from "../../constants";
import { User } from "../../models/User";
import { SnackbarContext } from "../SnackbarContext";

export const UserLogin = () => {
  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const [user, setUser] = useState<User>({
    name: "",
    password: "",
  });

  useEffect(() => {
    logOut();
  }, []);

  const userLogin = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      await axios
        .post(`${BACKEND_API_URL}/users/login`, user, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then((response) => {
          console.log(response);
          setAuthToken(response.data);

          openSnackbar("success", "Logged in successfully!");
          navigate("/");
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to log in!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar("error", "Failed to log in due to an unknown error!");
    }
  };

  return (
    <Container>
      <Card sx={{ p: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="flex-start" sx={{ mb: 4 }}>
            <IconButton component={Link} sx={{ mb: 2, mr: 3 }} to={`/`}>
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
              Log In
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
          </form>
        </CardContent>
        <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
          <Button onClick={userLogin} variant="contained">
            Log In
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};
