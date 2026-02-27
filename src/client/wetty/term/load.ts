import _ from 'lodash';
import type { XTerm, Options } from './options';

// Mac Terminal ANSI Colors (shared between Basic and Pro)
const MAC_ANSI_COLORS = {
  black: '#000000',
  red: '#990000',
  green: '#00a600',
  yellow: '#999900',
  blue: '#0000b2',
  magenta: '#b200b2',
  cyan: '#00a6b2',
  white: '#bfbfbf',
  brightBlack: '#666666',
  brightRed: '#e50000',
  brightGreen: '#00d900',
  brightYellow: '#e5e500',
  brightBlue: '#0000ff',
  brightMagenta: '#e500e5',
  brightCyan: '#00e5e5',
  brightWhite: '#e5e5e5',
};

// Mac Terminal Pro Theme (Dark) - Uses Monaco 10
const MAC_PRO_THEME = {
  foreground: '#f2f2f2',
  background: '#000000',
  cursor: '#00ff00',  // Bright green cursor for visibility
  cursorAccent: '#000000',
  selectionBackground: '#414453',
  selectionForeground: '#ffffff',
  ...MAC_ANSI_COLORS,
};

// Mac Terminal Basic Theme (Light) - Uses SF Mono Regular 11
const MAC_BASIC_THEME = {
  foreground: '#000000',
  background: '#ffffff',
  cursor: '#0000ff',  // Blue cursor for visibility in light mode
  cursorAccent: '#ffffff',
  selectionBackground: '#b2d7ff',
  selectionForeground: '#000000',
  ...MAC_ANSI_COLORS,
};

// Font settings matching Mac Terminal
// Pro (Dark): Monaco 10
// Basic (Light): SF Mono Regular 11
const MAC_PRO_FONT = {
  fontFamily: 'Monaco, "Courier New", monospace',
  fontSize: 12,  // Scaled up from Mac's 10pt for web readability
};

const MAC_BASIC_FONT = {
  fontFamily: '"SF Mono", SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
  fontSize: 13,  // Scaled up from Mac's 11pt for web readability
};

// Get the current theme name
function getCurrentThemeName(): string {
  try {
    return localStorage.getItem('leo-theme') || 'dark';
  } catch {
    return 'dark';
  }
}

// Get the appropriate theme based on localStorage setting
function getDefaultTheme() {
  return getCurrentThemeName() === 'light' ? MAC_BASIC_THEME : MAC_PRO_THEME;
}

// Get the appropriate font based on localStorage setting
function getDefaultFont() {
  return getCurrentThemeName() === 'light' ? MAC_BASIC_FONT : MAC_PRO_FONT;
}

export const defaultOptions: Options = {
  xterm: {
    ...getDefaultFont(),
    cursorBlink: true,  // Enable cursor blinking for better visibility
    cursorStyle: 'block',
    theme: getDefaultTheme(),
  },
  wettyVoid: 0,
  wettyFitTerminal: true,
};

export function loadOptions(): Options {
  try {
    let options = _.isUndefined(localStorage.options)
      ? defaultOptions
      : JSON.parse(localStorage.options);
    // Convert old options to new options
    if (!('xterm' in options)) {
      const xterm = options;
      options = defaultOptions;
      options.xterm = xterm as unknown as XTerm;
    }
    // Always apply the current theme and font based on wetty-theme setting
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
