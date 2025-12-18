# Contributing to GTM MCP Server

Thank you for your interest in contributing to the GTM MCP Server! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Contributing to GTM MCP Server](#contributing-to-gtm-mcp-server)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
    - [Our Standards](#our-standards)
  - [Getting Started](#getting-started)
  - [Development Setup](#development-setup)
    - [Prerequisites](#prerequisites)
    - [Environment Setup](#environment-setup)
    - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
  - [Making Changes](#making-changes)
  - [Testing](#testing)
    - [Writing Tests](#writing-tests)
    - [Test Structure](#test-structure)
    - [Running Tests](#running-tests)
  - [Code Style](#code-style)
    - [TypeScript](#typescript)
    - [Formatting](#formatting)
    - [Example](#example)
  - [Commit Messages](#commit-messages)
    - [Types](#types)
    - [Examples](#examples)
  - [Pull Request Process](#pull-request-process)
  - [Adding New Operations](#adding-new-operations)
  - [Documentation](#documentation)
    - [API Documentation](#api-documentation)
    - [Code Documentation](#code-documentation)
    - [README Updates](#readme-updates)
  - [Review Checklist](#review-checklist)
  - [Reporting Issues](#reporting-issues)
    - [Bug Reports](#bug-reports)
    - [Feature Requests](#feature-requests)
  - [Getting Help](#getting-help)
  - [Security](#security)
  - [License](#license)

## Code of Conduct

Be respectful, inclusive, and constructive in all interactions. We welcome contributions from everyone.

### Our Standards

- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/mcp-for-gtm.git`
3. Navigate to the project: `cd mcp-for-gtm/gtm-mcp`
4. Install dependencies: `npm install`

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Google Cloud Platform account with GTM API access

### Environment Setup

1. Create a Google Cloud Project and enable the Tag Manager API
2. Create OAuth 2.0 credentials (see `README.md` for details)
3. Place `credentials.json` in the project root
4. Run `npm run auth` to generate `token.json`

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run the compiled server
- `npm run dev` - Run the server in development mode with watch
- `npm run type-check` - Type check without emitting files
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
gtm-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── gtm-client.ts         # GTM API client
│   ├── gtm-components.ts     # High-level component helpers
│   ├── auth-helper.ts        # OAuth authentication helper
│   └── auth.ts               # Standalone auth script
├── test/
│   └── gtm-client.test.ts    # Unit tests
├── docs/                      # API documentation
├── dist/                      # Compiled output (gitignored)
└── coverage/                  # Test coverage (gitignored)
```

## Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Write or update tests for your changes

4. Ensure all tests pass: `npm run test:run`

5. Ensure type checking passes: `npm run type-check`

6. Update documentation if needed

## Testing

### Writing Tests

- All new operations must have corresponding tests
- Tests use Vitest and should be in `test/gtm-client.test.ts`
- Mock the `googleapis` client to avoid real API calls
- Test both success and error cases

### Test Structure

```typescript
describe('Operation Name', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should perform operation successfully', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Error handling test
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

## Code Style

### TypeScript

- Use strict TypeScript settings (already configured)
- Prefer explicit types over `any`
- Use `async/await` over promises
- Use meaningful variable and function names
- Add JSDoc comments for public methods

### Formatting

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters (soft limit)

### Example

```typescript
/**
 * Create a new GTM tag
 */
async createTag(
  accountId: string,
  containerId: string,
  name: string,
  type: string,
  workspaceId?: string
): Promise<{ success: boolean; tag?: any; error?: string }> {
  // Implementation
}
```

## Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `chore`: Build/tooling changes

### Examples

```
feat(gtm-client): add listDestinations operation

Add support for listing destinations in server-side containers.

Closes #123
```

```
fix(auth): handle token refresh errors

Properly handle OAuth token refresh failures and provide clear error messages.
```

## Pull Request Process

1. **Set up upstream** (first time only):
   ```bash
   git remote add upstream https://github.com/pouyanafisi/mcp-for-gtm.git
   ```

2. **Update your branch**: Rebase on latest `main` before submitting
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

3. **Ensure quality**:
   - All tests pass
   - Type checking passes
   - Code follows style guidelines
   - Documentation is updated

4. **Create PR**:
   - Use a clear, descriptive title
   - Provide detailed description of changes
   - Reference related issues
   - Include screenshots/examples if applicable

5. **Respond to feedback**: Address review comments promptly

## Adding New Operations

When adding new GTM API operations:

1. **Add to `gtm-client.ts`**:
   ```typescript
   async newOperation(
     accountId: string,
     // ... parameters
   ): Promise<{ success: boolean; data?: any; error?: string }> {
     // Implementation
   }
   ```

2. **Add Zod schema to `index.ts`**:
   ```typescript
   const NewOperationSchema = z.object({
     account_id: z.string().describe('GTM account ID'),
     // ... other fields
   });
   ```

3. **Add MCP tool definition**:
   ```typescript
   {
     name: 'new_gtm_operation',
     description: 'Description of the operation',
     inputSchema: { /* ... */ },
   }
   ```

4. **Add handler in `call_tool`**:
   ```typescript
   case 'new_gtm_operation': {
     const params = NewOperationSchema.parse(args);
     const result = await gtmClient.newOperation(/* ... */);
     return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
   }
   ```

5. **Add tests**:
   ```typescript
   it('should perform new operation', async () => {
     // Test implementation
   });
   ```

6. **Update documentation**:
   - Add to `API_COVERAGE.md`
   - Add to `OPERATIONS.md`

## Documentation

### API Documentation

- Located in `docs/` directory
- Each entity has its own markdown file
- Keep documentation concise and first-principles-based
- Update when adding new operations

### Code Documentation

- Add JSDoc comments for public methods
- Document parameters and return types
- Include usage examples for complex operations

### README Updates

- Update `README.md` for significant changes
- Keep setup instructions current
- Document new features

## Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with `main`
- [ ] No console.logs or debug code
- [ ] Error handling is appropriate

## Reporting Issues

Before opening an issue:

1. Check existing issues to avoid duplicates
2. Search closed issues - your issue may have been resolved

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Error messages or logs
- Minimal reproduction if possible

### Feature Requests

Include:
- Use case and motivation
- Proposed solution (if any)
- Alternatives considered

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be specific and provide reproduction steps for bugs

## Security

If you discover a security vulnerability, please email the maintainer directly rather than opening a public issue. We'll work with you to resolve and disclose the issue appropriately.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

