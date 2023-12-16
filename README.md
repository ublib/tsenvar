# tsenvar

define and load type-safe environment variables for any JavaScript runtime

status: experimental (not published)

## Usage

### Node.js

```ts
import { define, ValidationError } from "@tsenvar/core";
import { Tsenvar } from "@tsenvar/node";

// define environment variables
export const myEnvDef = define({
  STAGE_NAME: {
    construct: (v: string): "dev" | "prd" => {
      if (!["dev", "prd"].includes(v)) {
        throw new ValidationError(`invalid STAGE_NAME: ${v}`);
      }
      return v;
    },
  },
  AWS_REGION: { construct: String },
});

// load environment variables (return typed object)
const myEnv = Tsenvar.load(myEnvDef, { envPath: "./config/.env" });

myEnv.STAGE_NAME;
// ^? (property) STAGE_NAME: "dev" | "prd"

myEnv.AWS_REGION;
// ^? (property) AWS_REGION: string
```

able to use `ResolveType` to get the type of the resolved environment variables

```ts
import { type ResolveType } from "@tsenvar/core";

export type MyEnv = ResolveType<typeof myEnvDef>;

const someFunction = (env: MyEnv) => {
  env.STAGE_NAME;
  // ^? (property) STAGE_NAME: "dev" | "prd"

  env.AWS_REGION;
  // ^? (property) AWS_REGION: string
};
```
