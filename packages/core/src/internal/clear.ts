import type { LoaderContext } from ".";
import type { Tsenvar } from "..";

/**
 * @internal
 */
export const clearer =
  (ctx: Readonly<LoaderContext>): Tsenvar["clear"] =>
  envVarDefs => {
    for (const key in envVarDefs) {
      // TODO: already defined?
      delete ctx.rawEnv.read()[key];
    }
  };
