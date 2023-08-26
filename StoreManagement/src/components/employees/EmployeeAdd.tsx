import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Container } from "@mui/system";
import axios, { AxiosError } from "axios";
import { debounce } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { Employee, Gender } from "../../models/Employee";
import { EmployeeRole } from "../../models/EmployeeRole";
import { useAuthToken } from "../../utils/authentication";
import { BACKEND_API_URL, getEnumValues } from "../../utils/constants";

export const EmployeeAdd = () => {
  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const [roles, setRoles] = useState<EmployeeRole[]>([]);
  const [employee, setEmployee] = useState<Employee>({
    firstName: "",
    lastName: "",

    gender: 0,

    employmentDate: "",
    terminationDate: "",
    salary: -1,

    storeEmployeeRoleId: -1,
  });

  const addEmployee = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    try {
      await axios
        .post(`${BACKEND_API_URL}/storeemployees`, employee, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then(() => {
          openSnackbar("success", "Employee added successfully!");
          navigate("/employees");
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to add employee!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar("error", "Failed to add employee due to an unknown error!");
    }
  };

  const fetchInitialData = async () => {
    try {
      await axios
        .get<EmployeeRole[]>(`${BACKEND_API_URL}/storeemployeeroles/0/10`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then((response) => {
          const data = response.data;
          setRoles(data);
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar(
            "error",
            "Failed to fetch data!\n" +
              (String(reason.response?.data).length > 255
                ? reason.message
                : reason.response?.data)
          );
        });
    } catch (error) {
      console.log(error);
      openSnackbar("error", "Failed to fetch data due to an unknown error!");
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchSuggestions = async (query: string) => {
    try {
      await axios
        .get<EmployeeRole[]>(
          `${BACKEND_API_URL}/storeemployeeroles/search?query=${query}`,
          {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          }
        )
        .then((response) => {
          const data = response.data;
          const removedDupes = data.filter(
            (v, i, a) => a.findIndex((v2) => v2.name === v.name) === i
          );

          setRoles(removedDupes);
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
    if (value.length < 3) return;
    console.log("input", value, reason);

    if (reason === "input") {
      debouncedFetchSuggestions(value);
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
              to={`/employees`}
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
              Add Employee
            </h1>
          </Box>

          <form>
            <TextField
              id="firstName"
              label="First Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  firstName: event.target.value,
                })
              }
            />
            <TextField
              id="lastName"
              label="Last Name"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  lastName: event.target.value,
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
                  setEmployee({
                    ...employee,
                    gender: event.target.value as Gender,
                  })
                }
              >
                {getEnumValues(Gender).map((genderValue) => (
                  <MenuItem key={genderValue} value={genderValue}>
                    {Gender[genderValue]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              id="employmentDate"
              label="Employment Date"
              InputLabelProps={{ shrink: true }}
              type="datetime-local"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(event) => {
                setEmployee({
                  ...employee,
                  employmentDate: new Date(event.target.value).toISOString(),
                });
              }}
            />

            <TextField
              id="terminationDate"
              label="Termination Date"
              InputLabelProps={{ shrink: true }}
              type="datetime-local"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(event) => {
                setEmployee({
                  ...employee,
                  terminationDate: new Date(event.target.value).toISOString(),
                });
              }}
            />

            <TextField
              id="salary"
              label="Salary"
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              onChange={(event) =>
                setEmployee({
                  ...employee,
                  salary: Number(event.target.value),
                })
              }
            />

            <Autocomplete
              id="storeEmployeeRoleId"
              sx={{ mb: 2 }}
              options={roles}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => {
                return (
                  <li {...props} key={option.id}>
                    {option.name}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Role" variant="outlined" />
              )}
              filterOptions={(x) => x}
              onInputChange={handleInputChange}
              onChange={(_event, value) => {
                if (value) {
                  console.log(value);
                  setEmployee({
                    ...employee,
                    storeEmployeeRoleId: value.id,
                    storeEmployeeRole: value,
                  });
                }
              }}
            />
          </form>
        </CardContent>
        <CardActions sx={{ mb: 1, ml: 1, mt: 1 }}>
          <Button
            onClick={addEmployee}
            variant="contained"
            form="addEmployeeForm"
          >
            Add Employee
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};
