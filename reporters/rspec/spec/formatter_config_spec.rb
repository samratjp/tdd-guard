# frozen_string_literal: true

require "tmpdir"
require "fileutils"
require "json"
require_relative "../lib/tdd_guard_rspec"

RSpec.describe "TddGuardRspec::Formatter project root configuration" do
  let(:test_json_relative_path) { File.join(".claude", "tdd-guard", "data", "test.json") }

  around(:each) do |example|
    original_env = ENV["TDD_GUARD_PROJECT_ROOT"]
    original_config = RSpec.configuration.tdd_guard_project_root
    example.run
  ensure
    ENV["TDD_GUARD_PROJECT_ROOT"] = original_env
    RSpec.configuration.tdd_guard_project_root = original_config
  end

  def run_formatter_and_close
    formatter = TddGuardRspec::Formatter.new(StringIO.new)
    formatter.close(RSpec::Core::Notifications::NullNotification)
  end

  describe "default behavior (no config, no env var)" do
    it "writes test.json relative to Dir.pwd" do
      ENV.delete("TDD_GUARD_PROJECT_ROOT")
      RSpec.configuration.tdd_guard_project_root = nil

      Dir.mktmpdir do |tmpdir|
        Dir.chdir(tmpdir) do
          run_formatter_and_close

          expected_path = File.join(tmpdir, test_json_relative_path)
          expect(File.exist?(expected_path)).to be(true), "Expected test.json at #{expected_path}"

          data = JSON.parse(File.read(expected_path))
          expect(data).to have_key("testModules")
        end
      end
    end
  end

  describe "env var overrides default" do
    it "writes test.json at TDD_GUARD_PROJECT_ROOT path instead of cwd" do
      RSpec.configuration.tdd_guard_project_root = nil

      Dir.mktmpdir("env-root") do |env_root|
        Dir.mktmpdir("cwd-dir") do |cwd_dir|
          ENV["TDD_GUARD_PROJECT_ROOT"] = env_root

          Dir.chdir(cwd_dir) do
            run_formatter_and_close

            expected_at_env = File.join(env_root, test_json_relative_path)
            not_expected_at_cwd = File.join(cwd_dir, test_json_relative_path)

            expect(File.exist?(expected_at_env)).to be(true),
              "Expected test.json at env var path: #{expected_at_env}"
            expect(File.exist?(not_expected_at_cwd)).to be(false),
              "test.json should NOT be at cwd: #{not_expected_at_cwd}"
          end
        end
      end
    end
  end

  describe "RSpec config overrides env var" do
    it "writes test.json at config path, not at env var path" do
      Dir.mktmpdir("config-root") do |config_root|
        Dir.mktmpdir("env-root") do |env_root|
          RSpec.configuration.tdd_guard_project_root = config_root
          ENV["TDD_GUARD_PROJECT_ROOT"] = env_root

          Dir.mktmpdir("cwd-dir") do |cwd_dir|
            Dir.chdir(cwd_dir) do
              run_formatter_and_close

              expected_at_config = File.join(config_root, test_json_relative_path)
              not_expected_at_env = File.join(env_root, test_json_relative_path)
              not_expected_at_cwd = File.join(cwd_dir, test_json_relative_path)

              expect(File.exist?(expected_at_config)).to be(true),
                "Expected test.json at config path: #{expected_at_config}"
              expect(File.exist?(not_expected_at_env)).to be(false),
                "test.json should NOT be at env var path: #{not_expected_at_env}"
              expect(File.exist?(not_expected_at_cwd)).to be(false),
                "test.json should NOT be at cwd: #{not_expected_at_cwd}"
            end
          end
        end
      end
    end
  end

  describe "RSpec config overrides default" do
    it "writes test.json at config path instead of cwd" do
      ENV.delete("TDD_GUARD_PROJECT_ROOT")

      Dir.mktmpdir("config-root") do |config_root|
        Dir.mktmpdir("cwd-dir") do |cwd_dir|
          RSpec.configuration.tdd_guard_project_root = config_root

          Dir.chdir(cwd_dir) do
            run_formatter_and_close

            expected_at_config = File.join(config_root, test_json_relative_path)
            not_expected_at_cwd = File.join(cwd_dir, test_json_relative_path)

            expect(File.exist?(expected_at_config)).to be(true),
              "Expected test.json at config path: #{expected_at_config}"
            expect(File.exist?(not_expected_at_cwd)).to be(false),
              "test.json should NOT be at cwd: #{not_expected_at_cwd}"
          end
        end
      end
    end
  end
end
