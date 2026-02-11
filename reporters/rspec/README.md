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

The project root must be an absolute path and the current working directory must be within it. Invalid paths are silently ignored with a fallback to the current working directory.

### Rails Projects

The formatter works with Rails projects using `rspec-rails` without any additional setup. In a Rails project, configure the formatter in `rails_helper.rb` or a support file:

```ruby
# spec/support/tdd_guard.rb
require "tdd_guard_rspec"

RSpec.configure do |config|
  config.formatter = TddGuardRspec::Formatter
end
```

Make sure the support file is loaded by adding to `rails_helper.rb`:

```ruby
Rails.root.glob("spec/support/**/*.rb").sort.each { |f| require f }
```

## More Information

- Test results are saved to `.claude/tdd-guard/data/test.json`
- See [TDD Guard documentation](https://github.com/nizos/tdd-guard) for complete setup

## License

MIT
