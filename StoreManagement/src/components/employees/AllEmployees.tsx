import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { Employee, Gender } from "../../models/Employee";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const AllEmployees = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", sortProperty: "", hide: false },
    { text: "First Name", sortProperty: "firstName", hide: false },
    { text: "Last Name", sortProperty: "lastName", hide: false },
    { text: "Gender", sortProperty: "gender", hide: breaksDownLg },
    { text: "Salary", sortProperty: "salary", hide: breaksDownLg },
    { text: "Role", sortProperty: "", hide: false },
    { text: "# of Shifts", sortProperty: "", hide: false },
    { text: "User", sortProperty: "", hide: false },
    { text: "Operations", sortProperty: "", hide: false },
  ] as Header[];

  const tableData = [
    { render: (employee) => employee.firstName },
    { render: (employee) => employee.lastName },
    { render: (employee) => Gender[employee.gender] },
    { render: (employee) => employee.salary },
    { render: (employee) => employee.storeEmployeeRole?.name ?? "Unknown" },
    { render: (employee) => employee.storeShifts?.length },
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
    {
      prefix: "# of Shifts: ",
      render: (employee) => employee.storeShifts?.length,
    },
  ] as DataEntry<Employee>[];

  return (
    <DataView<Employee>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="employee"
      pluralWord="employees"
      webRoute="employees"
      dataRoute="storeemployees"
    ></DataView>
  );
};
