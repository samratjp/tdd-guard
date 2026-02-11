import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { ReporterConfig, TestScenarios } from '../types'
import { copyTestArtifacts } from './helpers'

export function createRspecReporter(): ReporterConfig {
  // Use hardcoded absolute path for security when available, fall back to PATH for CI environments
  const rspecBinary = existsSync('/opt/rbenv/versions/3.3.6/bin/rspec')
    ? '/opt/rbenv/versions/3.3.6/bin/rspec'
    : 'rspec'
  const artifactDir = 'rspec'
  const testScenarios = {
    singlePassing: 'single_passing_spec.rb',
    singleFailing: 'single_failing_spec.rb',
    singleImportError: 'single_import_error_spec.rb',
  }

  return {
    name: 'RspecReporter',
    testScenarios,
    run: (tempDir, scenario: keyof TestScenarios) => {
      copyTestArtifacts(artifactDir, testScenarios, scenario, tempDir)

      const rspecDir = join(__dirname, '../../rspec')
      const testFile = testScenarios[scenario]

      // Run rspec directly with --require to load the formatter and --format to activate it
      spawnSync(
        rspecBinary,
        [
          join(tempDir, testFile),
          '--format',
          'TddGuardRspec::Formatter',
          '--require',
          join(rspecDir, 'lib/tdd_guard_rspec'),
          '--no-color',
        ],
        {
          cwd: tempDir,
          stdio: 'pipe',
          encoding: 'utf8',
        }
      )
    },
  }
}
