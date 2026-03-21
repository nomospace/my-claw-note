import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    let whereClause = '';
    const params: string[] = [];
    
    if (type) {
      whereClause = 'WHERE type = ?';
      params.push(type);
    }
    
    const result = db.exec(
      `SELECT id, type, content, source_note_id, tags, use_count, created_at 
       FROM materials ${whereClause}
       ORDER BY created_at DESC`,
      params
    );
    
    const materials = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          type: row[1],
          content: row[2],
          source_note_id: row[3],
          tags: row[4] ? JSON.parse(row[4] as string) : [],
          use_count: row[5],
          created_at: row[6],
        }))
      : [];
    
    return NextResponse.json({ materials });
  } catch (error) {
    console.error('Materials API error:', error);
    return NextResponse.json({ materials: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const body = await request.json();
    const { type, content, source_note_id, tags } = body;
    
    if (!type || !content) {
      return NextResponse.json({ error: 'Type and content are required' }, { status: 400 });
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO materials (id, type, content, source_note_id, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, type, content, source_note_id || null, JSON.stringify(tags || []), now]
    );
    saveDbSync();
    
    return NextResponse.json({ id, created_at: now });
  } catch (error) {
    console.error('Create material error:', error);
    return NextResponse.json({ error: 'Failed to create material' }, { status: 500 });
  }
}
