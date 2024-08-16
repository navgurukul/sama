import { createTheme } from "@mui/material/styles";
import { breakpoints } from "./constant";
let theme = createTheme();

const shadows = theme.shadows;
shadows[2] = '0px 1px 2px 0px rgba(74, 74, 74, 0.06), 0px 2px 1px 0px rgba(74, 74, 74, 0.04), 0px 1px 5px 0px rgba(74, 74, 74, 0.08)'

theme = createTheme(theme, {
    breakpoints,
    palette: {
      // mode: "light",
      default: {
        // light: "#0066FF",
        // main: "#fff",
        contrastText: "#4A4A4A",
      },
      primary: {
        main: "#5C785A",
        light: "#F0F4EF",
        // dark: "#3A8137",
        lighter: "#CED7CE",
      },
      secondary: {
        main: "#453722",
        // light: "#FFF5CC",
        // dark: "#CCA300",
        // contrastText: "#2E2E2E",
      },
      background: {
        default: "#F8F3F0",
      },
      dark: {
        main: "#4A4A4A",
      },
      grey: {
        main: "#828282",
        med: "#BDBDBD",
        light: "#E0E0E0",
      },
    },
    typography: {
        fontFamily: "Raleway",
        fontSize: 18,
        h1: {
          
          fontSize: "6rem",
          lineHeight: "130%",
         
        },
        h2: {
         
          fontSize: "6rem",
          lineHeight: "130%",
         
        },
        h3: {
        
          fontSize: "6rem",
          lineHeight: "130%",
          
        },
        h4: {
       
          fontSize: "48%",
          lineHeight: "130%",
          fontFamily: "Montserrat",
        
        },
        h5: {
      
          fontSize: "32%",
          lineHeight: "130%",
          fontFamily: "Montserrat",

        },
        h6: {
          
          fontSize: "24%",
          lineHeight: "130%",
          fontFamily: "Montserrat",
       
        },
        captions: {
          
          fontSize: "12%",
          lineHeight: "130%",
         
        },
        subtitle1: {
          
          fontSize: "12%",
          lineHeight: "170%",
         
        },
        subtitle2: {
          
          fontSize: "12%",
          lineHeight: "170%",
         
        },
        body1: {
          
          fontSize: "12%",
          lineHeight: "170%",
         
        },
        body2: {
          
          fontSize: "12%",
          lineHeight: "170%",
         
        },
        
        button: {
            fontSize: "1.125rem",
            fontSize: "18%",
            lineHeight: "170%",
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
                borderRadius: "8px",
                height: "48px",
              },
            },
          },
        }
    export default theme;