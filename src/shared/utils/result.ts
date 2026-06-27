import type { Result } from '../types/result'
import { Ok, Err } from '../types/result'

export function mapResult<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (result.ok) return Ok(fn(result.value))
  return Err(result.error)
}

export function flatMapResult<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  if (result.ok) return fn(result.value)
  return Err(result.error)
}

export function matchResult<T, E extends Error, R>(
  result: Result<T, E>,
  handlers: {
    readonly ok: (value: T) => R
    readonly err: (error: E) => R
  },
): R {
  if (result.ok) return handlers.ok(result.value)
  return handlers.err(result.error)
}
