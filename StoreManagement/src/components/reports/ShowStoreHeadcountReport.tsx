import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { StoreCategory } from "../../models/Store";
import { StoreHeadcountReport } from "../../models/StoreHeadcountReport";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const ShowStoreHeadcountReport = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", hide: false },
    { text: "Name", hide: false },
    { text: "Description", hide: breaksDownLg },
    { text: "Category", hide: false },
    { text: "Headcount", hide: false },
  ] as Header[];

  const tableData = [
    { render: (store) => store.name },
    { render: (store) => store.description },
    { render: (store) => StoreCategory[store.category] },
    { render: (store) => store.headcount },
  ] as DataEntry<StoreHeadcountReport>[];

  const cardData = [
    { isTitle: true, render: (store) => store.name },
    {
      prefix: "Category: ",
      render: (store) => StoreCategory[store.category],
    },
    {
      prefix: "Headcount: ",
      render: (store) => store.headcount,
    },
  ] as DataEntry<StoreHeadcountReport>[];

  return (
    <DataView<StoreHeadcountReport>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="store"
      pluralWord="stores"
      webRoute="stores"
      dataRoute="stores/report/headcount"
      titleText={
        "Stores ordered in descending order by the number of employees"
      }
      addControls={false}
      allowCreate={false}
      showUser={false}
    ></DataView>
  );
};
