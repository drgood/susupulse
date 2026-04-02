
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
