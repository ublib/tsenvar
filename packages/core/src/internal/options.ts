import type { LoaderOptions } from "..";

/**
 * @internal
 */
export type MergedLoaderOptions = Required<LoaderOptions>;

/**
 * @internal
 */
export const mergeLoaderOptions = (options?: LoaderOptions): Required<LoaderOptions> => {
  return {
    envPath: options?.envPath ?? DEFAULT_LOADER_OPTIONS.envPath,
    overwrite: options?.overwrite ?? DEFAULT_LOADER_OPTIONS.overwrite,
  };
};

const DEFAULT_LOADER_OPTIONS: MergedLoaderOptions = {
  envPath: ".env",
  overwrite: false,
};
