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
      lineHeight: "130px",
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fontWeight: 700,
    },
    h5: {
      fontSize: "32px",
      lineHeight: "130px",
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fontWeight: 700,
    },
    h6: {
      fontSize: "24px",
      lineHeight: "130px",
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fontWeight: 700,
    },
    
    captions: {
      fontSize: "12px",
      lineHeight: "130px",
    },
    subtitle1: {
      fontSize: "18px",
      lineHeight: "170%",
      fontStyle: "normal",
      fontWeight: 700,
      fontFamily: "Raleway",
    },
    subtitle2: {
      fontSize: "14px",
      lineHeight: "170px",
    },
    body1: {
      fontSize: "18px",
      lineHeight: "170%",
      fontStyle: "normal",
      fontWeight: 400,
      fontFamily: "Raleway",
    },
    body2: {
      fontSize: "12px",
      lineHeight: "170px",
    },

    button: {
      fontSize: "1.125rem",
      fontSize: "18px",
      lineHeight: "170px",
      textTransform: "none",
    },
  },
});
theme.components = {
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
        borderRadius: "100px",
        height: "48px",
        '&:hover': {
          backgroundColor: '#5C785A', // Highlight: Red color on hover
          boxShadow: 'none',
        },
      },
    },
  },
};
export default theme;
