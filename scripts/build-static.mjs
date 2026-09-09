import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const result = spawnSync(process.execPath, [nextCli, "build"], {
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "true" },
});

if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
