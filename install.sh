#!/bin/bash
# ClaudeGO Installation Script
# This script checks and installs all required dependencies

set -e

echo "========================================"
echo "  ClaudeGO v0.9.5 Installation Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. It's recommended to run as a regular user with sudo privileges."
fi

echo "Checking system requirements..."
echo ""

# 1. Check OS
echo "1. Operating System"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    print_status "Detected: $NAME $VERSION_ID"
else
    print_warning "Could not detect OS version"
fi

# 2. Check Node.js
echo ""
echo "2. Node.js (required: >= 18.0.0)"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//')
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_status "Node.js $NODE_VERSION installed"
    else
        print_error "Node.js $NODE_VERSION is too old (need >= 18.0.0)"
        NEED_NODE=true
    fi
else
    print_error "Node.js not found"
    NEED_NODE=true
fi

# 3. Check npm
echo ""
echo "3. npm"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_status "npm $NPM_VERSION installed"
else
    print_error "npm not found"
    NEED_NPM=true
fi

# 4. Check SSH server
echo ""
echo "4. SSH Server"
if systemctl is-active --quiet sshd 2>/dev/null || systemctl is-active --quiet ssh 2>/dev/null; then
    print_status "SSH server is running"
elif pgrep -x "sshd" > /dev/null; then
    print_status "SSH server is running"
else
    print_warning "SSH server not detected"
    NEED_SSH=true
fi

# 5. Check tmux
echo ""
echo "5. tmux (for session persistence)"
if command -v tmux &> /dev/null; then
    TMUX_VERSION=$(tmux -V | cut -d' ' -f2)
    print_status "tmux $TMUX_VERSION installed"
else
    print_warning "tmux not found (recommended for session persistence)"
    NEED_TMUX=true
fi

# 6. Check Claude Code CLI
echo ""
echo "6. Claude Code CLI"
if command -v claude &> /dev/null; then
    print_status "Claude Code CLI installed"
else
    print_warning "Claude Code CLI not found"
    print_warning "Install it from: https://docs.anthropic.com/en/docs/claude-code"
    NEED_CLAUDE=true
fi

echo ""
echo "========================================"
echo "  Installation"
echo "========================================"
echo ""

# Install missing dependencies
if [ "$NEED_NODE" = true ] || [ "$NEED_NPM" = true ]; then
    echo "Installing Node.js 20.x..."
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_status "Node.js installed"
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
        print_status "Node.js installed"
    else
        print_error "Could not install Node.js automatically. Please install manually."
        exit 1
    fi
fi

if [ "$NEED_SSH" = true ]; then
    echo "Installing OpenSSH server..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y openssh-server
        sudo systemctl enable ssh
        sudo systemctl start ssh
        print_status "SSH server installed and started"
    elif command -v yum &> /dev/null; then
        sudo yum install -y openssh-server
        sudo systemctl enable sshd
        sudo systemctl start sshd
        print_status "SSH server installed and started"
    fi
fi

if [ "$NEED_TMUX" = true ]; then
    echo "Installing tmux..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y tmux
        print_status "tmux installed"
    elif command -v yum &> /dev/null; then
        sudo yum install -y tmux
        print_status "tmux installed"
    fi
fi

# Install project dependencies
echo ""
echo "Installing ClaudeGO dependencies..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

npm install
print_status "npm dependencies installed"

# Build the project
echo ""
echo "Building ClaudeGO..."
npm run build
print_status "Build completed"

echo ""
echo "========================================"
echo "  Installation Complete!"
echo "========================================"
echo ""
echo "To start ClaudeGO:"
echo "  ./start.sh [port]"
echo ""
echo "Or run directly:"
echo "  PORT=3000 npm start"
echo ""
echo "Default URL: http://localhost:3000"
echo ""

if [ "$NEED_CLAUDE" = true ]; then
    echo -e "${YELLOW}Note:${NC} Claude Code CLI is not installed."
    echo "ClaudeGO will work, but you need to install Claude Code CLI"
    echo "for the full experience. Visit:"
    echo "  https://docs.anthropic.com/en/docs/claude-code"
    echo ""
fi

echo "For systemd service setup, see: conf/claudego.service"
echo ""
