import { describe, it, expect } from 'vitest'
import { getRoleRules } from './index'
import { RED_RULES } from './red-rules'
import { GREEN_RULES } from './green-rules'
import { REFACTOR_RULES } from './refactor-rules'
import { Role } from '../../../contracts/types/Role'

describe('getRoleRules', () => {
  it('should return red rules for red role', () => {
    expect(getRoleRules('red')).toBe(RED_RULES)
  })

  it('should return green rules for green role', () => {
    expect(getRoleRules('green')).toBe(GREEN_RULES)
  })

  it('should return refactor rules for refactor role', () => {
    expect(getRoleRules('refactor')).toBe(REFACTOR_RULES)
  })

  it.each(['red', 'green', 'refactor'] as const)(
    'should return non-empty string for %s role',
    (role: Role) => {
      const rules = getRoleRules(role)
      expect(rules.length).toBeGreaterThan(0)
    }
  )

  it('should include role name in red rules', () => {
    expect(getRoleRules('red')).toContain('RED Phase')
  })

  it('should include role name in green rules', () => {
    expect(getRoleRules('green')).toContain('GREEN Phase')
  })

  it('should include role name in refactor rules', () => {
    expect(getRoleRules('refactor')).toContain('REFACTOR Phase')
  })
})
