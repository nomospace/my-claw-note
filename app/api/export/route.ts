import { NextResponse } from 'next/server';
import { ensureDbInitialized } from '@/lib/db/init';
import { getDbSync } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const db = getDbSync();
    
    // 导出所有数据
    const notes = db.exec('SELECT * FROM notes WHERE is_deleted = 0');
    const materials = db.exec('SELECT * FROM materials');
    const categories = db.exec('SELECT * FROM categories');
    const rules = db.exec('SELECT * FROM rules');
    
    const exportData = {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      notes: notes.length > 0 ? notes[0].values : [],
      materials: materials.length > 0 ? materials[0].values : [],
      categories: categories.length > 0 ? categories[0].values : [],
      rules: rules.length > 0 ? rules[0].values : [],
    };
    
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="myclawnote-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
