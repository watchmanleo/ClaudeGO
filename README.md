# ClaudeGO v0.9.5 (开源版)

**Claude Code on the go** - 随时随地使用 Claude Code

by Leo | qq6699609@hotmail.com

## 项目介绍

ClaudeGO 是一个专为移动端优化的 Web SSH 终端应用，核心实现了 Claude Code 随时随地、跨端���用。

允许用户在个人 Linux 服务器上部署后，通过手机、pad、电脑登录其 Claude Code，实现多设备无缝切换、继续任务。

### 主要特性

#### 移动端优化
- ✅ 虚拟方向键 - 精确控制光标位置
- ✅ 自定义滚动条 - 流畅查看历史记录
- ✅ 触摸滑动支持 - 自然的滚动体验
- ✅ 键盘自适应 - 智能避免遮挡
- ✅ 响应式设计 - 适配各种屏幕尺寸

#### 主题系统
- **Dark 模式（默认）**：Mac Terminal Pro 配色
- **Light 模式**：Mac Terminal Basic 配色
- 一键切换，设置持久化

#### 智能自动化
- 登录后自动创建/附加 tmux 会话
- 自动启动 Claude Code
- 会话保持，支持锁屏、切换应用后恢复

#### 用户体验
- 欢迎动画
- About 信息面板
- 中文界面
- 流畅的交互动画

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- Linux/Unix 系统
- SSH 服务
- tmux（推荐，用于会话持久化）
- Claude Code CLI（需单独安装）

### 一键安装

```bash
# 克隆项目
git clone https://github.com/your-username/ClaudeGO.git
cd ClaudeGO

# 运行安装脚本（自动检查并安装依赖）
./install.sh
```

安装脚本会自动：
- 检查 Node.js 版本（需要 >= 18）
- 检查并安装 SSH 服务
- 检查并安装 tmux
- 安装 npm 依赖
- 构建项目

### 手动安装

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 启动服务
npm start
# 或指定端口
PORT=3000 npm start
```

### 访问应用

```
http://your-server-ip:3000/
```

使用你的 Linux 系统用户名和密码登录。

## 配置说明

### 环境变量

```bash
PORT=3000                                    # 服务端口
SSHHOST=localhost                            # SSH主机
SSHPORT=22                                   # SSH端口
BASE=/                                       # URL基础路径
TITLE="ClaudeGO - Claude Code on the go"    # 网站标题
```

### 配置文件

编辑 `conf/config.json5` 进行详细配置：

```json5
{
  ssh: {
    host: 'localhost',
    auth: 'password',
    port: 22,
  },
  server: {
    base: '/',
    port: 3000,
    host: '0.0.0.0',
    title: 'ClaudeGO - Claude Code on the go',
  },
}
```

## 部署为系统服务

### 使用 systemd

```bash
# 1. 复制服务文件
sudo cp conf/claudego.service /etc/systemd/system/

# 2. 编辑服务文件，修改路径
sudo nano /etc/systemd/system/claudego.service

# 3. 重载 systemd
sudo systemctl daemon-reload

# 4. 启用并启动服务
sudo systemctl enable claudego
sudo systemctl start claudego

# 5. 查看状态
sudo systemctl status claudego
```

### 使用启动脚本

```bash
# 启动（默认端口 3000）
./start.sh

# 指定端口
./start.sh 8080
```

## 技术架构

### 前端
- xterm.js - 终端模拟器
- Socket.IO Client - WebSocket 通信
- TypeScript - 类型安全
- SCSS - 样式管理

### 后端
- Node.js + Express - Web 服务器
- Socket.IO - WebSocket 服务
- node-pty - 伪终端
- TypeScript - 类型安全

### 构建工具
- Snowpack - 快速构建
- Sass - CSS 预处理
- ESLint - 代码检查

## 安全建议

1. **使用 HTTPS**：建议通过 Nginx 反向代理并配置 SSL 证书
2. **防火墙**：限制访问端口，只允许信任的 IP
3. **强密码**：确保 Linux 用户使用强密码
4. **定期更新**：保持系统和依赖包更新

### Nginx 反向代理示例

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 致谢

本项目基于 [WeTTY](https://github.com/butlerx/wetty) 开发，感谢原作者 Cian Butler 及所有贡献者的工作。

## 版本信息

- **当前版本**：v0.9.5 (开源版)
- **开发者**：Leo
- **联系方式**：qq6699609@hotmail.com

## 许可证

MIT License
