# frozen_string_literal: true

require "rspec/core"
require "rspec/core/formatters/base_formatter"
require "json"
require "fileutils"

module TddGuardRspec
  class Formatter < RSpec::Core::Formatters::BaseFormatter
    RSpec::Core::Formatters.register self,
      :example_passed,
      :example_failed,
      :example_pending,
      :message,
      :dump_summary,
      :close

    def initialize(output)
      super(output)
      @test_results = []
      @load_error_messages = []
    end

    def example_passed(notification)
      @test_results << build_test_result(notification.example, "passed")
    end

    def example_failed(notification)
      example = notification.example
      result = build_test_result(example, "failed")

      exception = example.execution_result.exception
      if exception
        error = { "message" => format_error_message(notification, exception) }

        if exception.respond_to?(:expected) && exception.expected
          error["expected"] = exception.expected.to_s
        end

        if exception.respond_to?(:actual) && exception.actual
          error["actual"] = exception.actual.to_s
        end

        result["errors"] = [error]
      end

      @test_results << result
    end

    def example_pending(notification)
      @test_results << build_test_result(notification.example, "skipped")
    end

    def message(notification)
      msg = notification.message
      if msg.include?("An error occurred while loading")
        @load_error_messages << msg
      end
    end

    def dump_summary(notification)
      if notification.errors_outside_of_examples_count > 0
        @load_error_messages.each do |msg|
          file_path = extract_file_path_from_error(msg)
          module_id = file_path || "unknown"

          synthetic_result = {
            "name" => "load_error",
            "fullName" => module_id,
            "state" => "failed",
            "errors" => [{ "message" => msg }]
          }

          @test_results << synthetic_result
        end
      end
    end

    def close(_notification)
      modules_map = {}

      @test_results.each do |test|
        module_id = test.delete("_module_id") || extract_module_from_full_name(test["fullName"])

        modules_map[module_id] ||= {
          "moduleId" => module_id,
          "tests" => []
        }

        modules_map[module_id]["tests"] << test
      end

      has_failures = @test_results.any? { |t| t["state"] == "failed" }

      output_data = {
        "testModules" => modules_map.values,
        "unhandledErrors" => [],
        "reason" => has_failures ? "failed" : "passed"
      }

      write_results(output_data)
    end

    private

    def build_test_result(example, state)
      file_path = example.metadata[:file_path].to_s
      file_path = file_path.sub(%r{\A\./}, "")

      {
        "_module_id" => file_path,
        "name" => example.description,
        "fullName" => example.full_description,
        "state" => state
      }
    end

    def format_error_message(notification, exception)
      if notification.respond_to?(:message_lines)
        lines = notification.message_lines
        return lines.join("\n") unless lines.empty?
      end

      message = exception.message.to_s
      if exception.respond_to?(:backtrace) && exception.backtrace
        message += "\n" + exception.backtrace.join("\n")
      end
      message
    end

    def extract_file_path_from_error(msg)
      match = msg.match(/An error occurred while loading (.+)/)
      if match
        path = match[1].strip.chomp(".")
        path.sub(%r{\A\./}, "")
      end
    end

    def extract_module_from_full_name(full_name)
      full_name.to_s.split("::").first || full_name.to_s
    end

    def project_root
      config_root = RSpec.configuration.tdd_guard_project_root
      return config_root if config_root.is_a?(String) && !config_root.empty?

      env_root = ENV["TDD_GUARD_PROJECT_ROOT"]
      return env_root if env_root.is_a?(String) && !env_root.empty?

      Dir.pwd
    end

    def write_results(output_data)
      data_dir = File.join(project_root, ".claude", "tdd-guard", "data")
      FileUtils.mkdir_p(data_dir)

      output_path = File.join(data_dir, "test.json")
      File.write(output_path, JSON.generate(output_data))
    end
  end
end
