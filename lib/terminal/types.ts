export type TerminalContext = {
  currentDirectory: string;
  history: CommandHistoryEntry[];
  setCurrentDirectory: (path: string) => void;
  addToHistory: (entry: CommandHistoryEntry) => void;
  clearHistory: () => void;
};

export type CommandHistoryEntry = {
  input: string;
  output: string;
  timestamp: number;
  error?: boolean;
};

export type CommandResponse = {
  output: string;
  error?: boolean;
};

export type Command = {
  name: string;
  description: string;
  aliases?: string[];
  response?: string | ((args: string[], context: TerminalContext) => string);
  effect?: (args: string[], context: TerminalContext) => void | Promise<void>;
};

export type FileSystemNode = {
  name: string;
  type: "directory" | "file";
  path: string;
  children?: FileSystemNode[];
  content?: string | Record<string, unknown>;
};

export type FileSystem = {
  root: FileSystemNode;
};
