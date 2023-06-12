const PROD_BACKEND_API_URL = "https://sdistoreapi.ddns.net/api";
const DEV_BACKEND_API_URL = "http://localhost:5066/api";
// const DEV_BACKEND_API_URL = "http://sdistoreapi.duckdns.org/api";

export const BACKEND_API_URL =
    process.env.NODE_ENV === "development"
        ? DEV_BACKEND_API_URL
        : PROD_BACKEND_API_URL;

export function formatDate(date: Date | string | undefined) {
    return date === null || date === undefined
        ? "N/A"
        : new Date(date).toLocaleString();
}

export const getEnumValues = (e: any) => {
    return Object.keys(e)
        .filter((key) => isNaN(Number(key)))
        .map((key) => e[key]);
};
