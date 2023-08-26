import {
  Button,
  Container,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import React from "react";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { DataEntry } from "../../models/DataEntry";
import { Employee, Gender } from "../../models/Employee";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const EmployeeFilter = () => {
  const openSnackbar = useContext(SnackbarContext);

  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const [salaryText, setSalaryText] = useState<string>("3000");
  const [parsedText, setParsedText] = useState<number>(3000);

  const headers = [
    { text: "#", hide: false },
    { text: "First Name", hide: false },
    { text: "Last Name", hide: false },
    { text: "Gender", hide: breaksDownLg },
    { text: "Salary", hide: false },
    { text: "Role", hide: breaksDownLg },
    { text: "Operations", hide: false },
  ] as Header[];

  const tableData = [
    { render: (employee) => employee.firstName },
    { render: (employee) => employee.lastName },
    { render: (employee) => Gender[employee.gender] },
    { render: (employee) => employee.salary },
    { render: (employee) => employee.storeEmployeeRole?.name },
  ] as DataEntry<Employee>[];

  const cardData = [
    {
      isTitle: true,
      render: (employee) => `${employee.firstName} ${employee.lastName}`,
    },
    {
      prefix: "Role: ",
      render: (employee) => employee.storeEmployeeRole?.name ?? "Unknown",
    },
    { prefix: "Salary: ", render: (employee) => employee.salary },
  ] as DataEntry<Employee>[];

  function parseData(): void {
    const value = parseInt(salaryText, 10);
    if (value < 0 && value > 99999) {
      openSnackbar("error", "Please enter a valid number (0 < n <= 99999)");
      return;
    }

    setParsedText(value);
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
      <h1
        style={{
          paddingTop: 26,
          marginBottom: 4,
          textAlign: "center",
        }}
      >
        Filter Employees
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            marginLeft: 16,
            marginRight: 8,
            userSelect: "none",
          }}
        >
          {`Minimum salary: `}
        </p>
        <TextField
          disabled={false} // todo
          value={salaryText}
          type="text"
          inputProps={{ min: 1, style: { textAlign: "center" } }}
          onChange={(event) => setSalaryText(event.target.value)}
          onKeyPress={handleInputKeyPress}
          variant="outlined"
          size="small"
          style={{
            width: 100,
            marginRight: 16,
          }}
        />
        <Button
          disabled={false} // todo
          variant="contained"
          onClick={parseData}
        >
          Filter
        </Button>
      </div>

      <DataView<Employee>
        key={parsedText}
        tableHeaders={headers}
        tableData={tableData}
        cardData={cardData}
        singularWord="employee"
        pluralWord="employees"
        webRoute="employees"
        dataRoute="storeemployees/filter"
        dataQuery={`?minSalary=${parsedText}`}
        titleText={null}
        noDataText="No employees found. If you haven't clicked on the filter button yet,
        make sure to do so."
        allowCreate={false}
        showUser={false}
      ></DataView>
    </Container>
  );
};
