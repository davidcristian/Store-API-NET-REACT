import { Button, useTheme, useMediaQuery } from "@mui/material";

import React, { useContext, useEffect, useState } from "react";
import { BACKEND_API_URL } from "../constants";
import axios, { AxiosError } from "axios";
import { SnackbarContext } from "./SnackbarContext";
import { getAuthToken } from "../auth";

interface PaginatorProps {
    route: string;
    pageSize: number;
    pageIndex: number;
    setPageIndex: (pageNumber: number) => void;
    query?: string;
}

const Paginator: React.FC<PaginatorProps> = ({
    route,
    pageSize,
    pageIndex,
    setPageIndex,
    query = "",
}) => {
    const openSnackbar = useContext(SnackbarContext);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(999999);

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
    const isLargeScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const fetchPageCount = async () => {
        setLoading(true);
        try {
            await axios
                .get<number>(
                    `${BACKEND_API_URL}/${route}/count/${pageSize}${query}`,
                    {
                        headers: {
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                )
                .then((response) => {
                    const data = response.data;
                    setTotalPages(data);
                    setLoading(false);
                })
                .catch((reason: AxiosError) => {
                    console.log(reason.message);
                    openSnackbar(
                        "error",
                        "Failed to fetch page count!\n" +
                            (String(reason.response?.data).length > 255
                                ? reason.message
                                : reason.response?.data)
                    );
                });
        } catch (error) {
            console.log(error);
            openSnackbar(
                "error",
                "Failed to fetch page count due to an unknown error!"
            );
        }
    };

    useEffect(() => {
        fetchPageCount();
    }, [pageSize]);

    function handlePageClick(pageNumber: number) {
        setPageIndex(pageNumber - 1);
    }

    const displayedPages = isSmallScreen
        ? 3
        : isMediumScreen
        ? 5
        : isLargeScreen
        ? 7
        : 9;

    let startPage = pageIndex - Math.floor((displayedPages - 3) / 2) + 1;
    let endPage = startPage + displayedPages - 3;

    if (startPage <= 2) {
        startPage = 1;
        endPage = displayedPages - 1;
    } else if (endPage >= totalPages - 1) {
        startPage = totalPages - displayedPages + 2;
        endPage = totalPages;
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 16,
            }}
        >
            <Button
                variant="contained"
                onClick={() => handlePageClick(pageIndex)}
                disabled={pageIndex === 0}
            >
                &lt;
            </Button>
            {startPage > 1 && (
                <>
                    <Button
                        variant={pageIndex === 0 ? "contained" : "outlined"}
                        onClick={() => handlePageClick(1)}
                        style={{
                            marginLeft: 8,
                            marginRight: 8,
                        }}
                    >
                        1
                    </Button>
                    <span>...</span>
                </>
            )}
            {Array.from(
                { length: endPage - startPage + 1 },
                (_, i) => i + startPage
            ).map((number) => (
                <Button
                    key={number}
                    variant={
                        pageIndex === number - 1 ? "contained" : "outlined"
                    }
                    onClick={() => handlePageClick(number)}
                    style={{
                        marginLeft: 8,
                        marginRight: 8,
                    }}
                >
                    {number}
                </Button>
            ))}
            {endPage < totalPages && (
                <>
                    <span>...</span>
                    <Button
                        variant={
                            pageIndex === totalPages - 1
                                ? "contained"
                                : "outlined"
                        }
                        onClick={() => handlePageClick(totalPages)}
                        style={{
                            marginLeft: 8,
                            marginRight: 8,
                        }}
                    >
                        {totalPages}
                    </Button>
                </>
            )}
            <Button
                variant="contained"
                onClick={() => handlePageClick(pageIndex + 2)}
                disabled={pageIndex + 1 >= totalPages}
            >
                &gt;
            </Button>
        </div>
    );
};

export default Paginator;
