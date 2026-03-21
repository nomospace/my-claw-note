// 数据库连接 - sql.js 实现
import initSqlJs, { Database, SqlValue } from 'sql.js';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createTables } from './schema';

const DB_DIR = join(process.cwd(), 'data');
const DB_PATH = join(DB_DIR, 'myclawnote.db');

// wasm 文件路径
const WASM_PATH = join(
  process.cwd(),
  'node_modules',
  '.pnpm',
  'sql.js@1.14.1',
  'node_modules',
  'sql.js',
  'dist',
  'sql-wasm.wasm'
);

let db: Database | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

export async function initSql() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => {
        // 返回 wasm 文件的绝对路径
        return join(
          process.cwd(),
          'node_modules',
          '.pnpm',
          'sql.js@1.14.1',
          'node_modules',
          'sql.js',
          'dist',
          file
        );
      }
    });
  }
  return SQL;
}

export async function getDb(): Promise<Database> {
  if (!db) {
    const SQL = await initSql();
    
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
    }
    
    if (existsSync(DB_PATH)) {
      const buffer = readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
      db.run(createTables);
    }
  }
  return db;
}

export function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

export function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

// 同步版本的数据库获取
let dbSync: Database | null = null;

export function getDbSync(): Database {
  if (!dbSync) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbSync;
}

export async function initDatabase(): Promise<Database> {
  const SQL = await initSql();
  
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    dbSync = new SQL.Database(buffer);
  } else {
    dbSync = new SQL.Database();
    dbSync.run(createTables);
    saveDbSync();
  }
  
  console.log('Database initialized');
  return dbSync;
}

export function saveDbSync() {
  if (dbSync) {
    const data = dbSync.export();
    const buffer = Buffer.from(data);
    writeFileSync(DB_PATH, buffer);
  }
}

// 通用查询方法
export function query<T>(sql: string, params: SqlValue[] = []): T[] {
  const database = getDbSync();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  
  const results: T[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(row as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T>(sql: string, params: SqlValue[] = []): T | undefined {
  const results = query<T>(sql, params);
  return results[0];
}

export function execute(sql: string, params: SqlValue[] = []): { changes: number; lastInsertRowId: number } {
  const database = getDbSync();
  database.run(sql, params);
  saveDbSync();
  return {
    changes: database.getRowsModified(),
    lastInsertRowId: 0
  };
}
