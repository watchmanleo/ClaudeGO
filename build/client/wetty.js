import {dom, library} from "../web_modules/pkg/@fortawesome/fontawesome-svg-core.js";
import {faCogs} from "../web_modules/pkg/@fortawesome/free-solid-svg-icons.js";
import _ from "../web_modules/pkg/lodash.js";
import {disconnect} from "./wetty/disconnect.js";
import {overlay} from "./wetty/disconnect/elements.js";
import {verifyPrompt} from "./wetty/disconnect/verify.js";
import {FileDownloader} from "./wetty/download.js";
import {FlowControlClient} from "./wetty/flowcontrol.js";
import {mobileKeyboard} from "./wetty/mobile.js";
import {socket} from "./wetty/socket.js";
import {terminal} from "./wetty/term.js";
library.add(faCogs);
dom.watch();
window.wetty_socket = socket;
function setupAutoLaunch() {
  let dataBuffer = "";
  let loginDetected = false;
  let usernameForSession = "";
  let checkCount = 0;
  const maxChecks = 400;
  let autoLaunchExecuted = false;
  const checkAndLaunch = (data) => {
    dataBuffer += data;
    checkCount++;
    if (dataBuffer.length > 4e3) {
      dataBuffer = dataBuffer.slice(-4e3);
    }
    if (checkCount > maxChecks) {
      console.log("⏱ Auto-launch: Login detection timeout");
      socket.off("data", checkAndLaunch);
      return;
    }
    if (!loginDetected && !autoLaunchExecuted) {
      let loginMatch = null;
      loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:~[\$#]\s*$/);
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+[\$#]\s*$/);
      }
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:~[\$#]/);
      }
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/^([a-zA-Z0-9_-]+)[\$#]\s*$/m);
      }
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:[^\$#]+[\$#]\s*$/);
      }
      if (!loginMatch) {
        const lastLoginMatch = dataBuffer.match(/Last login:.*\n.*@.*:~[\$#]/);
        if (lastLoginMatch) {
          const promptMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@/);
          if (promptMatch) {
            loginMatch = [lastLoginMatch[0], promptMatch[1]];
          }
        }
      }
      if (loginMatch && loginMatch[1]) {
        loginDetected = true;
        autoLaunchExecuted = true;
        usernameForSession = loginMatch[1];
        socket.off("data", checkAndLaunch);
        console.log("✅ Login detected! Username:", usernameForSession);
        console.log("🚀 Starting reliable auto-launch sequence...");
        const sessionName = `${usernameForSession}-1`;
        setTimeout(() => {
          console.log("📤 Step 1: Sending tmux attach/create command");
          socket.emit("input", `tmux attach -t ${sessionName} 2>/dev/null || tmux new -s ${sessionName}\r`);
        }, 3e3);
        setTimeout(() => {
          console.log("📤 Step 2: Sending claude command");
          socket.emit("input", "claude\r");
        }, 6e3);
        setTimeout(() => {
          console.log("✅ Auto-launch sequence completed!");
        }, 6500);
        return;
      }
    }
  };
  socket.on("data", checkAndLaunch);
  setTimeout(() => {
    socket.off("data", checkAndLaunch);
    console.log("🧹 Auto-launch: Cleanup after 40s");
  }, 4e4);
}
function onResize(term) {
  return function resize() {
    term.resizeTerm();
  };
}
socket.on("connect", () => {
  const term = terminal(socket);
  if (_.isUndefined(term))
    return;
  if (!_.isNull(overlay))
    overlay.style.display = "none";
  window.addEventListener("beforeunload", verifyPrompt, false);
  window.addEventListener("resize", onResize(term), false);
  term.resizeTerm();
  term.focus();
  mobileKeyboard();
  const fileDownloader = new FileDownloader();
  const fcClient = new FlowControlClient();
  setupAutoLaunch();
  term.onData((data) => {
    socket.emit("input", data);
  });
  term.onResize((size) => {
    socket.emit("resize", size);
  });
  socket.on("data", (data) => {
    const remainingData = fileDownloader.buffer(data);
    const downloadLength = data.length - remainingData.length;
    if (downloadLength && fcClient.needsCommit(downloadLength)) {
      socket.emit("commit", fcClient.ackBytes);
    }
    if (remainingData) {
      if (fcClient.needsCommit(remainingData.length)) {
        term.write(remainingData, () => socket.emit("commit", fcClient.ackBytes));
      } else {
        term.write(remainingData);
      }
    }
  }).on("logout", disconnect).on("disconnect", disconnect).on("error", (err) => {
    if (err)
      disconnect(err);
  });
});
