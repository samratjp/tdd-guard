# TDD Guard RSpec Reporter

## What This Is

An RSpec reporter gem (`tdd-guard-rspec`) that captures test results from RSpec test runs and writes them in TDD Guard's JSON format. This enables TDD Guard to enforce test-driven development in Rails/Ruby projects using Claude Code hooks — blocking code changes that skip tests or over-implement beyond what tests cover.

## Core Value

Rails projects using Claude Code can enforce TDD automatically — Claude Code is blocked from writing production code without corresponding test coverage, using the same mechanism that already works for Jest, Vitest, Pytest, PHPUnit, Go, and Rust.

## Requirements

### Validated

- ✓ TDD Guard core CLI and validation pipeline — existing
- ✓ Reporter JSON schema contract (testModules, tests, state, errors) — existing
- ✓ Integration test framework for reporters — existing
- ✓ reporters/rspec/ directory stub — existing

### Active

- [ ] RSpec formatter gem that captures test results
- [ ] Output matches TDD Guard reporter JSON schema
- [ ] Handle passing, failing, and errored tests
- [ ] Handle pending/skipped tests
- [ ] Handle syntax/load errors (import errors)
- [ ] Group tests by spec file path (testModules)
- [ ] Configurable project root (env var or RSpec config)
- [ ] Write results to `.claude/tdd-guard/data/test.json`
- [ ] Integration tests following existing reporter test pattern
- [ ] Test artifacts for RSpec scenarios (passing, failing, import error)
- [ ] README with installation and configuration instructions
- [ ] Gemspec for publishing to RubyGems

### Out of Scope

- RuboCop linter integration — separate concern, can be added later
- Rails-specific generators or rake tasks — keep it simple, just the reporter
- Spring preloader integration — RSpec formatter works regardless of how RSpec is invoked
- Parallel test support (parallel_tests gem) — standard RSpec first
- SimpleCov integration — coverage is separate from test result reporting

## Context

TDD Guard already has 7 reporter implementations across different languages. Each follows the same pattern:
1. Hook into the test framework's reporting/formatter system
2. Collect test results (name, state, errors)
3. Group by module/file
4. Write JSON to `.claude/tdd-guard/data/test.json`

RSpec uses a "formatter" system where custom formatters receive callbacks for each test example. This is the natural integration point — similar to how Pytest uses plugin hooks and PHPUnit uses extensions.

The existing reporters/test/ infrastructure has integration tests that validate all reporters produce correct output. The RSpec reporter needs to follow this same pattern with test artifacts in reporters/test/artifacts/rspec/.

## Constraints

- **Ruby compatibility**: Support Ruby 3.0+ (current mainstream versions)
- **RSpec compatibility**: Support RSpec 3.x (widely used in Rails projects)
- **Output format**: Must match existing reporter JSON schema exactly (Zod-validated)
- **Storage location**: Must write to `.claude/tdd-guard/data/test.json` relative to project root
- **Gem packaging**: Must be publishable to RubyGems as `tdd-guard-rspec`
- **Testing**: Must include integration tests in the existing reporter test framework

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use RSpec Formatter API | Native integration point, receives all test lifecycle events | — Pending |
| Ruby gem (not standalone binary) | Consistent with RSpec ecosystem, easy to add to Gemfile | — Pending |
| Follow PHPUnit/Pytest patterns | These are closest analogues (non-JS reporters with similar architecture) | — Pending |

---
*Last updated: 2026-02-11 after initialization*
