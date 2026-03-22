import {
  assert,
  buildMessageId,
  getArrayArg,
  getEntryById,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  nowIso,
  parseArgs,
  resolveStreamName,
  writeJson,
} from "./coordination-lib.mjs";

const allowedStatuses = new Set(["in_progress", "blocked", "completed", "accepted"]);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    throw new Error("Could not resolve stream. Pass --stream explicitly or run on a managed stream branch.");
  }

  const status = getStringArg(args, "status");
  assert(status && allowedStatuses.has(status), "Missing or invalid --status. Allowed: in_progress, blocked, completed, accepted");

  const summary = getStringArg(args, "summary");
  assert(summary, "Missing required --summary");

  const { stream, paths, state, inbox, outbox } = await loadStreamContext(config, streamName);
  const { queuePath, queue } = await loadChiefQueue(config);
  const taskId = getStringArg(args, "task-id", state.activeTaskId);
  assert(taskId, `Stream '${streamName}' has no active task to report on`);

  const inboxMessageId = state.latestInboxMessageId;
  const inboxMessage = getEntryById(inbox, inboxMessageId);
  assert(inboxMessage, `Latest inbox message '${inboxMessageId}' not found for stream '${streamName}'`);

  const task = queue.tasks.find((entry) => entry.id === taskId);
  assert(task, `Task '${taskId}' not found in chief queue`);

  const createdAt = nowIso();
  const outboxMessage = {
    id: buildMessageId(taskId, status),
    taskId,
    type: status,
    from: streamName,
    to: "chief",
    inReplyTo: inboxMessage.id,
    createdAt,
    summary,
    validation: getArrayArg(args, "validation"),
    filesChanged: getArrayArg(args, "file"),
    blockers: getArrayArg(args, "blocker"),
  };

  outbox.push(outboxMessage);
  task.status = status;
  task.lastReportedAt = createdAt;
  if (status === "completed") {
    task.completedAt = createdAt;
  }
  queue.updatedAt = createdAt;

  const nextState = {
    ...state,
    status,
    latestOutboxMessageId: outboxMessage.id,
    latestCompletedTaskId: status === "completed" ? taskId : state.latestCompletedTaskId,
    updatedAt: createdAt,
  };

  await writeJson(queuePath, queue);
  await writeJson(paths.outboxPath, outbox);
  await writeJson(paths.statePath, nextState);

  console.log(`${stream.displayName} reported ${status} for ${taskId}`);
}

await main();
