export type FileType = 'python' | 'javascript' | 'php' | 'elixir'

export function detectFileType(hookData: unknown): FileType {
  // Handle different tool operation types
  const toolInput = (hookData as { tool_input?: Record<string, unknown> }).tool_input
  if (toolInput && typeof toolInput === 'object' && 'file_path' in toolInput) {
    const filePath = toolInput.file_path
    if (typeof filePath === 'string') {
      if (filePath.endsWith('.py')) {
        return 'python'
      }
      if (filePath.endsWith('.php')) {
        return 'php'
      }
      if (filePath.endsWith('.ex') || filePath.endsWith('.exs')) {
        return 'elixir'
      }
    }
  }
  return 'javascript'
}