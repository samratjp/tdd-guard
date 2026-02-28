import { Role } from '../../../contracts/types/Role'
import { RED_RULES } from './red-rules'
import { GREEN_RULES } from './green-rules'
import { REFACTOR_RULES } from './refactor-rules'

const ROLE_RULES: Record<Role, string> = {
  red: RED_RULES,
  green: GREEN_RULES,
  refactor: REFACTOR_RULES,
}

export function getRoleRules(role: Role): string {
  return ROLE_RULES[role]
}
