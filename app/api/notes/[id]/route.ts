import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    const { id } = await params;
    
    const result = db.exec(
      'SELECT * FROM notes WHERE id = ? AND is_deleted = 0',
      [id]
    );
    
    if (result.length === 0 || result[0].values.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    const row = result[0].values[0];
    const note = {
      id: row[0],
      title: row[1],
      content: row[2],
      summary: row[3],
      source_url: row[4],
      source_platform: row[5],
      snapshot_path: row[6],
      category_id: row[7],
      tags: row[8] ? JSON.parse(row[8] as string) : [],
      keywords: row[9] ? JSON.parse(row[9] as string) : [],
      created_at: row[10],
      updated_at: row[11],
    };
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Note detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    const { id } = await params;
    
    const body = await request.json();
    const { title, content, summary, category_id, tags } = body;
    
    const now = new Date().toISOString();
    
    db.run(
      `UPDATE notes 
       SET title = ?, content = ?, summary = ?, category_id = ?, tags = ?, updated_at = ?
       WHERE id = ?`,
      [title, content, summary, category_id, JSON.stringify(tags || []), now, id]
    );
    saveDbSync();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    const { id } = await params;
    
    // 软删除
    db.run('UPDATE notes SET is_deleted = 1 WHERE id = ?', [id]);
    saveDbSync();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
