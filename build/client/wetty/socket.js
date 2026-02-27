import io from "../../web_modules/pkg/socket.io-client.js";
export const trim = (str) => str.replace(/\/*$/, "");
const socketBase = trim(window.location.pathname).replace(/ssh\/[^/]+$/, "");
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
export const socket = io(window.location.origin, {
  path: `${trim(socketBase)}/socket.io`,
  transports: isMobile ? ["polling", "websocket"] : ["websocket", "polling"],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1e3,
  reconnectionDelayMax: 3e4,
  timeout: 6e4
});
let lastActivity = Date.now();
const ACTIVITY_TIMEOUT = 30 * 60 * 1e3;
function updateActivity() {
  lastActivity = Date.now();
}
["mousedown", "mousemove", "keydown", "touchstart", "scroll"].forEach((event) => {
  document.addEventListener(event, updateActivity, {passive: true});
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    updateActivity();
    if (!socket.connected) {
      socket.connect();
    }
  }
});
window.addEventListener("online", () => {
  updateActivity();
  if (!socket.connected) {
    socket.connect();
  }
});
setInterval(() => {
  if (socket.connected && Date.now() - lastActivity < ACTIVITY_TIMEOUT) {
    socket.emit("activity");
  }
}, 3e4);
