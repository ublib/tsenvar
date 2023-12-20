import { EnvVar, Document, Identifier, Value, Node } from "./ast";

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
  error: string;
}

interface ParseErrorValue {
  error: string;
  position: number;
}

const ok = <T extends Node>(value: T): ParseResult<T> => ({
  ok: true,
  value,
});

interface ParserContext {
  source: string;
  position: number;
}

const createContext = (source: string): ParserContext => ({ source, position: 0 });

export const parse = (input: string): ParseResult<Document> => {
  const context = createContext(input);
  return parseDocument(context);
};

const parseDocument = (context: ParserContext): ParseResult<Document> => {
  const envVars: EnvVar[] = [];
  const errors: ParseErrorValue[] = [];
  while (peekChar(context) !== EOF) {
    const envVar = parseEnvVar(context);
    if (!envVar.ok) {
      errors.push({ error: envVar.error, position: context.position });
      continue;
    }
    envVars.push(envVar.value);
  }
  return ok({
    envVars,
    span: { start: 0, end: context.position },
  });
};

const parseEnvVar = (context: ParserContext): ParseResult<EnvVar> => {
  const start = context.position;
  const id = parseIdentifier(context);
  if (!id.ok) {
    return id;
  }
  consumeWhitespace(context);
  consumeChar(context);
  consumeWhitespace(context);
  const value = parseValue(context);
  if (!value.ok) {
    return value;
  }
  const end = context.position;
  return ok({
    id: id.value,
    value: value.value,
    span: { start, end },
  });
};

const parseIdentifier = (context: ParserContext): ParseResult<Identifier> => {
  const start = context.position;
  let name = "";
  while (peekChar(context) !== "=") {
    name += consumeChar(context);
  }
  const end = context.position;
  return ok({
    name,
    span: { start, end },
  });
};

const parseValue = (context: ParserContext): ParseResult<Value> => {
  const start = context.position;
  let value = "";
  while (peekChar(context) !== "\n") {
    value += consumeChar(context);
  }
  const end = context.position;
  return ok({
    value,
    span: { start, end },
  });
};

const consumeChar = (context: ParserContext): string => {
  return context.source[context.position++] ?? EOF;
};

const consumeWhitespace = (context: ParserContext): void => {
  while (/s/.test(peekChar(context))) {
    consumeChar(context);
  }
};

const peekChar = (context: ParserContext): string => {
  return context.source[context.position] ?? EOF;
};
