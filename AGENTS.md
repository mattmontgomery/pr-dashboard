# PR Dashboard - AI Agent Guidelines

## Project Overview

This is a modern Next.js application that provides a configurable dashboard for viewing and managing pull requests across multiple GitHub repositories. The application features a column-based interface with filtering capabilities and supports both public and private repositories through GitHub API integration.

## Technology Stack

- **Framework**: Next.js 16.0.1 with App Router
- **Runtime**: React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Linting**: ESLint 9 with Next.js config
- **Package Manager**: npm/yarn/pnpm/bun (project agnostic)

## Architecture & Patterns

### Application Structure
```
app/                    # Next.js App Router directory
├── api/               # API routes for GitHub integration
├── components/        # Reusable UI components
├── lib/              # Utility functions and configurations
├── types/            # TypeScript type definitions
├── hooks/            # Custom React hooks
└── (dashboard)/      # Dashboard route group
```

### Key Components to Implement
- **PR Table/Grid**: Configurable column-based view
- **Filter Components**: Repository and tag filtering
- **Repository Selector**: Multi-repository management
- **Authentication**: GitHub API key management
- **Column Configuration**: Customizable view settings

## Core Features

### 1. Multi-Repository PR Viewing
- Display pull requests from multiple GitHub repositories
- Support for both public and private repositories
- Real-time data fetching and caching
- Pagination and infinite scroll support

### 2. Configurable Column Layout
- Drag-and-drop column reordering
- Show/hide columns dynamically
- Column width adjustment
- Save user preferences locally or in database

### 3. Advanced Filtering
- Filter by repository
- Filter by tags/labels
- Filter by PR status (open, closed, merged, draft)
- Filter by assignee, reviewer, author
- Date range filtering
- Custom search queries

### 4. GitHub API Integration
- Secure API key storage and management
- Rate limiting handling
- Error handling and retry logic
- Webhook support for real-time updates

## Development Guidelines

### Code Organization
- Use TypeScript for all components and utilities
- Implement proper error boundaries
- Follow Next.js App Router conventions
- Use server components where appropriate for SEO and performance

### State Management
- Use React's built-in state management (useState, useReducer)
- Consider Zustand or Jotai for global state if complexity grows
- Implement proper data fetching with SWR or TanStack Query
- Cache GitHub API responses appropriately

### Styling Conventions
- Use Tailwind CSS utility classes
- Create reusable component variants with cva (class-variance-authority)
- Implement responsive design patterns
- Follow accessibility best practices (WCAG 2.1)

### API Design
```typescript
// Example API routes structure
/api/github/
├── repos/              # Repository management
├── pulls/              # Pull request data
├── auth/               # GitHub authentication
└── webhooks/           # Real-time updates
```

## Security Considerations

### GitHub API Key Management
- Store API keys securely (environment variables)
- Implement proper key validation
- Support personal access tokens and GitHub Apps
- Never expose keys in client-side code

### Data Privacy
- Respect GitHub's API terms of service
- Implement proper CORS policies
- Validate and sanitize all user inputs
- Use secure HTTP headers

## Performance Optimization

### Data Fetching
- Implement efficient GitHub API pagination
- Use background data refresh
- Cache responses with appropriate TTL
- Implement optimistic updates where possible

### UI Performance
- Virtualize large PR lists
- Lazy load non-critical components
- Optimize bundle size with proper tree shaking
- Use Next.js Image optimization for avatars

## Testing Strategy

### Unit Testing
- Test utility functions and hooks
- Test component rendering and interactions
- Mock GitHub API responses
- Use Jest and React Testing Library

### Integration Testing
- Test API route handlers
- Test end-to-end user workflows
- Test GitHub API integration
- Use Playwright or Cypress

## Environment Configuration

### Required Environment Variables
```bash
# GitHub API Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----

# Application Configuration
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Database (optional, for user preferences)
DATABASE_URL=postgresql://...
```

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Configure GitHub API credentials
5. Run development server: `npm run dev`

## API Integration Patterns

### GitHub REST API
```typescript
// Example API client structure
class GitHubClient {
  async getPullRequests(repo: string, options?: FilterOptions): Promise<PullRequest[]>
  async getRepositories(): Promise<Repository[]>
  async getLabels(repo: string): Promise<Label[]>
  // ... other methods
}
```

### Error Handling
- Implement graceful fallbacks for API failures
- Show user-friendly error messages
- Log errors for debugging
- Handle rate limiting with exponential backoff

## User Experience Guidelines

### Dashboard Layout
- Clean, minimal interface design
- Intuitive navigation between repositories
- Quick access to common filters
- Responsive design for mobile and desktop

### Performance Feedback
- Loading states for data fetching
- Progress indicators for long operations
- Real-time updates when possible
- Offline capability consideration

## Deployment Considerations

### Vercel (Recommended)
- Optimized for Next.js applications
- Environment variable management
- Automatic deployments from Git
- Edge functions for API routes

### Alternative Platforms
- Netlify
- Railway
- Self-hosted with Docker

## Common Implementation Patterns

### Custom Hooks Examples
```typescript
// Custom hooks for GitHub data
useRepositories() // Fetch and manage repositories
usePullRequests(repos, filters) // Fetch filtered PRs
useGitHubAuth() // Handle GitHub authentication
useColumnConfig() // Manage column configuration
```

### Component Patterns
- Compound components for complex UI elements
- Render props for flexible data rendering
- Higher-order components for authentication
- Context providers for global state

## Future Enhancements

### Potential Features
- Dashboard sharing and collaboration
- Custom webhook integrations
- Advanced analytics and reporting
- Team management and permissions
- Mobile application
- Browser extension

### Scalability Considerations
- Database integration for user data
- Multi-tenant architecture
- Background job processing
- CDN integration for static assets

## Contributing Guidelines

When working on this project:
1. Follow TypeScript strict mode
2. Write comprehensive tests for new features
3. Update documentation for API changes
4. Consider backwards compatibility
5. Optimize for performance and accessibility
6. Review security implications of changes

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19)