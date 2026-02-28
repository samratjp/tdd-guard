import { describe, test, expect, beforeEach } from 'vitest'
import { MemoryStorage } from '../../src/storage/MemoryStorage'
import { buildContext } from '../../src/cli/buildContext'
import { generateDynamicContext } from '../../src/validation/context/context'
import { testData } from '../utils'

describe('Role-aware validation pipeline', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    storage = new MemoryStorage()
  })

  test('red role produces red-phase rules in validation prompt', async () => {
    const operation = testData.editOperation({
      file_path: '/src/calculator.test.ts',
    })
    await storage.saveModifications(JSON.stringify(operation))
    await storage.saveRole(JSON.stringify({ role: 'red' }))

    const context = await buildContext(storage)
    const prompt = generateDynamicContext(context)

    expect(prompt).toContain('## Active Role: RED Phase')
    expect(prompt).not.toContain('## Active Role: GREEN Phase')
    expect(prompt).not.toContain('## Active Role: REFACTOR Phase')
  })

  test('green role produces green-phase rules in validation prompt', async () => {
    const operation = testData.editOperation({
      file_path: '/src/calculator.ts',
    })
    await storage.saveModifications(JSON.stringify(operation))
    await storage.saveRole(JSON.stringify({ role: 'green' }))
    await storage.saveTest(JSON.stringify(testData.failedTestResults()))

    const context = await buildContext(storage)
    const prompt = generateDynamicContext(context)

    expect(prompt).toContain('## Active Role: GREEN Phase')
    expect(prompt).not.toContain('## Active Role: RED Phase')
    expect(prompt).not.toContain('## Active Role: REFACTOR Phase')
  })

  test('refactor role produces refactor-phase rules in validation prompt', async () => {
    const operation = testData.editOperation({
      file_path: '/src/calculator.ts',
    })
    await storage.saveModifications(JSON.stringify(operation))
    await storage.saveRole(JSON.stringify({ role: 'refactor' }))
    await storage.saveTest(JSON.stringify(testData.passingTestResults()))

    const context = await buildContext(storage)
    const prompt = generateDynamicContext(context)

    expect(prompt).toContain('## Active Role: REFACTOR Phase')
    expect(prompt).not.toContain('## Active Role: RED Phase')
    expect(prompt).not.toContain('## Active Role: GREEN Phase')
  })

  test('no role produces standard prompt without role rules', async () => {
    const operation = testData.editOperation()
    await storage.saveModifications(JSON.stringify(operation))

    const context = await buildContext(storage)
    const prompt = generateDynamicContext(context)

    expect(prompt).not.toContain('Active Role:')
    expect(prompt).toContain('## TDD Fundamentals')
    expect(prompt).toContain('## File Type Specific Rules')
  })

  test('role is cleared by clearTransientData', async () => {
    await storage.saveRole(JSON.stringify({ role: 'red' }))
    await storage.clearTransientData()

    const role = await storage.getRole()
    expect(role).toBeNull()
  })
})
