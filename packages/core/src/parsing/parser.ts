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
  error: string;
}

interface ParseErrorValue {
  error: string;
  position: number;
}

const ok = <T extends Node>(value: T): ParseResult<T> => ({ ok: true, value });
const err = (error: string): ParseResultErr => ({ ok: false, error });

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

  const start = context.position;
  const id = parseIdentifier(context);
  if (!id.ok) {
    errors.push({ error: id.error, position: context.position });
    return err(errors.join("\n")); // TODO:
  }
  const identifier = id.value;
  consumeWhitespace(context);
  if (peekChar(context) !== "=") {
    errors.push({
      error: `Expected "=", got "${peekChar(context)}"`,
      position: context.position,
    });
    return err(errors.join("\n")); // TODO:
  }
  consumeChar(context);

  // TODO: loop
  const end = context.position;
  envVars.push({
    id: identifier,
    value: {
      value: "",
      span: { start: identifier.span.end, end: identifier.span.end },
    },
    span: { start, end },
  });

  return ok({
    envVars,
    span: { start: 0, end: context.position },
  });
};

const parseIdentifier = (context: ParserContext): ParseResult<Identifier> => {
  const start = context.position;
  let name = "";
  while (isIdentifierChar(peekChar(context))) {
    name += consumeChar(context);
  }

  const end = context.position;

  return ok({
    name,
    span: { start, end },
  });
};

const isIdentifierChar = (char: string): boolean => {
  return /[a-zA-Z0-9_]/.test(char);
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
