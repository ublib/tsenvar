import path from "node:path";
import { execSync } from "node:child_process";

import { build } from "esbuild";
import { rimraf } from "rimraf";
import { bundle } from "dts-bundle";

const blue = (str: string) => `\x1b[34m${str}\x1b[0m`;
const green = (str: string) => `\x1b[32m${str}\x1b[0m`;

const finishedBuild = (dir: string) => console.log(`${green("✔︎")} build: ${blue(dir)}`);

const EXTERN_NODE = ["fs", "path", "os", "crypto"].flatMap((it) => [it, `node:${it}`]);
const PACKAGES: Record<string, { external?: string[] }> = {
  tsenvar: {},
  browser: {},
  bun: {},
  core: {},
  deno: {},
  node: {},
};

export const buildTsenvar = () => {
  execSync("tsc -p tsconfig.build.json");

  const promises = Object.entries(PACKAGES).map(async ([pkg]) => {
    const res = await build({
      entryPoints: [path.resolve(`packages/${pkg}/src/index`)],
      bundle: true,
      target: "es2018",
      outdir: `packages/${pkg}/dist`,
      external: EXTERN_NODE,
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

export const clearTsenvarSync = () =>
  Object.entries(PACKAGES)
    .map(([pkg]) => `packages/${pkg}/dist`)
    .map((dir) => rimraf(dir));

(async function main() {
  console.log("clear dist...");
  await Promise.allSettled(clearTsenvarSync());
  console.log(`${green("✔︎")} finished clearing dist`);
  console.log("building tsenvar...");
  const buildingTsenvar = buildTsenvar();
  await Promise.all(buildingTsenvar);
  execSync("rm -rf temp");
})();
