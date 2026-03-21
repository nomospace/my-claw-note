import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateId } from '@/lib/utils';

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

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const body = await request.json();
    const { name, parent_id, icon } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // 获取最大 sort_order
    const maxResult = db.exec('SELECT MAX(sort_order) as max_order FROM categories');
    const maxOrder = maxResult.length > 0 ? (maxResult[0].values[0] as number[])[0] || 0 : 0;
    
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO categories (id, name, parent_id, icon, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, parent_id || null, icon || 'folder', maxOrder + 1, now]
    );
    saveDbSync();
    
    return NextResponse.json({ id, name });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
