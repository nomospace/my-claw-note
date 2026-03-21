import { NextRequest, NextResponse } from 'next/server';
import { readSnapshot } from '@/lib/services/snapshot';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const snapshot = await readSnapshot(id);
    
    if (!snapshot) {
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }
    
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error('Snapshot API error:', error);
    return NextResponse.json({ error: 'Failed to read snapshot' }, { status: 500 });
  }
}
