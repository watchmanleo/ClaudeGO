import _ from "../../../web_modules/pkg/lodash.js";
const MAC_ANSI_COLORS = {
  black: "#000000",
  red: "#990000",
  green: "#00a600",
  yellow: "#999900",
  blue: "#0000b2",
  magenta: "#b200b2",
  cyan: "#00a6b2",
  white: "#bfbfbf",
  brightBlack: "#666666",
  brightRed: "#e50000",
  brightGreen: "#00d900",
  brightYellow: "#e5e500",
  brightBlue: "#0000ff",
  brightMagenta: "#e500e5",
  brightCyan: "#00e5e5",
  brightWhite: "#e5e5e5"
};
const MAC_PRO_THEME = {
  foreground: "#f2f2f2",
  background: "#000000",
  cursor: "#00ff00",
  cursorAccent: "#000000",
  selectionBackground: "#414453",
  selectionForeground: "#ffffff",
  ...MAC_ANSI_COLORS
};
const MAC_BASIC_THEME = {
  foreground: "#000000",
  background: "#ffffff",
  cursor: "#0000ff",
  cursorAccent: "#ffffff",
  selectionBackground: "#b2d7ff",
  selectionForeground: "#000000",
  ...MAC_ANSI_COLORS
};
const MAC_PRO_FONT = {
  fontFamily: 'Monaco, "Courier New", monospace',
  fontSize: 12
};
const MAC_BASIC_FONT = {
  fontFamily: '"SF Mono", SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
  fontSize: 13
};
function getCurrentThemeName() {
  try {
    return localStorage.getItem("leo-theme") || "dark";
  } catch {
    return "dark";
  }
}
function getDefaultTheme() {
  return getCurrentThemeName() === "light" ? MAC_BASIC_THEME : MAC_PRO_THEME;
}
function getDefaultFont() {
  return getCurrentThemeName() === "light" ? MAC_BASIC_FONT : MAC_PRO_FONT;
}
export const defaultOptions = {
  xterm: {
    ...getDefaultFont(),
    cursorBlink: true,
    cursorStyle: "block",
    theme: getDefaultTheme()
  },
  wettyVoid: 0,
  wettyFitTerminal: true
};
export function loadOptions() {
  try {
    let options = _.isUndefined(localStorage.options) ? defaultOptions : JSON.parse(localStorage.options);
    if (!("xterm" in options)) {
      const xterm = options;
      options = defaultOptions;
      options.xterm = xterm;
    }
    if (options.xterm) {
      const font = getDefaultFont();
      options.xterm.theme = getDefaultTheme();
      options.xterm.fontFamily = font.fontFamily;
      options.xterm.fontSize = font.fontSize;
    }
    return options;
  } catch {
    return defaultOptions;
  }
}
