# Requirements: TDD Guard RSpec Reporter

**Defined:** 2026-02-11
**Core Value:** Rails projects using Claude Code can enforce TDD automatically via RSpec test result capture

## v1 Requirements

### Reporter Core

- [x] **RPT-01**: RSpec formatter captures passing test results with name and full name
- [x] **RPT-02**: RSpec formatter captures failing test results with error message and stack trace
- [x] **RPT-03**: RSpec formatter captures pending/skipped tests
- [x] **RPT-04**: RSpec formatter handles syntax/load errors (import errors) with synthetic test entry
- [x] **RPT-05**: Test results grouped by spec file path in testModules array

### Output & Storage

- [x] **STR-01**: Output matches TDD Guard reporter JSON schema exactly (testModules, tests, state, errors, reason)
- [x] **STR-02**: Results written to `.claude/tdd-guard/data/test.json` relative to project root
- [x] **STR-03**: Overall run status (reason field) set to passed/failed based on results

### Configuration

- [x] **CFG-01**: Project root configurable via environment variable (`TDD_GUARD_PROJECT_ROOT`)
- [x] **CFG-02**: Project root configurable via RSpec configuration option

### Packaging

- [ ] **PKG-01**: Publishable as `tdd-guard-rspec` gem on RubyGems
- [ ] **PKG-02**: Gemspec with proper metadata, dependencies (rspec ~> 3.0), and Ruby version requirement (>= 3.0)
- [ ] **PKG-03**: README with installation and configuration instructions

### Testing

- [x] **TST-01**: Integration tests using existing reporter test framework (reporters/test/)
- [x] **TST-02**: Test artifacts for passing, failing, and import error scenarios in reporters/test/artifacts/rspec/
- [x] **TST-03**: Integration tests validate module paths, test names, states, and error messages

## v2 Requirements

### Enhanced Features

- **ENH-01**: RuboCop linter integration for Ruby/Rails code quality checking
- **ENH-02**: Parallel test support (parallel_tests gem)
- **ENH-03**: Rails-specific test type detection (model, request, system specs)

## Out of Scope

| Feature                     | Reason                                                   |
| --------------------------- | -------------------------------------------------------- |
| RuboCop integration         | Separate concern, can be added as a linter in v2         |
| Spring preloader handling   | RSpec formatter works regardless of how RSpec is invoked |
| Rails generators/rake tasks | Keep it simple -- just the reporter gem                  |
| SimpleCov integration       | Coverage reporting is separate from test result capture  |
| Custom output formats       | TDD Guard JSON schema is the only required format        |

## Traceability

| Requirement | Phase   | Status  |
| ----------- | ------- | ------- |
| RPT-01      | Phase 1 | Done    |
| RPT-02      | Phase 1 | Done    |
| RPT-03      | Phase 1 | Done    |
| RPT-04      | Phase 1 | Done    |
| RPT-05      | Phase 1 | Done    |
| STR-01      | Phase 1 | Done    |
| STR-02      | Phase 1 | Done    |
| STR-03      | Phase 1 | Done    |
| CFG-01      | Phase 2 | Done    |
| CFG-02      | Phase 2 | Done    |
| TST-01      | Phase 2 | Done    |
| TST-02      | Phase 2 | Done    |
| TST-03      | Phase 2 | Done    |
| PKG-01      | Phase 3 | Pending |
| PKG-02      | Phase 3 | Pending |
| PKG-03      | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---

_Requirements defined: 2026-02-11_
_Last updated: 2026-02-11 after Phase 2 completion_
