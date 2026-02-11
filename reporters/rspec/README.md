# TDD Guard RSpec Reporter

RSpec formatter that captures test results for TDD Guard validation.

## Requirements

- Ruby 3.0+
- RSpec 3.0+
- [TDD Guard](https://github.com/nizos/tdd-guard) installed globally

## Installation

Add to your Gemfile:

```ruby
group :test do
  gem "tdd-guard-rspec"
end
```

Then run:

```bash
bundle install
```

## Configuration

### RSpec Configuration

Add the formatter to your `.rspec` file:

```
--format TddGuardRspec::Formatter
--require tdd_guard_rspec
```

Or in your `spec_helper.rb`:

```ruby
require "tdd_guard_rspec"

RSpec.configure do |config|
  config.formatter = TddGuardRspec::Formatter
end
```

### Project Root Configuration

By default, test results are written relative to the current working directory. For monorepos or workspace setups, set the project root using any ONE of these methods:

**Option 1: RSpec Configuration (Recommended)**

```ruby
# spec_helper.rb or spec/support/tdd_guard.rb
RSpec.configure do |config|
  config.tdd_guard_project_root = "/absolute/path/to/project/root"
end
```

**Option 2: Environment Variable**

```bash
export TDD_GUARD_PROJECT_ROOT=/absolute/path/to/project/root
```

RSpec configuration takes precedence over the environment variable.

## More Information

- Test results are saved to `.claude/tdd-guard/data/test.json`
- See [TDD Guard documentation](https://github.com/nizos/tdd-guard) for complete setup

## License

MIT
