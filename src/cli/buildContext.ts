import { Storage } from '../storage/Storage'
import { LintDataSchema } from '../contracts/schemas/lintSchemas'
import { Context } from '../contracts/types/Context'
import { Role } from '../contracts/types/Role'
import { processLintData } from '../processors/lintProcessor'

const VALID_ROLES = new Set<string>(['red', 'green', 'refactor'])

export async function buildContext(storage: Storage): Promise<Context> {
  const [modifications, rawTest, todo, lint, instructions, rawRole] =
    await Promise.all([
      storage.getModifications(),
      storage.getTest(),
      storage.getTodo(),
      storage.getLint(),
      storage.getInstructions(),
      storage.getRole(),
    ])

  let processedLintData
  try {
    if (lint) {
      const rawLintData = LintDataSchema.parse(JSON.parse(lint))
      processedLintData = processLintData(rawLintData)
    } else {
      processedLintData = processLintData()
    }
  } catch {
    processedLintData = processLintData()
  }

  const role = parseRole(rawRole)

  return {
    modifications: formatModifications(modifications ?? ''),
    test: rawTest ?? '',
    todo: todo ?? '',
    lint: processedLintData,
    instructions: instructions ?? undefined,
    role,
  }
}

function parseRole(rawRole: string | null): Role | undefined {
  if (!rawRole) return undefined
  try {
    const parsed = JSON.parse(rawRole)
    const role = parsed.role
    return VALID_ROLES.has(role) ? (role as Role) : undefined
  } catch {
    return undefined
  }
}

function formatModifications(modifications: string): string {
  if (!modifications) {
    return ''
  }

  try {
    const parsed = JSON.parse(modifications)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // If it's not valid JSON, leave it as is
    return modifications
  }
}
