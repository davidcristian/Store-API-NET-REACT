import {
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
    Container,
    useTheme,
    useMediaQuery,
    Grid,
    Card,
    CardContent,
    Typography,
    CardActions,
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import { BACKEND_API_URL } from "../../constants";
import axios from "axios";
import { SnackbarContext } from "../SnackbarContext";
import { getAccount, getAuthToken } from "../../auth";
import Paginator from "../Paginator";

import { StoreSalaryReport } from "../../models/StoreSalaryReport";
import { StoreCategory } from "../../models/Store";

export const ShowStoreSalaryReport = () => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);

    const [pageSize] = useState(getAccount()?.userProfile?.pagePreference ?? 5);
    const [pageIndex, setPageIndex] = useState(0);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const headers = [
        { text: "#", hide: false },
        { text: "Name", hide: false },
        { text: "Description", hide: isLargeScreen },
        { text: "Category", hide: false },
        { text: "Average Salary", hide: false },
    ];

    const fetchStores = async () => {
        setLoading(true);
        try {
            await axios
                .get<[]>(
                    `${BACKEND_API_URL}/stores/report/salaries/${pageIndex}/${pageSize}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const stores = response.data;
                    setStores(stores);
                    setLoading(false);
                })
                .catch((reason) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch stores!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch stores due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchStores();
    }, [pageIndex, pageSize]);

    return (
        <Container>
            <h1
                style={{
                    paddingTop: 26,
                    marginBottom: 32,
                    textAlign: "center",
                }}
            >
                Stores ordered in descending order by the average salary of
                their employees
            </h1>
            {loading && <CircularProgress />}
            {!loading && stores.length == 0 && <div>No stores found!</div>}
            {!loading &&
                stores.length > 0 &&
                (isMediumScreen ? (
                    <Grid container spacing={3}>
                        {stores.map((store: StoreSalaryReport, index) => (
                            <Grid item xs={12} sm={6} md={4} key={store.id}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            component="div"
                                        >
                                            {store.name}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            {"Category: "}
                                            {StoreCategory[store.category]}
                                        </Typography>
                                        <Typography color="text.secondary">
                                            Average Salary:{" "}
                                            {store.averageSalary}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 0 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    {headers.map((header, i) => {
                                        if (header.hide) {
                                            return null;
                                        }
                                        return (
                                            <TableCell
                                                key={i}
                                                style={{ userSelect: "none" }}
                                                align="left"
                                            >
                                                {header.text}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stores.map(
                                    (store: StoreSalaryReport, index) => {
                                        const storeData = [
                                            pageIndex * pageSize + index + 1,
                                            store.name,
                                            store.description,
                                            StoreCategory[store.category],
                                            store.averageSalary,
                                        ];
                                        return (
                                            <TableRow key={store.id}>
                                                {storeData.map((data, i) => {
                                                    const header = headers[i];
                                                    if (header.hide) {
                                                        return null;
                                                    }
                                                    return (
                                                        <TableCell
                                                            key={i}
                                                            align="left"
                                                        >
                                                            {data}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    }
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
            {!loading && stores.length > 0 && (
                <Paginator
                    route="stores/report/salaries"
                    pageSize={pageSize}
                    pageIndex={pageIndex}
                    setPageIndex={setPageIndex}
                />
            )}
        </Container>
    );
};
