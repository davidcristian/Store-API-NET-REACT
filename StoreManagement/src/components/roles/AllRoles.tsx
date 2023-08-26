import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { EmployeeRole } from "../../models/EmployeeRole";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const AllRoles = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", hide: false },
    { text: "Name", hide: false },
    { text: "Description", hide: breaksDownLg },
    { text: "Level", hide: false },
    { text: "# of Employees", hide: false },
    { text: "User", hide: false },
    { text: "Operations", hide: false },
  ] as Header[];

  const tableData = [
    { render: (role) => role.name },
    { render: (role) => role.description },
    { render: (role) => role.roleLevel },
    { render: (role) => role.storeEmployees?.length },
  ] as DataEntry<EmployeeRole>[];

  const cardData = [
    { isTitle: true, render: (role) => role.name },
    { prefix: "Level: ", render: (role) => role.roleLevel },
    {
      prefix: "# of Employees: ",
      render: (role) => role.storeEmployees?.length,
    },
  ] as DataEntry<EmployeeRole>[];

  return (
    <DataView<EmployeeRole>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="role"
      pluralWord="roles"
      webRoute="roles"
      dataRoute="storeemployeeroles"
    ></DataView>
  );
};
