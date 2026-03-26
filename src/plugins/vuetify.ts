// src/plugins/vuetify.ts
import { createVuetify, ThemeDefinition } from "vuetify";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

// Material Design 3 custom theme
const visiobookLightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: "#2196F3",
    secondary: "#424242",
    accent: "#FF4081",
    error: "#D32F2F",
    warning: "#FFA000",
    info: "#1976D2",
    success: "#388E3C",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-background": "#1A1A1A",
    "on-surface": "#1A1A1A",
  },
};

const visiobookDarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#64B5F6",
    secondary: "#616161",
    accent: "#FF80AB",
    error: "#EF5350",
    warning: "#FFB74D",
    info: "#42A5F5",
    success: "#66BB6A",
    background: "#121212",
    surface: "#1E1E1E",
    "on-primary": "#000000",
    "on-secondary": "#000000",
    "on-background": "#FFFFFF",
    "on-surface": "#FFFFFF",
  },
};

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "visiobookLight",
    themes: {
      visiobookLight: visiobookLightTheme,
      visiobookDark: visiobookDarkTheme,
    },
  },
  defaults: {
    VBtn: {
      color: "primary",
      variant: "elevated",
      rounded: "lg",
    },
    VCard: {
      elevation: 2,
      rounded: "lg",
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
    },
    VCheckbox: {
      color: "primary",
    },
    VSwitch: {
      color: "primary",
    },
  },
});
