import {
  getEntryById,
  getLatestEntry,
  loadChiefQueue,
  loadCoordinationConfig,
  loadStreamContext,
} from "./coordination-lib.mjs";

function printSection(title, rows) {
  if (rows.length === 0) {
    return;
  }

  console.log(`${title}:`);
  for (const row of rows) {
    console.log(`- ${row}`);
  }
  console.log("");
}

function summarizeTask(task) {
  if (!task) {
    return "no active task";
  }
  return `${task.id} - ${task.title}`;
}

async function main() {
  const config = await loadCoordinationConfig();
  const { queue } = await loadChiefQueue(config);

  const unacknowledged = [];
  const inProgress = [];
  const completed = [];
  const blocked = [];
  const idle = [];

  for (const streamName of Object.keys(config.streams ?? {})) {
    const { stream, state, inbox, outbox } = await loadStreamContext(config, streamName);
    const latestInbox = getLatestEntry(inbox);
    const latestOutbox = state.latestOutboxMessageId
      ? getEntryById(outbox, state.latestOutboxMessageId)
      : null;
    const task = state.activeTaskId
      ? queue.tasks.find((entry) => entry.id === state.activeTaskId) ?? null
      : null;

    const prefix = `${stream.displayName} (${streamName})`;

    if (!latestInbox && state.status === "idle") {
      idle.push(prefix);
      continue;
    }

    if (latestInbox && state.latestAcknowledgedInboxMessageId !== latestInbox.id) {
      unacknowledged.push(
        `${prefix}: ${summarizeTask(task)} | assigned ${latestInbox.createdAt}`,
      );
      continue;
    }

    if (state.status === "blocked") {
      blocked.push(
        `${prefix}: ${summarizeTask(task)}${
          latestOutbox?.summary ? ` | ${latestOutbox.summary}` : ""
        }`,
      );
      continue;
    }

    if (state.status === "completed" || state.status === "accepted") {
      completed.push(
        `${prefix}: ${summarizeTask(task)}${
          latestOutbox?.summary ? ` | ${latestOutbox.summary}` : ""
        }`,
      );
      continue;
    }

    if (["acknowledged", "in_progress", "assigned"].includes(state.status)) {
      inProgress.push(
        `${prefix}: ${summarizeTask(task)} | status ${state.status}${
          latestOutbox?.summary ? ` | ${latestOutbox.summary}` : ""
        }`,
      );
      continue;
    }

    idle.push(`${prefix}: status ${state.status}`);
  }

  console.log("MusicHub Chief Watch");
  console.log("====================\n");

  printSection("Unacknowledged", unacknowledged);
  printSection("In Progress", inProgress);
  printSection("Completed / Ready For Review", completed);
  printSection("Blocked", blocked);
  printSection("Idle", idle);

  if (
    unacknowledged.length === 0 &&
    inProgress.length === 0 &&
    completed.length === 0 &&
    blocked.length === 0 &&
    idle.length === 0
  ) {
    console.log("No stream state found.");
  }
}

await main();
