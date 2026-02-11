# Coding Conventions

**Analysis Date:** 2026-02-11

## Naming Patterns

**Files:**
- PascalCase for classes and interfaces: `ESLint.ts`, `FileStorage.ts`, `Config.ts`, `GuardManager.ts`
- camelCase for functions and utilities: `validator.ts`, `buildContext.ts`, `processHookData.ts`
- kebab-case for multi-word descriptive files: `eslint.config.mjs`, `test-context.test.ts`, `postToolLint.ts`
- Suffix pattern: `.test.ts` for test files, `.spec.ts` for component specs

**Functions:**
- camelCase for all function names
- Verb-first naming: `buildContext()`, `processHookData()`, `generateDynamicContext()`, `formatOperation()`
- Prefix helpers with descriptive verbs: `extractFilePath()`, `parseResults()`, `createLintData()`, `skipWhitespace()`
- Type guard functions use `is` prefix: `isEditOperation()`, `isMultiEditOperation()`, `isWriteOperation()`, `isValidClient()`, `isExecError()`

**Variables:**
- camelCase for all variables and constants
- Uppercase for module-level constants: `TRANSIENT_DATA`, `DEFAULT_MODEL_VERSION`, `DEFAULT_DATA_DIR`, `SYSTEM_PROMPT`
- Single letters only for loop counters and iterators within single-line operations
- Descriptive names for all other variables: `mockModelClient`, `testResults`, `processedLintData`

**Types:**
- PascalCase for all type names: `Context`, `ValidationResult`, `ModelClient`, `LintResult`, `TestModule`
- Interface names start with `I` only for abstract service contracts: `IModelClient`, `Linter` (for class interface)
- Type aliases use PascalCase: `ClientType`, `Todo`, `Edit`, `EditOperation`
- Discriminated union types use `tool_name` literal fields: `'Edit'`, `'Write'`, `'MultiEdit'`, `'TodoWrite'`

## Code Style

**Formatting:**
- Prettier (v3.8.1) enforces all formatting
- Config: `.prettierrc` with settings:
  - `semi: false` - No semicolons
  - `singleQuote: true` - Single quotes for strings
  - `tabWidth: 2` - Two-space indentation
  - `trailingComma: 'es5'` - Trailing commas where valid in ES5
  - `printWidth: 80` - Line length limit
  - `arrowParens: 'always'` - Always wrap arrow function parameters

**Linting:**
- ESLint (v9.39.2) with TypeScript plugin and SonarJS plugin
- Config: `eslint.config.mjs` (flat config format)
- Complexity limits enforced:
  - `complexity: 20` - Max cyclomatic complexity
  - `cognitive-complexity: 20` - Max cognitive complexity
  - `max-lines-per-function: 80` - Max function lines (relaxed to 80 for primary code, off in tests)
  - `max-depth: 5` - Max nesting depth
  - `max-params: 5` - Max function parameters (warn level)
  - `max-statements: 40` - Max statements per function (warn level)

**Code Quality Rules:**
- `no-any: error` - Explicit types required everywhere
- `prefer-const: error` - Use const by default
- `prefer-template: error` - Use template literals over string concatenation
- `object-shorthand: error` - Use object property shorthand
- `prefer-arrow-callback: error` - Arrow functions in callbacks
- `prefer-object-spread: error` - Spread over Object.assign()
- `no-shadow: error` - No variable shadowing
- `no-param-reassign: error` - Function parameters immutable
- `no-nested-ternary: error` - Single-level ternary only
- `no-else-return: error` - Remove unnecessary else after return

## Import Organization

**Order:**
1. External dependencies first: `import { z } from 'zod'`
2. Internal absolute paths: `import { Context } from '../contracts/types/Context'`
3. Relative imports: `import { Storage } from './Storage'`
4. Type imports grouped: `import type { ... } from '...'` when importing only types

**Path Aliases:**
- `@testUtils` maps to `./test/utils/index.ts` for unified test data imports
- Always use aliases for frequently imported test utilities: `import { testData } from '@testUtils'`

**Module Structure:**
- Interfaces/types exported before implementations
- Factory functions grouped together at module end with clear naming
- Helper functions prefixed with verb and placed at bottom of file before factory exports
- Barrel files used in `test/utils/` to consolidate factory exports

## Error Handling

**Patterns:**
- Try-catch blocks used for expected failures: JSON parsing, file I/O, external command execution
- Error destructuring to extract messages: `error instanceof Error ? error.message : 'Unknown error'`
- Graceful degradation on error: `catch { return null }` or `catch { return [] }` instead of throwing
- Custom error messages wrap underlying errors: `Error \`Claude Agent SDK error: ${message.subtype}\``
- Type guards for error checking: `isExecError(error)` to safely access error properties

**Error Recovery:**
- Validation errors return default results rather than throwing: `return defaultResult` in hook processing
- Silent failures in non-critical operations: lint processing wraps in try-catch with fallback
- Specific error messages in validator responses for model consumption

## Logging

**Framework:** console object only (no external logging library)

**Patterns:**
- `console.log()` for structured output: JSON results from CLI entry point
- `console.error()` for error messages: CLI failures
- No debug logging in production code
- All console calls located in CLI layer only (`src/cli/tdd-guard.ts`)

## Comments

**When to Comment:**
- Section separators for major logical groups (e.g., `// Test constants`, `// Helper functions`)
- JSDoc comments on all factory functions explaining parameters and return values
- Comments for non-obvious type guards: `// Simple regex to find JSON objects containing both "decision" and "reason"`
- Explanatory comments for complex parsing logic, not for obvious code

**JSDoc/TSDoc:**
- All factory functions in `test/utils/factories/` have JSDoc blocks
- Format: `/** Creates a [description] @param [param] - [what it does] */`
- Example from `editFactory.ts`:
  ```typescript
  /**
   * Creates a single edit object
   * @param params - Optional parameters for the edit
   */
  export const edit = (params?: Partial<Edit>): Edit => { ... }
  ```
- JSDoc on exported functions and interfaces
- Optional on small utility functions without public API significance

## Function Design

**Size:**
- Aim for 40-80 lines per function (80-line limit with warnings)
- Longer validators broken into named helper functions: `extractJsonString()`, `extractFromJsonCodeBlock()`, `extractPlainJson()`
- Extractable logic moved to helpers even in tests

**Parameters:**
- Maximum 5 parameters (enforced with warnings)
- Optional parameters grouped at end with `?` modifier
- Destructured objects preferred over multiple positional parameters
- Dependency injection through parameters: `modelClient: IModelClient = new ClaudeCli()`

**Return Values:**
- Functions return values consistent with type signature
- Nullable returns use `| null` over `| undefined` for consistency: `string | null`
- Union types for varied returns: `ValidationResult` with `decision: 'block' | 'approve' | undefined`
- Early returns preferred: multiple guards at top before main logic

## Module Design

**Exports:**
- Named exports over default exports (default exports only for config files)
- Interface exports before implementation: `export interface Storage { ... }` before `export class FileStorage`
- Type exports grouped: `export type Edit = ...`, `export type EditOperation = ...`
- Factory exports at module level from `testData` singleton

**Barrel Files:**
- `test/utils/index.ts` re-exports unified `testData` object combining all factories
- Factories accessed via dot notation: `testData.edit()`, `testData.editOperation()`
- All test data creation goes through testData (no direct factory imports)

**Abstraction Patterns:**
- Interfaces define contracts: `Storage`, `Linter`, `IModelClient`
- Implementations injectable via constructor: `FileStorage implements Storage`
- Providers return instances: `ModelClientProvider.getModelClient()`, `LinterProvider.getLinter()`
- Discriminated unions for operation type handling: `ToolOperation` with `tool_name` literal types

---

*Convention analysis: 2026-02-11*
