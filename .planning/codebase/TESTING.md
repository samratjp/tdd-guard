# Testing Patterns

**Analysis Date:** 2026-02-11

## Test Framework

**Runner:**
- Vitest (v3.2.4) - Fast unit test runner
- Config: `vitest.config.ts` with multiple projects for parallelization
- Projects configured by type: `unit`, `integration`, `reporters`, `golangci-lint`, `default`

**Assertion Library:**
- Vitest built-in expect API (no separate library needed)
- Usage: `expect(result).toEqual({ ... })`, `expect(result).toBe('block')`

**Run Commands:**
```bash
npm run test              # Run all tests (unit + integration by default)
npm run test:unit        # Fast unit tests only (no integration)
npm run test:integration # Integration tests only
npm run test:reporters   # Test all reporter implementations (jest, vitest, storybook)
npm run test:coverage    # Run with coverage report
npm run checks           # Run typecheck, lint, format, and test
```

## Test File Organization

**Location:**
- Co-located with source: `src/config/Config.ts` paired with `src/config/Config.test.ts`
- Integration tests separate: `test/integration/*.test.ts`
- Test utils/factories: `test/utils/factories/*.ts`

**Naming:**
- Source files: `Module.ts` (PascalCase)
- Test files: `Module.test.ts` (always `.test.ts`, not `.spec.ts`)

**Structure:**
```
src/
├── config/
│   ├── Config.ts
│   └── Config.test.ts
├── validation/
│   ├── validator.ts
│   ├── validator.test.ts
│   ├── context/
│   │   ├── context.ts
│   │   └── context.test.ts
test/
├── utils/
│   ├── factories/       # All test data factories
│   │   ├── testDefaults.ts
│   │   ├── editFactory.ts
│   │   ├── writeFactory.ts
│   │   └── index.ts    # Unified testData export
│   └── index.ts        # Re-exports testData
├── integration/
│   ├── validator.core.test.ts
│   ├── validator.scenarios.test.ts
│   └── test-context.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { testData } from '@testUtils'

describe('Module Name', () => {
  // Optional: Setup state shared across tests
  let state: StateType

  beforeEach(() => {
    // Reset/initialize before each test
    vi.clearAllMocks()
    state = createInitialState()
  })

  afterEach(() => {
    // Cleanup after each test
    vi.resetModules()
  })

  describe('Feature or Method Name', () => {
    test('should do something specific', () => {
      const result = functionUnderTest(input)
      expect(result).toEqual(expected)
    })

    test('should handle edge case', () => {
      // Arrange
      const input = setupEdgeCase()

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe(expected)
    })
  })

  describe('Error Handling', () => {
    test('should block on invalid input', () => {
      expect(() => functionUnderTest(null)).toThrow()
    })
  })
})
```

**Patterns:**
- `describe()` for logical grouping by feature or class
- Nested `describe()` for sub-categories: `describe('Error Handling', () => { ... })`
- `beforeEach()` for setup (mock clearing, state initialization)
- `afterEach()` for cleanup (resetting modules, clearing files)
- Test name describes behavior: `should [action] [when condition]`

## Mocking

**Framework:** Vitest `vi` module (built-in)

**Patterns:**
```typescript
// Mock entire module
vi.mock('./context/context', () => ({
  generateDynamicContext: vi.fn(),
}))

// Use mocked function in test
const mockGenerateDynamicContext = vi.mocked(generateDynamicContext)
mockGenerateDynamicContext.mockReturnValue('test prompt')

// Mock rejected promises
const mockModelClient: IModelClient = {
  ask: vi.fn().mockRejectedValue(new Error('Command failed'))
}

// Mock resolved promises
const mockModelClient: IModelClient = {
  ask: vi.fn().mockResolvedValue(JSON.stringify({ decision: 'block' }))
}

// Clear all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

**What to Mock:**
- External service calls: API clients, model requests
- File system operations: For tests not requiring real I/O
- Environment variables: Use process.env overrides in test setup
- Expensive operations: Complex computations, database queries

**What NOT to Mock:**
- Pure utility functions: `pick()`, `omit()`, helper functions
- Types and schemas: Zod validation, type definitions
- Factory functions: Use factories to create test data instead
- Integration points being tested: If testing integration, use real implementations

## Fixtures and Factories

**Test Data:**
```typescript
// Factory function with JSDoc
/**
 * Creates a single edit object
 * @param params - Optional parameters for the edit
 */
export const edit = (params?: Partial<Edit>): Edit => {
  const defaults = TEST_DEFAULTS.edit
  const base = params ?? {}

  const result: Edit = {
    file_path: base.file_path ?? defaults.file_path,
    old_string: base.old_string ?? defaults.old_string,
    new_string: base.new_string ?? defaults.new_string,
  }

  if (base.replace_all !== undefined) {
    result.replace_all = base.replace_all
  }

  return result
}

// Factory with partial/omit helper
export const editWithout = <K extends keyof Edit>(
  keys: K[],
  params?: Partial<Edit>
): Omit<Edit, K> => {
  const fullEdit = edit(params)
  return omit(fullEdit, keys)
}
```

**Location:**
- Default values: `test/utils/factories/testDefaults.ts`
- Type-specific factories: `test/utils/factories/editFactory.ts`, `test/utils/factories/writeFactory.ts`, etc.
- Unified export: `test/utils/index.ts` exports single `testData` object

**Usage in Tests:**
```typescript
import { testData } from '@testUtils'

// Create with defaults
const operation = testData.editOperation()

// Create with overrides
const operation = testData.editOperation({
  tool_input: testData.edit({ file_path: '/custom/path.ts' })
})

// Create with properties omitted
const incomplete = testData.editWithout(['replace_all'])
```

## Coverage

**Requirements:** No hard minimum enforced (coverage reporting available)

**View Coverage:**
```bash
npm run test:coverage    # Generate and display coverage report
```

Coverage includes: line, branch, function, and statement coverage via `@vitest/coverage-v8`

## Test Types

**Unit Tests:**
- Scope: Single function or class method in isolation
- Location: Co-located with source in `src/` directories
- Approach: Mock dependencies, test pure logic, verify inputs/outputs
- Patterns: Input-output verification, error case handling, edge case coverage
- Examples: `Config.test.ts`, `validator.test.ts`, `ESLint.test.ts`

**Integration Tests:**
- Scope: Multiple modules working together with real implementations
- Location: `test/integration/` directory
- Approach: Use real config, real model clients, test end-to-end scenarios
- Patterns: Scenario-based testing with language-specific test data
- Examples: `validator.core.test.ts` tests validator with real model, `validator.scenarios.test.ts` tests comprehensive TDD rules

**E2E Tests:**
- Framework: Not used - CLI tested via subprocess in `tdd-guard.test.ts`
- Reporters tested via Playwright in `reporters/test/reporters.integration.test.ts`

## Common Patterns

**Async Testing:**
```typescript
test('should validate operation asynchronously', async () => {
  const result = await validator(context, mockModelClient)
  expect(result.decision).toBe('block')
})

// With mocked promises
const mockModelClient: IModelClient = {
  ask: vi.fn().mockResolvedValue(JSON.stringify({ decision: 'block', reason: 'TDD violation' }))
}
```

**Error Testing:**
```typescript
test('should handle model client errors', async () => {
  const mockModelClient: IModelClient = {
    ask: vi.fn().mockRejectedValue(new Error('Command failed: claude not found'))
  }

  const result = await validator(context, mockModelClient)
  expect(result.decision).toBe('block')
  expect(result.reason).toContain('Error during validation')
})

test('should throw on invalid input', () => {
  expect(() => functionUnderTest(null)).toThrow('Expected message')
})
```

**Data-Driven Testing (Parameterized):**
```typescript
const testCases = [
  { name: 'should handle case 1', input: 'value1', expected: 'result1' },
  { name: 'should handle case 2', input: 'value2', expected: 'result2' },
]

testCases.forEach(({ name, input, expected }) => {
  test(name, () => {
    const result = functionUnderTest(input)
    expect(result).toBe(expected)
  })
})
```

**Environment Variable Testing:**
```typescript
describe('Config with env vars', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  test('uses TEST_MODEL_TYPE in test mode', () => {
    process.env.TEST_MODEL_TYPE = 'custom_model'
    const config = new Config({ mode: 'test' })
    expect(config.modelType).toBe('custom_model')
  })
})
```

**Test Helper Functions:**
Test helpers placed at bottom of test file after all test suites:
```typescript
// Test helper
async function runValidator(
  modelResponse: string | Error,
  options?: { contextOverrides?: Partial<Context> }
): Promise<{ result: ValidationResult; mockModelClient: IModelClient }> {
  const mockModelClient: IModelClient = {
    ask: modelResponse instanceof Error
      ? vi.fn().mockRejectedValue(modelResponse)
      : vi.fn().mockResolvedValue(modelResponse)
  }

  const context: Context = {
    modifications: JSON.stringify(testData.editOperation()),
    ...options?.contextOverrides,
  }

  const result = await validator(context, mockModelClient)
  return { result, mockModelClient }
}
```

## Test Configuration

**Vitest Projects:**
- `golangci-lint`: Forked pool for tests changing working directory
- `unit`: Threaded pool for fast unit tests, excludes integration and golangci
- `integration`: Threaded pool for integration tests
- `reporters`: Threaded pool for reporter implementations
- `default`: All tests except slow golangci tests

**ESLint Rules in Tests:**
- Test files in `**/**.test.ts` have relaxed rules:
  - `max-lines-per-function: off` - Tests can be longer
  - `sonarjs/no-nested-functions: off` - Nested test helpers allowed
  - `no-magic-numbers: off` - Magic numbers acceptable in tests
  - `@typescript-eslint/explicit-function-return-type: off` - Implicit returns OK

---

*Testing analysis: 2026-02-11*
