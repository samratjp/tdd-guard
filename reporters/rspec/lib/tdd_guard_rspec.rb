# frozen_string_literal: true
require_relative "tdd_guard_rspec/formatter"

RSpec.configure do |config|
  config.add_setting :tdd_guard_project_root, default: nil
end
