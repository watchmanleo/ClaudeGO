const DEFAULT_BELL_SOUND =
  'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwNAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVNoMPMjAAAA0gAAABEVFGmgqK////9bP/6XCykxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';

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

// Mac Terminal Pro Theme (Dark) - DEFAULT
const MAC_PRO_THEME = {
  foreground: '#f2f2f2',
  background: '#000000',
  cursor: '#4d4d4d',
  cursorAccent: '#000000',
  selectionBackground: '#414453',
  selectionForeground: '#ffffff',
  ...MAC_ANSI_COLORS,
};

// Mac Terminal Basic Theme (Light)
const MAC_BASIC_THEME = {
  foreground: '#000000',
  background: '#ffffff',
  cursor: '#7f7f7f',
  cursorAccent: '#ffffff',
  selectionBackground: '#b2d7ff',
  selectionForeground: '#000000',
  ...MAC_ANSI_COLORS,
};

// Export themes for external access
window.MAC_PRO_THEME = MAC_PRO_THEME;
window.MAC_BASIC_THEME = MAC_BASIC_THEME;

// Get saved theme or default to 'dark' (Pro)
const savedTheme = localStorage.getItem('leo-theme') || 'dark';
const currentTheme = savedTheme === 'light' ? MAC_BASIC_THEME : MAC_PRO_THEME;

window.loadOptions({
  wettyFitTerminal: true,
  wettyVoid: 0,

  xterm: {
    cols: 80,
    rows: 24,
    cursorBlink: false,
    cursorStyle: 'block',
    cursorWidth: 1,
    bellSound: DEFAULT_BELL_SOUND,
    bellStyle: 'none',
    drawBoldTextInBrightColors: true,
    fastScrollModifier: 'alt',
    fastScrollSensitivity: 5,
    fontFamily: 'Monaco, "SF Mono", Menlo, "Courier New", monospace',
    fontSize: 14,
    fontWeight: 'normal',
    fontWeightBold: 'bold',
    lineHeight: 1.0,
    linkTooltipHoverDuration: 500,
    letterSpacing: 0,
    logLevel: 'info',
    scrollback: 1000,
    scrollSensitivity: 1,
    screenReaderMode: false,
    macOptionIsMeta: false,
    macOptionClickForcesSelection: false,
    minimumContrastRatio: 1,
    disableStdin: false,
    allowProposedApi: true,
    allowTransparency: false,
    tabStopWidth: 8,
    rightClickSelectsWord: false,
    rendererType: 'canvas',
    windowOptions: {},
    windowsMode: false,
    wordSeparator: ' ()[]{}\',"`',
    convertEol: false,
    termName: 'xterm',
    cancelEvents: false,

    theme: currentTheme,
  },
});
