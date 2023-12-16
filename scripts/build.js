import path from "node:path";
import { execSync } from "node:child_process";

import { build } from "esbuild";
import { rimraf } from "rimraf";
import { bundle } from "dts-bundle";

/** @type {(str: string) => string} */
const blue = str => `\x1b[34m${str}\x1b[0m`;

/** @type {(str: string) => string} */
const green = str => `\x1b[32m${str}\x1b[0m`;

/** @type {(dir: string) => void} */
const finishedBuild = dir => console.log(`${green("✔︎")} build: ${blue(dir)}`);

const PACKAGES = {
  tsenvar: {},
  browser: {},
  bun: {},
  core: {},
  deno: {},
  node: {
    external: ["fs", "path", "os", "crypto"].flatMap(it => [it, `node:${it}`]),
  },
};

/**
 * @type {() => PromiseLike<import('esbuild').BuildResult<{ entryPoints: string, outdir: string }>>[]}
 */
export const buildTsenvar = () => {
  execSync("tsc -p tsconfig.build.json");

  const promises = Object.entries(PACKAGES).map(async ([pkg, { external }]) => {
    /**
     * @type {import('esbuild').BuildOptions}
     */
    const res = await build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      minify: true,
      target: "es2018",
      outdir: `packages/${pkg}/dist`,
      external,
      format: "esm",
      plugins: [
        {
          name: "TypeScriptDeclarationsPlugin",
          setup(build) {
            build.onEnd(() => {
              bundle({
                name: pkg,
                main: `temp/packages/${pkg}/src/index.d.ts`,
                out: path.resolve(`packages/${pkg}/dist/index.d.ts`),
              });
            });
          },
        },
      ],
    });
    finishedBuild(`packages/${pkg}/dist`);
    return res;
  });
  return promises;
};

/**
 * @type {function(): void}
 */
export const clearTsenvarSync = () =>
  Object.entries(PACKAGES)
    .map(([pkg]) => `packages/${pkg}/dist`)
    .map(dir => rimraf(dir));

(async function main() {
  console.log("clear dist...");
  await Promise.allSettled([...clearTsenvarSync()]);
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tsenvar...");
  const buildingTsenvar = buildTsenvar();
  await Promise.all([...buildingTsenvar]);
  execSync("rm -rf temp");
})();
