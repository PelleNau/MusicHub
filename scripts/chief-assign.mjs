import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  buildMessageId,
  getArrayArg,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  nowIso,
  parseArgs,
  writeJson,
} from "./coordination-lib.mjs";

function generateTaskId(streamName) {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `MH-TASK-${stamp}-${streamName}`;
}

async function readBody(args) {
  const directBody = getStringArg(args, "body", "");
  const bodyFile = getStringArg(args, "body-file", null);

  if (bodyFile) {
    const body = await readFile(path.resolve(process.cwd(), bodyFile), "utf8");
    return body.trim();
  }

  return directBody.trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const streamName = getStringArg(args, "stream");
  if (!streamName) {
    throw new Error("Missing required --stream argument");
  }

  const title = getStringArg(args, "title");
  if (!title) {
    throw new Error("Missing required --title argument");
  }

  const config = await loadCoordinationConfig();
  const { stream, paths, state, inbox } = await loadStreamContext(config, streamName);
  const { queuePath, queue } = await loadChiefQueue(config);
  const force = args.force === true;

  if (
    !force &&
    state.activeTaskId &&
    !["completed", "accepted", "blocked", "idle"].includes(state.status)
  ) {
    throw new Error(
      `Stream '${streamName}' already has active task '${state.activeTaskId}' with status '${state.status}'. Use --force to override.`,
    );
  }

  const taskId = getStringArg(args, "task-id", generateTaskId(streamName));
  if (queue.tasks.some((task) => task.id === taskId)) {
    throw new Error(`Task '${taskId}' already exists in chief queue`);
  }

  const body = await readBody(args);
  const mustRead = [
    "/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md",
    "/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md",
    stream.handover,
    ...getArrayArg(args, "must-read"),
  ].filter(Boolean);

  const assignedAt = nowIso();
  const task = {
    id: taskId,
    stream: streamName,
    title,
    status: "assigned",
    assignedBy: "chief",
    assignedAt,
    branch: getStringArg(args, "branch", stream.branch),
    worktree: getStringArg(args, "worktree", stream.worktree),
    priority: getStringArg(args, "priority", "normal"),
    mustRead,
    body,
  };

  const message = {
    id: buildMessageId(taskId, "assignment"),
    taskId,
    type: "assignment",
    from: "chief",
    to: streamName,
    createdAt: assignedAt,
    title,
    body,
    mustRead,
  };

  queue.tasks.push(task);
  queue.updatedAt = assignedAt;
  inbox.push(message);

  const nextState = {
    ...state,
    status: "assigned",
    activeTaskId: taskId,
    latestInboxMessageId: message.id,
    latestAcknowledgedInboxMessageId: null,
    updatedAt: assignedAt,
  };

  await writeJson(queuePath, queue);
  await writeJson(paths.inboxPath, inbox);
  await writeJson(paths.statePath, nextState);

  console.log(`Assigned ${taskId} to ${stream.displayName}`);
}

await main();
