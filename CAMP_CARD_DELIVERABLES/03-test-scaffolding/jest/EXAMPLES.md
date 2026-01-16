# Jest Starter Examples

## 1) Idempotency unit test (example)
```ts
import { computeIdempotencyKey } from "../src/idempotency";

describe("idempotency", () => {
  it("produces stable key for same inputs", () => {
    const a = computeIdempotencyKey({ merchantId: "m1", amountCents: 1000, nonce: "n1" });
    const b = computeIdempotencyKey({ merchantId: "m1", amountCents: 1000, nonce: "n1" });
    expect(a).toBe(b);
  });
});
```

## 2) Domain invariant test (example)
```ts
import { validateLedgerBalance } from "../src/ledger";

test("ledger balance must hold: debits == credits", () => {
  const entries = [
    { type: "DEBIT", amount: 100 },
    { type: "CREDIT", amount: 100 },
  ];
  expect(() => validateLedgerBalance(entries)).not.toThrow();
});
```
