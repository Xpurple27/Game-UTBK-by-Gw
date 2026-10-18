import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const playerSaves=sqliteTable('player_saves',{userId:text('user_id').primaryKey(),payload:text('payload').notNull(),revision:integer('revision').notNull(),updatedAt:integer('updated_at').notNull()});
