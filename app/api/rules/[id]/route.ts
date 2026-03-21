import { NextRequest, NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync, saveDbSync } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    const { id } = await params;
    
    const body = await request.json();
    const { is_active } = body;
    
    db.run(
      'UPDATE rules SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );
    saveDbSync();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update rule error:', error);
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
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
    
    db.run('DELETE FROM rules WHERE id = ?', [id]);
    saveDbSync();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete rule error:', error);
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
