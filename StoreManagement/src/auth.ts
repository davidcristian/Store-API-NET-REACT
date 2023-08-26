import jwt_decode from "jwt-decode";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { SnackbarContext } from "./components/SnackbarContext";
import { AccessLevel, User } from "./models/User";

interface JwtPayload {
  unique_name: string; // Name

  nameid: string; // NameIdentifier
  role: string; // Role

  PagePreference: string; // PagePreference
  exp: number; // Expiration
}

export const logOut = (): void => {
  setAuthToken(null);
  setAccount(undefined);
};

export const isAuthorized = (userId: number | undefined): boolean => {
  const account = getAccount();

  return (
    account !== undefined &&
    account.accessLevel !== undefined &&
    (account.accessLevel > AccessLevel.Regular || account.id === userId)
  );
};

export const setAuthToken = (token: string | null): void => {
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
    },

    password: "",
  };
  setAccount(user);

  const expirationDate = decodedToken.exp * 1000;
  console.log("Token expiration date:", new Date(expirationDate));
};

export const useAuthToken = () => {
  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);

  const getAuthToken = (): string | null => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    const decodedToken = jwt_decode<JwtPayload>(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      openSnackbar("warning", "Your session has expired. Please log in again.");
      navigate("/users/login");

      return null;
    }

    return token;
  };

  return { getAuthToken };
};

export const setAccount = (newAccount: User | undefined): void => {
  if (newAccount) {
    localStorage.setItem("account", JSON.stringify(newAccount));
  } else {
    localStorage.removeItem("account");
  }
};

export const getAccount = (): User | undefined => {
  const storedAccount = localStorage.getItem("account");
  if (storedAccount) return JSON.parse(storedAccount);

  return undefined;
};

export const updatePref = (userId: number | undefined, pref: number): void => {
  const account = getAccount();

  if (account && account.userProfile && account.id === userId) {
    account.userProfile.pagePreference = pref;
    setAccount(account);
  }
};
