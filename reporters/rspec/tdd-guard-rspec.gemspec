# frozen_string_literal: true

require_relative "lib/tdd_guard_rspec/version"

Gem::Specification.new do |spec|
  spec.name          = "tdd-guard-rspec"
  spec.version       = TddGuardRspec::VERSION
  spec.authors       = ["Wolfgang Klinger"]
  spec.email         = ["hello@wolfgang-klinger.dev"]

  spec.summary       = "RSpec reporter for TDD Guard"
  spec.description   = "RSpec formatter that captures test results for TDD Guard validation. " \
                        "Enables automated TDD enforcement in Ruby projects using Claude Code."
  spec.homepage      = "https://github.com/nizos/tdd-guard"
  spec.license       = "MIT"

  spec.required_ruby_version = ">= 3.0"

  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/nizos/tdd-guard/tree/main/reporters/rspec"
  spec.metadata["bug_tracker_uri"] = "https://github.com/nizos/tdd-guard/issues"

  spec.files = Dir["lib/**/*.rb", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.add_dependency "rspec", "~> 3.0"
end
