# [CodeBrim](https://codebrim.online) - Compiler on the Go! 🚀

**A robust code execution and sharing platform with distinctive collaboration capabilities**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://codebrim.online)
[![License](https://img.shields.io/badge/License-AGPL%20v3-green?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-3.0-orange?style=for-the-badge)]()

CodeBrim is a deployed robust code execution platform supporting Python, JavaScript, Java, C++, C, and Go using Docker containerization on AWS EC2, ensuring complete runtime isolation security. Engineered with distinctive collaboration capabilities including Git integration, real-time multi-file support, and persistent code sharing via unique URLs - features unavailable in other competing platforms.

## ✨ Features

### 🌐 Multi-Language Support

- **C/C++** - Full compilation with GCC support
- **Java** - Complete Java environment with JDK
- **Python** - Latest Python runtime environment
- **JavaScript** - Node.js execution engine
- **Go** - Go compiler with full standard library
- **Text Files** - Documentation and configuration file support

### 🔗 Distinctive Collaboration Features

- **Persistent Code Sharing** - Share multiple files through a single unique URL
- **Access Control** - Grant either editable or read-only access to shared projects
- **Real-time Multi-file Support** - Collaborate on entire project structures with complete file and folder structure
- **Cross-platform Compatibility** - Access from any device with a browser

### 🔧 Integrated Git Operations

- **Direct Repository Management** - Pull public repositories directly on the website
- **Live Code Editing** - Make changes and run code in real-time
- **Push to Remote** - Push changes back to remote repositories
- **Full Git Workflow** - Complete version control through web interface
- **Branch Management** - Switch and manage branches seamlessly

### 🐳 Enterprise-Grade Security & Performance

- **Docker Containerization** - Complete runtime isolation on AWS EC2
- **99.9% Uptime** - Reliable infrastructure with high availability on ec2
- **Scalable Architecture** - Message queue system for concurrent execution in the backend
- **AWS EC2 Deployment** - Professional cloud infrastructure

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **TypeScript** - Type-safe development

### Backend

- **Express.js** - Fast Node.js web framework
- **TypeScript** - End-to-end type safety
- **WebSockets** - Real-time communication
- **Message Queues** - Scalable task processing
- **Docker** - Containerized code execution
- **Prisma** - Modern database toolkit

### Database & Storage

- **PostgreSQL** - Primary relational database
- **Redis** - Caching and session management

### Infrastructure & DevOps

- **AWS EC2** - Backend hosting with 99.9% uptime
- **Docker Engine** - Container orchestration
- **Linux** - Server environment
- **Vercel** - Frontend deployment

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm/bun
- Docker (for local development)
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/jinendra3/codebrim.git
cd codebrim
```

2. **Install dependencies**

```bash
bun install
```

3. **Environment Setup**

Create `.env` files in both Frontend and Backend directories:

**Backend/.env**

```env
DATABASE_URL=your_postgres_connection_string
RESETPWD=your_reset_password_secret
ROLLBAR_TOKEN=your_rollbar_token
```

**Frontend/.env.local**

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

4. **Start Docker Daemon**
   Ensure Docker Daemon engine is running on your system as it's required for code execution.

5. **Start Redis CLI on port 6379**
   If using windows run `docker run -p 6379:6379 redis`

6. **Start Development Server**

```bash
bun dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

```bash
bun start
```

## 📖 Available Scripts

- `bun dev` - Start both frontend and backend in development mode
- `bun dev:frontend` - Start only frontend development server
- `bun dev:backend` - Start only backend development server

- `bun start` - Build and start production servers
- `bun start:frontend` - Build and start production frontend
- `bun start:backend` - Start production backend

- `bun install` - Install all dependencies
- `bun format` - Format code with Prettier

## 🎯 What's New in v3.0

CodeBrim has evolved through multiple versions:

- **v1.0**: MVP with basic compilation features
- **v2.0**: Major refactoring and design improvements
- **v3.0**: Enhanced functionality with:
  - File and folder support
  - Fixed Git integrations
  - Improved workspace locking
  - Overall code refactoring
  - Performance optimizations

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork** the repository on GitHub
2. **Clone** the forked repository to your local machine
3. **Follow** the installation steps above
4. **Open** an issue and get it assigned
5. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
6. **Open** a Pull Request

### Reporting Issues

Found a bug or have a feature request?

1. **Create** a new issue with detailed description
2. **Wait** for approval from maintainers
3. **Submit** your Pull Request after approval

### Types of Contributions Needed

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage
- 🔧 DevOps improvements

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Benevolent Dictator for Life: Jinendra Jain**

- 🌐 [LinkedIn](https://linkedin.com/in/jjinendra3)
- 🧑‍💻 [Github] (https://github.com/jjinendra3)
- 🐦 [Twitter](https://x.com/jjinendra3)
- 🌟 [Portfolio](https://jinendra.tech)
- 🚀 [Live Demo](https://codebrim.online)
