// 数据库迁移和种子数据
import { getDbSync, saveDbSync } from './index';

export function runMigrations() {
  const db = getDbSync();
  
  // 检查 migrations 表是否存在
  const result = db.exec(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'
  `);
  
  if (result.length === 0) {
    db.run(`
      CREATE TABLE migrations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
  
  // sql.js 不支持复杂的迁移逻辑，简化处理
  console.log('Migrations checked');
}

export function seedDefaultData() {
  const db = getDbSync();
  
  // 检查是否已有分类
  const result = db.exec('SELECT COUNT(*) as count FROM categories');
  const count = result.length > 0 ? (result[0].values[0] as number[]) : [0];
  
  if (count[0] === 0) {
    // 插入默认分类
    const defaultCategories = [
      { id: 'default', name: '默认分类', icon: 'folder', sort_order: 0 },
      { id: 'wechat', name: '微信公众号', icon: 'message-circle', sort_order: 1 },
      { id: 'zhihu', name: '知乎精选', icon: 'help-circle', sort_order: 2 },
      { id: 'xiaohongshu', name: '小红书', icon: 'heart', sort_order: 3 },
    ];
    
    const stmt = db.prepare('INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)');
    for (const cat of defaultCategories) {
      stmt.run([cat.id, cat.name, cat.icon, cat.sort_order]);
    }
    stmt.free();
    
    // 插入默认规则
    db.run(`INSERT INTO rules (id, name, trigger, actions, output, is_active) VALUES (?, ?, ?, ?, ?, ?)`, [
      'rule-default',
      '默认处理规则',
      JSON.stringify({}),
      JSON.stringify([
        { type: 'denoise', options: { removeAds: true } },
        { type: 'extract', options: { keywords: true, summary: true } }
      ]),
      JSON.stringify({}),
      1
    ]);
    
    saveDbSync();
    console.log('Default data seeded');
  }
}
