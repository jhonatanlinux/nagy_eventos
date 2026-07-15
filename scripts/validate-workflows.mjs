import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { parseDocument } from "yaml";

const workflowsDirectory = resolve(".github/workflows");
const workflowFiles = (await readdir(workflowsDirectory)).filter((file) =>
  file.endsWith(".yml"),
);
const allowedBranches = new Set(["develop", "main"]);

for (const file of workflowFiles) {
  const source = await readFile(resolve(workflowsDirectory, file), "utf8");
  const document = parseDocument(source);

  if (document.errors.length > 0) {
    throw new Error(`${file}: ${document.errors.join("; ")}`);
  }

  const workflow = document.toJS();

  if (!workflow?.on || !workflow?.jobs) {
    throw new Error(`${file}: workflow must define on and jobs`);
  }

  for (const event of ["push", "pull_request"]) {
    const branches = workflow.on[event]?.branches ?? [];

    for (const branch of branches) {
      if (!allowedBranches.has(branch)) {
        throw new Error(`${file}: unsupported branch ${branch}`);
      }
    }
  }
}

const migrationWorkflow = await readFile(
  resolve(workflowsDirectory, "migration.yml"),
  "utf8",
);

if (migrationWorkflow.includes("--include-seed")) {
  throw new Error(
    "migration.yml: production migrations must never include seed",
  );
}

if (!migrationWorkflow.includes("penymftuwlipszichtjn")) {
  throw new Error("migration.yml: production project guard is missing");
}

const deployDocument = parseDocument(
  await readFile(resolve(workflowsDirectory, "deploy.yml"), "utf8"),
).toJS();
const productionNeeds = deployDocument.jobs.production.needs;

if (!productionNeeds.includes("migrations")) {
  throw new Error("deploy.yml: Production must depend on migrations");
}

if (deployDocument.jobs.release.needs !== "production") {
  throw new Error("deploy.yml: release must depend on Production deploy");
}

console.log(`${workflowFiles.length} workflows validated`);
