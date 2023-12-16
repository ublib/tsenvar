import dotenv from "dotenv";

import type { Tsenvar } from "..";
import type { LoaderContext } from "./interface";

import { clearer } from "./clear";
import { mergeLoaderOptions } from "./options";
import { resolve } from "./resolve";

export * from "./interface";

/**
 * @internal
 */
export const createTsenvar = (ctx: Readonly<LoaderContext>): Tsenvar => {
  return { load: loader(ctx), clear: clearer(ctx) };
};

const loader =
  (ctx: Readonly<LoaderContext>): Tsenvar["load"] =>
  (envVarDefs, options) => {
    const mergedOptions = mergeLoaderOptions(options);
    // TODO: load any runtime
    dotenv.config({ path: mergedOptions.envPath });
    return resolve(ctx, envVarDefs);
  };
