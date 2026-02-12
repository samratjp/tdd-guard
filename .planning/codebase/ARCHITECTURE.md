# Architecture

**Analysis Date:** 2026-02-11

## Pattern Overview

**Overall:** Event-driven hook processing pipeline with AI-based validation and dependency injection

**Key Characteristics:**
- CLI hook intercepts file operations (Edit, Write, MultiEdit) from Claude Code
- Asynchronous event processing with Storage abstraction for test/lint/modification data
- AI validation layer uses multiple model clients (Claude SDK, CLI, Anthropic API)
- Pluggable linter and provider implementations
- Per-session context building from storage-persisted hook data

## Layers

**Hook Entry Point:**
- Purpose: Receives stdin hook events from Claude Code and routes to appropriate handler
- Location: `src/cli/tdd-guard.ts`
- Contains: CLI entry point, dependency initialization, stdin buffering
- Depends on: Storage, Config, ModelClientProvider, validator
- Used by: Claude Code hook system via npm bin

**Hook Processing:**
- Purpose: Validates hook format, extracts file operations, decides validation necessity
- Location: `src/hooks/processHookData.ts`
- Contains: Event routing (SessionStart, PreToolUse, PostToolUse), early exit logic, file ignore patterns, lint notification handling
- Depends on: HookEvents, SessionHandler, UserPromptHandler, GuardManager, PostToolLintHandler
- Used by: tdd-guard CLI entry point

**Event Handlers:**
- SessionHandler (`src/hooks/sessionHandler.ts`): Initializes session state, clears transient data, ensures default instructions exist
- UserPromptHandler (`src/hooks/userPromptHandler.ts`): Processes user commands (tdd-guard on/off)
- PostToolLintHandler (`src/hooks/postToolLint.ts`): Handles lint results after tool execution
- HookEvents (`src/hooks/HookEvents.ts`): Extracts and persists tool operations (file edits/writes/todos)

**Context Building:**
- Purpose: Aggregates persisted hook data from storage into validation context
- Location: `src/cli/buildContext.ts`
- Contains: Parallel loading of modifications, test results, todos, lint, instructions; lint data processing
- Depends on: Storage, LintProcessor, TestResultsProcessor
- Used by: Validation layer

**Validation Layer:**
- Purpose: Sends formatted context to AI model, parses response, enforces TDD rules
- Location: `src/validation/validator.ts`
- Contains: Model client orchestration, response parsing (JSON extraction), error handling
- Depends on: Context generator, ModelClient (SDK/CLI/API)
- Used by: processHookData for final decision

**Context Formatting:**
- Purpose: Builds AI prompt from Context with TDD rules, test output, lint issues
- Location: `src/validation/context/context.ts`
- Contains: Dynamic prompt assembly from modular prompt sections, operation-specific formatting
- Depends on: System prompts, operation prompts, tool prompts
- Used by: Validator

**Configuration & Storage:**
- Config (`src/config/Config.ts`): Environment-based settings (data dir, model version, client type, linter type)
- Storage interface (`src/storage/Storage.ts`): Transient data persistence (test, modifications, todo, lint, config, instructions)
- FileStorage (`src/storage/FileStorage.ts`): Filesystem implementation using `.claude/tdd-guard/data/`
- MemoryStorage: In-memory implementation for testing

**Providers:**
- ModelClientProvider (`src/providers/ModelClientProvider.ts`): Factory for model clients (SDK, API, CLI)
- LinterProvider (`src/providers/LinterProvider.ts`): Factory for language-specific linters (ESLint, golangci-lint)

**Linters:**
- Linter interface (`src/linters/Linter.ts`): Abstraction for code quality checking
- ESLint (`src/linters/eslint/ESLint.ts`): JavaScript/TypeScript linting
- GolangciLint (`src/linters/golangci/GolangciLint.ts`): Go linting

**Processing:**
- TestResultsProcessor (`src/processors/testResults/TestResultsProcessor.ts`): Formats test failures into readable summaries (handles Vitest/pytest)
- lintProcessor (`src/processors/lintProcessor.ts`): Transforms lint data into grouped-by-file issues

**Model Clients:**
- ClaudeAgentSdk (`src/validation/models/ClaudeAgentSdk.ts`): Uses `@anthropic-ai/claude-agent-sdk` query() with disallowed tools
- AnthropicApi (`src/validation/models/AnthropicApi.ts`): Direct Anthropic API calls
- ClaudeCli (`src/validation/models/ClaudeCli.ts`): System Claude CLI invocation

**Guard Management:**
- GuardManager (`src/guard/GuardManager.ts`): Enable/disable state, file ignore patterns (minimatch), storage-backed config

**Type Contracts:**
- Context (`src/contracts/types/Context.ts`): Typed context with modifications, test, todo, lint, instructions
- ValidationResult (`src/contracts/types/ValidationResult.ts`): Model response (decision: block/approve/null, reason)
- Schemas: Tool operations (Edit/Write/MultiEdit), reporter formats (Vitest/pytest), lint results

## Data Flow

**Hook Reception to Validation:**

1. `tdd-guard` CLI receives hook event on stdin from Claude Code
2. `processHookData()` parses JSON, checks if file should be ignored via GuardManager
3. Routes by event type:
   - SessionStart → SessionHandler clears transient data, initializes instructions
   - UserPromptSubmit → UserPromptHandler processes commands (enable/disable guard)
   - PostToolUse → PostToolLintHandler checks lint issues when tests passing
   - PreToolUse/PostToolUse other → HookEvents extracts operation and persists to Storage
4. For file operations (Edit/Write/MultiEdit):
   - HookEvents persists modified file content to Storage.modifications
   - If tests/lint available, buildContext() loads all persisted data in parallel
   - Formatters transform test/lint data into readable summaries
   - Context generator assembles multi-section prompt with modular rules/operations
5. Validator sends to ModelClient, parses JSON response
6. Returns decision (block/approve) with reason in ValidationResult
7. Claude Code hook receives JSON response, applies decision

**State Transitions:**

- Session Start → Clear transient data, set initial instructions
- User writes/edits file → Persisted to modifications, awaits test run
- Tests run → Storage.test updated by reporter hook
- Linter runs → Storage.lint updated by linter hook
- Next tool invocation → Full context built, validated, cleared on session end

**State Management:**

- **Persistent (per session):** config.json (guard enabled/disabled, ignore patterns)
- **Transient (cleared on SessionStart):** test.json, modifications.json, todos.json, lint.json
- **Immutable per session:** instructions.md (TDD rules, can be overridden)
- **Location:** `.claude/tdd-guard/data/` relative to project root or `CLAUDE_PROJECT_DIR`

## Key Abstractions

**Storage Interface:**
- Purpose: Abstract file/memory persistence for hook data
- Examples: `src/storage/Storage.ts`, `src/storage/FileStorage.ts`, `src/storage/MemoryStorage.ts`
- Pattern: Interface with implementations (Storage, FileStorage, MemoryStorage); injected via constructor

**ModelClient Interface:**
- Purpose: Abstract model interaction (query format, response parsing)
- Examples: `src/validation/models/ClaudeAgentSdk.ts`, `src/validation/models/AnthropicApi.ts`, `src/validation/models/ClaudeCli.ts`
- Pattern: IModelClient interface with `ask(prompt): Promise<string>`; selected via Config.validationClient

**Linter Interface:**
- Purpose: Abstract language-specific code quality checking
- Examples: `src/linters/eslint/ESLint.ts`, `src/linters/golangci/GolangciLint.ts`
- Pattern: Linter base class with run() method; selected via Config.linterType

**Hook Schemas:**
- Purpose: Runtime validation of hook event structure and tool operations
- Location: `src/contracts/schemas/toolSchemas.ts`, `src/contracts/schemas/reporterSchemas.ts`
- Pattern: Zod schemas for HookData, ToolOperation (Edit/Write/MultiEdit), test/lint results; safeParse() for errors

## Entry Points

**CLI Entry Point:**
- Location: `src/cli/tdd-guard.ts` (bin: tdd-guard)
- Triggers: Claude Code hook invocation (stdin)
- Responsibilities: Parse hook JSON, initialize Config/Storage/ModelProvider, call processHookData, output ValidationResult JSON

**Session Initialization:**
- Location: `src/hooks/sessionHandler.ts`
- Triggers: SessionStart hook event
- Responsibilities: Clear transient data, ensure instructions exist, reset session state

**Pre-Tool Validation:**
- Location: `src/hooks/processHookData.ts` (PreToolUse branch)
- Triggers: Before Claude Code executes a tool
- Responsibilities: Check if lint issues need notification when tests passing

**Post-Tool Processing:**
- Location: `src/hooks/postToolLint.ts` (PostToolUse branch)
- Triggers: After Claude Code executes Edit/Write/MultiEdit/Bash
- Responsibilities: Extract modified file, run linter, persist results

## Error Handling

**Strategy:** Graceful degradation - failed validation returns `{decision: 'block', reason: 'Error message'}`, allowing Claude Code to show feedback

**Patterns:**

- **Schema Validation:** Zod safeParse() returns success/failure; operations skipped on parse failure
- **Storage Errors:** FileStorage getters return null on missing files; processors handle null data gracefully
- **Model Errors:** Try-catch in validator wraps model client calls; returns blocking error message
- **JSON Parsing:** Response extractor tries multiple parse strategies (JSON block, code block, plain JSON) before failing
- **File Operations:** postToolLint catches errors when accessing modified files, returns gracefully
- **Linter Execution:** LinterProvider returns null linter on initialization failure; lint notifications skipped

## Cross-Cutting Concerns

**Logging:** console.error() for exceptions, returned to Claude Code via JSON reason field

**Validation:**
- Schema-based validation via Zod for all external inputs (hook events, reporter output, lint results)
- Operation-specific validation (todo vs file modification, file path extraction)
- File path extraction with strict type checking in processHookData.extractFilePath()

**Authentication:**
- Config reads anthropic API key from TDD_GUARD_ANTHROPIC_API_KEY env var (never logged)
- Claude CLI uses system authentication
- Claude Agent SDK uses environment-provided credentials

**Configuration Priority:**
1. Constructor options (ConfigOptions parameter)
2. Environment variables (TDD_GUARD_*, MODEL_TYPE, VALIDATION_CLIENT, etc.)
3. Defaults (DEFAULT_MODEL_VERSION, DEFAULT_CLIENT)

---

*Architecture analysis: 2026-02-11*
