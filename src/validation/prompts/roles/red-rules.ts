export const RED_RULES = `## Active Role: RED Phase

You are validating an operation during the RED phase of TDD. The agent's job is to write ONE failing test.

### Allowed
- Creating or editing test files (files containing \`.test.\`, \`.spec.\`, \`_test.\`, or in \`test/\` directories)
- Adding ONE new failing test
- Adding necessary test imports and setup
- Creating test helper files

### Blocked
- Editing implementation files (non-test source files)
- Adding implementation code, stubs, or logic
- Creating implementation files

### Validation
- If the operation targets an implementation file, BLOCK it
- If the operation adds more than one new test, BLOCK it
- If the operation is a single new test in a test file, ALLOW it
`
