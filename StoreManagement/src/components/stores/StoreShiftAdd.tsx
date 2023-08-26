import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Autocomplete,
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
import { debounce } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuthToken } from "../../auth";
import { BACKEND_API_URL } from "../../constants";
import { Employee } from "../../models/Employee";
import { Store } from "../../models/Store";
import { StoreShift } from "../../models/StoreShift";
import { SnackbarContext } from "../SnackbarContext";

export const StoreShiftAdd = () => {
  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const { storeId } = useParams();
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [shift, setShift] = useState<StoreShift>({
    startDate: "",
    endDate: "",

    storeId: 0,
    storeEmployeeId: 0,
  });

  const addShift = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      await axios
        .post(`${BACKEND_API_URL}/storeshifts`, shift, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then(() => {
          openSnackbar("success", "Shift added successfully!");
          navigate("/stores");
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to add shift!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar("error", "Failed to add shift due to an unknown error!");
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const fetchStoreData = axios.get<Store>(
        `${BACKEND_API_URL}/stores/${storeId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const fetchEmployeeData = axios.get<Employee[]>(
        `${BACKEND_API_URL}/storeemployees/0/10`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const [storeResponse, employeeResponse] = await Promise.all([
        fetchStoreData,
        fetchEmployeeData,
      ]);

      const storeData = storeResponse.data;
      setStoreName(storeData.name ?? "");
      setShift({
        ...shift,
        storeId: storeData.id ?? 0,
      });

      const employeeData = employeeResponse.data;
      setEmployees(employeeData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.message);
        openSnackbar(
          "error",
          "Failed to fetch data!\n" +
            (String(error.response?.data).length > 255
              ? error.message
              : error.response?.data)
        );
      } else {
        console.log(error);
        openSnackbar("error", "Failed to fetch data due to an unknown error!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      return;
    }

    try {
      await axios
        .get<Employee[]>(
          `${BACKEND_API_URL}/storeemployees/search?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        )
        .then((response) => {
          const data = response.data;
          const removedDupes = data.filter(
            (v, i, a) =>
              a.findIndex(
                (v2) =>
                  `${v2.firstName} ${v2.lastName}` ===
                  `${v.firstName} ${v.lastName}`
              ) === i
          );

          setEmployees(removedDupes);
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to fetch employee suggestions!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        "Failed to fetch employee suggestions due to an unknown error!"
      );
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 250),
    []
  );

  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  const handleInputChange = (
    _event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => {
    console.log("input", value, reason);

    if (reason === "input") {
      debouncedFetchSuggestions(value);
    }
  };

  return (
    <Container>
      {loading && <CircularProgress />}
      {!loading && (
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="flex-start" sx={{ mb: 4 }}>
              <IconButton component={Link} sx={{ mb: 2, mr: 3 }} to={`/stores`}>
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
                Add Shift
              </h1>
            </Box>

            <form>
              <Autocomplete
                id="employeeName"
                sx={{ mb: 2 }}
                options={employees}
                getOptionLabel={(option) =>
                  option.firstName + " " + option.lastName
                }
                renderOption={(props, option) => {
                  return (
                    <li {...props} key={option.id}>
                      {option.firstName} {option.lastName}
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Employee Name"
                    variant="outlined"
                  />
                )}
                filterOptions={(x) => x}
                onInputChange={handleInputChange}
                onChange={(_event, value) => {
                  if (value) {
                    console.log(value);
                    setShift({
                      ...shift,
                      storeEmployeeId: value.id ?? 0,
                    });
                  }
                }}
              />

              <TextField
                id="storeName"
                label="Store Name"
                value={storeName}
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                disabled={true}
              />

              <TextField
                id="startDate"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                type="datetime-local"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(event) =>
                  setShift({
                    ...shift,
                    startDate: new Date(event.target.value).toISOString(),
                  })
                }
              />

              <TextField
                id="endDate"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                type="datetime-local"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onChange={(event) =>
                  setShift({
                    ...shift,
                    endDate: new Date(event.target.value).toISOString(),
                  })
                }
              />
            </form>
          </CardContent>
          <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
            <Button onClick={addShift} variant="contained">
              Add Shift
            </Button>
          </CardActions>
        </Card>
      )}
    </Container>
  );
};
