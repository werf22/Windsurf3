// Main theme file for Cerulík AI Task Manager
import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { colors } from "./colors";
import { foundations } from "./foundations";
import { components } from "./components";

// Support for color mode
const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

// Create the extended theme
const theme = extendTheme({
  config,
  colors,
  ...foundations,
  components,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "gray.50" : "gray.900",
      },
    }),
  },
  // Custom breakpoints
  breakpoints: {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
  },
});

export default theme;
