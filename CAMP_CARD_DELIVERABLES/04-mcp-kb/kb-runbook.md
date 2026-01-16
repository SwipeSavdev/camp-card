# KB Sync Runbook

## Local
1) Copy `kb-config.example.json` to `kb-config.json` and update `workspaceRoot`.
2) Run:
```bash
node kb-sync.js --config ./kb-config.json
```
3) Outputs appear in `mcp-kb/generated/`.

## CI (GitHub Actions)
- Add a workflow step:
```yaml
- name: Sync MCP KB
  run: |
    node ./mcp-kb/kb-sync.js --config ./mcp-kb/kb-config.json
```
- Optionally fail if required artifacts are missing (extend kb-sync.js).

## Recommended Extensions
- Replace minimal matcher with a glob library (fast-glob)
- Parse OpenAPI and emit a derived API index
- Parse event schemas and emit a topic/consumer matrix
- Generate a “diff summary” between runs
