import { Router, Request, Response } from 'express';
import {
  quickbooksBridgeLedger,
  lockCallIntoQuickBooks,
  generateInsaneTechnicalMetadata,
  directBatchImportToQuickBooks,
  normalizeTransactionList,
} from './quickbooks-bridge';
import { activeTokens } from '../index';

export const bridgeRouter = Router();

/**
 * GET /api/bridge/records
 * Returns all locked transactions and calls between Chase/Mastercard and QuickBooks Online
 */
bridgeRouter.get('/records', (req: Request, res: Response) => {
  res.json({
    success: true,
    totalRecords: quickbooksBridgeLedger.length,
    activeRealmId: activeTokens.realmId || '9341453267972001',
    hasActiveQboSession: !!activeTokens.accessToken,
    timestamp: new Date().toISOString(),
    records: quickbooksBridgeLedger,
  });
});

/**
 * POST /api/bridge/import-transactions
 * Imports arbitrary Finicity, Chase, or custom transactions directly to QuickBooks Online
 */
bridgeRouter.post('/import-transactions', async (req: Request, res: Response) => {
  try {
    const {
      transactions = [],
      source = 'MASTERCARD_OPEN_FINANCE',
      targetType = 'JournalEntry',
      realmId,
      accessToken,
    } = req.body || {};

    const importResult = await directBatchImportToQuickBooks({
      transactions,
      source,
      targetType,
      realmId: realmId || activeTokens.realmId,
      accessToken: accessToken || activeTokens.accessToken,
    });

    res.status(200).json(importResult);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/bridge/manual-sync
 * Force trigger a high-fidelity sync from Chase/Mastercard to QBO
 */
bridgeRouter.post('/manual-sync', async (req: Request, res: Response) => {
  try {
    const { source = 'CHASE_OPEN_BANKING', action = 'TRANSACTION_SYNC', amount = 1500, payload = {} } = req.body;
    const locked = await lockCallIntoQuickBooks({
      source,
      action,
      externalEntityId: `MANUAL-${Date.now()}`,
      amount: Number(amount),
      currency: 'USD',
      summary: `Manual Bridge Sync: ${source} -> QuickBooks Online (${amount} USD)`,
      payload,
      qboLinkedEntityType: 'JournalEntry',
    });

    res.json({
      success: true,
      message: 'Successfully locked into QuickBooks Online ledger with technical metadata.',
      record: locked,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/bridge/records
 * Clear bridge ledger
 */
bridgeRouter.delete('/records', (req: Request, res: Response) => {
  quickbooksBridgeLedger.length = 0;
  res.json({ success: true, message: 'QuickBooks Bridge Ledger reset.' });
});

