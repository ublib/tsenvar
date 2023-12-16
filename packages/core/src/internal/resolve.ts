import type { LoaderContext } from ".";
import type { Defs, ResolveType } from "../define";
import { ValidationError } from "../errors";

export const resolve = <T extends Defs>(ctx: Readonly<LoaderContext>, def: T): ResolveType<T> => {
  const result: Partial<ResolveType<T>> = {};
  const errors: string[] = [];

  const red = (str: string) => `\u001B[31m${str}\u001B[0m`;
  const capture = (reason: string) => {
    errors.push(`${red("Invalid EnvVar")}: ${reason}`);
  };

  for (const key in def) {
    const config = def[key];
    const v = ctx.rawEnv.read()[key];

    // check optional
    if (v === undefined) {
      if (config.optional) {
        continue;
      }
      capture(`"${key}" is required but not defined.`);
      continue;
    }

    // cast and validate type
    try {
      result[key] = config.construct(v);
    } catch (e: unknown) {
      if (e instanceof ValidationError) {
        capture(e.message);
        continue;
      }
      capture(`"${Object.prototype.toString.call(config.construct)}" is not a constructor`);
      continue;
    }
  }

  // check errors
  if (errors.length !== 0) {
    ctx.panic(errors.join("\n"), 1);
  }

  return result as ResolveType<T>;
};
