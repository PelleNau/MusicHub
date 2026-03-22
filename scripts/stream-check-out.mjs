import {
  assert,
  getEntryById,
  getLatestEntry,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  parseArgs,
  resolveStreamName,
} from "./coordination-lib.mjs";

function allowedOutboxTypesForEvent() {
  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    return new Set(["blocked", "completed", "accepted"]);
  }
  return new Set(["acknowledged", "in_progress", "blocked", "completed", "accepted"]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    console.log("Current branch is not mapped to a managed stream. Skipping stream check-out.");
    return;
  }

  const { stream, state, inbox, outbox } = await loadStreamContext(config, streamName);
  const { queue } = await loadChiefQueue(config);

  assert(state.activeTaskId, `${stream.displayName}: missing activeTaskId in state.json`);

  const latestInbox = getLatestEntry(inbox);
  assert(latestInbox, `${stream.displayName}: inbox is empty`);
  assert(
    state.latestAcknowledgedInboxMessageId === latestInbox.id,
    `${stream.displayName}: newest Chief instruction has not been acknowledged`,
  );

  const latestOutbox = state.latestOutboxMessageId
    ? getEntryById(outbox, state.latestOutboxMessageId)
    : null;
  assert(latestOutbox, `${stream.displayName}: missing latest outbox message for active task`);
  assert(
    latestOutbox.taskId === state.activeTaskId,
    `${stream.displayName}: latest outbox message does not belong to active task '${state.activeTaskId}'`,
  );
  assert(
    latestOutbox.inReplyTo === latestInbox.id,
    `${stream.displayName}: latest outbox message does not reply to latest Chief instruction`,
  );

  const allowedTypes = allowedOutboxTypesForEvent();
  assert(
    allowedTypes.has(latestOutbox.type),
    `${stream.displayName}: latest outbox type '${latestOutbox.type}' is not allowed for this event`,
  );

  const task = queue.tasks.find((entry) => entry.id === state.activeTaskId);
  assert(task, `${stream.displayName}: active task '${state.activeTaskId}' is missing from chief queue`);
  assert(task.stream === streamName, `${stream.displayName}: active task belongs to '${task.stream}', not '${streamName}'`);

  if (process.env.GITHUB_EVENT_NAME === "pull_request") {
    assert(
      ["blocked", "completed", "accepted"].includes(state.status),
      `${stream.displayName}: pull requests require stream state to be blocked, completed, or accepted`,
    );
  }

  console.log(`Stream check-out passed for ${stream.displayName}.`);
}

await main();
