import { User, AccessLevel } from "./models/User";
import jwt_decode from "jwt-decode";

interface JwtPayload {
    unique_name: string; // Name

    nameid: string; // NameIdentifier
    role: string; // Role

    PagePreference: string; // PagePreference
    exp: number; // Expiration
}

export const logOut = () => {
    setAuthToken(null);
    setAccount(null);
};

export const isAuthorized = (userId: number | undefined) => {
    const account = getAccount();

    return (
        account !== null &&
        account.accessLevel !== undefined &&
        (account.accessLevel > AccessLevel.Regular || account.id === userId)
    );
};

export const setAuthToken = (token: string | null) => {
    if (!token) {
        localStorage.removeItem("authToken");
        return;
    }
    localStorage.setItem("authToken", token);

    const decodedToken = jwt_decode<JwtPayload>(token);
    const user: User = {
        id: parseInt(decodedToken.nameid),
        name: decodedToken.unique_name,
        accessLevel: AccessLevel[
            decodedToken.role as keyof typeof AccessLevel
        ] as AccessLevel,

        userProfile: {
            pagePreference: parseInt(decodedToken.PagePreference),

            bio: "",
            location: "",
            gender: 0,
            maritalStatus: 0,
        },

        password: "",
    };
    setAccount(user);

    const expirationDate = decodedToken.exp * 1000;
    console.log("Token expiration date:", new Date(expirationDate));
};

export const getAuthToken = () => {
    // TODO: Redirect to login page and show snackbar if token is expired
    return localStorage.getItem("authToken");
};

export const setAccount = (newAccount: User | null) => {
    if (newAccount) {
        localStorage.setItem("account", JSON.stringify(newAccount));
    } else {
        localStorage.removeItem("account");
    }
};

export const getAccount = () => {
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) return JSON.parse(storedAccount);

    return null;
};

export const updatePref = (userId: number | undefined, pref: number) => {
    const account = getAccount();

    if (account && account.userProfile && account.id === userId) {
        account.userProfile.pagePreference = pref;
        setAccount(account);
    }
};
