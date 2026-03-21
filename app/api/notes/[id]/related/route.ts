import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    const { id } = await params;
    
    const result = db.exec(`
      SELECT r.note_id_b, n.title, r.relation_type, r.similarity_score
      FROM relations r
      JOIN notes n ON n.id = r.note_id_b
      WHERE r.note_id_a = ? AND n.is_deleted = 0
      ORDER BY r.similarity_score DESC
      LIMIT 5
    `, [id]);
    
    const related = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          title: row[1],
          relation_type: row[2],
          similarity_score: row[3],
        }))
      : [];
    
    return NextResponse.json({ related });
  } catch (error) {
    console.error('Related notes error:', error);
    return NextResponse.json({ related: [] });
  }
}
