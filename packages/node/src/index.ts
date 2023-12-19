import fs from "node:fs";

import type { LoaderContext } from "@tsenvar/core";
import { createTsenvar } from "@tsenvar/core";

const loaderContext = {
  rawEnv: {
    read: () => process.env,
    write: (k, v) => {
      process.env[k] = v;
    },
  },

  panic: (reason, status) => {
    process.stderr.write(reason);
    process.exit(status ?? 1);
  },

  fs: {
    readFileSync: (path) => fs.readFileSync(path, "utf-8"),
  },
} satisfies LoaderContext;

export const Tsenvar = createTsenvar(loaderContext);
