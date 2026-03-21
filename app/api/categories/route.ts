import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const result = db.exec(
      'SELECT id, name, parent_id, icon, sort_order FROM categories ORDER BY sort_order'
    );
    
    const categories = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          name: row[1],
          parent_id: row[2],
          icon: row[3],
          sort_order: row[4],
        }))
      : [];
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json({ categories: [] });
  }
}
