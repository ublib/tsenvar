import type { DuplicateError } from "../errors";

/**
 * @internal
 */
export interface LoaderContext {
  rawEnv: RawEnv;
  panic: Panic;
  fs: FileSystem;
}

/**
 * @internal
 */
export interface RawEnv {
  read(): RawEnvVars;
  write(key: string, value: string): DuplicateError | void;
}

/**
 * @internal
 */
export type RawEnvVars = Record<string, string | undefined>;

/**
 * @internal
 */
export interface Panic {
  (reason: string, status?: number): never;
}

/**
 * @internal
 */
export interface FileSystem {
  readFileSync(path: string): string;
}
