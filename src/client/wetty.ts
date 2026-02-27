import { dom, library } from '@fortawesome/fontawesome-svg-core';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import _ from 'lodash';

import { disconnect } from './wetty/disconnect';
import { overlay } from './wetty/disconnect/elements';
import { verifyPrompt } from './wetty/disconnect/verify';
import { FileDownloader } from './wetty/download';
import { FlowControlClient } from './wetty/flowcontrol';
import { mobileKeyboard } from './wetty/mobile';
import { socket } from './wetty/socket';
import { terminal, Term } from './wetty/term';

// Setup for fontawesome
library.add(faCogs);
dom.watch();

// Expose socket globally for virtual arrow keys
(window as any).wetty_socket = socket;

// Auto-launch tmux and claude after login - Redesigned for reliability
function setupAutoLaunch(): void {
  let dataBuffer = '';
  let loginDetected = false;
  let usernameForSession = '';
  let checkCount = 0;
  const maxChecks = 400; // Max 40 seconds for login detection
  let autoLaunchExecuted = false;

  const checkAndLaunch = (data: string) => {
    dataBuffer += data;
    checkCount++;

    // Keep buffer manageable
    if (dataBuffer.length > 4000) {
      dataBuffer = dataBuffer.slice(-4000);
    }

    // Stop checking after max attempts
    if (checkCount > maxChecks) {
      console.log('⏱ Auto-launch: Login detection timeout');
      socket.off('data', checkAndLaunch);
      return;
    }

    // Only detect login once, then use reliable time-based execution
    if (!loginDetected && !autoLaunchExecuted) {
      // Multiple prompt patterns to catch different shells and states
      let loginMatch = null;

      // Pattern 1: Standard prompt with path
      loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:~[\$#]\s*$/);

      // Pattern 2: Prompt without path
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+[\$#]\s*$/);
      }

      // Pattern 3: Prompt with tilde
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:~[\$#]/);
      }

      // Pattern 4: Simple prompt
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/^([a-zA-Z0-9_-]+)[\$#]\s*$/m);
      }

      // Pattern 5: Prompt with any path
      if (!loginMatch) {
        loginMatch = dataBuffer.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+:[^\$#]+[\$#]\s*$/);
      }

      // Pattern 6: Last login message (indicates successful login)
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
        socket.off('data', checkAndLaunch);

        console.log('✅ Login detected! Username:', usernameForSession);
        console.log('🚀 Starting reliable auto-launch sequence...');

        const sessionName = `${usernameForSession}-1`;

        // REDESIGNED: More reliable time-based execution with longer delays
        // This ensures commands are executed after shell is fully ready

        // Step 1: Wait for shell to stabilize (3 seconds)
        setTimeout(() => {
          console.log('📤 Step 1: Sending tmux attach/create command');
          socket.emit('input', `tmux attach -t ${sessionName} 2>/dev/null || tmux new -s ${sessionName}\r`);
        }, 3000);

        // Step 2: Wait for tmux to fully initialize (6 seconds total)
        setTimeout(() => {
          console.log('📤 Step 2: Sending claude command');
          socket.emit('input', 'claude\r');
        }, 6000);

        // Step 3: Completion log
        setTimeout(() => {
          console.log('✅ Auto-launch sequence completed!');
        }, 6500);

        return;
      }
    }
  };

  socket.on('data', checkAndLaunch);

  // Cleanup after timeout
  setTimeout(() => {
    socket.off('data', checkAndLaunch);
    console.log('🧹 Auto-launch: Cleanup after 40s');
  }, 40000);
}

function onResize(term: Term): () => void {
  return function resize() {
    term.resizeTerm();
  };
}

socket.on('connect', () => {
  const term = terminal(socket);
  if (_.isUndefined(term)) return;

  if (!_.isNull(overlay)) overlay.style.display = 'none';
  window.addEventListener('beforeunload', verifyPrompt, false);
  window.addEventListener('resize', onResize(term), false);

  term.resizeTerm();
  term.focus();
  mobileKeyboard();
  const fileDownloader = new FileDownloader();
  const fcClient = new FlowControlClient();

  // Start auto-launch immediately on connect
  setupAutoLaunch();

  term.onData((data: string) => {
    socket.emit('input', data);
  });
  term.onResize((size: { cols: number; rows: number }) => {
    socket.emit('resize', size);
  });
  socket
    .on('data', (data: string) => {
      const remainingData = fileDownloader.buffer(data);
      const downloadLength = data.length - remainingData.length;
      if (downloadLength && fcClient.needsCommit(downloadLength)) {
        socket.emit('commit', fcClient.ackBytes);
      }
      if (remainingData) {
        if (fcClient.needsCommit(remainingData.length)) {
          term.write(remainingData, () =>
            socket.emit('commit', fcClient.ackBytes),
          );
        } else {
          term.write(remainingData);
        }
      }
    })
    .on('logout', disconnect)
    .on('disconnect', disconnect)
    .on('error', (err: string | null) => {
      if (err) disconnect(err);
    });
});
