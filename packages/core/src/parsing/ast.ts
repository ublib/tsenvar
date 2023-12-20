export interface Span {
  start: number;
  end: number;
}

export interface Node {
  span: Span;
}

export interface Document extends Node {
  envVars: EnvVar[];
}

export interface EnvVar extends Node {
  id: Identifier;
  value: Value;
}

export interface Identifier extends Node {
  name: string;
}

export interface Value extends Node {
  value: string;
}
