# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript 5.8+ - Main application logic in `src/`, test files, and CLI tools
- Node.js JavaScript (CommonJS) - Compiled output target and runtime

**Secondary:**
- Python 3.8+ - Pytest reporter plugin (`reporters/pytest/`)
- Go 1.24 - Go test reporter (`reporters/go/`)
- Ruby - RSpec reporter (`reporters/rspec/`)
- PHP 8.1+ - PHPUnit reporter (`reporters/phpunit/`)
- Rust 2021 edition - Rust test reporter (`reporters/rust/`)

## Runtime

**Environment:**
- Node.js 22.0.0 or higher (configured in `package.json` engines)
- npm 9+ (implied by Node 22 LTS requirements)

**Package Manager:**
- npm (primary) - Monorepo with workspaces
- Python pip - For pytest reporter
- Cargo - For Rust reporter
- Go modules - For Go reporter
- Ruby Bundler - For RSpec reporter
- PHP Composer - For PHPUnit reporter

## Frameworks

**Core Testing:**
- Vitest 3.2.4 - Test runner and framework for main project
- Jest 30.0.5+ - Peer dependency for jest reporter (`reporters/jest/`)
- Storybook 8.4.7 - Storybook test-runner integration (`reporters/storybook/`)

**Build/Transpile:**
- TypeScript 5.8+ - Compiler with ES2022 target, CommonJS modules
- tsc (TypeScript Compiler) - Build tool for monorepo packages
- tsx 4.21.0 - TypeScript execution for scripts

**Code Quality:**
- ESLint 9.39+ - JavaScript/TypeScript linting (config: `eslint.config.mjs`)
- @typescript-eslint/eslint-plugin 8.54+ - TypeScript-specific rules
- @typescript-eslint/parser 8.54+ - TypeScript AST parser
- eslint-plugin-sonarjs 3.0.6 - Code quality and security rules
- Prettier 3.8.1 - Code formatter

**Testing & Coverage:**
- @vitest/coverage-v8 3.2.4 - Code coverage provider
- Vitest 3.2.4 - Test runner for all test suites

**Process/CLI Tools:**
- Husky 9.1.7 - Git hooks framework
- lint-staged 16.2.7 - Run linters on staged files
- @commitlint/cli 20.4.0 - Commit message validation
- @commitlint/config-conventional 20.4.0 - Conventional commits config
- get-port 7.1.0 - Find available network ports

## Key Dependencies

**Critical:**
- @anthropic-ai/sdk 0.72.1 - Anthropic API client for model inference
  - Used in `src/validation/models/AnthropicApi.ts`
  - Provides `messages.create()` for Claude model calls
- @anthropic-ai/claude-agent-sdk 0.2.25 - Claude Agent SDK for orchestration
  - Used in `src/validation/models/ClaudeAgentSdk.ts`
  - Provides streaming query interface for model validation

**Data & Configuration:**
- zod 4.3.6 - Runtime schema validation and type safety
- uuid 13.0.0 - UUID generation for unique identifiers
- @types/uuid 10.0.0 - TypeScript types for uuid

**Environment & Runtime:**
- dotenv 17.2.3 - Environment variable loading from `.env` files
  - Imported in `src/cli/tdd-guard.ts`
- minimatch 10.0.3 - Glob pattern matching for file filtering

**Type Definitions:**
- @types/node 25.1.0 - Node.js built-in types
- globals 17.2.0 - Global variable type definitions

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Main configuration (ES2022 target, strict mode, CommonJS modules)
- `tsconfig.build.json` - Build-specific configuration
- `tsconfig.eslint.json` - ESLint parser configuration
- `tsconfig.node.json` - Node.js-specific configuration

**Linting & Formatting:**
- `eslint.config.mjs` - ESLint configuration with TypeScript and SonarJS
- `.prettierrc` - Prettier format config (semi: false, singleQuote: true, tabWidth: 2)

**Testing:**
- `vitest.config.ts` - Vitest configuration with 5 test projects (golangci-lint, unit, integration, reporters, default)

**Version Control:**
- `.husky/` - Git hooks directory
- `.commitlintrc.cjs` - Commit message linting rules

## Platform Requirements

**Development:**
- Node.js >= 22.0.0
- npm >= 9.0.0
- TypeScript 5.8+ with strict mode
- Optional: ESLint CLI, golangci-lint for testing linter integration
- Optional: golangci-lint (tested via integration tests in `src/linters/golangci/`)

**Production (Execution Environments):**
- Node.js 22+ runtime for main CLI
- Python 3.8+ for pytest reporter
- Go 1.24 for Go reporter
- Ruby for RSpec reporter
- PHP 8.1+ for PHPUnit reporter
- Rust 2021 edition for Rust reporter
- Claude CLI binary or Anthropic API access

**Deployment:**
- npm publish to npm registry (main package and workspace reporters)
- pip publish to PyPI (pytest reporter)
- Cargo publish to crates.io (Rust reporter)
- Gem publish to rubygems.org (RSpec reporter)
- Composer publish to Packagist (PHPUnit reporter)
- Go module published to github.com

## Build Process

**Main Package:**
```bash
tsc --build tsconfig.build.json  # Compile to dist/
npm run build:workspaces          # Build npm workspace reporters
```

**Outputs:**
- Main: `dist/` directory with compiled JavaScript and type declarations
- Reporters: Individual `dist/` in each reporter directory
- CLI entry: `dist/cli/tdd-guard.js` (bin command)

**Scripts Available:**
- `npm run build` - Full build
- `npm run typecheck` - Type checking only
- `npm run lint` - Linting with auto-fix
- `npm run format` - Auto-format with Prettier
- `npm run test` - Full test suite
- `npm run test:unit` - Fast unit tests only
- `npm run test:reporters` - Reporter integration tests
- `npm run checks` - Full CI suite (typecheck, lint, format, test)

---

*Stack analysis: 2026-02-11*
