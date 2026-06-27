import { randomUUID } from 'crypto'
import { createProfileId } from '../../domain/profile'
import type { ProfileId } from '../../domain/profile'

export function generateId(): string {
  return randomUUID()
}

export function generateProfileId(): ProfileId {
  return createProfileId(generateId())
}
