import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { Store, StoreCategory } from "../../models/Store";
import { Header } from "../../models/TableHeader";
import DataView from "../generic/DataView";

export const AllStores = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", hide: false },
    { text: "Name", hide: false },
    { text: "Description", hide: breaksDownLg },
    { text: "Category", hide: false },
    { text: "# of Shifts", hide: false },
    { text: "User", hide: false },
    { text: "Operations", hide: false },
  ] as Header[];

  const tableData = [
    { render: (store) => store.name },
    { render: (store) => store.description },
    { render: (store) => StoreCategory[store.category] },
    { render: (store) => store.storeShifts?.length },
  ] as DataEntry<Store>[];

  const cardData = [
    { isTitle: true, render: (store) => store.name },
    {
      prefix: "Category: ",
      render: (store) => StoreCategory[store.category],
    },
    {
      prefix: "# of Shifts: ",
      render: (store) => store.storeShifts?.length,
    },
  ] as DataEntry<Store>[];

  return (
    <DataView<Store>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="store"
      pluralWord="stores"
      webRoute="stores"
      dataRoute="stores"
    ></DataView>
  );
};
