import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const docsProjectDir = path.join(repoRoot, "docs", "project");
const requiredAuthority = "/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md";
const requiredProtocol = "/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md";

async function listHandoverFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHandoverFiles(fullPath));
      continue;
    }

    if (entry.isFile() && /^MH-\d+.*Handover\.md$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function rel(filePath) {
  return path.relative(repoRoot, filePath) || filePath;
}

async function main() {
  const docsStat = await stat(docsProjectDir).catch(() => null);
  if (!docsStat?.isDirectory()) {
    console.error(`Missing docs/project directory: ${docsProjectDir}`);
    process.exit(1);
  }

  const handoverFiles = await listHandoverFiles(docsProjectDir);
  if (handoverFiles.length === 0) {
    console.log("No handover docs found under docs/project. Skipping stream governance validation.");
    process.exit(0);
  }

  const failures = [];

  for (const file of handoverFiles) {
    const body = await readFile(file, "utf8");

    if (!body.includes("Authority:")) {
      failures.push(`${rel(file)}: missing 'Authority:' section`);
    }
    if (!body.includes(requiredAuthority)) {
      failures.push(`${rel(file)}: missing platform directive reference`);
    }
    if (!body.includes("Execution protocol:")) {
      failures.push(`${rel(file)}: missing 'Execution protocol:' section`);
    }
    if (!body.includes(requiredProtocol)) {
      failures.push(`${rel(file)}: missing execution protocol reference`);
    }
  }

  if (failures.length > 0) {
    console.error("Governance check failed:\n");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`Governance check passed for ${handoverFiles.length} handover file(s).`);
}

await main();
