# Roadmap: TDD Guard RSpec Reporter

## Overview

Build an RSpec formatter gem that captures test results in TDD Guard's JSON format, following the same pattern established by 7 existing reporters. The work progresses from core formatter logic, through configuration and integration testing, to gem packaging for RubyGems publication.

## Phases

- [ ] **Phase 1: Core Formatter** - RSpec formatter captures all test result types and writes correct JSON output
- [ ] **Phase 2: Configuration & Validation** - Project root is configurable and integration tests prove correctness
- [ ] **Phase 3: Gem Packaging** - Publishable gem with proper metadata and documentation

## Phase Details

### Phase 1: Core Formatter
**Goal**: RSpec test results are captured and written in TDD Guard's JSON format
**Depends on**: Nothing (first phase)
**Requirements**: RPT-01, RPT-02, RPT-03, RPT-04, RPT-05, STR-01, STR-02, STR-03
**Success Criteria** (what must be TRUE):
  1. Running RSpec with the TDD Guard formatter on a suite with passing tests produces a test.json file containing those tests with state "passed"
  2. Running RSpec with the TDD Guard formatter on a suite with failing tests produces a test.json file containing error messages and stack traces
  3. Running RSpec on a file with syntax/load errors produces a test.json file with a synthetic error entry (not a crash)
  4. Pending/skipped tests appear in the output with appropriate state
  5. The JSON output passes validation against the existing TDD Guard reporter schema (testModules array with tests grouped by spec file path, overall reason field)
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Configuration & Validation
**Goal**: Reporter is configurable for different project layouts and validated through the existing integration test framework
**Depends on**: Phase 1
**Requirements**: CFG-01, CFG-02, TST-01, TST-02, TST-03
**Success Criteria** (what must be TRUE):
  1. Setting `TDD_GUARD_PROJECT_ROOT` environment variable changes where test.json is written
  2. Setting project root via RSpec configuration option changes where test.json is written
  3. Integration tests in reporters/test/ pass for the RSpec reporter using the same test harness as other reporters
  4. Test artifacts exist in reporters/test/artifacts/rspec/ covering passing, failing, and import error scenarios
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Gem Packaging
**Goal**: Users can install tdd-guard-rspec from RubyGems and configure it in their RSpec setup
**Depends on**: Phase 2
**Requirements**: PKG-01, PKG-02, PKG-03
**Success Criteria** (what must be TRUE):
  1. `gem build tdd-guard-rspec.gemspec` produces a valid .gem file with correct metadata, rspec ~> 3.0 dependency, and Ruby >= 3.0 requirement
  2. README contains installation instructions (Gemfile entry), configuration instructions (RSpec formatter setup), and usage examples
  3. The gem can be installed in a fresh Ruby project and used as an RSpec formatter without errors
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Formatter | 0/TBD | Not started | - |
| 2. Configuration & Validation | 0/TBD | Not started | - |
| 3. Gem Packaging | 0/TBD | Not started | - |
