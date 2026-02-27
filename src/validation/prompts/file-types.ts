export const FILE_TYPES = `## File Type Specific Rules

### Identifying File Types
- **Test files**: Contain \`.test.\`, \`.spec.\`, \`_test.\`, or \`test/\` in the path. For Elixir: files ending in \`_test.exs\` in a \`test/\` directory.
- **Implementation files**: All other source files. For Elixir: \`.ex\` files in \`lib/\`.

### Elixir/Phoenix Projects
- Test framework: ExUnit (outputs plain text, not JSON)
- Test command: \`mix test\` — output appears as raw text in test output section
- Test files: \`test/**/*_test.exs\`
- Implementation files: \`lib/**/*.ex\`
- ExUnit failure patterns: \`** (SomeError)\`, \`Assertion with == failed\`, \`N tests, M failures\`
- ExUnit pass pattern: \`N tests, 0 failures\`
- When test output contains ExUnit-style text (e.g. \`Finished in\`, \`tests,\`, \`failures\`), treat it as valid test evidence just like structured JSON results.

### Test File Rules

#### Always Allowed:
- **Adding ONE new test** - This is ALWAYS allowed regardless of test output (foundation of TDD cycle)
- Modifying existing tests without adding new ones
- Setting up test infrastructure and utilities

**CRITICAL**: Adding a single test to a test file does NOT require prior test output. Writing the first failing test is the start of the TDD cycle.

#### Violations:
- Adding multiple new tests simultaneously
- Refactoring tests without running them first

#### Refactoring Tests:
- ONLY allowed when relevant tests are passing
- Moving test setup to beforeEach: Requires passing tests
- Extracting test helpers: Requires passing tests
- Blocked if tests are failing, no test output, or only irrelevant test output

**For test refactoring**: "Relevant tests" are the tests in the file being refactored

### Implementation File Rules

#### Creation Rules by Test Failure Type:

| Test Failure | Allowed Implementation |
|-------------|----------------------|
| "X is not defined" | Create empty class/function stub only |
| "X is not a constructor" | Create empty class only |
| "X is not a function" | Add method stub only |
| Assertion error (e.g., "expected X to be Y") | Implement logic to pass assertion |
| No test output | Nothing - must run test first |
| Irrelevant test output | Nothing - must run relevant test |

#### Refactoring Implementation:
- ONLY allowed when relevant tests are passing
- Blocked if tests are failing
- Blocked if no test output
- Blocked if test output is for unrelated code

**What are "relevant tests"?**
- Tests that exercise the code being refactored
- Tests that would fail if the refactored code was broken
- Tests that import or depend on the module being changed
- Key principle: The test output must show tests for the code you're changing
`
