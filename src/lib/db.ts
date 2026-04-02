
import Dexie, { type EntityTable } from 'dexie';
import { SusuGroup } from './types';

/**
 * SusuPulse Local Database Configuration
 */
export const db = new Dexie('SusuPulseDB') as Dexie & {
  groups: EntityTable<
    SusuGroup,
    'id'
  >;
};

// Schema declaration:
db.version(1).stores({
  groups: 'id, name, createdAt' // primary key "id", indexes for name and createdAt
});
