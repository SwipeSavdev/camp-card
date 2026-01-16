# k6 Load Testing Harness (Template)

## Run
```bash
export BASE_URL="https://your-env.example.com"
k6 run scenarios.js
```

## Notes
- Uses idempotency keys for all writes
- Records test-run-id headers for observability
- Includes placeholder verification polls for cross-app sync
