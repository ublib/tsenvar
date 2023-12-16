// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Defs = { [key: string]: Def<any> };

export interface Def<T extends EnvVarConstructor> {
  /**
   * constructor with validation.
   *
   * when throw error, process exits with code 1.
   *
   * @example
   *
   * ```ts
   * // built-in type
   * construct: String
   * construct: RegExp
   * ```
   * ```ts
   * // custom type and validator
   * construct: (v: any): 'a' | 'b' | 'c' => {
   *   if (!['a', 'b', 'c'].includes(v)) throw new EnvVarLib.InvalidError('unexpected NEW_VAR')
   *   return v
   * }
   * ```
   *
   */
  construct: T;

  /** default: `false` */
  optional?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EnvVarConstructor = (...args: any) => any;

export type ResolveType<T> = { [K in keyof T]: ResolveEnvVarType<T[K]> };

type ResolveEnvVarType<T> = T extends { construct: infer U }
  ? U extends EnvVarConstructor
    ? ReturnType<U>
    : never
  : never;

// for type inference
export const define = <T extends Defs>(def: T): T => def;
