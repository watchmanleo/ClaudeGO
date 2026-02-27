<div align="center">

# 🚀 ClaudeGO

### Claude Code on the Go — 随时随地，掌控 AI 编程

[![GitHub stars](https://img.shields.io/github/stars/watchmanleo/ClaudeGO?style=social)](https://github.com/watchmanleo/ClaudeGO)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

[English](#english) | [中文](#中文)

<img src="docs/terminal.png" alt="ClaudeGO Screenshot" width="600">

</div>

---

<a name="english"></a>
## 🌍 English

### Why ClaudeGO?

**Anthropic just released the official Claude Code mobile app** — and that's great news! But if you're like us, you might want:

- 🔒 **Full control** over your data and environment
- 🖥️ **Your own server** with your own configurations
- 🌐 **No geo-restrictions** — access from anywhere
- 💰 **Use your own API key** — no subscription required
- 🔧 **Customization** — tweak it however you want

**ClaudeGO is your self-hosted alternative.** Deploy it on your Linux server, and access Claude Code from any device — phone, tablet, or computer — with a seamless, mobile-optimized experience.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 📱 **Mobile-First Design** | Virtual arrow keys, touch scrolling, keyboard-aware layout |
| 🔄 **Session Persistence** | tmux integration — switch devices without losing context |
| 🎨 **Theme Support** | Dark (Mac Terminal Pro) / Light (Mac Terminal Basic) |
| ⚡ **Auto-Launch** | Automatically starts Claude Code after login |
| 🌐 **Cross-Platform** | Works on any device with a modern browser |
| 🔐 **Self-Hosted** | Your server, your data, your rules |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/watchmanleo/ClaudeGO.git
cd ClaudeGO

# One-line install (checks dependencies automatically)
./install.sh

# Start the server
./start.sh
```

Then open `http://your-server-ip:3000` in your browser.

### 📋 Requirements

- Node.js >= 18.0.0
- Linux/Unix server
- SSH service
- tmux (recommended)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed

### 🛠️ Configuration

Environment variables:
```bash
PORT=3000                    # Server port
SSHHOST=localhost            # SSH host
SSHPORT=22                   # SSH port
```

Or edit `conf/config.json5` for advanced settings.

### 🔒 Security Recommendations

1. **Use HTTPS** — Set up Nginx reverse proxy with SSL
2. **Firewall** — Restrict access to trusted IPs
3. **Strong passwords** — Use secure Linux user credentials

---

<a name="中文"></a>
## 🇨🇳 中文

### 为什么选择 ClaudeGO？

**Anthropic 刚刚发布了官方的 Claude Code 手机端** —— 这是个好消息！但如果你和我们一样，可能还需要：

- 🔒 **完全掌控** 自己的数据和环境
- 🖥️ **自己的服务器**，自己的配置
- 🌐 **无地域限制** —— 随时随地访问
- 💰 **使用自己的 API Key** —— 无需订阅
- 🔧 **自由定制** —— 想怎么改就怎么改

**ClaudeGO 是你的私有化替代方案。** 部署在你的 Linux 服务器上，从任何设备 —— 手机、平板、电脑 —— 访问 Claude Code，享受专为移动端优化的流畅体验。

### ✨ 核心特性

| 特性 | 说明 |
|------|------|
| 📱 **移动端优先** | 虚拟方向键、触摸滚动、键盘自适应布局 |
| 🔄 **会话保持** | tmux 集成 —— 换设备不丢上下文 |
| 🎨 **主题切换** | 深色 (Mac Terminal Pro) / 浅色 (Mac Terminal Basic) |
| ⚡ **自动启动** | 登录后自动启动 Claude Code |
| 🌐 **跨平台** | 任何现代浏览器都能用 |
| 🔐 **私有部署** | 你的服务器，你的数据，你做主 |

### 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/watchmanleo/ClaudeGO.git
cd ClaudeGO

# 一键安装（自动检查依赖）
./install.sh

# 启动服务
./start.sh
```

然后在浏览器打开 `http://你的服务器IP:3000`。

### 📋 环境要求

- Node.js >= 18.0.0
- Linux/Unix 服务器
- SSH 服务
- tmux（推荐）
- 已安装 [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)

### 🛠️ 配置说明

环境变量：
```bash
PORT=3000                    # 服务端口
SSHHOST=localhost            # SSH 主机
SSHPORT=22                   # SSH 端口
```

或编辑 `conf/config.json5` 进行高级配置。

### 🔒 安全建议

1. **使用 HTTPS** —— 配置 Nginx 反向代理 + SSL 证书
2. **防火墙** —— 限制可访问的 IP
3. **强密码** —— 使用安全的 Linux 用户密码

---

<div align="center">

## 🤝 Contributing

PRs welcome! Feel free to open issues or submit pull requests.

欢迎贡献代码！可以提 Issue 或 PR。

## 📄 License

MIT License — Use it however you want.

## 💖 Acknowledgments

Built on [WeTTY](https://github.com/butlerx/wetty). Thanks to all contributors!

基于 [WeTTY](https://github.com/butlerx/wetty) 开发，感谢所有贡献者！

---

**If this project helps you, please give it a ⭐!**

**如果这个项目对你有帮助，请给个 ⭐ 支持一下！**

<br>

Made with ❤️ by [Leo](mailto:qq6699609@hotmail.com)

</div>
