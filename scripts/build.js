import path from "node:path";
import * as esbuild from "esbuild";
import { rimraf } from "rimraf";

/** @type {(str: string) => string} */
const blue = (str) => `\x1b[34m${str}\x1b[0m`;

/** @type {(str: string) => string} */
const green = (str) => `\x1b[32m${str}\x1b[0m`;

/** @type {(dir: string) => void} */
const finishedBuild = (dir) =>
  console.log(`${green("✔︎")} build: ${blue(dir)}`);

const PACKAGES = [
  "tsenvar",
  "browser",
  "bun",
  "core",
  "deno",
  "node",
];

/**
 * @type {() => PromiseLike<import('esbuild').BuildResult<{ entryPoints: string, outdir: string }>>[]}
 */
export const buildTsenvar = () =>
  PACKAGES.map((pkg) => {
    /**
     * @type {import('esbuild').BuildOptions}
     */
    const res = esbuild.build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      minify: true,
      target: "es2018",
      outdir: `packages/${pkg}/dist`,
      format: "esm",
    });
    res.then(() => finishedBuild(`packages/${pkg}/dist`));
    return res;
  });

/**
 * @type {function(): void}
 */
export const clearTsenvarSync = () =>
  PACKAGES.map((pkg) => `packages/${pkg}/dist`).map((dir) =>
    rimraf(dir)
  );

(async function main() {
  console.log("clear dist...");
  await Promise.allSettled([...clearTsenvarSync()]);
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tsenvar...");
  const buildingTsenvar = buildTsenvar();
  await Promise.all([...buildingTsenvar]);
})();
