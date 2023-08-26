import { DataEntry } from "../../models/DataEntry";
import { Header } from "../../models/TableHeader";
import { AccessLevel, User } from "../../models/User";
import DataView from "../generic/DataView";

export const AllUsers = () => {
  const headers = [
    { text: "#", hide: false },
    { text: "User", hide: false },
    { text: "Access Level", hide: false },
    { text: "Operations", hide: false },
  ] as Header[];

  const tableData = [
    { render: (user) => user.name },
    {
      render: (user) =>
        user.accessLevel !== undefined
          ? AccessLevel[user.accessLevel]
          : "Unknown",
    },
  ] as DataEntry<User>[];

  const cardData = [
    { isTitle: true, render: (user) => user.name },
    {
      prefix: "Access Level: ",
      render: (user) =>
        user.accessLevel !== undefined
          ? AccessLevel[user.accessLevel]
          : "Unknown",
    },
  ] as DataEntry<User>[];

  return (
    <DataView<User>
      tableHeaders={headers}
      tableData={tableData}
      cardData={cardData}
      singularWord="user"
      pluralWord="users"
      webRoute="users"
      dataRoute="users"
      showUser={false}
    ></DataView>
  );
};
