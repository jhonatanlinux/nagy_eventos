import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";

import semanticRelease from "semantic-release";

const release = await semanticRelease({ dryRun: true, ci: false });
const packageVersion = JSON.parse(readFileSync("package.json", "utf8")).version;

function currentVersion() {
  try {
    return execFileSync(
      "git",
      ["describe", "--tags", "--abbrev=0", "--match", "v[0-9]*"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return `v${packageVersion}`;
  }
}

const version = release?.nextRelease?.version
  ? `v${release.nextRelease.version}`
  : currentVersion();

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
}

console.log(`Production version resolved as ${version}`);
