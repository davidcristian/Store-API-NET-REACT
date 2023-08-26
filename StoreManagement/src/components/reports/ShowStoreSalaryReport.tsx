import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { StoreCategory } from "../../models/Store";
import { StoreSalaryReport } from "../../models/StoreSalaryReport";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const ShowStoreSalaryReport = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", hide: false },
    { text: "Name", hide: false },
    { text: "Description", hide: breaksDownLg },
    { text: "Category", hide: false },
    { text: "Average Salary", hide: false },
  ] as Header[];

  const tableData = [
    { render: (store) => store.name },
    { render: (store) => store.description },
    { render: (store) => StoreCategory[store.category] },
    { render: (store) => store.averageSalary },
  ] as DataEntry<StoreSalaryReport>[];

  const cardData = [
    { isTitle: true, render: (store) => store.name },
    {
      prefix: "Category: ",
      render: (store) => StoreCategory[store.category],
    },
    {
      prefix: "Average Salary: ",
      render: (store) => store.averageSalary,
    },
  ] as DataEntry<StoreSalaryReport>[];

  return (
    <DataView<StoreSalaryReport>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="store"
      pluralWord="stores"
      webRoute="stores"
      dataRoute="stores/report/salaries"
      titleText={
        "Stores ordered in descending order by the average salary of their employees"
      }
      addControls={false}
      allowCreate={false}
      showUser={false}
    ></DataView>
  );
};
