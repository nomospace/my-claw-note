import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateId } from '@/lib/utils';

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
          trigger: JSON.parse(row[2] as string),
          actions: JSON.parse(row[3] as string),
          output: JSON.parse(row[4] as string || '{}'),
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

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    const body = await request.json();
    const { name, trigger, actions, output, is_active } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    db.run(
      `INSERT INTO rules (id, name, trigger, actions, output, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        JSON.stringify(trigger || {}),
        JSON.stringify(actions || []),
        JSON.stringify(output || {}),
        is_active !== false ? 1 : 0,
        now,
      ]
    );
    saveDbSync();
    
    return NextResponse.json({ id, created_at: now });
  } catch (error) {
    console.error('Create rule error:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}
