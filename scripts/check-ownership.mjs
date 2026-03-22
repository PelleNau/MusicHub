import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  assert,
  getStringArg,
  loadCoordinationConfig,
  parseArgs,
  readJson,
  repoRoot,
  resolveStreamName,
} from "./coordination-lib.mjs";

const execFileAsync = promisify(execFile);

function normalize(value) {
  return value.replace(/\\/g, "/");
}

function matchPattern(filePath, pattern) {
  const file = normalize(filePath);
  const rule = normalize(pattern);

  if (rule.endsWith("/**")) {
    const prefix = rule.slice(0, -3);
    return file === prefix || file.startsWith(`${prefix}/`);
  }

  if (rule.includes("*")) {
    const regex = new RegExp(
      `^${rule
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*")}$`,
    );
    return regex.test(file);
  }

  return file === rule;
}

function matchesAny(filePath, patterns = []) {
  return patterns.some((pattern) => matchPattern(filePath, pattern));
}

async function diffNames(baseRef, cwd) {
  const { stdout } = await execFileAsync("git", ["diff", "--name-only", `${baseRef}...HEAD`], { cwd });
  return stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}

async function localNames(cwd) {
  const { stdout } = await execFileAsync("git", ["status", "--porcelain"], { cwd });
  return stdout
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const pathPart = line.slice(3).trim();
      const arrowIndex = pathPart.indexOf(" -> ");
      return arrowIndex >= 0 ? pathPart.slice(arrowIndex + 4).trim() : pathPart;
    });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await loadCoordinationConfig();
  const streamName = await resolveStreamName(config, getStringArg(args, "stream"));

  if (!streamName) {
    console.log("Current branch is not mapped to a managed stream. Skipping ownership check.");
    return;
  }

  const ownershipPath = path.join(repoRoot, ".coordination", "ownership.json");
  const ownership = await readJson(ownershipPath);
  assert(ownership?.streams?.[streamName], `Missing ownership config for stream '${streamName}'`);

  const streamOwnership = ownership.streams[streamName];
  const branch = config.streams[streamName]?.branch ?? "";
  const defaultBase = branch === "codex/figma-capture-mode" ? "origin/main" : "origin/codex/figma-capture-mode";
  const baseRef = getStringArg(args, "base", defaultBase);
  const includeLocal = args["include-local"] === true || !process.env.GITHUB_ACTIONS;

  const changed = new Set(await diffNames(baseRef, repoRoot));
  if (includeLocal) {
    for (const file of await localNames(repoRoot)) {
      changed.add(file);
    }
  }

  const files = [...changed].sort();
  if (files.length === 0) {
    console.log(`Ownership check passed for ${config.streams[streamName].displayName}: no changed files.`);
    return;
  }

  const violations = [];
  for (const file of files) {
    if (matchesAny(file, streamOwnership.deny ?? [])) {
      violations.push(`${file} matches deny rule`);
      continue;
    }
    if (!matchesAny(file, streamOwnership.allow ?? [])) {
      violations.push(`${file} is outside allow rules`);
    }
  }

  if (violations.length > 0) {
    console.error(`Ownership check failed for ${config.streams[streamName].displayName}.`);
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log(`Ownership check passed for ${config.streams[streamName].displayName}.`);
}

await main();
