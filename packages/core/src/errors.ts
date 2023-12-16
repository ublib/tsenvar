export type ErrorOnLoad = DuplicateError | ValidationError;

export class ValidationError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}

export class DuplicateError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
  }
}
