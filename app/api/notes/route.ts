import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE is_deleted = 0';
    const params: (string | number)[] = [];
    
    if (category) {
      whereClause += ' AND category_id = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // 获取总数
    const countResult = db.exec(
      `SELECT COUNT(*) as count FROM notes ${whereClause}`,
      params
    );
    const total = countResult.length > 0 ? (countResult[0].values[0] as number[])[0] : 0;
    
    // 获取列表
    const result = db.exec(
      `SELECT id, title, summary, source_platform, category_id, tags, created_at 
       FROM notes ${whereClause}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    const notes = result.length > 0 
      ? result[0].values.map((row) => ({
          id: row[0],
          title: row[1],
          summary: row[2],
          source_platform: row[3],
          category_id: row[4],
          tags: row[5] ? JSON.parse(row[5] as string) : [],
          created_at: row[6],
        }))
      : [];
    
    return NextResponse.json({
      total,
      notes,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const body = await request.json();
    const { title, content, source_url, source_platform, category_id, tags } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO notes (id, title, content, source_url, source_platform, category_id, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, content || '', source_url || null, source_platform || 'manual', category_id || null, JSON.stringify(tags || []), now, now]
    );
    saveDbSync();
    
    return NextResponse.json({ id, title, created_at: now });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
