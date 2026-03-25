import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  getLatestEntry,
  getStringArg,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
  parseArgs,
  repoRoot,
  resolveStreamName,
} from "./coordination-lib.mjs";

const execFileAsync = promisify(execFile);

function printInstruction(stream, task, latestInbox, acknowledged) {
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
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    throw new Error("Could not resolve stream. Pass --stream explicitly or run on a managed stream branch.");
  }

  const { stream, state, inbox } = await loadStreamContext(config, streamName);
  const { queue } = await loadChiefQueue(config);
  const latestInbox = getLatestEntry(inbox);

  if (!latestInbox) {
    console.log(`${stream.displayName}: no Chief instructions in inbox.`);
    return;
  }

  const task = queue.tasks.find((entry) => entry.id === latestInbox.taskId) ?? null;
  const acknowledged = state.latestAcknowledgedInboxMessageId === latestInbox.id;
  const autoAck = args.ack === true;
  const summary = getStringArg(args, "summary", "Read latest Chief assignment and starting work.");

  printInstruction(stream, task, latestInbox, acknowledged);

  if (acknowledged) {
    console.log("\nNo action taken. Latest instruction is already acknowledged.");
    return;
  }

  if (!autoAck) {
    console.log("\nPending instruction detected.");
    console.log(`Suggested start command: npm run stream:start:${streamName} -- --summary ${JSON.stringify(summary)}`);
    return;
  }

  await execFileAsync("npm", ["run", `coord:ack:${streamName}`, "--", "--summary", summary], {
    cwd: repoRoot,
  });

  console.log("\nAcknowledged latest instruction.");
}

await main();
