import AddIcon from "@mui/icons-material/Add";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { SnackbarContext } from "../../contexts/SnackbarContext";
import { DataEntry } from "../../models/DataEntry";
import { Header } from "../../models/TableHeader";
import { User } from "../../models/User";
import {
  getAccount,
  isAuthorized,
  useAuthToken,
} from "../../utils/authentication";
import { BACKEND_API_URL } from "../../utils/constants";
import Paginator from "./Paginator";

interface DataViewProps<T> {
  tableHeaders: Header[];
  tableData: DataEntry<T>[];
  cardData: DataEntry<T>[];

  dataRoute: string;
  webRoute: string;

  dataPageRoute?: string;
  dataQuery?: string;
  idProps?: (keyof T)[];

  allowCreate?: boolean;
  addControls?: boolean;
  showUser?: boolean;

  titleText?: string | null;
  noDataText?: string;

  singularWord: string;
  pluralWord: string;
}

const DataView = <T extends { id?: number; user?: User }>({
  tableHeaders,
  tableData,
  cardData,

  dataRoute,
  webRoute,

  dataPageRoute = "",
  dataQuery = "",
  idProps = [],

  allowCreate = true,
  addControls = true,
  showUser = true,

  titleText = "",
  noDataText = "",

  singularWord,
  pluralWord,
}: DataViewProps<T>) => {
  const openSnackbar = useContext(SnackbarContext);
  const { getAuthToken } = useAuthToken();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T[]>([]);

  const [pageSize] = useState<number>(
    getAccount()?.userProfile?.pagePreference ?? 5
  );
  const [pageIndex, setPageIndex] = useState<number>(0);

  const theme = useTheme();
  const breaksDownMd = useMediaQuery(theme.breakpoints.down("md"));

  const fetchData = async () => {
    setLoading(true);

    let url = `${BACKEND_API_URL}/${dataRoute}`;
    if (dataPageRoute !== "") {
      url += `/${dataPageRoute}`;
    }
    url += `/${pageIndex}/${pageSize}`;
    if (dataQuery !== "") {
      url += `${dataQuery}`;
    }

    try {
      await axios
        .get<T[]>(url, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        })
        .then((response) => {
          const data = response.data;
          setData(data);
          setLoading(false);
        })
        .catch((reason: AxiosError) => {
          console.log(reason.message);
          openSnackbar("error", `Failed to fetch ${pluralWord}!`);
        });
    } catch (error) {
      console.log(error);
      openSnackbar(
        "error",
        `Failed to fetch ${pluralWord} due to an unknown error!`
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, [pageIndex, pageSize]);

  const [sorting, setSorting] = useState<{ key: string; ascending: boolean }>({
    key: "column name",
    ascending: true,
  });

  function applySorting(key: string, ascending: boolean) {
    if (key !== sorting.key) ascending = true;
    setSorting({ key: key, ascending: ascending });
  }

  useEffect(() => {
    if (data.length === 0) return;

    const currentData = [...data];
    const sortedCurrentUsers = currentData.sort((a, b) => {
      const aVal = a[sorting.key as keyof T];
      const bVal = b[sorting.key as keyof T];
      if (aVal === undefined || bVal === undefined) return 0;

      // Check if the values are numbers
      const isNumeric =
        typeof aVal === "string" &&
        !isNaN(+parseFloat(aVal)) &&
        typeof bVal === "string" &&
        !isNaN(+parseFloat(bVal));

      // If both values are numbers, use subtraction for comparison
      if (isNumeric) {
        return parseFloat(aVal) - parseFloat(bVal);
      } else if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal);
      }

      return 0;
    });

    setData(
      sorting.ascending ? sortedCurrentUsers : sortedCurrentUsers.reverse()
    );
  }, [sorting]);

  return (
    <Container>
      {titleText !== null && (
        <h1
          style={{
            paddingTop: 26,
            marginBottom: allowCreate ? 4 : 32,
            textAlign: "center",
          }}
        >
          {titleText === ""
            ? `All ${
                pluralWord[0].toUpperCase() + pluralWord.slice(1).toLowerCase()
              }`
            : titleText}
        </h1>
      )}

      {loading && <CircularProgress />}
      {!loading && allowCreate && (
        <Button
          component={Link}
          to={`/${webRoute}/add`}
          disabled={getAccount() === undefined}
          variant="text"
          size="large"
          sx={{ mb: 2, textTransform: "none" }}
          startIcon={<AddIcon />}
        >
          Create
        </Button>
      )}
      {!loading && data.length === 0 && (
        <p
          data-testid={`test-all-${pluralWord}-empty`}
          style={{ marginLeft: 16 }}
        >
          {noDataText === "" ? `No ${pluralWord} found.` : noDataText}
        </p>
      )}
      {!loading &&
        data.length > 0 &&
        (breaksDownMd ? (
          <Grid container spacing={3}>
            {data.map((entry) => {
              const entryIdentifier =
                idProps.length === 0
                  ? `${entry.id}`
                  : idProps.map((prop) => entry[prop]).join("/");

              return (
                <Grid item xs={12} sm={6} md={4} key={entry.id}>
                  <Card>
                    <CardContent>
                      {cardData.map((data, i) => {
                        const variant = data.isTitle ? "h6" : "body1";
                        const content = `${data.prefix ?? ""}${data.render(
                          entry
                        )}`;

                        return (
                          <Typography key={i} variant={variant}>
                            {content}
                          </Typography>
                        );
                      })}
                    </CardContent>
                    {addControls && (
                      <CardActions>
                        <IconButton
                          component={Link}
                          to={`/${webRoute}/${entryIdentifier}/details`}
                        >
                          <Tooltip title={`View ${singularWord} details`} arrow>
                            <ReadMoreIcon color="primary" />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          component={Link}
                          sx={{ ml: 1, mr: 1 }}
                          to={`/${webRoute}/${entryIdentifier}/edit`}
                          disabled={!isAuthorized(entry.user?.id)}
                        >
                          <Tooltip title={`Edit ${singularWord}`} arrow>
                            <EditIcon />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/${webRoute}/${entryIdentifier}/delete`}
                          disabled={!isAuthorized(entry.user?.id)}
                          sx={{ color: "red" }}
                        >
                          <Tooltip title={`Delete ${singularWord}`} arrow>
                            <DeleteForeverIcon />
                          </Tooltip>
                        </IconButton>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 0 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  {tableHeaders.map((header, i) => {
                    if (header.hide) {
                      return null;
                    }
                    return (
                      <TableCell
                        key={i}
                        style={{
                          cursor: header.sortProperty ? "pointer" : "default",
                          whiteSpace: header.sortProperty ? "nowrap" : "normal",
                          userSelect: "none",
                        }}
                        align={header.text === "Operations" ? "center" : "left"}
                        onClick={() =>
                          header.sortProperty &&
                          applySorting(
                            header.sortProperty,
                            sorting.key === header.sortProperty
                              ? !sorting.ascending
                              : true
                          )
                        }
                      >
                        {header.text}
                        {sorting.key === header.sortProperty &&
                          (sorting.ascending ? " ↑" : " ↓")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((entry, index) => {
                  const entryIdentifier =
                    idProps.length === 0
                      ? `${entry.id}`
                      : idProps.map((prop) => entry[prop]).join("/");

                  const entryData: unknown[] = [
                    pageIndex * pageSize + index + 1,
                  ];
                  tableData.forEach((data) => {
                    entryData.push(data.render(entry));
                  });

                  if (showUser) {
                    entryData.push(
                      entry.user?.name ? (
                        <Link
                          to={`/users/${entry.user?.id}/details`}
                          title="View user details"
                        >
                          {entry.user?.name}
                        </Link>
                      ) : (
                        <p>N/A</p>
                      )
                    );
                  }

                  if (addControls) {
                    entryData.push(
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        justifyContent="center"
                      >
                        <IconButton
                          component={Link}
                          to={`/${webRoute}/${entryIdentifier}/details`}
                        >
                          <Tooltip title={`View ${singularWord} details`} arrow>
                            <ReadMoreIcon color="primary" />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          component={Link}
                          sx={{ ml: 1, mr: 1 }}
                          to={`/${webRoute}/${entryIdentifier}/edit`}
                          disabled={!isAuthorized(entry.user?.id)}
                        >
                          <Tooltip title={`Edit ${singularWord}`} arrow>
                            <EditIcon />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/${webRoute}/${entryIdentifier}/delete`}
                          disabled={!isAuthorized(entry.user?.id)}
                          sx={{ color: "red" }}
                        >
                          <Tooltip title={`Delete ${singularWord}`} arrow>
                            <DeleteForeverIcon />
                          </Tooltip>
                        </IconButton>
                      </Box>
                    );
                  }

                  return (
                    <TableRow key={entry.id}>
                      {entryData.map((data, i) => {
                        const header = tableHeaders[i];
                        if (header.hide) {
                          return null;
                        }
                        return (
                          <TableCell
                            key={i}
                            align={
                              header.text === "Operations" ? "center" : "left"
                            }
                          >
                            {data as ReactNode}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ))}
      {!loading && data.length > 0 && (
        <Paginator
          route={dataRoute}
          pageSize={pageSize}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          query={dataQuery}
        />
      )}
    </Container>
  );
};

export default DataView;
