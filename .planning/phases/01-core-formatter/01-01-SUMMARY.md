---
phase: 01-core-formatter
plan: 01
subsystem: testing
tags: [rspec, ruby, formatter, json, test-reporter]

# Dependency graph
requires: []
provides:
  - "RSpec formatter gem that captures test results and writes TDD Guard JSON"
  - "Gem entry point loadable via --require tdd_guard_rspec"
  - "Support for passing, failing, pending, and load error test scenarios"
affects: [02-integration-tests, 03-packaging]

# Tech tracking
tech-stack:
  added: [rspec ~> 3.0]
  patterns: [RSpec BaseFormatter inheritance, notification-based event capture, synthetic error entries for load failures]

key-files:
  created:
    - reporters/rspec/lib/tdd_guard_rspec.rb
    - reporters/rspec/lib/tdd_guard_rspec/formatter.rb
    - reporters/rspec/Gemfile.lock
  modified:
    - reporters/rspec/Gemfile
    - .gitignore

key-decisions:
  - "Used explicit require of rspec/core/formatters/base_formatter since rspec/core alone does not autoload it"
  - "Added .gitignore negation for reporters/rspec/lib/ since root-level lib/ ignore was blocking the gem structure"
  - "Used message notification + dump_summary to capture load/syntax errors as synthetic test entries"

patterns-established:
  - "RSpec formatter pattern: inherit BaseFormatter, register notifications, write JSON in close callback"
  - "Load error capture: store messages from message notification, create synthetic entries in dump_summary"

# Metrics
duration: 8min
completed: 2026-02-11
---

# Phase 1 Plan 1: Core Formatter Summary

**RSpec formatter capturing passing/failing/pending/load-error test results as TDD Guard JSON via BaseFormatter inheritance and notification events**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-11T01:48:01Z
- **Completed:** 2026-02-11T01:56:25Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- RSpec formatter gem at reporters/rspec/ loads via --require and --format flags
- All 4 test result types captured: passing (state "passed"), failing (state "failed" with error messages), pending (state "skipped"), and load errors (synthetic entries)
- JSON output matches TDD Guard reporter schema with testModules, tests, state, errors, unhandledErrors, and reason fields
- Tests grouped by spec file path as moduleId

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold gem structure and Gemfile** - `5243552` (chore)
2. **Task 2: Implement RSpec formatter with full test result capture** - `f6d1a6b` (feat)

## Files Created/Modified
- `reporters/rspec/Gemfile` - Updated with rspec ~> 3.0 dependency
- `reporters/rspec/Gemfile.lock` - Generated lock file with all rspec dependencies
- `reporters/rspec/lib/tdd_guard_rspec.rb` - Entry point that requires the formatter
- `reporters/rspec/lib/tdd_guard_rspec/formatter.rb` - Core formatter class (151 lines) with full test result capture
- `.gitignore` - Added negation for reporters/rspec/lib/ directory

## Decisions Made
- Used explicit `require "rspec/core/formatters/base_formatter"` because `require "rspec/core"` alone does not autoload the BaseFormatter class
- Added `.gitignore` exception `!reporters/rspec/lib/` since the root-level `lib/` pattern was ignoring the gem's lib directory
- Captured load errors via the `message` notification (which receives "An error occurred while loading" messages) combined with `dump_summary` to check `errors_outside_of_examples_count`
- Used `_module_id` as a transient key on test result hashes to track file paths, deleted before JSON output

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added .gitignore negation for reporters/rspec/lib/**
- **Found during:** Task 1 (Scaffold gem structure)
- **Issue:** Root-level `.gitignore` contains `lib/` pattern (for Python build outputs) which was causing `reporters/rspec/lib/tdd_guard_rspec.rb` to be ignored by git
- **Fix:** Added `!reporters/rspec/lib/` negation rule after the `lib/` pattern
- **Files modified:** .gitignore
- **Verification:** `git check-ignore` returns exit code 1 (not ignored) for rspec lib files
- **Committed in:** 5243552 (Task 1 commit)

**2. [Rule 1 - Bug] Added explicit require for base_formatter**
- **Found during:** Task 2 (Implement formatter)
- **Issue:** `require "rspec/core"` does not autoload `RSpec::Core::Formatters::BaseFormatter`, causing `uninitialized constant` error
- **Fix:** Added `require "rspec/core/formatters/base_formatter"` to formatter.rb
- **Files modified:** reporters/rspec/lib/tdd_guard_rspec/formatter.rb
- **Verification:** Formatter loads and instantiates without errors
- **Committed in:** f6d1a6b (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for basic functionality. No scope creep.

## Issues Encountered
- Bundler 4.0.6 failed with `NameError: uninitialized class variable @@accept_charset` when trying `bundle install` from remote. Resolved by installing rspec gem directly via `gem install rspec --no-document`, then running `bundle install --local` to generate Gemfile.lock from locally available gems.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Core formatter is complete and verified with smoke tests for all 4 scenarios
- Ready for integration test setup and packaging in subsequent plans
- Test artifacts (rspec-specific spec files) will be needed for integration test suite

## Self-Check: PASSED

All 5 files verified present. Both commit hashes (5243552, f6d1a6b) confirmed in git log. Formatter is 151 lines (exceeds 80-line minimum).

---
*Phase: 01-core-formatter*
*Completed: 2026-02-11*
