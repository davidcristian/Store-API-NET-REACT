import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ChatIcon from "@mui/icons-material/Chat";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ShieldIcon from "@mui/icons-material/Shield";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { MouseEvent, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getAccount, logOut } from "../auth";
import { AccessLevel } from "../models/User";
import { SnackbarContext } from "./SnackbarContext";

export const AppMenu = () => {
  const theme = useTheme();
  const isXlScreen = useMediaQuery(theme.breakpoints.down("xl"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [whichMenu, setWhichMenu] = useState<"navigation" | "profile">(
    "navigation"
  );

  const handleClick = (
    event: MouseEvent<HTMLElement>,
    menu: "navigation" | "profile"
  ) => {
    setWhichMenu(menu);
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = useNavigate();
  const openSnackbar = useContext(SnackbarContext);

  const location = useLocation();
  const path = location.pathname;

  const accountNameClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const account = getAccount();
    if (account !== undefined) {
      navigate(`/users/${account.id}/details`);
    } else {
      navigate("/users/login");
    }
  };

  const logOutClick = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    logOut();
    navigate("/");
    openSnackbar("info", "Logged out successfully!");
  };

  const menuItems = [
    {
      link: "/filteremployees",
      title: "Filter",
      icon: <PersonSearchIcon />,
    },
    { link: "/employees", title: "Employees", icon: <EmojiEmotionsIcon /> },
    { link: "/roles", title: "Roles", icon: <ShieldIcon /> },
    { link: "/stores", title: "Stores", icon: <LocalOfferIcon /> },
    { link: "/shifts", title: "Shifts", icon: <AccessTimeFilledIcon /> },
    { link: "/salaryreport", title: "Salaries", icon: <AttachMoneyIcon /> },
    { link: "/headcountreport", title: "Headcount", icon: <GroupIcon /> },
    { link: "/chat", title: "Chat", icon: <ChatIcon /> },
  ];

  return (
    <Box sx={{ flexGrow: 1, position: "sticky", top: "0", zIndex: "9" }}>
      <AppBar position="static" sx={{ marginBottom: "20px" }}>
        <Toolbar>
          {isXlScreen ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={(event) => handleClick(event, "navigation")}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{ mr: 5, whiteSpace: "nowrap" }}
              >
                Store Management
              </Typography>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl) && whichMenu === "navigation"}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} to="/">
                  <IconButton size="large" color="inherit">
                    <HomeIcon />
                  </IconButton>
                  Home
                </MenuItem>

                {menuItems.map((item) => (
                  <MenuItem
                    key={item.title}
                    onClick={handleClose}
                    component={Link}
                    to={item.link}
                  >
                    <IconButton size="large" color="inherit">
                      {item.icon}
                    </IconButton>
                    {item.title}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <>
              <IconButton
                component={Link}
                to="/"
                size="large"
                edge="start"
                color="inherit"
                aria-label="school"
                sx={{ mr: 2 }}
              >
                <HomeIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="div"
                sx={{ mr: 5, whiteSpace: "nowrap" }}
              >
                Store Management
              </Typography>

              {menuItems.map((item) => (
                <Button
                  key={item.title}
                  variant={path.startsWith(item.link) ? "outlined" : "text"}
                  to={item.link}
                  component={Link}
                  color="inherit"
                  sx={{ mr: 5 }}
                  startIcon={item.icon}
                >
                  {item.title}
                </Button>
              ))}
            </>
          )}

          <Box sx={{ display: "flex", marginLeft: "auto" }}>
            <Button variant="text" color="inherit" onClick={accountNameClick}>
              {getAccount()?.name ?? "Log In"}
            </Button>

            <IconButton onClick={(event) => handleClick(event, "profile")}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "white",
                  color: "black",
                }}
              >
                {String(getAccount()?.name ?? "User")[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl) && whichMenu === "profile"}
              onClose={handleClose}
            >
              {getAccount()?.accessLevel === AccessLevel.Admin && (
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  to="/users/adminpanel"
                >
                  <ListItemIcon>
                    <LocalPoliceIcon fontSize="small" />
                  </ListItemIcon>
                  Admin Panel
                </MenuItem>
              )}

              <MenuItem
                onClick={(e) => {
                  accountNameClick(e);
                  handleClose();
                }}
              >
                <ListItemIcon>
                  {getAccount() === undefined ? (
                    <LoginIcon fontSize="small" />
                  ) : (
                    <PersonIcon fontSize="small" />
                  )}
                </ListItemIcon>
                {getAccount() === undefined ? "Log In" : "Profile"}
              </MenuItem>

              {getAccount() === undefined && (
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  to="/users/register"
                >
                  <ListItemIcon>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  Register
                </MenuItem>
              )}

              {getAccount() !== undefined && (
                <MenuItem onClick={logOutClick}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Log out
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};
