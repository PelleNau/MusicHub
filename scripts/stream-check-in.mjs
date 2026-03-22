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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    console.log("Current branch is not mapped to a managed stream. Skipping stream check-in.");
    return;
  }

  const { stream, state, inbox } = await loadStreamContext(config, streamName);
  const { queue } = await loadChiefQueue(config);

  assert(state.activeTaskId, `${stream.displayName}: missing activeTaskId in state.json`);

  const latestInbox = getLatestEntry(inbox);
  assert(latestInbox, `${stream.displayName}: inbox is empty`);
  assert(
    state.latestInboxMessageId === latestInbox.id,
    `${stream.displayName}: latestInboxMessageId does not match newest inbox message`,
  );
  assert(
    state.latestAcknowledgedInboxMessageId === latestInbox.id,
    `${stream.displayName}: newest Chief instruction has not been acknowledged`,
  );
  assert(
    latestInbox.taskId === state.activeTaskId,
    `${stream.displayName}: activeTaskId does not match newest inbox task`,
  );

  const task = queue.tasks.find((entry) => entry.id === state.activeTaskId);
  assert(task, `${stream.displayName}: active task '${state.activeTaskId}' is missing from chief queue`);
  assert(task.stream === streamName, `${stream.displayName}: active task belongs to '${task.stream}', not '${streamName}'`);
  assert(
    ["acknowledged", "in_progress", "blocked", "completed", "accepted"].includes(state.status),
    `${stream.displayName}: state status '${state.status}' is not allowed for check-in`,
  );

  console.log(`Stream check-in passed for ${stream.displayName}.`);
}

await main();
