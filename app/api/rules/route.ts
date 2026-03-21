import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const result = db.exec(
      'SELECT id, name, trigger, actions, output, is_active, created_at FROM rules ORDER BY created_at'
    );
    
    const rules = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          name: row[1],
          trigger: row[2],
          actions: row[3],
          output: row[4],
          is_active: row[5] === 1,
          created_at: row[6],
        }))
      : [];
    
    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Rules API error:', error);
    return NextResponse.json({ rules: [] });
  }
}
