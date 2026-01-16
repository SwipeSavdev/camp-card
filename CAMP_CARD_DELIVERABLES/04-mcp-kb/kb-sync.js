/**
 * kb-sync.js (template)
 * Crawl a multi-repo workspace and generate KB indexes + snapshots.
 *
 * Usage:
 *   node kb-sync.js --config ./kb-config.json
 *
 * Notes:
 * - Replace globbing with your preferred library if desired.
 * - This script is intentionally dependency-light.
 */
const fs = require("fs");
const path = require("path");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function walk(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function isMatchAny(filePath, patterns) {
  // Minimal matcher: checks suffixes and simple substring tokens. Replace with glob if needed.
  const lower = filePath.toLowerCase();
  return patterns.some(p => {
    const pl = p.toLowerCase();
    if (pl.startsWith("**/") && pl.endsWith("/**/*")) {
      const token = pl.slice(3, -5);
      return lower.includes(token);
    }
    if (pl.includes("*")) {
      const token = pl.replace(/\*/g, "");
      return lower.includes(token);
    }
    return lower.endsWith(pl) || lower.includes(pl.replace("**/", ""));
  });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

function rel(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function main() {
  const args = process.argv.slice(2);
  const configArgIndex = args.indexOf("--config");
  if (configArgIndex === -1) {
    console.error("Missing --config");
    process.exit(1);
  }
  const configPath = args[configArgIndex + 1];
  const config = readJson(configPath);

  const workspaceRoot = path.resolve(process.cwd(), config.workspaceRoot || ".");
  const outputDir = path.resolve(process.cwd(), config.outputDir || "mcp-kb/generated");
  ensureDir(outputDir);

  const allFiles = walk(workspaceRoot);

  const projectReports = [];

  for (const proj of config.projects || []) {
    const projOutDir = path.join(outputDir, "projects", proj.name);
    ensureDir(projOutDir);

    // Very simple "repo glob" emulation by substring token
    const repoTokens = (proj.repoGlobs || []).map(g => g.replace(/\*/g, "").toLowerCase());
    const projFiles = allFiles.filter(f => repoTokens.some(t => f.toLowerCase().includes(t)));

    const included = projFiles.filter(f => isMatchAny(f, config.includePatterns || []));

    // Generate index
    const lines = [];
    lines.push(`# KB Snapshot – ${proj.name}`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push("");
    lines.push("## Included Files");
    for (const f of included.sort()) {
      lines.push(`- ${rel(workspaceRoot, f)}`);
    }

    writeFile(path.join(projOutDir, "snapshot-index.md"), lines.join("\n"));

    projectReports.push({ name: proj.name, count: included.length });
  }

  const rootIndex = [];
  rootIndex.push("# MCP KB – Generated Index");
  rootIndex.push(`Generated: ${new Date().toISOString()}`);
  rootIndex.push("");
  rootIndex.push("## Projects");
  for (const r of projectReports) {
    rootIndex.push(`- **${r.name}**: ${r.count} files → \`mcp-kb/generated/projects/${r.name}/snapshot-index.md\``);
  }
  writeFile(path.join(outputDir, "index.md"), rootIndex.join("\n"));

  console.log("KB sync complete:", outputDir);
}

main();
