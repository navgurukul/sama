import { createTheme } from "@mui/material/styles";
import { breakpoints } from "./constant";
let theme = createTheme();

const shadows = theme.shadows;
shadows[2] =
  "0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)";

theme = createTheme(theme, {
  breakpoints,
  palette: {
    mode: "light",
    default: {
      contrastText: "#4A4A4A",
    },
    succes: {
      contrastText: "#48A145",
    },
    primary: {
      main: "#5C785A",
      light: "#F0F4EF",
      medium: "#CED7CE",
    },
    secondary: {
      main: "#453722",
    },
    tertiary: {
      main: "#B25F65",
    },

    background: {
      default: "#F8F3F0",
    },
    dark: {
      main: "#4A4A4A",
    },
    white: {
      main: "#FFF",
    },
    grey: {
      main: "#E0E1E0",
      med: "#BDBDBD",
      light: "#E0E0E0",
    },
  },
  typography: {
    fontFamily: "Raleway",
    fontSize: 18,

    h4: {
      fontSize: "48px",
      lineHeight: "130%",
      fontFamily: "Montserrat, sans-serif",
      fontStyle: "normal",
      fontWeight: 700,
    },
    h5: {
      fontSize: "32px",
      lineHeight: "130%",
      fontFamily: "Montserrat, sans-serif",
      fontStyle: "normal",
      fontWeight: 700,
    },
    h6: {
      fontSize: "24px",
      lineHeight: "130%",
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fontWeight: 700,
      color:"#4A4A4A"
    },

    captions: {
      fontSize: "12px",
      lineHeight: "130%",
    },
    subtitle1: {
      fontSize: "18px ",
      lineHeight: "170%",
      fontStyle: "normal",
      fontWeight: 700,
      fontFamily: "Raleway",
      color: "#828282",
    },
    subtitle2: {
      fontSize: "14px",
      lineHeight: "170%",
      fontStyle: "normal",
      fontWeight: 700,
      fontFamily: "Raleway",
    },
    body1: {
      fontSize: "18px",
      lineHeight: "170%",
      fontStyle: "normal",
      fontWeight: 400,
      fontFamily: "Raleway, sans-serif",
      color: "#4A4A4A",
    },
    body2: {
      fontSize: "14px",
      lineHeight: "170%",
      color: "#3A3A3A",
      fontFamily: "Raleway, sans-serif",
      fontWeight: 400,
      fontStyle: "normal",
    },

    button: {
      fontSize: "18px",
      lineHeight: "170%",
      textTransform: "none",
      fontFamily: "Raleway",
      fontWeight: 700,
      borderRadius: "100px",
    },
  },
});
theme.components = {
  MuiInputBase: {
    styleOverrides: {
      root: {
        backgroundColor: "#FFFFFF",
        fontFamily: "Montserrat, sans-serif",
      },
    },
  },
  MuiCardMedia: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      root: { width: 64 },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        // borderRadius: "100px",
        height: "48px",
        padding: "0px 32px 0px 32px",
        borderRadius: "100px",

        "&:hover": {
          backgroundColor: "#5C785A",
          color: "#FFFFFF",
        },
      },
    },
  },

  
  
};
export default theme;
