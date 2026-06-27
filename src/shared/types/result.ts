export type Result<T, E extends Error = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E }

export function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function Err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error }
}
