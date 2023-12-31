import type { EnvVar, Document, Identifier, Value, Node } from "./ast";

const EOF = "\0";

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
  const context = createContext(input);
  return parseDocument(context);
};

const parseDocument = (context: ParserContext): ParseResult<Document> => {
  const envVars: EnvVar[] = [];
  const errors: ParseErrorValue[] = [];

  const envVar = parseEnvVar(context);

  // TODO: loop
  if (!envVar.ok) {
    errors.push(...err(envVar.errors).errors);
    return err(errors);
  }
  envVars.push(envVar.value);

  return ok({
    envVars,
    span: { start: 0, end: context.position },
  });
};

const parseEnvVar = (context: ParserContext): ParseResult<EnvVar> => {
  const start = context.position;
  const maybeId = parseIdentifier(context);
  if (!maybeId.ok) return err(maybeId.errors);

  const identifier = maybeId.value;
  consumeWhitespace(context);
  if (peekChar(context) !== "=") {
    return err([
      {
        error: `Expected "=", got "${peekChar(context)}"`,
        position: context.position,
      },
    ]);
  }
  consumeChar(context); // skip "="
  consumeWhitespace(context);
  const maybeValue = parseValue(context);
  if (!maybeValue.ok) return err(maybeValue.errors);

  return ok({
    id: identifier,
    value: {
      value: maybeValue.value.value,
      span: maybeValue.value.span,
    },
    span: { start, end: context.position },
  });
};

const parseIdentifier = (context: ParserContext): ParseResult<Identifier> => {
  const start = context.position;
  let name = "";
  while (isIdentifierChar(peekChar(context))) {
    name += consumeChar(context);
  }
  const end = context.position;
  return ok({ name, span: { start, end } });
};

const isIdentifierChar = (char: string): boolean => {
  return /[a-zA-Z0-9_]/.test(char);
};

const parseValue = (context: ParserContext): ParseResult<Value> => {
  const start = context.position;
  let value = "";
  // TODO:
  while (peekChar(context) !== EOF) {
    value += consumeChar(context);
  }

  const end = context.position;

  return ok({
    value,
    span: { start, end },
  });
};

const peekChar = (context: ParserContext): string => {
  return context.source[context.position] ?? EOF;
};

const consumeChar = (context: ParserContext): string => {
  const char = peekChar(context);
  context.position++;
  return char;
};

const consumeWhitespace = (context: ParserContext): void => {
  while (isWhitespace(peekChar(context))) {
    consumeChar(context);
  }
};

const isWhitespace = (char: string): boolean => {
  return /\s/.test(char);
};
