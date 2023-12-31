import type { EnvVar, Document, Identifier, Value, Node } from "./ast";

const enum Tokens {
  DoubleQuat = '"',
  Eof = "\0",
  Equal = "=",
  Newline = "\n",
}

type ParseResult<T extends Node> = ParseResultOk<T> | ParseResultErr;

interface ParseResultBase {
  ok: boolean;
}

interface ParseResultOk<T extends Node> extends ParseResultBase {
  ok: true;
  value: T;
}

interface ParseResultErr extends ParseResultBase {
  ok: false;
  errors: ParseErrorValue[];
}

interface ParseErrorValue {
  error: string;
  position: number;
}

const ok = <T extends Node>(value: T): ParseResult<T> => ({ ok: true, value });
const err = (errors: ParseErrorValue[]): ParseResultErr => ({
  ok: false,
  errors,
});

interface ParserContext {
  source: string;
  position: number;
}

const createContext = (source: string): ParserContext => ({
  source,
  position: 0,
});

export const parse = (input: string): ParseResult<Document> => {
  const ctx = createContext(input);
  return parseDocument(ctx);
};

const parseDocument = (ctx: ParserContext): ParseResult<Document> => {
  const envVars: EnvVar[] = [];
  const errors: ParseErrorValue[] = [];

  const start = ctx.position;
  while (peekChar(ctx) !== Tokens.Eof) {
    // prologue
    consumeWhitespace(ctx);

    const envVar = parseEnvVar(ctx);
    if (!envVar.ok) {
      errors.push(...err(envVar.errors).errors);
      return err(errors);
    }
    envVars.push(envVar.value);

    // epilogue
    consumeWhitespace(ctx);
  }

  const end = ctx.position;

  return ok({
    envVars,
    span: { start, end },
  });
};

const parseEnvVar = (ctx: ParserContext): ParseResult<EnvVar> => {
  const start = ctx.position;
  const maybeId = parseIdentifier(ctx);
  if (!maybeId.ok) return err(maybeId.errors);

  const identifier = maybeId.value;
  consumeWhitespace(ctx);
  if (peekChar(ctx) !== Tokens.Equal) {
    return err([
      {
        error: `Expected "=", got "${peekChar(ctx)}"`,
        position: ctx.position,
      },
    ]);
  }
  consumeChar(ctx); // skip "="
  consumeWhitespace(ctx);
  const maybeValue = parseValue(ctx);
  if (!maybeValue.ok) return err(maybeValue.errors);

  return ok({
    id: identifier,
    value: {
      value: maybeValue.value.value,
      span: maybeValue.value.span,
    },
    span: { start, end: ctx.position },
  });
};

const parseIdentifier = (ctx: ParserContext): ParseResult<Identifier> => {
  const start = ctx.position;
  while (isIdentifierChar(peekChar(ctx))) {
    consumeChar(ctx);
  }
  const end = ctx.position;

  return ok({
    name: ctx.source.slice(start, end),
    span: { start, end },
  });
};

const isIdentifierChar = (char: string): boolean => {
  return /[a-zA-Z0-9_]/.test(char);
};

const parseValue = (ctx: ParserContext): ParseResult<Value> => {
  let start = ctx.position;

  let isDoubleQuat = false;
  if (peekChar(ctx) === '"') {
    start++;
    isDoubleQuat = true;
    consumeChar(ctx); // skip '"'
  }

  while (
    isDoubleQuat
      ? peekChar(ctx) !== Tokens.DoubleQuat && peekChar(ctx) !== Tokens.Eof
      : peekChar(ctx) !== Tokens.Newline && peekChar(ctx) !== Tokens.Eof
  ) {
    consumeChar(ctx);
  }

  if (isDoubleQuat) {
    // When eof without closing double quat
    if (peekChar(ctx) !== Tokens.DoubleQuat) {
      return err([
        {
          error: `Expected '"', got "${peekChar(ctx)}"`,
          position: ctx.position,
        },
      ]);
    }
    consumeChar(ctx); // skip '"'
  }

  const end = ctx.position - (isDoubleQuat ? 1 : 0);

  return ok({
    value: ctx.source.slice(start, end),
    span: { start, end },
  });
};

const peekChar = (ctx: ParserContext): string => {
  return ctx.source[ctx.position] ?? Tokens.Eof;
};

const consumeChar = (ctx: ParserContext) => {
  ctx.position++;
};

const consumeWhitespace = (ctx: ParserContext): void => {
  while (isWhitespace(peekChar(ctx))) {
    consumeChar(ctx);
  }
};

const isWhitespace = (char: string): boolean => {
  return /\s/.test(char);
};
