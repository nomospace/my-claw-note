import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const result = db.exec(
      'SELECT id, note_id_a, note_id_b, relation_type, similarity_score FROM relations LIMIT 100'
    );
    
    const relations = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          note_id_a: row[1],
          note_id_b: row[2],
          relation_type: row[3],
          similarity_score: row[4],
        }))
      : [];
    
    return NextResponse.json({ relations });
  } catch (error) {
    console.error('Relations API error:', error);
    return NextResponse.json({ relations: [] });
  }
}
