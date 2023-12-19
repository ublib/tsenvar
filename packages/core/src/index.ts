import type { Defs, ResolveType } from "./define";

export * from "./errors";

export type { Defs, Def, ResolveType } from "./define";
export { define } from "./define";

export interface Tsenvar {
  load: Load;
  clear: Clear;
}

export interface LoaderOptions {
  /** @default ".env" */
  envPath?: string;

  /** @default false */
  overwrite?: boolean;
}

export type Load = <T extends Defs>(envVarDefs: T, options?: LoaderOptions) => ResolveType<T>;

export type Clear = (defs: Defs) => void;

export * from "./internal";
