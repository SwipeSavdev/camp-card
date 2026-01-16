/*
 * JUnit 5 example (template)
 * Add to: src/test/java/.../LedgerInvariantTest.java
 */
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

class LedgerInvariantTest {

  static class Entry {
    enum Type { DEBIT, CREDIT }
    final Type type;
    final long amount;
    Entry(Type type, long amount) { this.type = type; this.amount = amount; }
  }

  @Test
  void debitsMustEqualCredits() {
    List<Entry> entries = List.of(
      new Entry(Entry.Type.DEBIT, 100),
      new Entry(Entry.Type.CREDIT, 100)
    );

    long debits = entries.stream().filter(e -> e.type == Entry.Type.DEBIT).mapToLong(e -> e.amount).sum();
    long credits = entries.stream().filter(e -> e.type == Entry.Type.CREDIT).mapToLong(e -> e.amount).sum();

    assertEquals(debits, credits, "Ledger must balance");
  }
}
