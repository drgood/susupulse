
import Dexie, { type EntityTable } from 'dexie';
import { SusuGroup, PaymentLog } from './types';

/**
 * SusuPulse Local Database Configuration
 */
export const db = new Dexie('SusuPulseDB') as Dexie & {
  groups: EntityTable<
    SusuGroup,
    'id'
  >;
  paymentLogs: EntityTable<
    PaymentLog,
    'id'
  >;
  config: EntityTable<
    { key: string; value: any },
    'key'
  >;
};

// Schema declaration:
db.version(2).stores({
  groups: 'id, name, createdAt',
  config: 'key'
});

db.version(3).stores({
  groups: 'id, name, createdAt',
  paymentLogs: 'id, groupId, memberId, timestamp',
  config: 'key'
}).upgrade(tx => {
  // Add creditRemainder: 0 to all existing members
  return tx.table('groups').toCollection().modify(group => {
    if (group.members) {
      group.members.forEach((m: any) => {
        if (m.creditRemainder === undefined) {
          m.creditRemainder = 0;
        }
      });
    }
  });
});
