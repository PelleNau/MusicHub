import {
  assert,
  buildMessageId,
  getEntryById,
  getLatestEntry,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  nowIso,
  parseArgs,
  resolveStreamName,
  writeJson,
} from "./coordination-lib.mjs";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    throw new Error("Could not resolve stream. Pass --stream explicitly or run on a managed stream branch.");
  }

  const { stream, paths, state, inbox, outbox } = await loadStreamContext(config, streamName);
  const { queuePath, queue } = await loadChiefQueue(config);
  const taskId = getStringArg(args, "task-id", state.activeTaskId);
  assert(taskId, `Stream '${streamName}' has no active task to acknowledge`);

  const inboxMessageId = getStringArg(args, "message-id", state.latestInboxMessageId);
  const inboxMessage = getEntryById(inbox, inboxMessageId);
  assert(inboxMessage, `Inbox message '${inboxMessageId}' not found for stream '${streamName}'`);
  assert(inboxMessage.taskId === taskId, `Inbox message '${inboxMessageId}' does not belong to task '${taskId}'`);

  const task = queue.tasks.find((entry) => entry.id === taskId);
  assert(task, `Task '${taskId}' not found in chief queue`);

  const createdAt = nowIso();
  const summary = getStringArg(args, "summary", "Read latest Chief instruction and starting work.");
  const outboxMessage = {
    id: buildMessageId(taskId, "ack"),
    taskId,
    type: "acknowledged",
    from: streamName,
    to: "chief",
    inReplyTo: inboxMessage.id,
    createdAt,
    summary,
  };

  outbox.push(outboxMessage);
  task.status = "acknowledged";
  task.acknowledgedAt = createdAt;
  queue.updatedAt = createdAt;

  const nextState = {
    ...state,
    status: "acknowledged",
    activeTaskId: taskId,
    latestAcknowledgedInboxMessageId: inboxMessage.id,
    latestOutboxMessageId: outboxMessage.id,
    updatedAt: createdAt,
  };

  await writeJson(queuePath, queue);
  await writeJson(paths.outboxPath, outbox);
  await writeJson(paths.statePath, nextState);

  console.log(`${stream.displayName} acknowledged ${taskId}`);
}

await main();
