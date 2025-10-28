# PR Dashboard

A modern Next.js application for viewing and managing pull requests across multiple GitHub repositories. Features a configurable column-based interface with advanced filtering capabilities and support for both public and private repositories.

## Features

- 🔐 **GitHub Integration** - Securely connect with your GitHub personal access token
- 📊 **Multi-Repository View** - Monitor PRs across all your repositories
- 🎯 **Advanced Filtering** - Filter by repository, labels, status, and search
- 📋 **Configurable Columns** - Customize which columns to display
- 🎨 **Modern UI** - Clean, responsive interface built with Tailwind CSS
- ⚡ **Fast & Efficient** - Built on Next.js 16 with React 19

## Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **API**: GitHub REST API v3

## Getting Started

### Prerequisites

- Node.js 20.x or later
- A GitHub account
- A GitHub Personal Access Token (instructions below)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/pr-dashboard.git
cd pr-dashboard
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure GitHub Token (Optional)**

You have two options for providing a GitHub token:

**Option A: Server-side token (Recommended for personal use)**

Create a `.env.local` file and add your token:

```bash
GITHUB_TOKEN=ghp_your_github_token_here
```

With this approach, the token is used automatically and users don't need to enter it in the UI.

**Option B: Client-side token**

If you don't configure a server-side token, users will be prompted to enter their own GitHub token in the UI when they first visit the application.

**Option C: Pre-configure default repositories**

You can also set default repositories that will be automatically selected when the dashboard loads. This is useful for team deployments:

```bash
GITHUB_DEFAULT_REPOS=owner/repo1,owner/repo2,anotherowner/repo3
```

Example for a single repository:
```bash
GITHUB_DEFAULT_REPOS=deseretdigital/marketplace-frontend
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### GitHub Personal Access Token

The application supports two ways to authenticate with GitHub:

#### Server-Side Token (Recommended for personal/team use)

Set the `GITHUB_TOKEN` environment variable in `.env.local`:

```bash
GITHUB_TOKEN=ghp_your_token_here
```

Benefits:
- Users don't need to configure anything
- Token is kept secure on the server
- Ideal for personal use or team deployments

#### Client-Side Token (User-provided)

If no server token is configured, users will be prompted to enter their own token:

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens/new)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "PR Dashboard")
4. Select the following scopes:
   - `repo` - Full control of private repositories
5. Click "Generate token"
6. Copy the token (you won't be able to see it again!)
7. Paste it into the application when prompted

The token is stored securely in your browser's localStorage and is only used to make API requests to GitHub.

## Project Structure

```
pr-dashboard/
├── app/
│   ├── api/github/        # GitHub API routes
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript definitions
│   └── page.tsx          # Main dashboard page
├── AGENTS.md             # AI agent guidelines
└── README.md            # This file
```

## License

This project is open source and available under the MIT License.
