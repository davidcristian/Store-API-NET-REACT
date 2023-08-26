import { useMediaQuery, useTheme } from "@mui/material";

import { DataEntry } from "../../models/DataEntry";
import { StoreShift } from "../../models/StoreShift";
import { Header } from "../../models/TableHeader";
import { formatDate } from "../../utils/constants";
import DataView from "../generic/DataView";

export const AllShifts = () => {
  const theme = useTheme();
  const breaksDownLg = useMediaQuery(theme.breakpoints.down("lg"));

  const headers = [
    { text: "#", hide: false },
    { text: "Employee Name", hide: false },
    { text: "Store Name", hide: false },
    { text: "Start Date", hide: breaksDownLg },
    { text: "End Date", hide: breaksDownLg },
    { text: "User", hide: false },
    { text: "Operations", hide: false },
  ] as Header[];

  const tableData = [
    {
      render: (shift) =>
        `${shift.storeEmployee?.firstName} ${shift.storeEmployee?.lastName}`,
    },
    { render: (shift) => shift.store?.name },
    { render: (shift) => formatDate(shift.startDate) },
    { render: (shift) => formatDate(shift.endDate) },
  ] as DataEntry<StoreShift>[];

  const cardData = [
    {
      isTitle: true,
      render: (shift) =>
        `${shift.storeEmployee?.firstName} ${shift.storeEmployee?.lastName} at ${shift.store?.name}`,
    },
    { prefix: "Start Date: ", render: (shift) => formatDate(shift.startDate) },
    { prefix: "End Date: ", render: (shift) => formatDate(shift.endDate) },
  ] as DataEntry<StoreShift>[];

  return (
    <DataView<StoreShift>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="shift"
      pluralWord="shifts"
      webRoute="shifts"
      dataRoute="storeshifts"
      dataPageRoute="pages"
      idProps={["storeId", "storeEmployeeId"]}
    ></DataView>
  );
};
