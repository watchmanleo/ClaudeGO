import io from 'socket.io-client';

export const trim = (str: string): string => str.replace(/\/*$/, '');

const socketBase = trim(window.location.pathname).replace(/ssh\/[^/]+$/, '');

// Detect mobile device for transport optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

export const socket = io(window.location.origin, {
  path: `${trim(socketBase)}/socket.io`,
  // Mobile browsers should start with polling then upgrade to websocket
  // to avoid initial connection failures
  transports: isMobile ? ['polling', 'websocket'] : ['websocket', 'polling'],
  upgrade: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  timeout: 60000,
});

// Activity tracking for keep-alive
let lastActivity = Date.now();
const ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function updateActivity() {
  lastActivity = Date.now();
}

// Track user activity
['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(event => {
  document.addEventListener(event, updateActivity, { passive: true });
});

// Handle page visibility changes (mobile app switching)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    updateActivity();
    if (!socket.connected) {
      socket.connect();
    }
  }
});

// Handle network state changes
window.addEventListener('online', () => {
  updateActivity();
  if (!socket.connected) {
    socket.connect();
  }
});

// Keep-alive ping when user is active
setInterval(() => {
  if (socket.connected && (Date.now() - lastActivity) < ACTIVITY_TIMEOUT) {
    socket.emit('activity');
  }
}, 30000);
