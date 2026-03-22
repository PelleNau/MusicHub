import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const repoRoot = process.cwd();
export const coordinationRoot = path.join(repoRoot, ".coordination");

export function nowIso() {
  return new Date().toISOString();
}

export function parseArgs(argv) {
  const args = { _: [] };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    const value = !next || next.startsWith("--") ? true : next;

    if (value !== true) {
      i += 1;
    }

    if (Object.hasOwn(args, key)) {
      if (Array.isArray(args[key])) {
        args[key].push(value);
      } else {
        args[key] = [args[key], value];
      }
    } else {
      args[key] = value;
    }
  }

  return args;
}

export function getStringArg(args, name, fallback = null) {
  const value = args[name];
  if (value === undefined || value === true) {
    return fallback;
  }
  if (Array.isArray(value)) {
    return String(value[value.length - 1]);
  }
  return String(value);
}

export function getArrayArg(args, name) {
  const value = args[name];
  if (value === undefined) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((entry) => entry !== true).map(String);
  }
  if (value === true) {
    return [];
  }
  return [String(value)];
}

export async function readJson(filePath, fallback = null) {
  try {
    const body = await readFile(filePath, "utf8");
    return JSON.parse(body);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function loadCoordinationConfig() {
  const configPath = path.join(coordinationRoot, "config.json");
  const config = await readJson(configPath);
  if (!config) {
    throw new Error(`Missing coordination config at ${configPath}`);
  }
  return config;
}

export function getStreamConfig(config, streamName) {
  const stream = config.streams?.[streamName] ?? null;
  if (!stream) {
    throw new Error(`Unknown stream '${streamName}'`);
  }
  return stream;
}

export function getStreamPaths(streamName) {
  const streamDir = path.join(coordinationRoot, "streams", streamName);
  return {
    streamDir,
    statePath: path.join(streamDir, "state.json"),
    inboxPath: path.join(streamDir, "inbox.json"),
    outboxPath: path.join(streamDir, "outbox.json"),
  };
}

export async function ensureStreamFiles(config, streamName) {
  const stream = getStreamConfig(config, streamName);
  const paths = getStreamPaths(streamName);

  const existingState = await readJson(paths.statePath);
  if (!existingState) {
    await writeJson(paths.statePath, {
      stream: streamName,
      displayName: stream.displayName,
      branch: stream.branch,
      worktree: stream.worktree,
      status: "idle",
      activeTaskId: null,
      latestInboxMessageId: null,
      latestAcknowledgedInboxMessageId: null,
      latestOutboxMessageId: null,
      latestCompletedTaskId: null,
      updatedAt: nowIso(),
    });
  }

  const existingInbox = await readJson(paths.inboxPath);
  if (!existingInbox) {
    await writeJson(paths.inboxPath, []);
  }

  const existingOutbox = await readJson(paths.outboxPath);
  if (!existingOutbox) {
    await writeJson(paths.outboxPath, []);
  }

  return paths;
}

export async function loadStreamContext(config, streamName) {
  const stream = getStreamConfig(config, streamName);
  const paths = await ensureStreamFiles(config, streamName);
  const state = await readJson(paths.statePath, null);
  const inbox = await readJson(paths.inboxPath, []);
  const outbox = await readJson(paths.outboxPath, []);

  return { stream, paths, state, inbox, outbox };
}

export async function loadChiefQueue(config) {
  const queuePath = path.join(repoRoot, config.chief.queueFile);
  const queue = await readJson(queuePath, { version: 1, tasks: [], updatedAt: nowIso() });
  return { queuePath, queue };
}

export function buildMessageId(taskId, type) {
  const suffix = Date.now().toString(36);
  return `${taskId}-${type}-${suffix}`;
}

export async function detectCurrentBranch() {
  if (process.env.GITHUB_HEAD_REF) {
    return process.env.GITHUB_HEAD_REF;
  }
  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }

  const { stdout } = await execFileAsync("git", ["branch", "--show-current"], { cwd: repoRoot });
  return stdout.trim();
}

export async function resolveStreamName(config, explicitStream = null) {
  if (explicitStream) {
    getStreamConfig(config, explicitStream);
    return explicitStream;
  }

  const branch = await detectCurrentBranch();
  if (!branch) {
    return null;
  }

  for (const [streamName, stream] of Object.entries(config.streams ?? {})) {
    if (stream.branch && stream.branch === branch) {
      return streamName;
    }
  }

  return null;
}

export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export function getLatestEntry(entries) {
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

export function getEntryById(entries, id) {
  return entries.find((entry) => entry.id === id) ?? null;
}
