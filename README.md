<div align="center">

# 🚀 GitPulse

**Visualize Your GitHub Journey with Style**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)

[🎮 Live Demo](https://git-pulse.pages.dev) • [📖 Documentation](#-features) • [🤝 Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start - Add to Your GitHub Profile](#-quick-start---add-to-your-github-profile)
- [Features](#-features)
- [Available Widgets](#-available-widgets)
- [Tech Stack](#-tech-stack)
- [Development Setup](#-getting-started)
- [Testing](#-testing)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [CI/CD](#-cicd)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**GitPulse** is a modern GitHub stats visualization platform with **embeddable badges for your GitHub profile README**. The primary goal is to provide beautiful, dynamic SVG widgets that showcase your GitHub achievements, rank, and streaks - perfect for making your profile stand out!

Additionally, GitPulse offers a web dashboard where you can explore detailed analytics and share your complete GitHub story with friends.

### Why GitPulse?

- � **Embeddable API Endpoints** - Drop-in SVG badges for your GitHub profile README
- 🏆 **Achievement Badges** - Showcase your earned trophies and milestones
- 📊 **Developer Ranking** - Display your calculated rank with beautiful visualizations  
- � **Contribution Streaks** - Highlight your consistency and dedication
- 🌐 **Share-Friendly Dashboard** - Full-featured UI to share with friends and colleagues
- ⚡ **Lightning Fast** - Global CDN caching for instant badge loading
- � **Beautiful Design** - Modern, professional widgets that match any profile theme

---

## 🚀 Quick Start - Add to Your GitHub Profile

Want to showcase your GitHub stats? Simply add these badges to your profile README!

### Step 1: Copy & Paste

Add any of these to your `README.md`:

```markdown
<!-- GitPulse Badges -->
![GitHub Badges](https://gitpulse-api.davidbbryan.workers.dev/badges?username={your-username})

<!-- GitPulse Rank -->
![GitHub Rank](https://gitpulse-api.davidbbryan.workers.dev/rank?username={your-username})

<!-- GitPulse Streaks -->
![GitHub Streaks](https://gitpulse-api.davidbbryan.workers.dev/streaks?username={your-username})
```

### Step 2: Replace Placeholders

- `your-username` → Your GitHub username

### Step 3: Commit & Enjoy! 

Your profile now displays dynamic, auto-updating GitHub stats! 🎉

### Example Profile README

```markdown
# Hi there! 👋

I'm a passionate developer who loves building cool stuff.

## 📊 My GitHub Stats

![GitHub Rank](https://gitpulse-api.davidbbryan.workers.dev/rank?username=torvalds)
![GitHub Badges](https://gitpulse-api.davidbbryan.workers.dev/badges?username=torvalds)
![GitHub Streaks](https://gitpulse-api.davidbbryan.workers.dev/streaks?username=torvalds)

## 🔗 Connect with me
- [Twitter](https://twitter.com/yourusername)
- [LinkedIn](https://linkedin.com/in/yourusername)
```

### 🌐 Try the Web Dashboard

Prefer to explore your stats visually or share with friends?

Visit: `https://git-pulse.pages.dev/your-username`

---

## ✨ Features

### � Primary Use Case: Embeddable Widgets

**GitPulse's main feature** is providing embeddable SVG badges for your GitHub profile README:

- **🏆 Achievement Badges** - Display earned trophies and milestones
  - Tier-based system: S, AAA, AA, A, B, C, SECRET
  - Calculated from stars, repos, languages, streaks, commits, PRs
  
- **📈 Developer Rank** - Show your calculated developer rank
  - Grades: S, A+++, A++, A+, A, B+++...D
  - Algorithm considers commits, PRs, issues, reviews, stars, followers
  - Percentile-based scoring system
  
- **🔥 Contribution Streaks** - Showcase your coding consistency
  - Current active streak
  - Longest streak record
  - Visual contribution calendar

### � Secondary Feature: Web Dashboard

Share your complete GitHub story with friends and colleagues:

- **Profile Analytics** - Comprehensive GitHub profile overview
- **Repository Insights** - Detailed stats and language distribution
- **Visual Charts** - Beautiful contribution graphs and metrics
- **Share Links** - Direct URLs to share your dashboard

### 🔒 Privacy & Performance

- ✅ No data storage - All data fetched in real-time from GitHub
- ✅ No tracking or analytics collection
- ✅ Smart caching (1 hour) to respect GitHub API rate limits
- ✅ Global CDN delivery via Cloudflare Workers
- ✅ Client-side calculations for privacy

---

## 🎨 Available Widgets

All widgets are SVG-based, lightweight, and auto-update from your GitHub profile.

### 1. Badges Widget

**Endpoint**: `GET /{username}/badges`

Displays all earned achievement trophies with tier colors and progress.

```markdown
![GitHub Badges](https://git-pulse.pages.dev/octocat/badges)
```

**Features**:
- Tier-based coloring (Gold S, Silver AAA, Bronze AA, etc.)
- Trophy icons and descriptions
- Progress tracking for achievements
- Responsive SVG design

---

### 2. Rank Widget

**Endpoint**: `GET /{username}/rank`

Shows your calculated developer rank with grade and percentile.

```markdown
![GitHub Rank](https://git-pulse.pages.dev/octocat/rank)
```

**Features**:
- Letter grade (S, A+++, A++, A+, A, B+++, etc.)
- Numerical score display
- Percentile ranking
- Grade-specific color themes

**Ranking Algorithm Factors**:
- Total commits (all-time)
- Merged pull requests
- Issues created
- PR reviews conducted
- Total stars earned
- Follower count

---

### 3. Streaks Widget

**Endpoint**: `GET /{username}/streaks`

Highlights your contribution consistency and dedication.

```markdown
![GitHub Streaks](https://git-pulse.pages.dev/octocat/streaks)
```

**Features**:
- Current active streak
- Longest streak ever
- Total contributions
- Visual streak counter

---

### 4. Unified Dashboard (Web UI)

**Route**: `/{username}`

Full-featured web interface for exploring all stats and sharing with friends.

```
https://git-pulse.pages.dev/octocat
```

**Features**:
- Interactive profile card
- Repository list with filters
- Language distribution chart
- All badges and achievements
- Rank visualization
- Contribution timeline

---

## 🛠 Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend/API

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **API**: GitHub GraphQL API v4
- **Caching**: Cloudflare Cache API
- **Testing**: Vitest

### Deployment

- **Frontend**: Cloudflare Pages
- **API**: Cloudflare Workers
- **CDN**: Global edge network via Cloudflare

### Development Tools

- **Code Quality**: ESLint 9
- **Type Checking**: TypeScript 5
- **Testing**: Vitest + React Testing Library
- **Coverage**: V8 Coverage Provider
- **CI/CD**: GitHub Actions
- **Package Manager**: npm/pnpm
- **Version Control**: Git

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- GitHub Personal Access Token (for API access)
- Cloudflare account (for deployment - both Pages and Workers)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/aravindr31/git-pulse.git
cd git-pulse
```

2. **Install dependencies**

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..
```

3. **Set up environment variables**

Create a `.dev.vars` file in the `api` directory:

```env
GITHUB_TOKEN=your_github_personal_access_token
CLIENT_API_KEY=your_custom_api_key
```

4. **Start development servers**

```bash
# Terminal 1: Start frontend (http://localhost:8080)
npm run dev

# Terminal 2: Start API worker (http://localhost:8787)
cd api
npx wrangler dev
```

5. **Open your browser**

Navigate to `http://localhost:8080` and enter a GitHub username to explore!

---

## 📁 Project Structure

```
git-pulse/
├── src/                        # Frontend source code
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ProfileCard.tsx   # User profile display
│   │   ├── RepoList.tsx      # Repository list
│   │   ├── BadgeDisplay.tsx  # Achievement badges
│   │   └── UserRank.tsx      # Ranking visualization
│   ├── lib/                   # Utility functions
│   │   ├── github.ts         # GitHub API utilities
│   │   ├── badges.ts         # Trophy calculation logic
│   │   ├── ranking.ts        # Ranking algorithm
│   │   └── streak.ts         # Streak calculation
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Route pages
│   │   ├── Index.tsx         # Main dashboard
│   │   └── embed/            # Embeddable widgets
│   └── types/                 # TypeScript definitions
├── api/                       # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts          # Worker entry point
│   └── wrangler.jsonc        # Worker configuration
├── public/                    # Static assets
└── package.json              # Dependencies
```

---

## 🔌 API Endpoints

### Public Widget Endpoints (Embeddable)

These return SVG images suitable for GitHub README files:

#### 1. Badges Endpoint
```
GET /{username}/badges
```
Returns an SVG image with all earned achievement badges.

#### 2. Rank Endpoint
```
GET /{username}/rank
```
Returns an SVG image with developer rank and score.

#### 3. Streaks Endpoint
```
GET /{username}/streaks
```
Returns an SVG image with contribution streak information.

#### 4. Dashboard Endpoint (HTML)
```
GET /{username}
```
Returns the full web dashboard (HTML page).

---

### Creating a GitHub Token

To run your own instance, you'll need a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `read:user` - Read user profile data
   - `repo` (or `public_repo`) - Read repository information
4. Generate and copy the token
5. Add it to your `.dev.vars` file (see [Environment Variables](#-environment-variables))

---

### Caching Strategy

- All API responses cached for **1 hour** via Cloudflare CDN
- Reduces GitHub API rate limit consumption
- Provides faster response times globally
- Automatic cache invalidation after 60 minutes
- Perfect for frequently accessed profile badges

---

## 🌍 Environment Variables

### Frontend (`vite.config.ts`)

```typescript
// API endpoint is configurable via environment
VITE_API_URL=https://your-worker.workers.dev
```

### API (`api/.dev.vars`)

```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
CLIENT_API_KEY=your_secret_key
```

---

## 📦 Deployment

GitPulse is designed to be deployed entirely on Cloudflare's edge network for maximum performance.

### Frontend (Cloudflare Pages)

The React frontend is deployed to Cloudflare Pages:

**Option 1: Git Integration (Recommended)**

1. Push your code to GitHub
2. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (or leave empty)
6. Click "Save and Deploy"

**Option 2: Direct Upload**

```bash
npm run build
npx wrangler pages deploy dist --project-name=gitpulse
```

**Option 3: CLI with Git**

```bash
npm run build
npx wrangler pages deploy dist
```

### API (Cloudflare Workers)

The backend API is deployed as a Cloudflare Worker:

```bash
cd api

# Login to Cloudflare (first time only)
npx wrangler login

# Deploy to production
npx wrangler deploy

# Set environment secrets
npx wrangler secret put GITHUB_TOKEN
# Paste your GitHub Personal Access Token

npx wrangler secret put CLIENT_API_KEY
# Paste your custom API key
```

### Connecting Frontend to API

After deploying both services, you need to configure the frontend to use your API:

1. **Get your Worker URL** from Cloudflare (e.g., `https://git-pulse-api.your-subdomain.workers.dev`)

2. **Update frontend API configuration** in your code or environment variables

3. **Redeploy frontend** with the updated API endpoint

### Post-Deployment: Use Your Widgets!

Once deployed, your badges are ready to use:

1. **Get your deployment URLs** from Cloudflare:
   - **Pages URL**: `https://gitpulse.pages.dev` (or your custom domain)
   - **Worker URL**: `https://git-pulse-api.your-subdomain.workers.dev`

2. **Update your GitHub profile README** with your badges:

```markdown
# Your Name

![GitHub Rank](https://gitpulse.pages.dev/your-username/rank)
![GitHub Badges](https://gitpulse.pages.dev/your-username/badges)
![GitHub Streaks](https://gitpulse.pages.dev/your-username/streaks)
```

3. **Share your dashboard** with friends:
```
https://gitpulse.pages.dev/your-username
```

### Custom Domain (Optional)

You can add custom domains to both services:

**Cloudflare Pages**
1. Go to your Pages project settings
2. Click "Custom domains"
3. Add your domain (e.g., `gitpulse.yourdomain.com`)

**Cloudflare Workers**
1. Go to your Worker settings
2. Click "Triggers" → "Custom Domains"
3. Add your API domain (e.g., `api.gitpulse.yourdomain.com`)

---

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure TypeScript types are properly defined
- Run tests before submitting PR: `npm test`
- Check linting: `npm run lint`

### Code Quality Standards

- **Test Coverage**: Maintain >80% coverage for new code
- **Type Safety**: All code must be properly typed
- **Code Style**: Follow ESLint rules
- **Commit Messages**: Use conventional commits format
  ```
  feat: add new badge type
  fix: resolve ranking calculation bug
  docs: update API documentation
  test: add tests for streak calculation
  ```

### Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Lovable](https://lovable.dev/) for designing the frontend UI
- [GitHub GraphQL API](https://docs.github.com/en/graphql) for providing comprehensive data
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Cloudflare Workers](https://workers.cloudflare.com/) for serverless infrastructure
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Vitest](https://vitest.dev/) for blazing fast testing

---

## 📚 Additional Resources

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Testing Guide](TESTING.md) - Detailed testing documentation
- [Issue Templates](.github/ISSUE_TEMPLATE/) - Bug reports and feature requests
- [PR Template](.github/PULL_REQUEST_TEMPLATE.md) - Pull request guidelines

---

## 📧 Contact & Support

- **Author**: [Aravind R](https://github.com/aravindr31)
- **Issues**: [GitHub Issues](https://github.com/aravindr31/git-pulse/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aravindr31/git-pulse/discussions)

---

<div align="center">

**Made with ❤️ by developers, for developers**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/aravindr31/git-pulse/issues) · [Request Feature](https://github.com/aravindr31/git-pulse/issues) · [Contribute](#-contributing)

</div>


---

