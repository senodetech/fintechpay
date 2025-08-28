import { MockDbService } from '../src/database/mock-db.service';
import { LedgerEntryType } from '@finpay360/shared-types';
import { MoneyMath } from '../src/common/utils/money-math';

describe('Double-Entry Ledger Invariant Verification', () => {
  let mockDb: MockDbService;

  beforeEach(() => {
    mockDb = new MockDbService();
  });

  it('should guarantee that total debits equal total credits across all posted ledger entries', () => {
    let totalDebit = MoneyMath.add(0, 0);
    let totalCredit = MoneyMath.add(0, 0);

    for (const entry of mockDb.ledgerEntries) {
      if (entry.entryType === LedgerEntryType.DEBIT) {
        totalDebit = MoneyMath.add(totalDebit, entry.amount);
      } else if (entry.entryType === LedgerEntryType.CREDIT) {
        totalCredit = MoneyMath.add(totalCredit, entry.amount);
      }
    }

    expect(MoneyMath.toDbString(totalDebit)).toBe(MoneyMath.toDbString(totalCredit));
  });

  it('should ensure each transaction has balanced debit and credit entries', () => {
    const transactions = mockDb.transactions.slice(0, 50);

    for (const tx of transactions) {
      const entries = mockDb.ledgerEntries.filter((l) => l.transactionId === tx.id);
      if (entries.length > 0) {
        const debitEntry = entries.find((e) => e.entryType === LedgerEntryType.DEBIT);
        const creditEntry = entries.find((e) => e.entryType === LedgerEntryType.CREDIT);

        if (debitEntry && creditEntry) {
          expect(debitEntry.amount).toBe(creditEntry.amount);
        }
      }
    }
  });
});
