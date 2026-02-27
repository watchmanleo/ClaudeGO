import _ from 'lodash';

// Detect if user is on mobile device
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || (window.innerWidth <= 768);
}

// Enhanced IME support with smart input handling
export function setupIMESupport(): void {
  if (!isMobileDevice()) return;

  // Create a semi-transparent input field that appears only when needed
  const inputWrapper = document.createElement('div');
  inputWrapper.id = 'mobile-input-wrapper';
  inputWrapper.innerHTML = `
    <textarea id="mobile-input"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      enterkeyhint="send"
      inputmode="text"
      placeholder="在此输入命令..."
    ></textarea>
  `;

  const style = document.createElement('style');
  style.id = 'mobile-input-style';
  style.textContent = `
    #mobile-input-wrapper {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: var(--theme-bg, #000);
      padding: 8px;
      display: block;
      border-top: 1px solid var(--theme-border, rgba(128,128,128,0.3));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    #mobile-input {
      width: 100%;
      height: 40px;
      padding: 10px 12px;
      font-size: 16px;
      font-family: Monaco, "SF Mono", Menlo, monospace;
      border: 1px solid var(--theme-border, rgba(128,128,128,0.5));
      border-radius: 8px;
      background: var(--theme-input-bg, rgba(255,255,255,0.1));
      color: var(--theme-fg, #fff);
      outline: none;
      resize: none;
      line-height: 1.2;
      transition: all 0.2s ease;
    }
    #mobile-input:focus {
      border-color: var(--theme-border, rgba(128,128,128,0.7));
      background: var(--theme-input-focus-bg, rgba(255,255,255,0.15));
    }
    #mobile-input::placeholder {
      color: var(--theme-placeholder, rgba(255,255,255,0.5));
      font-style: italic;
    }
    /* Light theme overrides */
    :root[data-theme="light"] #mobile-input-wrapper {
      background: var(--theme-bg, #fff);
      border-top-color: var(--theme-border, rgba(0,0,0,0.2));
    }
    :root[data-theme="light"] #mobile-input {
      background: var(--theme-input-bg, rgba(0,0,0,0.05));
      border-color: var(--theme-border, rgba(0,0,0,0.3));
      color: #000 !important;
    }
    :root[data-theme="light"] #mobile-input:focus {
      background: var(--theme-input-focus-bg, rgba(0,0,0,0.08));
    }
    :root[data-theme="light"] #mobile-input::placeholder {
      color: rgba(0,0,0,0.5) !important;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(inputWrapper);

  const input = document.getElementById('mobile-input') as HTMLTextAreaElement;
  let isComposing = false;
  let justFinishedComposing = false;
  let inputBuffer = '';
  let inputTimeout: ReturnType<typeof setTimeout> | null = null;

  // Enhanced input buffer handling
  const flushInput = () => {
    if (inputBuffer && !isComposing) {
      const socket = (window as any).wetty_socket;
      if (socket) {
        socket.emit('input', inputBuffer);
        // Scroll to bottom after sending input
        setTimeout(() => {
          if (window.wetty_term) {
            window.wetty_term.scrollToBottom();
          }
        }, 10);
      }
      inputBuffer = '';
    }
  };

  // Handle IME composition events
  input.addEventListener('compositionstart', () => {
    isComposing = true;
    justFinishedComposing = false;
  });

  input.addEventListener('compositionend', (e) => {
    isComposing = false;
    justFinishedComposing = true;
    const text = (e as CompositionEvent).data;
    if (text) {
      const socket = (window as any).wetty_socket;
      if (socket) {
        socket.emit('input', text);
        // Scroll to bottom after sending input
        setTimeout(() => {
          if (window.wetty_term) {
            window.wetty_term.scrollToBottom();
          }
        }, 10);
      }
    }
    input.value = '';

    // Reset the flag after a short delay to allow the input event to be skipped
    setTimeout(() => {
      justFinishedComposing = false;
    }, 10);
  });

  // Enhanced input handling with better third-party keyboard support
  input.addEventListener('input', (e) => {
    // Skip if we're composing or just finished composing (to prevent double input)
    if (isComposing || justFinishedComposing) return;

    const inputEvent = e as InputEvent;

    // Handle different input types
    // Note: deleteContentBackward is now handled in keydown to prevent double deletion
    if (inputEvent.inputType === 'deleteContentBackward') {
      // Skip - handled in keydown event
      return;
    }

    if (inputEvent.inputType === 'insertText' && inputEvent.data) {
      inputBuffer += inputEvent.data;

      // Clear existing timeout and set new one
      if (inputTimeout) {
        clearTimeout(inputTimeout);
      }
      // Use longer timeout for better third-party keyboard support
      inputTimeout = setTimeout(flushInput, 50);
    } else if (inputEvent.inputType === 'insertLineBreak') {
      // Don't flush here - let keydown handle Enter key
      return;
    }
  });

  // Handle special keys
  input.addEventListener('keydown', (e) => {
    if (isComposing) return;

    const socket = (window as any).wetty_socket;
    if (!socket) return;

    let handled = true;
    let shouldScroll = false;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\r');
        input.value = '';
        shouldScroll = true;
        break;
      case 'Backspace':
        // Prevent default and handle manually to avoid double deletion
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x7f');
        input.value = '';
        shouldScroll = true;
        break;
      case 'Tab':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\t');
        input.value = '';
        shouldScroll = true;
        break;
      case 'Escape':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x1b');
        input.value = '';
        break;
      case 'ArrowUp':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x1b[A');
        shouldScroll = true;
        break;
      case 'ArrowDown':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x1b[B');
        shouldScroll = true;
        break;
      case 'ArrowRight':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x1b[C');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        flushInput();
        socket.emit('input', '\x1b[D');
        break;
      default:
        handled = false;
    }

    if (handled && input.value) {
      input.value = '';
    }

    // Scroll to bottom after key actions
    if (shouldScroll) {
      setTimeout(() => {
        if (window.wetty_term) {
          window.wetty_term.scrollToBottom();
        }
      }, 10);
    }
  });

  // Show input wrapper when terminal is tapped
  const terminalEl = document.getElementById('terminal');
  if (terminalEl) {
    terminalEl.addEventListener('touchend', (e) => {
      // Don't activate if tapping on arrow keys
      if ((e.target as HTMLElement).closest('#virtual-arrows')) return;
      if ((e.target as HTMLElement).closest('#copy-selection-btn')) return;

      // Just focus the input, no need to show wrapper (it's always visible)
      setTimeout(() => {
        input.focus();
        scrollTerminalToBottom();
      }, 100);
    });
  }

  // Keep input wrapper always visible on mobile
  // No blur handler needed - wrapper stays visible

  // Track if user is manually scrolling
  let userIsScrolling = false;
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  // Completely disable auto-scroll when user is viewing history
  // Only auto-scroll if user hasn't scrolled in the last 3 seconds
  if (window.wetty_term) {
    const originalWrite = window.wetty_term.write.bind(window.wetty_term);
    window.wetty_term.write = function(data: string | Uint8Array, callback?: () => void) {
      const result = originalWrite(data, callback);
      // Disable auto-scroll completely - let user control scrolling
      // This prevents interference with manual scrolling in Claude
      return result;
    };

    // Expose userIsScrolling flag globally for touch scrolling to use
    (window as any).wetty_userIsScrolling = {
      get: () => userIsScrolling,
      set: (value: boolean) => {
        userIsScrolling = value;
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        // Reset after 3 seconds of no scrolling
        if (value) {
          scrollTimeout = setTimeout(() => {
            userIsScrolling = false;
          }, 3000);
        }
      }
    };
  }
}

// Enable touch scrolling for terminal history (like tmux mouse mode)
export function setupTouchScrolling(): void {
  if (!isMobileDevice()) return;

  const terminalEl = document.getElementById('terminal');
  if (!terminalEl) return;

  let touchStartY = 0;
  let touchStartX = 0;
  let isScrolling = false;
  let scrollVelocity = 0;
  let lastTouchY = 0;
  let lastTouchTime = 0;
  let totalScrolled = 0;
  let scrollInterval: number | null = null;

  terminalEl.addEventListener('touchstart', (e) => {
    // Don't interfere with arrow keys or input
    if ((e.target as HTMLElement).closest('#virtual-arrows')) return;
    if ((e.target as HTMLElement).closest('#mobile-input-wrapper')) return;

    const touch = e.touches[0];
    touchStartY = touch.clientY;
    touchStartX = touch.clientX;
    lastTouchY = touch.clientY;
    lastTouchTime = Date.now();
    isScrolling = false;
    scrollVelocity = 0;
    totalScrolled = 0;

    // Clear any existing scroll interval
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  }, { passive: true });

  terminalEl.addEventListener('touchmove', (e) => {
    if ((e.target as HTMLElement).closest('#virtual-arrows')) return;
    if ((e.target as HTMLElement).closest('#mobile-input-wrapper')) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY;
    const deltaX = touch.clientX - touchStartX;
    const now = Date.now();
    const timeDelta = now - lastTouchTime;

    // Determine if this is a vertical scroll
    if (!isScrolling && Math.abs(deltaY) > 5) {
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
        isScrolling = true;
        // Mark that user is manually scrolling
        if ((window as any).wetty_userIsScrolling) {
          (window as any).wetty_userIsScrolling.set(true);
        }
      }
    }

    if (isScrolling && window.wetty_term) {
      e.preventDefault();
      e.stopPropagation();

      // Calculate velocity for momentum scrolling
      if (timeDelta > 0) {
        scrollVelocity = (touch.clientY - lastTouchY) / timeDelta;
      }

      // Direct pixel-based scrolling - continuous smooth scrolling
      const pixelDelta = lastTouchY - touch.clientY;

      if (Math.abs(pixelDelta) > 0) {
        // Use continuous scrolling with smaller increments
        const scrollAmount = pixelDelta / 5; // 5 pixels per line for very high sensitivity

        // Scroll continuously, even fractional amounts
        if (Math.abs(scrollAmount) >= 0.3) {
          const lines = scrollAmount > 0 ? Math.ceil(scrollAmount) : Math.floor(scrollAmount);
          if (lines !== 0) {
            // Force scroll multiple times for smoother effect
            for (let i = 0; i < Math.abs(lines); i++) {
              window.wetty_term.scrollLines(lines > 0 ? 1 : -1);
            }
            totalScrolled += lines;
          }
        }
      }

      lastTouchY = touch.clientY;
      lastTouchTime = now;
    }
  }, { passive: false, capture: true });

  terminalEl.addEventListener('touchend', () => {
    // Apply momentum scrolling with better parameters
    if (isScrolling && Math.abs(scrollVelocity) > 0.2 && window.wetty_term) {
      let momentum = scrollVelocity * -250; // Very high multiplier
      const deceleration = 0.93; // Slower deceleration for longer scroll

      const applyMomentum = () => {
        if (Math.abs(momentum) > 0.2 && window.wetty_term) {
          const linesToScroll = Math.round(momentum / 5);
          if (linesToScroll !== 0) {
            window.wetty_term.scrollLines(linesToScroll);
          }
          momentum *= deceleration;
          requestAnimationFrame(applyMomentum);
        }
      };

      requestAnimationFrame(applyMomentum);
    }

    // Clear scroll interval
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }

    isScrolling = false;
  }, { passive: true, capture: true });
}

// Problem 2: Enable text selection and copy
export function setupTextSelection(): void {
  if (!isMobileDevice()) return;

  const style = document.createElement('style');
  style.id = 'text-selection-style';
  style.textContent = `
    /* Enable text selection in terminal */
    .xterm-screen {
      -webkit-user-select: text !important;
      user-select: text !important;
    }
    .xterm-rows {
      -webkit-user-select: text !important;
      user-select: text !important;
    }
    /* Selection highlight */
    .xterm .xterm-selection div {
      background-color: rgba(178, 215, 255, 0.5) !important;
    }
    /* Copy button */
    #copy-selection-btn {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2000;
      padding: 12px 24px;
      background: rgba(60, 60, 60, 0.95);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: none;
      cursor: pointer;
    }
    #copy-selection-btn.show {
      display: block;
    }
  `;
  document.head.appendChild(style);

  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.id = 'copy-selection-btn';
  copyBtn.textContent = '复制选中内容';
  document.body.appendChild(copyBtn);

  // Show copy button when text is selected
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      copyBtn.classList.add('show');
    } else {
      copyBtn.classList.remove('show');
    }
  });

  // Copy on button click
  copyBtn.addEventListener('click', async () => {
    const selection = window.getSelection();
    if (selection) {
      const text = selection.toString();
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          copyBtn.textContent = '复制选中内容';
          copyBtn.classList.remove('show');
          selection.removeAllRanges();
        }, 1000);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtn.textContent = '已复制!';
        setTimeout(() => {
          copyBtn.textContent = '复制选中内容';
          copyBtn.classList.remove('show');
        }, 1000);
      }
    }
  });

  // Also enable xterm's built-in selection
  if (window.wetty_term) {
    window.wetty_term.options.rightClickSelectsWord = true;
  }
}

// Problem 3: Better keyboard adaptation
function scrollTerminalToBottom(): void {
  if (window.wetty_term) {
    window.wetty_term.scrollToBottom();
  }
}

export function setupKeyboardAdaptation(): void {
  if (!isMobileDevice()) return;

  const arrows = document.getElementById('virtual-arrows');
  let initialHeight = window.innerHeight;
  let keyboardHeight = 0;

  // Add styles for keyboard adaptation
  const style = document.createElement('style');
  style.id = 'keyboard-adaptation-style';
  style.textContent = `
    :root {
      --keyboard-height: 0px;
      --input-wrapper-height: 56px;
      --safe-bottom: env(safe-area-inset-bottom, 0px);
    }
    html, body {
      height: 100%;
      overflow: hidden;
      position: fixed;
      width: 100%;
    }
    #terminal {
      position: fixed !important;
      top: 0;
      left: 0;
      right: 0;
      bottom: calc(var(--input-wrapper-height) + var(--safe-bottom));
      height: auto !important;
      overflow: hidden;
    }
    #terminal .xterm {
      height: 100% !important;
      padding-bottom: 40px;
    }
    #terminal .xterm-viewport {
      height: 100% !important;
    }
    #terminal .xterm-screen {
      padding-bottom: 40px;
    }
    body.keyboard-visible #terminal {
      bottom: calc(var(--keyboard-height) + var(--input-wrapper-height) + var(--safe-bottom));
    }
    body.keyboard-visible #mobile-input-wrapper {
      bottom: var(--keyboard-height);
    }
    body.keyboard-visible #virtual-arrows {
      bottom: calc(var(--keyboard-height) + var(--input-wrapper-height) + 8px);
    }
  `;

  if (!document.getElementById('keyboard-adaptation-style')) {
    document.head.appendChild(style);
  }

  // Use visualViewport API for accurate keyboard detection
  if (window.visualViewport) {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    let isKeyboardVisible = false;

    const updateLayout = () => {
      const viewport = window.visualViewport!;
      const currentHeight = viewport.height;
      const heightDiff = initialHeight - currentHeight;

      if (heightDiff > 100) {
        // Keyboard is visible
        if (!isKeyboardVisible) {
          isKeyboardVisible = true;
          keyboardHeight = heightDiff;
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);
          document.body.classList.add('keyboard-visible');
          arrows?.classList.add('keyboard-visible');

          // Refit terminal and scroll to bottom after layout update
          setTimeout(() => {
            if (window.wetty_term) {
              if (window.wetty_term.fitAddon) {
                window.wetty_term.fitAddon.fit();
              }
              window.wetty_term.scrollToBottom();
            }
          }, 100);
        } else {
          // Just update the height if keyboard is already visible
          keyboardHeight = heightDiff;
          document.documentElement.style.setProperty('--keyboard-height', `${keyboardHeight}px`);

          // Also refit when keyboard height changes
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }
          resizeTimeout = setTimeout(() => {
            if (window.wetty_term) {
              if (window.wetty_term.fitAddon) {
                window.wetty_term.fitAddon.fit();
              }
              window.wetty_term.scrollToBottom();
            }
          }, 100);
        }
      } else {
        // Keyboard is hidden
        if (isKeyboardVisible) {
          isKeyboardVisible = false;
          keyboardHeight = 0;
          document.documentElement.style.setProperty('--keyboard-height', '0px');
          document.body.classList.remove('keyboard-visible');
          arrows?.classList.remove('keyboard-visible');

          // Debounce the refit operation
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }
          resizeTimeout = setTimeout(() => {
            if (window.wetty_term && window.wetty_term.fitAddon) {
              window.wetty_term.fitAddon.fit();
            }
          }, 300);
        }
      }
    };

    window.visualViewport.addEventListener('resize', updateLayout);
    window.visualViewport.addEventListener('scroll', () => {
      // Keep page scrolled to top
      window.scrollTo(0, 0);
    });
  }

  // Update initial height on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      initialHeight = window.innerHeight;
    }, 500);
  });
}

// Create custom scrollbar for mobile
export function createCustomScrollbar(): void {
  if (!isMobileDevice()) return;

  const style = document.createElement('style');
  style.id = 'custom-scrollbar-style';
  style.textContent = `
    #custom-scrollbar {
      position: fixed;
      right: 0px;
      top: 50px;
      bottom: 70px;
      width: 50px;
      z-index: 999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      pointer-events: none;
      padding-right: 2px;
    }
    #scrollbar-track {
      width: 6px;
      height: 100%;
      background: rgba(128, 128, 128, 0.15);
      border-radius: 3px;
      position: relative;
      pointer-events: auto;
    }
    #scrollbar-thumb {
      width: 6px;
      min-height: 60px;
      background: rgba(128, 128, 128, 0.6);
      border-radius: 3px;
      position: absolute;
      top: 0;
      cursor: pointer;
      transition: width 0.2s ease, background 0.2s ease;
      pointer-events: auto;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    }
    #scrollbar-thumb:active {
      background: rgba(128, 128, 128, 0.8);
      width: 10px;
      margin-left: -2px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    }
    #scrollbar-thumb.dragging {
      background: rgba(128, 128, 128, 0.8);
      width: 10px;
      margin-left: -2px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
    }
    /* Light theme */
    :root[data-theme="light"] #scrollbar-track {
      background: rgba(0, 0, 0, 0.08);
    }
    :root[data-theme="light"] #scrollbar-thumb {
      background: rgba(0, 0, 0, 0.4);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    }
    :root[data-theme="light"] #scrollbar-thumb:active,
    :root[data-theme="light"] #scrollbar-thumb.dragging {
      background: rgba(0, 0, 0, 0.6);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
    }
  `;
  document.head.appendChild(style);

  const scrollbarContainer = document.createElement('div');
  scrollbarContainer.id = 'custom-scrollbar';
  scrollbarContainer.innerHTML = `
    <div id="scrollbar-track">
      <div id="scrollbar-thumb"></div>
    </div>
  `;
  document.body.appendChild(scrollbarContainer);

  const track = document.getElementById('scrollbar-track')!;
  const thumb = document.getElementById('scrollbar-thumb')!;

  let isDragging = false;
  let startY = 0;
  let startScrollTop = 0;

  function updateThumbPosition() {
    if (!window.wetty_term) return;

    const buffer = window.wetty_term.buffer;
    if (!buffer) return;

    const scrollTop = buffer.active.viewportY;
    const scrollHeight = buffer.active.baseY + window.wetty_term.rows;
    const clientHeight = window.wetty_term.rows;

    if (scrollHeight <= clientHeight) {
      thumb.style.display = 'none';
      return;
    }

    thumb.style.display = 'block';

    const trackHeight = track.clientHeight;
    const thumbHeight = Math.max(60, (clientHeight / scrollHeight) * trackHeight);
    const maxThumbTop = trackHeight - thumbHeight;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    const thumbTop = scrollPercentage * maxThumbTop;

    thumb.style.height = `${thumbHeight}px`;
    thumb.style.top = `${thumbTop}px`;
  }

  function handleDragStart(e: TouchEvent | MouseEvent) {
    isDragging = true;
    thumb.classList.add('dragging');

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY = clientY;

    const buffer = window.wetty_term?.buffer;
    if (buffer) {
      startScrollTop = buffer.active.viewportY;
    }

    e.preventDefault();
  }

  function handleDragMove(e: TouchEvent | MouseEvent) {
    if (!isDragging || !window.wetty_term) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY;

    const buffer = window.wetty_term.buffer;
    if (!buffer) return;

    const trackHeight = track.clientHeight;
    const thumbHeight = parseFloat(thumb.style.height);
    const maxThumbTop = trackHeight - thumbHeight;

    const scrollHeight = buffer.active.baseY + window.wetty_term.rows;
    const clientHeight = window.wetty_term.rows;
    const maxScroll = scrollHeight - clientHeight;

    const scrollDelta = (deltaY / maxThumbTop) * maxScroll;
    const newScroll = Math.max(0, Math.min(maxScroll, startScrollTop + scrollDelta));
    const linesToScroll = Math.round(newScroll - buffer.active.viewportY);

    if (linesToScroll !== 0) {
      window.wetty_term.scrollLines(linesToScroll);
    }

    e.preventDefault();
  }

  function handleDragEnd() {
    isDragging = false;
    thumb.classList.remove('dragging');
  }

  // Touch events
  thumb.addEventListener('touchstart', handleDragStart, { passive: false });
  document.addEventListener('touchmove', handleDragMove, { passive: false });
  document.addEventListener('touchend', handleDragEnd);

  // Mouse events for desktop testing
  thumb.addEventListener('mousedown', handleDragStart);
  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);

  // Track click to jump
  track.addEventListener('click', (e) => {
    if (!window.wetty_term) return;

    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = track.clientHeight;
    const percentage = clickY / trackHeight;

    const buffer = window.wetty_term.buffer;
    if (!buffer) return;

    const scrollHeight = buffer.active.baseY + window.wetty_term.rows;
    const clientHeight = window.wetty_term.rows;
    const maxScroll = scrollHeight - clientHeight;
    const targetScroll = percentage * maxScroll;
    const linesToScroll = Math.round(targetScroll - buffer.active.viewportY);

    if (linesToScroll !== 0) {
      window.wetty_term.scrollLines(linesToScroll);
    }
  });

  // Update thumb position periodically
  setInterval(updateThumbPosition, 100);

  // Initial update
  setTimeout(updateThumbPosition, 500);
}
export function createVirtualArrowKeys(): void {
  if (!isMobileDevice()) return;
  if (document.getElementById('virtual-arrows')) return;

  const container = document.createElement('div');
  container.id = 'virtual-arrows';
  container.innerHTML = `
    <div class="arrow-row">
      <button class="arrow-btn" data-key="up">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h5v8h6v-8h5z"/></svg>
      </button>
    </div>
    <div class="arrow-row middle">
      <button class="arrow-btn" data-key="left">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 12l8-8v5h8v6h-8v5z"/></svg>
      </button>
      <div class="arrow-spacer"></div>
      <button class="arrow-btn" data-key="right">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 12l-8 8v-5H4v-6h8V4z"/></svg>
      </button>
    </div>
    <div class="arrow-row">
      <button class="arrow-btn" data-key="down">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8h-5V4h-6v8H4z"/></svg>
      </button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #virtual-arrows {
      position: fixed;
      bottom: 20px;
      right: 15px;
      z-index: 1000;
      border-radius: 12px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      transition: all 0.3s ease;
    }

    /* Default/Dark theme styling */
    #virtual-arrows {
      background: rgba(60, 60, 60, 0.9);
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    #virtual-arrows .arrow-btn {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }

    #virtual-arrows .arrow-btn:active {
      background: rgba(255, 255, 255, 0.35);
    }

    /* Light theme styling - more subtle and transparent */
    :root[data-theme="light"] #virtual-arrows {
      background: rgba(240, 240, 240, 0.85) !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15) !important;
    }

    :root[data-theme="light"] #virtual-arrows .arrow-btn {
      background: rgba(0, 0, 0, 0.08) !important;
      color: #333 !important;
    }

    :root[data-theme="light"] #virtual-arrows .arrow-btn:active {
      background: rgba(0, 0, 0, 0.18) !important;
    }

    #virtual-arrows .arrow-row {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #virtual-arrows .arrow-row.middle {
      gap: 2px;
    }
    #virtual-arrows .arrow-spacer {
      width: 36px;
      height: 36px;
    }
    #virtual-arrows .arrow-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #virtual-arrows .arrow-btn svg {
      width: 18px;
      height: 18px;
    }
    @media (min-width: 769px) and (orientation: landscape) {
      #virtual-arrows { display: none; }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(container);

  const keyCodes: Record<string, string> = {
    up: '\x1b[A',
    down: '\x1b[B',
    right: '\x1b[C',
    left: '\x1b[D'
  };

  container.querySelectorAll('.arrow-btn').forEach(btn => {
    const key = btn.getAttribute('data-key');
    if (!key) return;

    const sendKey = () => {
      const socket = (window as any).wetty_socket;
      if (socket) {
        socket.emit('input', keyCodes[key]);
      }
    };

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendKey();
    }, { passive: false });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sendKey();
    });
  });
}

export function mobileKeyboard(): void {
  const [screen] = Array.from(document.getElementsByClassName('xterm-screen'));
  if (_.isNull(screen)) return;

  // Don't make xterm-screen contenteditable - we use our own input
  screen.setAttribute('spellcheck', 'false');
  screen.setAttribute('autocorrect', 'off');
  screen.setAttribute('autocomplete', 'off');
  screen.setAttribute('autocapitalize', 'off');

  // Setup all mobile features
  createCustomScrollbar();
  createVirtualArrowKeys();
  setupKeyboardAdaptation();
  setupIMESupport();
  setupTextSelection();
  setupTouchScrolling();
}
