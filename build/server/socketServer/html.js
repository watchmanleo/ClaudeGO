import { isDev } from '../../shared/env.js';
const jsFiles = isDev ? ['dev', 'wetty'] : ['wetty'];
const cssFiles = ['styles', 'options', 'overlay', 'terminal'];
const render = (_title, favicon, css, js, configUrl) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link rel="icon" type="image/x-icon" href="${favicon}">
    <title>ClaudeGO - Claude Code on the go</title>
    <style>
      /* Mac Terminal Pro (Dark) - Default */
      :root {
        --theme-bg: #000000;
        --theme-fg: #f2f2f2;
        --theme-cursor: #4d4d4d;
        --theme-selection: #414453;
        --theme-overlay-bg: rgba(0, 0, 0, 0.85);
        --theme-overlay-text: #ffffff;
        --theme-button-bg: #333333;
        --theme-button-text: #ffffff;
        --theme-button-border: #555555;
      }
      /* Mac Terminal Basic (Light) */
      :root[data-theme="light"] {
        --theme-bg: #ffffff;
        --theme-fg: #000000;
        --theme-cursor: #7f7f7f;
        --theme-selection: #b2d7ff;
        --theme-overlay-bg: rgba(255, 255, 255, 0.9);
        --theme-overlay-text: #000000;
        --theme-button-bg: #f0f0f0;
        --theme-button-text: #000000;
        --theme-button-border: #cccccc;
      }
      /* Prevent flash on load */
      html, body {
        background-color: var(--theme-bg);
        color: var(--theme-fg);
      }
      /* Welcome screen styles */
      #welcome-screen {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--theme-bg);
        color: var(--theme-fg);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: Monaco, "SF Mono", Menlo, "Courier New", monospace;
        transition: opacity 0.65s ease-out;
      }
      #welcome-screen.fade-out {
        opacity: 0;
        pointer-events: none;
      }
      #welcome-ascii {
        font-size: 10px;
        line-height: 1.2;
        margin: 0;
        padding: 20px;
        text-align: center;
        white-space: pre;
        overflow: hidden;
        animation: fadeInScale 1.04s ease-out;
      }
      #welcome-text {
        text-align: center;
        margin-top: 30px;
        animation: fadeInUp 1.04s ease-out 0.39s both;
      }
      #welcome-text p {
        margin: 10px 0;
        font-size: 16px;
      }
      #welcome-text .welcome-subtitle {
        font-size: 14px;
        opacity: 0.7;
      }
      #welcome-version {
        position: absolute;
        bottom: 20px;
        right: 20px;
        font-size: 11px;
        opacity: 0.5;
        animation: fadeIn 1s ease-out 0.5s both;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 0.5;
        }
      }
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Mobile responsive */
      @media (max-width: 768px) {
        #welcome-ascii {
          font-size: 6px;
          padding: 10px;
        }
        #welcome-text p {
          font-size: 14px;
        }
        #welcome-text .welcome-subtitle {
          font-size: 12px;
        }
      }
      @media (max-width: 480px) {
        #welcome-ascii {
          font-size: 4px;
          padding: 5px;
        }
        #welcome-text p {
          font-size: 12px;
        }
        #welcome-text .welcome-subtitle {
          font-size: 11px;
        }
        #welcome-version {
          font-size: 9px;
          bottom: 10px;
          right: 10px;
        }
      }
      /* Login Modal Styles */
      #login-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.02);
        backdrop-filter: blur(1px);
        -webkit-backdrop-filter: blur(1px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 998;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
        animation: fadeIn 0.3s ease-out;
        transition: align-items 0.3s ease-out, padding-top 0.3s ease-out;
      }
      :root[data-theme="light"] #login-modal {
        background: rgba(255, 255, 255, 0.02);
      }
      #login-modal.show {
        display: flex;
      }
      #login-modal.keyboard-visible {
        align-items: flex-start !important;
        padding-top: 10vh;
      }
      #login-modal.show {
        display: flex;
      }
      #login-box {
        background: rgba(28, 28, 30, 0.92);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        padding: 24px;
        width: 90%;
        max-width: 340px;
        position: relative;
        animation: slideUp 0.4s ease-out;
        color: #ffffff;
      }
      :root[data-theme="light"] #login-box {
        background: rgba(242, 242, 247, 0.92);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        color: #000000;
      }
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      #login-close {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(120, 120, 128, 0.18);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.6);
        transition: all 0.2s;
        font-weight: 300;
      }
      #login-close:hover {
        background: rgba(120, 120, 128, 0.28);
      }
      :root[data-theme="light"] #login-close {
        background: rgba(120, 120, 128, 0.16);
        color: rgba(0, 0, 0, 0.5);
      }
      :root[data-theme="light"] #login-close:hover {
        background: rgba(120, 120, 128, 0.24);
      }
      #login-slogan {
        text-align: center;
        margin-bottom: 24px;
        margin-top: 8px;
        font-size: 17px;
        font-weight: 600;
        color: #ffffff;
        min-height: 24px;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
        letter-spacing: -0.4px;
      }
      :root[data-theme="light"] #login-slogan {
        color: #000000;
      }
      #login-slogan-text {
        display: inline;
      }
      #login-cursor {
        display: inline-block;
        width: 2px;
        height: 17px;
        background: #ffffff;
        margin-left: 2px;
        animation: blink 1s infinite;
        vertical-align: middle;
      }
      :root[data-theme="light"] #login-cursor {
        background: #000000;
      }
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      .login-input-container {
        background: rgba(118, 118, 128, 0.12);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 16px;
      }
      :root[data-theme="light"] .login-input-container {
        background: rgba(118, 118, 128, 0.12);
      }
      .login-input-group {
        position: relative;
      }
      .login-input-group:not(:last-child) {
        border-bottom: 0.5px solid rgba(60, 60, 67, 0.18);
      }
      :root[data-theme="light"] .login-input-group:not(:last-child) {
        border-bottom: 0.5px solid rgba(60, 60, 67, 0.29);
      }
      .login-input-group input {
        width: 100%;
        padding: 11px 16px;
        border: none;
        background: transparent;
        font-size: 17px;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        letter-spacing: -0.4px;
      }
      :root[data-theme="light"] .login-input-group input {
        color: #000000;
      }
      .login-input-group input:focus {
        outline: none;
      }
      .login-input-group input::placeholder {
        color: rgba(235, 235, 245, 0.3);
        font-weight: 400;
      }
      :root[data-theme="light"] .login-input-group input::placeholder {
        color: rgba(60, 60, 67, 0.3);
      }
      #login-button {
        width: 100%;
        padding: 13px;
        background: rgba(120, 120, 128, 0.18);
        color: rgba(255, 255, 255, 0.3);
        border: none;
        border-radius: 10px;
        font-size: 17px;
        font-weight: 600;
        cursor: not-allowed;
        transition: all 0.2s;
        margin-top: 0;
        letter-spacing: -0.4px;
      }
      :root[data-theme="light"] #login-button {
        background: rgba(120, 120, 128, 0.16);
        color: rgba(60, 60, 67, 0.3);
      }
      #login-button.active {
        background: #007AFF;
        color: #ffffff;
        cursor: pointer;
      }
      :root[data-theme="light"] #login-button.active {
        background: #007AFF;
        color: #ffffff;
      }
      #login-button.active:hover {
        background: #0051D5;
      }
      #login-button.active:active {
        opacity: 0.8;
      }
      #login-error {
        color: #FF453A;
        font-size: 13px;
        margin-top: 8px;
        margin-bottom: 8px;
        text-align: center;
        display: none;
        font-weight: 400;
      }
      :root[data-theme="light"] #login-error {
        color: #FF3B30;
      }
      #login-loading {
        text-align: center;
        font-size: 15px;
        color: #007AFF;
        margin-top: 20px;
        display: none;
        font-family: Monaco, "SF Mono", Menlo, monospace;
        position: relative;
        padding-bottom: 50px;
      }
      #login-loading-cursor {
        display: inline-block;
        width: 2px;
        height: 16px;
        background: #007AFF;
        margin-left: 2px;
        animation: blink 1s infinite;
        vertical-align: middle;
      }
      #retry-claude-button {
        position: absolute;
        bottom: 0;
        right: 0;
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 0;
        transition: color 0.2s;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        text-decoration: underline;
      }
      :root[data-theme="light"] #retry-claude-button {
        color: rgba(0, 0, 0, 0.5);
      }
      #retry-claude-button:hover {
        color: rgba(255, 255, 255, 0.8);
      }
      :root[data-theme="light"] #retry-claude-button:hover {
        color: rgba(0, 0, 0, 0.8);
      }
      #retry-claude-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      #login-button-loading {
        display: none;
        font-size: 15px;
        font-weight: 400;
        letter-spacing: 0;
      }
      /* Responsive */
      @media (max-width: 768px) {
        #login-box {
          max-width: 90%;
        }
      }
      @media (max-width: 480px) {
        #login-box {
          padding: 20px;
        }
        #login-slogan {
          font-size: 16px;
        }
      }
      /* Orientation support */
      @media (orientation: landscape) and (max-height: 600px) {
        #login-box {
          padding: 20px;
          max-height: 90vh;
          overflow-y: auto;
        }
        #login-slogan {
          margin-bottom: 16px;
          font-size: 16px;
        }
        .login-input-container {
          margin-bottom: 12px;
        }
      }
    </style>
    <script>
      // Apply theme immediately to prevent flash
      (function() {
        var savedTheme = localStorage.getItem('leo-theme') || 'dark';
        if (savedTheme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        }
      })();
    </script>
    ${css.map(file => `<link rel="stylesheet" href="${file}" />`).join('\n    ')}
  </head>
  <body>
    <div id="welcome-screen">
      <pre id="welcome-ascii">
 ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗     █���████╗ ██████╗ ██████╗ ███████╗
██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║     ██║     ███████║██║   ██║██║  ██║█████╗      ██║     ██║   ██║██║  ██║█████╗
██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝      ██║     ██║   ██║██║  ██║██╔══╝
╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗    ╚██████╗╚██████╔╝██████╔╝███████╗
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝
      </pre>
      <div id="welcome-text">
        <p>欢迎使用 ClaudeGO 移动终端</p>
        <p class="welcome-subtitle">正在连接...</p>
      </div>
      <div id="welcome-version">v0.9.5 开源版，by Leo</div>
    </div>
    <div id="login-modal">
      <div id="login-box">
        <button id="login-close">×</button>
        <div id="login-slogan">
          ClaudeGO: <span id="login-slogan-text"></span><span id="login-cursor"></span>
        </div>
        <div id="login-form">
          <div class="login-input-container">
            <div class="login-input-group">
              <input type="text" id="username-input" placeholder="Linux 用户名" autocomplete="username" autocapitalize="off" />
            </div>
            <div class="login-input-group" id="password-group" style="display: none;">
              <input type="password" id="password-input" placeholder="密码" autocomplete="current-password" />
            </div>
          </div>
          <div id="login-error"></div>
          <button id="login-button">
            <span id="login-button-text">继续</span>
            <span id="login-button-loading">验证登录中...</span>
          </button>
        </div>
        <div id="login-loading" style="display: none;">
          正在进入 Claude Code...<span id="login-loading-cursor"></span>
          <button id="retry-claude-button">长时间还未看到Claude界面？</button>
        </div>
      </div>
    </div>
    <button id="theme-toggle"></button>
    <button id="about-button">About</button>
    <div id="about-panel">
      <h3 style="font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">ClaudeGO v0.9.5（开源版）</h3>
      <p style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
        本产品核心实现了 Claude Code 随时随地、跨端可用，允许用户在个人 Linux 服务器上部署后，通过手机、pad、电脑登录其 Claude Code，实现多设备无缝切换、继续任务。
      </p>
      <p style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; margin: 0 0 16px 0; font-size: 14px; line-height: 1.6;">
        若您感觉本项目对您有帮助，欢迎打赏支持～
      </p>
      <div style="display: flex; justify-content: center; margin-bottom: 16px;">
        <div style="text-align: center;">
          <div style="background: #fff; padding: 8px; border-radius: 8px; display: inline-block;">
            <img src="/assets/payment/wechat-9.9.png" alt="微信收款码" style="width: 150px; height: 150px; display: block;">
          </div>
          <p style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; margin: 8px 0 0 0; font-size: 12px; color: #666;">微信</p>
        </div>
      </div>
      <div style="font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif; padding: 12px 0 0 0; border-top: 1px solid var(--theme-border); font-size: 12px; color: var(--theme-fg); opacity: 0.7; text-align: center;">
        by Leo &nbsp;|&nbsp; qq6699609@hotmail.com
      </div>
    </div>
    <div id="overlay">
      <div class="error">
        <div id="msg"></div>
        <input type="button" onclick="location.reload();" value="重新连接" />
      </div>
    </div>
    <div id="options">
      <a class="toggler"
         href="#"
         alt="Toggle options"
         style="display: none;"
       ><i class="fas fa-cogs"></i></a>
      <iframe class="editor" src="${configUrl}"></iframe>
    </div>
    <div id="terminal"></div>
    ${js
    .map(file => `<script type="module" src="${file}"></script>`)
    .join('\n    ')}
    <script>
      // Mac Terminal Theme Definitions
      var MAC_PRO_THEME = {
        foreground: '#f2f2f2',
        background: '#000000',
        cursor: '#4d4d4d',
        cursorAccent: '#000000',
        selectionBackground: '#414453',
        selectionForeground: '#ffffff',
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
        brightWhite: '#e5e5e5'
      };

      var MAC_BASIC_THEME = {
        foreground: '#000000',
        background: '#ffffff',
        cursor: '#7f7f7f',
        cursorAccent: '#ffffff',
        selectionBackground: '#b2d7ff',
        selectionForeground: '#000000',
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
        brightWhite: '#e5e5e5'
      };

      // Mac Terminal Font Settings
      // Pro (Dark): Monaco 10 -> scaled to 12 for web
      // Basic (Light): SF Mono Regular 11 -> scaled to 13 for web
      var MAC_PRO_FONT = {
        fontFamily: 'Monaco, "Courier New", monospace',
        fontSize: 12
      };
      var MAC_BASIC_FONT = {
        fontFamily: '"SF Mono", SFMono-Regular, Menlo, Monaco, "Courier New", monospace',
        fontSize: 13
      };

      // Theme toggle functionality
      function getCurrentTheme() {
        return localStorage.getItem('leo-theme') || 'dark';
      }

      function updateButtonText() {
        var btn = document.getElementById('theme-toggle');
        var theme = getCurrentTheme();
        btn.textContent = theme === 'dark' ? '浅色' : '深色';
      }

      function applyThemeToTerminal(themeName) {
        if (window.wetty_term) {
          var themeObj = themeName === 'light' ? MAC_BASIC_THEME : MAC_PRO_THEME;
          var fontObj = themeName === 'light' ? MAC_BASIC_FONT : MAC_PRO_FONT;
          window.wetty_term.options.theme = themeObj;
          window.wetty_term.options.fontFamily = fontObj.fontFamily;
          window.wetty_term.options.fontSize = fontObj.fontSize;
          // Force refresh and fit the terminal display
          window.wetty_term.refresh(0, window.wetty_term.rows - 1);
          if (window.wetty_term.fitAddon) {
            window.wetty_term.fitAddon.fit();
          }
        }
      }

      function toggleTheme() {
        var currentTheme = getCurrentTheme();
        var newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        // Save to localStorage
        localStorage.setItem('leo-theme', newTheme);

        // Update CSS custom properties
        if (newTheme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }

        // Update button text
        updateButtonText();

        // Apply theme to terminal
        applyThemeToTerminal(newTheme);
      }

      // Initialize on DOM ready
      document.addEventListener('DOMContentLoaded', function() {
        updateButtonText();

        // Add click handler for theme toggle
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Add click handler for about button
        var aboutButton = document.getElementById('about-button');
        var aboutPanel = document.getElementById('about-panel');
        var isAboutOpen = false;

        aboutButton.addEventListener('click', function(e) {
          e.stopPropagation();
          isAboutOpen = !isAboutOpen;
          if (isAboutOpen) {
            aboutPanel.classList.add('show');
          } else {
            aboutPanel.classList.remove('show');
          }
        });

        // Close panels when clicking outside
        document.addEventListener('click', function(e) {
          if (isAboutOpen && !aboutPanel.contains(e.target) && e.target !== aboutButton) {
            isAboutOpen = false;
            aboutPanel.classList.remove('show');
          }
        });

        // Apply theme to terminal once it's ready
        var checkTerminal = setInterval(function() {
          if (window.wetty_term) {
            applyThemeToTerminal(getCurrentTheme());
            clearInterval(checkTerminal);
          }
        }, 100);

        // Clear interval after 10 seconds to prevent memory leak
        setTimeout(function() {
          clearInterval(checkTerminal);
        }, 10000);

        // Hide welcome screen when terminal receives first data
        var welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen && window.wetty_socket) {
          var dataReceived = false;
          window.wetty_socket.on('data', function() {
            if (!dataReceived) {
              dataReceived = true;
              setTimeout(function() {
                welcomeScreen.classList.add('fade-out');
                setTimeout(function() {
                  welcomeScreen.style.display = 'none';
                }, 650);
              }, 650);
            }
          });
        }

        // Login Modal Logic
        (function() {
          var loginModal = document.getElementById('login-modal');
          var loginBox = document.getElementById('login-box');
          var loginClose = document.getElementById('login-close');
          var loginForm = document.getElementById('login-form');
          var loginLoading = document.getElementById('login-loading');
          var usernameInput = document.getElementById('username-input');
          var passwordInput = document.getElementById('password-input');
          var passwordGroup = document.getElementById('password-group');
          var passwordToggle = document.getElementById('password-toggle');
          var loginButton = document.getElementById('login-button');
          var loginButtonText = document.getElementById('login-button-text');
          var loginButtonLoading = document.getElementById('login-button-loading');
          var loginError = document.getElementById('login-error');
          var sloganText = document.getElementById('login-slogan-text');
          var retryClaudeButton = document.getElementById('retry-claude-button');

          var slogans = [
            'Claude Code on the GO',
            '离开电脑，让AI为你继续',
            '随时随地，验证你的灵感',
            '想到就能继续，不用等回电脑前',
            '在所有设备同步，同一任务随时接力',
            '在任何设备，继续刚才的那一步',
            '一个Claude会话，所有设备实时同步',
            '换设备，不换上下文'
          ];
          var currentSloganIndex = 0;
          var currentText = '';
          var isTyping = false;
          var isDeleting = false;
          var typingSpeed = 90;
          var deletingSpeed = 40;
          var pauseAfterTyping = 800;
          var sloganInterval = null;
          var loginState = 'username'; // 'username', 'password', 'logging-in', 'failed', 'success'
          var welcomeAnimationComplete = false;

          // Load saved username
          var savedUsername = localStorage.getItem('claudego-username');
          if (savedUsername) {
            usernameInput.value = savedUsername;
            updateButtonState();
          }

          // Update button state based on input
          function updateButtonState() {
            if (loginState === 'username') {
              if (usernameInput.value.trim()) {
                loginButton.classList.add('active');
                loginButton.disabled = false;
              } else {
                loginButton.classList.remove('active');
                loginButton.disabled = true;
              }
            } else if (loginState === 'password') {
              if (passwordInput.value) {
                loginButton.classList.add('active');
                loginButton.disabled = false;
              } else {
                loginButton.classList.remove('active');
                loginButton.disabled = true;
              }
            }
          }

          // Input event listeners
          usernameInput.addEventListener('input', updateButtonState);
          passwordInput.addEventListener('input', updateButtonState);

          // Keyboard visibility detection for mobile
          if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
              var keyboardHeight = window.innerHeight - window.visualViewport.height;
              if (keyboardHeight > 150) {
                // Keyboard is visible
                loginModal.classList.add('keyboard-visible');
              } else {
                // Keyboard is hidden
                loginModal.classList.remove('keyboard-visible');
              }
            });
          }

          // Focus events - only add keyboard-visible class when actually typing
          var keyboardTimeout = null;
          var isInitialFocus = true; // Flag to ignore first auto-focus

          usernameInput.addEventListener('focus', function() {
            // Ignore the initial auto-focus from showLoginModal
            if (isInitialFocus) {
              isInitialFocus = false;
              return;
            }

            keyboardTimeout = setTimeout(function() {
              // Only add class if visualViewport didn't already handle it
              if (!loginModal.classList.contains('keyboard-visible')) {
                loginModal.classList.add('keyboard-visible');
              }
            }, 400);
          });

          passwordInput.addEventListener('focus', function() {
            keyboardTimeout = setTimeout(function() {
              if (!loginModal.classList.contains('keyboard-visible')) {
                loginModal.classList.add('keyboard-visible');
              }
            }, 400);
          });

          var removeKeyboardClass = function() {
            if (keyboardTimeout) {
              clearTimeout(keyboardTimeout);
            }
            setTimeout(function() {
              if (document.activeElement !== passwordInput && document.activeElement !== usernameInput) {
                loginModal.classList.remove('keyboard-visible');
              }
            }, 100);
          };

          usernameInput.addEventListener('blur', removeKeyboardClass);
          passwordInput.addEventListener('blur', removeKeyboardClass);

          // Typewriter effect for slogan
          function typeSlogan() {
            var targetSlogan = slogans[currentSloganIndex];

            if (!isDeleting && currentText.length < targetSlogan.length) {
              // Typing
              currentText = targetSlogan.substring(0, currentText.length + 1);
              sloganText.textContent = currentText;
              setTimeout(typeSlogan, typingSpeed);
            } else if (!isDeleting && currentText.length === targetSlogan.length) {
              // Pause after typing
              setTimeout(function() {
                isDeleting = true;
                typeSlogan();
              }, pauseAfterTyping);
            } else if (isDeleting && currentText.length > 0) {
              // Deleting
              currentText = currentText.substring(0, currentText.length - 1);
              sloganText.textContent = currentText;
              setTimeout(typeSlogan, deletingSpeed);
            } else if (isDeleting && currentText.length === 0) {
              // Move to next slogan
              isDeleting = false;
              currentSloganIndex = (currentSloganIndex + 1) % slogans.length;
              setTimeout(typeSlogan, 200);
            }
          }

          // Show login modal
          function showLoginModal() {
            loginModal.classList.add('show');
            // Don't auto-focus to avoid triggering keyboard-visible class
            // Let user click to focus
            setTimeout(function() {
              usernameInput.focus();
            }, 100);
            // Start typewriter effect
            currentSloganIndex = 0;
            currentText = '';
            isDeleting = false;
            typeSlogan();
          }

          // Hide login modal
          function hideLoginModal() {
            loginModal.classList.remove('show');
            resetLoginForm();
          }

          // Reset login form
          function resetLoginForm() {
            loginState = 'username';
            passwordGroup.style.display = 'none';
            passwordInput.value = '';
            loginError.style.display = 'none';
            loginForm.style.display = 'block';
            loginLoading.style.display = 'none';
            loginButtonText.style.display = 'inline';
            loginButtonLoading.style.display = 'none';
            loginButtonText.textContent = '继续';
            updateButtonState();
          }

          // Show error message
          function showError(message) {
            loginError.textContent = message;
            loginError.style.display = 'block';
          }

          // Close button
          loginClose.addEventListener('click', function() {
            hideLoginModal();
          });

          // Retry Claude button
          retryClaudeButton.addEventListener('click', function() {
            console.log('🔄 User requested retry Claude launch');

            // Get username from saved value
            var savedUsername = localStorage.getItem('claudego-username');
            if (!savedUsername) {
              console.log('❌ No saved username found');
              return;
            }

            var sessionName = savedUsername + '-1';

            // Show feedback
            retryClaudeButton.textContent = '正在重试...';
            retryClaudeButton.disabled = true;

            // Execute the launch sequence again
            setTimeout(function() {
              console.log('📤 Retry: Sending tmux attach/create command');
              window.wetty_socket.emit('input', 'tmux attach -t ' + sessionName + ' 2>/dev/null || tmux new -s ' + sessionName + '\\r');
            }, 500);

            setTimeout(function() {
              console.log('📤 Retry: Sending claude command');
              window.wetty_socket.emit('input', 'claude\\r');
            }, 3500);

            setTimeout(function() {
              console.log('✅ Retry sequence completed');
              retryClaudeButton.textContent = '长时间还未看到Claude界面？';
              retryClaudeButton.disabled = false;
            }, 4000);

            // Hide modal after 6 seconds
            setTimeout(function() {
              hideLoginModal();
            }, 6000);
          });

          // Click outside to close
          loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
              hideLoginModal();
            }
          });

          // Prevent clicks inside box from closing
          loginBox.addEventListener('click', function(e) {
            e.stopPropagation();
          });

          // Handle username submission
          function submitUsername() {
            var username = usernameInput.value.trim();
            if (!username) {
              showError('请输入用户名');
              return;
            }

            loginError.style.display = 'none';
            loginState = 'password';
            passwordGroup.style.display = 'block';
            passwordInput.focus();
            loginButtonText.textContent = '继续';
            loginButton.classList.remove('active');
            loginButton.disabled = true;

            // Save username
            localStorage.setItem('claudego-username', username);
          }

          // Handle login submission
          function submitLogin() {
            var username = usernameInput.value.trim();
            var password = passwordInput.value;

            if (!username || !password) {
              showError('请输入用户名和密码');
              return;
            }

            // Immediately show loading state for instant feedback
            loginError.style.display = 'none';
            loginButton.disabled = true;
            loginButtonText.style.display = 'none';
            loginButtonLoading.style.display = 'inline';
            loginState = 'logging-in';

            // Send username to SSH
            if (window.wetty_socket) {
              console.log('📤 Sending username to SSH:', username);
              window.wetty_socket.emit('input', username + '\\r');

              // Wait for password prompt, then send password
              setTimeout(function() {
                console.log('📤 Sending password to SSH');
                window.wetty_socket.emit('input', password + '\\r');

                // Show "正在进入 Claude Code..." immediately after sending password
                setTimeout(function() {
                  loginForm.style.display = 'none';
                  loginLoading.style.display = 'block';
                }, 500);

                // Monitor for login success or failure
                var loginCheckTimeout = setTimeout(function() {
                  // Timeout - keep showing loading state
                  console.log('⏱ Login timeout - keeping loading state visible');
                  // Don't hide modal, let user see "正在进入 Claude Code..." until actually in Claude
                }, 12000);

                // Listen for SSH data to detect login result
                var loginDataHandler = function(data) {
                  // Check for login failure
                  if (data.match(/incorrect|failed|denied|invalid|permission denied/i)) {
                    clearTimeout(loginCheckTimeout);
                    window.wetty_socket.off('data', loginDataHandler);
                    console.log('❌ Login failed');

                    // Show error and change button to refresh
                    loginLoading.style.display = 'none';
                    loginForm.style.display = 'block';
                    loginState = 'failed';
                    passwordGroup.style.display = 'none';
                    passwordInput.value = '';
                    loginButtonText.style.display = 'inline';
                    loginButtonLoading.style.display = 'none';
                    loginButtonText.textContent = '刷新页面，重新进入';
                    showError('账号或密码错误，请刷新页面重试');
                    usernameInput.value = '';
                    usernameInput.disabled = true;
                    loginButton.disabled = false;
                    loginButton.classList.add('active');
                    return;
                  }

                  // Check for successful login (prompt appears)
                  if (data.match(/([a-zA-Z0-9_-]+)@[a-zA-Z0-9_.-]+[:\\$#~]/)) {
                    clearTimeout(loginCheckTimeout);
                    window.wetty_socket.off('data', loginDataHandler);
                    console.log('✅ Login successful!');

                    // Trigger auto-launch from login modal as backup
                    var savedUsername = localStorage.getItem('claudego-username');
                    if (savedUsername) {
                      var sessionName = savedUsername + '-1';
                      console.log('🚀 Login modal: Triggering auto-launch as backup');

                      setTimeout(function() {
                        console.log('📤 Login modal: Sending tmux command');
                        window.wetty_socket.emit('input', 'tmux attach -t ' + sessionName + ' 2>/dev/null || tmux new -s ' + sessionName + '\\r');
                      }, 3000);

                      setTimeout(function() {
                        console.log('📤 Login modal: Sending claude command');
                        window.wetty_socket.emit('input', 'claude\\r');
                      }, 6000);
                    }

                    // Keep showing "正在进入 Claude Code..." until Claude actually starts
                    setTimeout(function() {
                      var checkClaudeInterval = setInterval(function() {
                        // This will be handled by the general data listener
                      }, 1000);

                      // Hide modal after 10 seconds regardless
                      setTimeout(function() {
                        clearInterval(checkClaudeInterval);
                        hideLoginModal();
                      }, 10000);
                    }, 1000);
                  }
                };

                window.wetty_socket.on('data', loginDataHandler);
              }, 1800);
            }
          }

          // Login button click
          loginButton.addEventListener('click', function() {
            if (loginState === 'username') {
              submitUsername();
            } else if (loginState === 'password') {
              submitLogin();
            } else if (loginState === 'failed') {
              // Refresh page
              location.reload();
            }
          });

          // Enter key handling
          usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (loginState === 'username') {
                submitUsername();
              }
            }
          });

          passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (loginState === 'password') {
                submitLogin();
              }
            }
          });

          // Detect SSH connection and show login modal
          // Strategy: Show modal as soon as welcome animation completes
          if (window.wetty_socket) {
            var loginPromptDetected = false;
            var welcomeAnimationTimer = null;

            // Start welcome animation timer immediately
            welcomeAnimationTimer = setTimeout(function() {
              welcomeAnimationComplete = true;
              console.log('✅ Welcome animation complete');

              // If SSH is already connected, show modal immediately
              if (loginPromptDetected) {
                console.log('📋 Showing login modal (SSH already connected)');
                showLoginModalAfterWelcome();
              }
            }, 1650); // Animation duration (650ms fade) + small buffer

            function showLoginModalAfterWelcome() {
              if (welcomeScreen && welcomeScreen.style.display !== 'none') {
                welcomeScreen.classList.add('fade-out');
                setTimeout(function() {
                  welcomeScreen.style.display = 'none';
                  showLoginModal();
                }, 650);
              } else {
                showLoginModal();
              }
            }

            window.wetty_socket.on('data', function(data) {
              // Detect SSH connection established (login prompt)
              if (!loginPromptDetected && data.match(/login:|username:|User:/i)) {
                loginPromptDetected = true;
                console.log('🔐 SSH login prompt detected');

                if (welcomeAnimationComplete) {
                  // Animation already complete, show modal immediately
                  console.log('📋 Showing login modal immediately');
                  showLoginModalAfterWelcome();
                } else {
                  // Animation still playing, will show when timer completes
                  console.log('⏳ Waiting for animation to complete');
                }
              }
            });
          }

          // Expose for debugging
          window.loginModal = {
            show: showLoginModal,
            hide: hideLoginModal
          };
        })();
      });
    </script>
  </body>
</html>`;
export const html = (base, title) => (_req, res) => {
    res.send(render(title, `${base}/favicon.ico`, cssFiles.map(css => `${base}/assets/css/${css}.css`), jsFiles.map(js => `${base}/client/${js}.js`), `${base}/assets/xterm_config/index.html`));
};
//# sourceMappingURL=html.js.map