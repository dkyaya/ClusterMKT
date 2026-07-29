import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "relays/tmp/application-foundation");
const masterDir = resolve(root, "brand/source/locked-masters");
const lockedHashes = {
  "cluster-mkt-mark-dimensional-light.svg":
    "66496cfe8dc2d6abb51c5b5a58824ca751db2de0d9a65be621f083bc075b11a1",
  "cluster-mkt-mark-dimensional-dark.svg":
    "b8c4d7a36ae24daf5bb6e785dc41d9e6c4b01649e5eb5c55959763b5faa3405b",
  "cluster-mkt-mark-flat.svg": "2dfae7aaf3524a80fe86a56f2fb3a1fa01b866c55abf11e3faf86aa6ef8ca992",
  "cluster-mkt-mark-monochrome-black.svg":
    "037232276468c91ce7bb70daac33bc615f83ee3942855d4bd7b337e074fe5850",
  "cluster-mkt-mark-monochrome-white.svg":
    "b676c0856aaa5b0c2bca0a687df8519b5c2c069044fa2e40ce0605c44b703542",
};
const runtimeAssets = [
  "favicon.ico",
  "favicon-16.png",
  "favicon-32.png",
  "apple-touch-icon-180.png",
  "cluster-mkt-icon-192.png",
  "cluster-mkt-icon-512.png",
  "cluster-mkt-icon-maskable-192.png",
  "cluster-mkt-icon-maskable-512.png",
  "site.webmanifest",
];
const requiredFiles = [
  "package.json",
  "pnpm-workspace.yaml",
  "pnpm-lock.yaml",
  "tsconfig.json",
  "tsconfig.base.json",
  "vitest.workspace.ts",
  "eslint.config.js",
  ".prettierrc.json",
  ".prettierignore",
  ".github/workflows/ci.yml",
  "AGENTS.md",
  "CLAUDE.md",
  "apps/web/package.json",
  "apps/web/vite.config.ts",
  "apps/web/src/App.tsx",
  "apps/worker/package.json",
  "apps/worker/wrangler.jsonc",
  "apps/worker/src/index.ts",
  "apps/worker/src/routes/health.ts",
  "apps/worker/src/routes/status.ts",
  "packages/core/package.json",
  "packages/ui/package.json",
  "packages/config/package.json",
  "docs/architecture/APPLICATION_FOUNDATION.md",
  "docs/development/LOCAL_DEVELOPMENT.md",
  "docs/development/VALIDATION.md",
  "docs/decisions/0004-application-foundation-stack.md",
];
const packageNames = new Map([
  ["apps/web/package.json", "@cluster-mkt/web"],
  ["apps/worker/package.json", "@cluster-mkt/worker"],
  ["packages/core/package.json", "@cluster-mkt/core"],
  ["packages/ui/package.json", "@cluster-mkt/ui"],
  ["packages/config/package.json", "@cluster-mkt/config"],
]);
const requiredScripts = [
  "dev",
  "dev:web",
  "dev:worker",
  "build",
  "build:web",
  "build:worker",
  "lint",
  "typecheck",
  "test",
  "test:run",
  "format",
  "format:check",
  "brand:validate",
  "assets:sync",
  "foundation:validate",
  "validate",
  "clean",
];
const checks = [];

function sha(data) {
  return createHash("sha256").update(data).digest("hex");
}
async function exists(path) {
  try {
    await stat(resolve(root, path));
    return true;
  } catch {
    return false;
  }
}
function check(name, passed, detail) {
  checks.push({ name, status: passed ? "PASS" : "FAIL", detail });
}
async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

check(
  "Expected files",
  (await Promise.all(requiredFiles.map(exists))).every(Boolean),
  `${requiredFiles.length} required foundation files checked.`,
);
const lockfileCandidates = [
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];
const lockfileExistence = await Promise.all(lockfileCandidates.map(exists));
const lockfiles = lockfileCandidates.filter((_, index) => lockfileExistence[index]);
check(
  "Single package manager",
  lockfiles.length === 1 && lockfiles[0] === "pnpm-lock.yaml",
  `Found: ${lockfiles.join(", ")}`,
);

const rootPackage = JSON.parse(await text("package.json"));
check("Root package", rootPackage.private === true, "Root package is private.");
check(
  "Root scripts",
  requiredScripts.every((script) => typeof rootPackage.scripts?.[script] === "string"),
  `${requiredScripts.length} required scripts checked.`,
);
for (const [path, expected] of packageNames) {
  const packageJson = JSON.parse(await text(path));
  check(
    `Workspace package ${expected}`,
    packageJson.name === expected && packageJson.private === true,
    `${path} has the expected private name.`,
  );
}

check("Agent guidance", await exists("AGENTS.md"), "AGENTS.md exists.");
check(
  "Claude import",
  (await text("CLAUDE.md")).startsWith("@AGENTS.md\n"),
  "CLAUDE.md imports AGENTS.md.",
);

let masterIntegrity = true;
for (const [name, expected] of Object.entries(lockedHashes)) {
  const data = await readFile(resolve(masterDir, name));
  if (sha(data) !== expected) masterIntegrity = false;
}
check("Locked masters", masterIntegrity, "All five SHA-256 hashes match the pre-phase record.");

const brandSvgDirs = [resolve(root, "brand/svg"), masterDir];
let rasterSvg = false;
for (const directory of brandSvgDirs) {
  for (const name of await readdir(directory)) {
    if (extname(name) !== ".svg") continue;
    const svg = await readFile(resolve(directory, name), "utf8");
    if (/<image\b/i.test(svg) || /data:image|base64/i.test(svg)) rasterSvg = true;
  }
}
check("SVG safety", !rasterSvg, "No production SVG embeds raster content.");

const runtimeMatches = (
  await Promise.all(
    runtimeAssets.map(async (name) => {
      const canonical = await readFile(resolve(root, "brand/icons", name));
      const generated = await readFile(resolve(root, "apps/web/public/brand", name));
      return sha(canonical) === sha(generated);
    }),
  )
).every(Boolean);
check(
  "Runtime brand sync",
  runtimeMatches,
  `${runtimeAssets.length} generated browser assets match canonical sources.`,
);

const packagePaths = ["package.json", ...packageNames.keys()];
const allDependencies = {};
for (const path of packagePaths) {
  const packageJson = JSON.parse(await text(path));
  Object.assign(
    allDependencies,
    packageJson.dependencies,
    packageJson.devDependencies,
    packageJson.peerDependencies,
  );
}
const forbiddenDependencies = [
  "tailwindcss",
  "@supabase/supabase-js",
  "openai",
  "@anthropic-ai/sdk",
  "@mui/material",
  "@chakra-ui/react",
  "antd",
  "bootstrap",
  "@tanstack/react-query",
  "axios",
  "redux",
  "zustand",
  "hono",
];
const foundForbidden = forbiddenDependencies.filter((dependency) => dependency in allDependencies);
check(
  "Dependency boundaries",
  foundForbidden.length === 0,
  foundForbidden.length
    ? `Forbidden: ${foundForbidden.join(", ")}`
    : "No prohibited service, styling, state, HTTP, AI, or component dependency found.",
);

const environmentFiles = (await readdir(root)).filter(
  (name) => name === ".env" || (name.startsWith(".env.") && name !== ".env.example"),
);
check(
  "Environment hygiene",
  environmentFiles.length === 0,
  "No real root environment file exists.",
);
const secretPattern = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bsk-[A-Za-z0-9]{20,}/;
const authoredFiles = requiredFiles.filter((path) => !path.endsWith("pnpm-lock.yaml"));
let secretFound = false;
for (const path of authoredFiles) if (secretPattern.test(await text(path))) secretFound = true;
check(
  "Secret scan",
  !secretFound,
  "No obvious private key or API-token pattern found in authored foundation files.",
);

const uiSource = await Promise.all(
  [
    "apps/web/src/App.tsx",
    "apps/web/src/pages/TodayPage.tsx",
    "apps/web/src/pages/ClusterDetailPage.tsx",
    "apps/web/src/data/demoClusters.ts",
  ].map(text),
);
check(
  "Demonstration labeling",
  uiSource.some((value) => value.includes("Demonstration data")),
  "The web shell labels static fixtures.",
);
const recommendationPattern =
  /\b(?:buy|sell|hold|target[ -]price|price prediction|trading signal)\b/i;
check(
  "Product boundary language",
  !uiSource.some((value) => recommendationPattern.test(value)),
  "No recommendation or prediction language appears in the product UI fixtures.",
);

const activeDocs = await Promise.all(
  [
    "README.md",
    "AGENTS.md",
    "docs/architecture/APPLICATION_FOUNDATION.md",
    "docs/development/LOCAL_DEVELOPMENT.md",
    "docs/development/VALIDATION.md",
  ].map(text),
);
check(
  "Force-push safety",
  !activeDocs.some((value) => /git push\s+(?:--force|-f)\b/.test(value)),
  "No force-push command is documented.",
);
check(
  "Deployment honesty",
  activeDocs.every((value) => !/successfully deployed|production deployment is live/i.test(value)),
  "No successful production deployment is claimed.",
);

const requiredRoutes = [
  "TodayPage.tsx",
  "ClusterDetailPage.tsx",
  "SettingsPage.tsx",
  "PlaceholderPage.tsx",
  "NotFoundPage.tsx",
];
check(
  "Web route files",
  (await Promise.all(requiredRoutes.map((name) => exists(`apps/web/src/pages/${name}`)))).every(
    Boolean,
  ),
  `${requiredRoutes.length} required route files checked.`,
);
check(
  "Worker boundary",
  await exists("apps/worker/test/app.test.ts"),
  "Worker implementation and behavior tests exist.",
);
check(
  "CI workflow",
  (await text(".github/workflows/ci.yml")).includes("pnpm foundation:validate"),
  "CI includes all validation stages without deployment.",
);

const failed = checks.filter((item) => item.status === "FAIL");
const report = {
  status: failed.length ? "FAIL" : "PASS",
  generatedAt: new Date().toISOString(),
  checks,
  lockedMasterHashes: lockedHashes,
};
await mkdir(output, { recursive: true });
await writeFile(
  resolve(output, "application-foundation-validation-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
const summary = [
  "# Application foundation validation",
  "",
  `Overall status: **${report.status}**`,
  "",
  `Checks: ${checks.length - failed.length} passed, ${failed.length} failed.`,
  "",
  ...checks.map((item) => `- ${item.status}: ${item.name} — ${item.detail}`),
  "",
].join("\n");
await writeFile(resolve(output, "application-foundation-validation-summary.md"), summary);
for (const item of checks) console.log(`${item.status}: ${item.name} — ${item.detail}`);
console.log(`SUMMARY: ${checks.length - failed.length} passed, ${failed.length} failed`);
if (failed.length) process.exitCode = 1;
