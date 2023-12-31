import type { EnvVar, Document, Identifier, Value, Node } from "./ast";

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

  return ok({
    envVars,
    span: { start: 0, end: context.position },
  });
};
