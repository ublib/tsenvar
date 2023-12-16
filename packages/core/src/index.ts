import { Defs, ResolveType } from "./define";

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

export type Load = <T extends Defs>(envVarDefs: T, options: LoaderOptions) => ResolveType<Defs>;

export type Clear = (defs: Defs) => void;
