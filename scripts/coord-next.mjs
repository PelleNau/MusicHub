import {
  getEntryById,
  getLatestEntry,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  parseArgs,
  resolveStreamName,
} from "./coordination-lib.mjs";

function printList(label, entries) {
  if (!entries || entries.length === 0) return;
  console.log(`${label}:`);
  for (const entry of entries) {
    console.log(`- ${entry}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    throw new Error("Could not resolve stream. Pass --stream explicitly or run on a managed stream branch.");
  }

  const { stream, state, inbox, outbox } = await loadStreamContext(config, streamName);
  const { queue } = await loadChiefQueue(config);
  const latestInbox = getLatestEntry(inbox);

  if (!latestInbox) {
    console.log(`${stream.displayName}: no Chief instructions in inbox.`);
    return;
  }

  const task = queue.tasks.find((entry) => entry.id === latestInbox.taskId) ?? null;
  const acknowledged = state.latestAcknowledgedInboxMessageId === latestInbox.id;

  console.log(`Stream: ${stream.displayName}`);
  console.log(`Task: ${latestInbox.taskId}`);
  console.log(`Title: ${latestInbox.title}`);
  console.log(`Chief message: ${latestInbox.id}`);
  console.log(`Assigned at: ${latestInbox.createdAt}`);
  console.log(`Acknowledged: ${acknowledged ? "yes" : "no"}`);
  if (task) {
    console.log(`Task status: ${task.status}`);
    console.log(`Priority: ${task.priority ?? "normal"}`);
  }
  printList("Must read", latestInbox.mustRead);

  if (latestInbox.body) {
    console.log("\nInstruction:");
    console.log(latestInbox.body);
  }

  const latestOutbox = state.latestOutboxMessageId
    ? getEntryById(outbox, state.latestOutboxMessageId)
    : null;
  if (latestOutbox) {
    console.log(`\nLatest stream reply: ${latestOutbox.type} at ${latestOutbox.createdAt}`);
    if (latestOutbox.summary) {
      console.log(`Summary: ${latestOutbox.summary}`);
    }
  }

  if (!acknowledged) {
    console.log("\nSuggested acknowledge command:");
    console.log(
      `npm run coord:ack:${streamName} -- --summary ${JSON.stringify(
        getStringArg(args, "summary", "Read latest Chief assignment and starting work."),
      )}`,
    );
  }
}

await main();
