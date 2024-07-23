import { createTheme } from "@mui/material/styles";
import { breakpoints } from "./constant";
let theme = createTheme();

theme = createTheme(theme, {
    breakpoints,
    palette: {
      mode: "light",
      default: {
        light: "#0066FF",
        main: "#fff",
        contrastText: "#FFCC00",
      },
      primary: {
        main: "#48A145",
        light: "#E9F5E9",
        dark: "#3A8137",
        lighter: "#FAFAFA",
      },
      secondary: {
        main: "#FFCC00",
        light: "#FFF5CC",
        dark: "#CCA300",
        contrastText: "#2E2E2E",
      },
      background: {
        default: "#FFFFFF",
        paper: "#FFFFFF",
      },
      dark: {
        main: "#2E2E2E",
        contrastText: "#FFFFFF",
      },
    },
    typography: {
        fontFamily: "Josefin Sans",
        fontSize: 18,
        h1: {
          letterSpacing: "-1px",
          fontWeight: 600,
          fontSize: "6rem",
          lineHeight: "130%",
          fontFamily: "Josefin Sans",
          [theme.breakpoints.down("sm")]: {
            fontSize: "4rem",
          },
        },
        button: {
            fontSize: "1.125rem",
            fontFamily: "Noto Sans",
            [theme.breakpoints.down("sm")]: {
              fontSize: "1rem",
            },
            lineHeight: "170%",
            fontWeight: 700,
            textTransform: "none",
          },
          code: {
            fontFamily: "IBM Plex Mono",
            fontSize: "1.125rem",
            lineHeight: "170%",
            fontWeight: 400,
            [theme.breakpoints.down("sm")]: {
              fontSize: "1rem",
            },
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
                borderRadius: "8px",
                height: "48px",
              },
            },
          },
        }
    export default theme;