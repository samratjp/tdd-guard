# Codebase Concerns

**Analysis Date:** 2026-02-11

## Tech Debt

**Unvalidated JSON Parsing Throughout Context Building:**
- Issue: Multiple locations parse JSON without pre-validation, relying on downstream Zod schemas or catch-alls. `JSON.parse()` is called directly on untrusted input from storage.
- Files: `src/validation/context/context.ts:34`, `src/cli/buildContext.ts:18`, `src/cli/buildContext.ts:42`, `src/hooks/processHookData.ts:53`, `src/hooks/processHookData.ts:151-152`
- Impact: SyntaxErrors from malformed JSON are caught silently but lose error context. If a storage file is corrupted or partially written, parsing fails with generic fallbacks returning empty strings, potentially hiding data loss.
- Fix approach: Add centralized JSON parsing utility with explicit error logging. Pre-validate JSON structure before parsing. Include file path and line number in error context.

**Silent Error Absorption in Critical Paths:**
- Issue: Multiple `catch` blocks with no error logging or monitoring. Empty catch blocks with comments like "Treat any error as no stored data" mask real problems.
- Files: `src/cli/buildContext.ts:23-24`, `src/hooks/postToolLint.ts:45-46`, `src/hooks/postToolLint.ts:56-58`, `src/hooks/processHookData.ts:157-158`, `src/hooks/processHookData.ts:173-174`, `src/guard/GuardManager.ts:78-80`
- Impact: Storage failures, schema validation errors, and genuine system issues are indistinguishable from missing data. Debugging production issues becomes difficult.
- Fix approach: Implement structured error logging with context (file path, operation type, data sample). Distinguish between "not found" errors (file doesn't exist) and "corrupted data" errors (parse failure).

**Type Casting Bypasses Schema Validation:**
- Issue: Multiple locations use `as Record<string, unknown>` and type assertions instead of validated schemas before accessing nested properties.
- Files: `src/hooks/processHookData.ts:34`, `src/hooks/processHookData.ts:41`, `src/hooks/fileTypeDetection.ts:3`
- Impact: If hook data structure changes, code silently accesses undefined properties instead of failing validation. Creates runtime bugs that tests may not catch.
- Fix approach: Parse and validate with schemas immediately after JSON.parse(). Use discriminated unions to safely access nested data.

**Unbounded Context Size in Model Requests:**
- Issue: Full file content (including all changes) is included in prompts with only `max_tokens: 1024` limit. Large file edits may be truncated silently or cause token limit errors.
- Files: `src/validation/context/context.ts:74-79`, `src/validation/models/AnthropicApi.ts:21`
- Impact: When editing large files or multiple files, critical context is lost. Model receives incomplete information about what code changed, leading to incorrect validation decisions.
- Fix approach: Add content size validation before including in context. Truncate with clear markers or exclude if too large. Track token estimates per component.

**No Timeout or Circuit Breaker for Model Requests:**
- Issue: ClaudeCli has 60s timeout, but AnthropicApi has no configurable timeout. If model becomes unresponsive, validation hangs indefinitely.
- Files: `src/validation/models/ClaudeCli.ts:38`, `src/validation/models/AnthropicApi.ts:17-31`
- Impact: Claude Code hook can hang indefinitely, blocking user workflow. No fallback or degraded mode.
- Fix approach: Add explicit timeout configuration to AnthropicApi. Implement retry logic with exponential backoff. Add circuit breaker pattern if consecutive timeouts occur.

**Fragile JSON Extraction in Validator:**
- Issue: `extractJsonString()` uses multiple regex patterns and fallbacks to find JSON in model response. Patterns assume specific formatting.
- Files: `src/validation/validator.ts:41-64`, especially lines 93-96 with complex regex
- Impact: If Claude changes response format slightly (e.g., wraps JSON differently), validation silently fails or extracts wrong JSON. Regex pattern doesn't validate found JSON structure matches expected schema.
- Fix approach: Replace regex extraction with parser that enforces `{decision: 'block'|'approve'|null, reason: string}` structure. Validate parsed result matches ValidationResult schema before returning.

## Known Bugs

**NonNull Assertion on undefined Map Values:**
- Symptoms: Potential runtime crash when accessing `issuesByFile.get(issue.file)!.push()`
- Files: `src/hooks/postToolLint.ts:94`
- Trigger: This should not happen given the guard on line 90, but TypeScript's control flow analysis doesn't guarantee it
- Workaround: Code works in practice because the guard ensures value exists, but type checker should reflect this
- Fix: Use `const issues = issuesByFile.get(issue.file) ?? []; issues.push(...)`

**Error Decision Normalization:**
- Symptoms: When model errors occur, validator always returns `decision: 'block'`, but response normalization converts `null` to `undefined`
- Files: `src/validation/validator.ts:20-31`, `src/validation/validator.ts:155-157`
- Trigger: Model error or "No response" condition
- Impact: Inconsistent decision types - sometimes `null`, sometimes `undefined`. Callers must handle both.
- Fix: Standardize on one representation. Either always block on error (current behavior) or return explicit error decision type.

**Missing Validation in formatTodoSection:**
- Symptoms: If todo JSON is malformed or missing tool_input, crashes with unclear error
- Files: `src/validation/context/context.ts:124-125`
- Trigger: Corrupted todo.json file or unexpected todo operation structure
- Impact: Context generation fails partway through, leaving system in bad state
- Fix: Validate todo operation against schema before accessing nested properties

## Security Considerations

**Arbitrary Code Execution via execFileSync:**
- Risk: ClaudeCli uses `execFileSync` to invoke Claude binary. If binary path is compromised or CLAUDEBINARY env var injected, arbitrary code runs.
- Files: `src/validation/models/ClaudeCli.ts:36-42`
- Current mitigation: Uses explicit binary name and homedir-based path. Disallows TodoWrite tool.
- Recommendations:
  - Validate binary path against allowlist
  - Use full absolute path instead of searching PATH
  - Sign/hash binary and verify on startup
  - Never pass unsanitized user input to args array

**API Key Exposure in Config:**
- Risk: `process.env.TDD_GUARD_ANTHROPIC_API_KEY` loaded into Config object which may be logged or serialized
- Files: `src/config/Config.ts:61`
- Current mitigation: Config object not typically logged in error contexts
- Recommendations:
  - Implement toString/toJSON on Config to redact apiKey
  - Avoid passing Config object to error handlers or logging
  - Use sealed object or getter to prevent accidental exposure

**Environment Variable Pollution:**
- Risk: Numerous `process.env` reads without validation. Malformed values fall through to defaults silently.
- Files: Multiple across `src/config/Config.ts`, `src/validation/models/ClaudeCli.ts`
- Impact: Silent configuration mismatches (e.g., MODEL_TYPE typo uses default instead of raising error)
- Recommendations: Validate env vars against schema at startup with clear error messages

**Relative Path Handling in GuardManager:**
- Risk: File patterns matched with `minimatch` can bypass security with patterns like `../../secrets`
- Files: `src/guard/GuardManager.ts:52-57`
- Current mitigation: Default patterns don't include path traversal, but custom patterns are user-supplied
- Recommendations: Validate ignore patterns don't escape project root, normalize paths before matching

## Performance Bottlenecks

**N+1 Async Operations in buildContext:**
- Problem: Seven sequential `await` operations for storage reads, but they're parallelized with Promise.all
- Files: `src/cli/buildContext.ts:7-13`
- Current state: Actually efficient with Promise.all, not a bottleneck
- Note: Good pattern to maintain

**File I/O Synchronous Processing:**
- Problem: ESLint linter spawns subprocess synchronously for each lint operation
- Files: `src/linters/eslint/ESLint.ts:18-19`
- Cause: execFileAsync waits for subprocess to complete before returning
- Improvement path: Batch file linting or cache lint results to avoid repeated subprocess invocations

**Untruncated File Content in Prompts:**
- Problem: Large files (editing 1000+ line file) include full content in model request
- Files: `src/validation/context/context.ts:74-97`
- Cause: No size limits on what gets included in formatSection()
- Improvement path: Implement content truncation with "..." markers for large changes, include line numbers instead of full context

**Regenerating Lint Data on Every Hook:**
- Problem: Even if same files are linted multiple times in a session, results aren't cached
- Files: `src/hooks/postToolLint.ts:127`
- Improvement path: Cache lint results per file + timestamp, invalidate on modification

## Fragile Areas

**Hook Event Processing Pipeline:**
- Files: `src/hooks/processHookData.ts:49-116`
- Why fragile: Multiple sequential checks (SessionStart, user commands, disabled check) with overlapping concerns. New hook types or event handling require deep code understanding.
- Safe modification: Add new event type handling near existing checks. Preserve early returns for performance. Add tests for interaction between checks.
- Test coverage: Line 68-70 for SessionStart, but incomplete coverage for edge cases like concurrent events

**Model Response Parsing:**
- Files: `src/validation/validator.ts:35-159`
- Why fragile: Depends on Claude formatting response in specific way (code blocks, JSON structure). Any model update or different model might format differently.
- Safe modification: Add comprehensive test cases for model output variations. Use strict schema validation on extracted JSON.
- Test coverage: Some coverage in validator.test.ts but only happy path tested

**Context Generation with Multiple JSON Parses:**
- Files: `src/validation/context/context.ts:30-135`
- Why fragile: Parses modifications, todos, lint data - if any single parse fails, whole context generation silently degrades
- Safe modification: Wrap each parse in try-catch with specific error handling. Test with corrupted data in each field.
- Test coverage: context.test.ts covers basic cases but not error scenarios (missing fields, malformed JSON)

**Storage Layer Abstraction:**
- Files: `src/storage/FileStorage.ts:25-36`
- Why fragile: All file operations wrapped in generic catch blocks. Silent failures cascade through system.
- Safe modification: Add logging before catch. Distinguish ENOENT (expected) from other errors (unexpected).
- Test coverage: Storage.test.ts exists but doesn't test corrupted file scenarios

## Scaling Limits

**Model Token Budget:**
- Current capacity: max_tokens=1024 in AnthropicApi
- Limit: Large file edits (>500 lines) likely exceed token budget when including test output + lint data
- Scaling path: Implement tiered context inclusion - only include relevant parts. Use separate model requests for complex scenarios.

**Lint Result Storage:**
- Current capacity: Full lint results serialized to `lint.json`
- Limit: Large projects with 100+ lint issues could produce multi-MB JSON files
- Scaling path: Implement rolling window or summary-only storage. Cache in-memory during session.

**Multiple File Operations:**
- Current capacity: ProcessHookData extracts ONE file_path per hook
- Limit: MultiEdit operations extract all files but context formation doesn't scale to 50+ file edits
- Scaling path: Batch file operations or create separate validation requests per file

## Dependencies at Risk

**minimatch Pattern Matching:**
- Risk: Uses `minimatch` with brace expansion and glob patterns. Complex patterns could cause ReDoS or performance issues.
- Impact: Guard ignore patterns could hang validation if maliciously crafted
- Migration plan: Validate pattern complexity before use. Consider simpler glob library or hardcoded whitelist.

**Zod Schema Validation:**
- Risk: Schemas are large and complex (e.g., reporterSchemas.ts). Schema changes require careful migration.
- Impact: Adding new field to hook data requires updating all schema files in sync
- Mitigation: Good test coverage for schemas. Consider extracting schemas to separate package.

**Claude CLI Binary Dependency:**
- Risk: Requires `~/.claude/local/claude` or system claude binary. If binary not installed or wrong version, validation fails silently.
- Impact: Fresh checkout won't work until Claude CLI is installed
- Migration path: Detect missing binary and provide clear error message. Consider bundling or version check.

## Missing Critical Features

**No Observability/Telemetry:**
- Problem: No way to track validation decisions, model performance, or error rates
- Blocks: Can't debug why validations are failing in production or optimize model prompts
- Recommendation: Add structured logging with spans for each major operation

**No Explicit Error States:**
- Problem: Validation always returns `{decision, reason}`. No way to distinguish "block due to error" from "block due to TDD violation"
- Blocks: Can't provide specific error recovery instructions to users
- Recommendation: Add error type field to ValidationResult for categorization

**No Configuration Validation at Startup:**
- Problem: Config loads env vars without comprehensive validation
- Blocks: Invalid config discovered mid-operation instead of startup
- Recommendation: Implement eager validation of required env vars and paths at application startup

**No Request/Response Logging for Model Calls:**
- Problem: Can't audit what prompts were sent to model or what responses received (for debugging)
- Blocks: Difficult to improve model prompts or identify model behavior changes
- Recommendation: Implement optional audit logging (off by default, toggleable) that logs sanitized prompts

## Test Coverage Gaps

**Corrupted Storage Files:**
- What's not tested: Partially written JSON files, truncated content, invalid UTF-8
- Files: `src/storage/FileStorage.ts`, `src/cli/buildContext.ts`
- Risk: System crashes or loses data silently if storage corruption occurs
- Priority: High - storage is critical path

**Model Response Edge Cases:**
- What's not tested: Model returning JSON with extra fields, model returning incomplete JSON, model returning multiple separate JSON objects
- Files: `src/validation/validator.ts`
- Risk: Validator fails to extract decision if response format differs slightly from expected
- Priority: High - validator reliability is critical

**Concurrent Hook Events:**
- What's not tested: Multiple hooks arriving in rapid succession (rapid file edits)
- Files: `src/hooks/processHookData.ts`, `src/storage/FileStorage.ts`
- Risk: Race conditions in file I/O or state inconsistency
- Priority: Medium - affects workflow under active editing

**Large File Handling:**
- What's not tested: Files > 100KB, > 1MB, operations on multiple large files
- Files: `src/validation/context/context.ts`, `src/hooks/postToolLint.ts`
- Risk: Context truncation, token limits exceeded, subprocess timeout
- Priority: Medium - affects large codebases

**Error Path Recovery:**
- What's not tested: Validator timeout, model API failure, storage permission denied
- Files: `src/validation/validator.ts`, `src/validation/models/AnthropicApi.ts`
- Risk: Cascading failures leave system in bad state
- Priority: Medium - affects resilience

---

*Concerns audit: 2026-02-11*
