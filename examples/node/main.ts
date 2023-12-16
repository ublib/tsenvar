import { type ResolveType, define } from "@tsenvar/core";
import { Tsenvar } from "@tsenvar/node";

const def = define({ A: { construct: Number }, B: { construct: Boolean } });

const v = Tsenvar.load(def, { envPath: "examples/node/.env" });
console.log(v);

v.A;
// ^?

v.B;
// ^?

type Env = ResolveType<typeof def>;
const _f = (env: Env) => {
  env.A;
  // ^?
  env.B;
  // ^?
};
