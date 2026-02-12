# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**Claude Model Services:**
- Anthropic Messages API - Direct HTTP API for Claude model inference
  - SDK: `@anthropic-ai/sdk` 0.72.1
  - Client: `src/validation/models/AnthropicApi.ts`
  - Auth: `TDD_GUARD_ANTHROPIC_API_KEY` env var
  - Purpose: Sends TDD validation prompts to Claude and receives validation decisions

- Claude Agent SDK - Agent framework for orchestrated model interactions
  - SDK: `@anthropic-ai/claude-agent-sdk` 0.2.25
  - Client: `src/validation/models/ClaudeAgentSdk.ts`
  - Purpose: Streaming query interface for TDD validation with system prompts and tool restrictions

- Claude CLI - Local Claude binary interface
  - Client: `src/validation/models/ClaudeCli.ts`
  - Binary: `~/.claude/local/claude` or system `claude` command
  - Config: `USE_SYSTEM_CLAUDE` env var to use system installation
  - Purpose: Fallback model client using subprocess execution

## Data Storage

**File Storage:**
- Local filesystem only - All data stored in `.claude/tdd-guard/data/` directory
  - Config dir: `DEFAULT_DATA_DIR = .claude/tdd-guard/data`
  - Config override: `CLAUDE_PROJECT_DIR` env var (must be absolute path)
  - Storage client: `src/storage/FileStorage.ts`
  - Storage interface: `src/storage/Storage.ts`

**Stored Files:**
- `test.json` - Test execution results
- `todos.json` - TODO/FIXME items extracted from code
- `modifications.json` - File modifications (Edit/Write/MultiEdit operations)
- `lint.json` - Linter violations and warnings
- `config.json` - Project configuration
- `instructions.md` - Project instructions

**Alternative Storage:**
- Memory storage available for testing: `src/storage/MemoryStorage.ts`
- In-memory only, non-persistent

**No External Databases:**
- No databases (SQL/NoSQL)
- No caching layer (Redis/Memcached)
- No cloud storage (S3/Google Cloud Storage)

## Code Quality Integration

**ESLint Integration:**
- Linter framework: ESLint 9.39+
- Client: `src/linters/eslint/ESLint.ts`
- Execution: Via `npx eslint` subprocess
- Output format: JSON (parsed from stdout)
- Supported configs: Custom config path via `configPath` parameter

**Golangci-lint Integration:**
- Linter framework: golangci-lint (external binary)
- Client: `src/linters/golangci/GolangciLint.ts`
- Execution: Via `golangci-lint run` subprocess
- Output format: JSON (parsed from stdout)
- Supported configs: Custom config path via `configPath` parameter

## Test Reporter Integrations

**JavaScript/TypeScript Test Reporters:**
- Jest (tdd-guard-jest 0.1.4) - Jest reporter plugin
  - Peer dependency: `jest >= 30.0.5`
  - Location: `reporters/jest/`
  - Integration: Custom Jest reporter class
  - Publishes to: npm (@nizar.selander/tdd-guard-jest)

- Vitest (tdd-guard-vitest 0.1.6) - Vitest reporter plugin
  - Peer dependency: `vitest >= 3.2.4`
  - Location: `reporters/vitest/`
  - Integration: Custom Vitest reporter class (used in main config)
  - Publishes to: npm (tdd-guard-vitest)

- Storybook (tdd-guard-storybook 0.1.0) - Storybook test-runner reporter
  - Peer dependency: `@storybook/test-runner >= 0.19.0`
  - Location: `reporters/storybook/`
  - Integration: Custom test-runner reporter
  - Publishes to: npm (tdd-guard-storybook)

**Python Test Reporters:**
- Pytest (tdd-guard-pytest 0.1.2) - Pytest plugin
  - Dependency: `pytest >= 6.0`
  - Location: `reporters/pytest/`
  - Support: Python 3.8+
  - Publishes to: PyPI (tdd-guard-pytest)

**Ruby Test Reporters:**
- RSpec (tdd-guard-rspec) - RSpec reporter
  - Location: `reporters/rspec/`
  - Publishes to: RubyGems (tdd-guard-rspec)

**Go Test Reporters:**
- Go (tdd-guard-go) - Go testing reporter
  - Module: github.com/nizos/tdd-guard/reporters/go
  - Go version: 1.24+
  - Location: `reporters/go/`
  - Publishes to: Go module registry

**Rust Test Reporters:**
- Rust (tdd-guard-rust 0.1.0) - Cargo test reporter
  - Edition: 2021
  - Location: `reporters/rust/`
  - Publishes to: crates.io (tdd-guard-rust)
  - Binary name: tdd-guard-rust

**PHP Test Reporters:**
- PHPUnit (tdd-guard/phpunit 0.1.3) - PHPUnit reporter
  - Dependency: `phpunit/phpunit ^9.0 || ^10.0 || ^11.0 || ^12.0`
  - PHP version: 8.1+
  - Location: `reporters/phpunit/`
  - Publishes to: Packagist (tdd-guard/phpunit)

## Authentication & Identity

**API Authentication:**
- Anthropic API Key
  - Env var: `TDD_GUARD_ANTHROPIC_API_KEY`
  - Purpose: Authenticate with Anthropic Messages API
  - Loaded via: dotenv configuration in `src/cli/tdd-guard.ts`
  - Config class: `src/config/Config.ts` (line 61)

**No OAuth/SSO:**
- No third-party authentication
- No user accounts or identity management

## Hooks & Claude Code Integration

**Hook Integration Points:**
- File operation interception: Edit, MultiEdit, Write operations
- Location: `src/hooks/` directory
- Purpose: Intercept and validate Claude Code file operations

**Context Builder:**
- Location: `src/cli/buildContext.ts`
- Purpose: Constructs validation context from file operations and test results

## Configuration Management

**Environment Variables:**
- `TDD_GUARD_ANTHROPIC_API_KEY` - Anthropic API authentication
- `TDD_GUARD_MODEL_VERSION` - Override default model (defaults to `claude-sonnet-4-0`)
- `MODEL_TYPE` - Client type (api, cli, sdk) - legacy naming
- `VALIDATION_CLIENT` - New env var for client selection
- `TEST_MODEL_TYPE` - Override model type in test mode
- `USE_SYSTEM_CLAUDE` - Use system Claude CLI instead of local
- `LINTER_TYPE` - Enable specific linter (eslint, golangci-lint)
- `CLAUDE_PROJECT_DIR` - Project root directory (must be absolute, validated)

**Configuration Precedence:**
1. Constructor options (ConfigOptions)
2. Environment variables
3. Defaults from `src/config/Config.ts`

**Stored Configuration:**
- Location: `.claude/tdd-guard/data/config.json`
- Managed by: Storage abstraction (`src/storage/`)

## CI/CD & Deployment

**Version Control:**
- Repository: github.com/nizos/tdd-guard
- Commits validated with commitlint (conventional format required)

**Package Publishing:**
- npm: Main package and npm workspace reporters (jest, vitest, storybook)
- PyPI: pytest reporter
- crates.io: Rust reporter
- RubyGems: RSpec reporter
- Packagist: PHPUnit reporter
- Go module registry: Go reporter

**No CI Provider:**
- Tests run locally with `npm run test`
- Full checks with `npm run checks` (typecheck, lint, format, test)

## External Tool Dependencies

**Required for Linting:**
- ESLint (npm) - Via `npx eslint` subprocess in `src/linters/eslint/ESLint.ts`
- golangci-lint (binary) - Via subprocess in `src/linters/golangci/GolangciLint.ts`

**Required for Language Support:**
- Node.js/npm - For JavaScript/TypeScript reporters
- Python/pip - For pytest reporter
- Go toolchain - For Go reporter
- Ruby/Bundler - For RSpec reporter
- PHP/Composer - For PHPUnit reporter
- Rust/Cargo - For Rust reporter

**Optional:**
- Playwright - For Storybook test-runner setup (`pretest:reporters` installs chromium)

---

*Integration audit: 2026-02-11*
