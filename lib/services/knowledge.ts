// 知识关联服务 - 自动发现笔记之间的关联
import { getDbSync, saveDbSync } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { calculateSimilarity } from './ai';

interface Note {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

// 为新笔记自动建立关联
export async function autoLinkNote(noteId: string): Promise<number> {
  const db = getDbSync();
  
  // 获取新笔记
  const noteResult = db.exec(
    'SELECT id, title, content, keywords FROM notes WHERE id = ? AND is_deleted = 0',
    [noteId]
  );
  
  if (noteResult.length === 0 || noteResult[0].values.length === 0) return 0;
  
  const noteRow = noteResult[0].values[0];
  const newNote: Note = {
    id: noteRow[0] as string,
    title: noteRow[1] as string,
    content: noteRow[2] as string,
    keywords: noteRow[3] ? JSON.parse(noteRow[3] as string) : [],
  };
  
  // 获取所有其他笔记
  const otherResult = db.exec(
    'SELECT id, title, content, keywords FROM notes WHERE id != ? AND is_deleted = 0 LIMIT 100'
  );
  
  if (otherResult.length === 0) return 0;
  
  let linkCount = 0;
  const now = new Date().toISOString();
  
  for (const row of otherResult[0].values) {
    const otherNote: Note = {
      id: row[0] as string,
      title: row[1] as string,
      content: row[2] as string,
      keywords: row[3] ? JSON.parse(row[3] as string) : [],
    };
    
    // 计算相似度
    const titleSimilarity = calculateSimilarity(newNote.title, otherNote.title);
    const contentSimilarity = calculateSimilarity(
      newNote.content.slice(0, 500),
      otherNote.content.slice(0, 500)
    );
    
    // 关键词匹配
    const keywordMatch = newNote.keywords.filter(k => otherNote.keywords.includes(k)).length;
    const keywordSimilarity = keywordMatch > 0 ? keywordMatch / Math.max(newNote.keywords.length, 1) : 0;
    
    // 综合相似度
    const overallSimilarity = titleSimilarity * 0.3 + contentSimilarity * 0.5 + keywordSimilarity * 0.2;
    
    // 如果相似度超过阈值，建立关联
    if (overallSimilarity > 0.15) {
      const relationId = generateId();
      const relationType = overallSimilarity > 0.4 ? 'similar' : 'reference';
      
      // 检查是否已存在关联
      const existingResult = db.exec(
        'SELECT id FROM relations WHERE note_id_a = ? AND note_id_b = ?',
        [newNote.id, otherNote.id]
      );
      
      if (existingResult.length === 0 || existingResult[0].values.length === 0) {
        db.run(
          `INSERT INTO relations (id, note_id_a, note_id_b, relation_type, similarity_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [relationId, newNote.id, otherNote.id, relationType, overallSimilarity, now]
        );
        
        // 双向关联
        const reverseId = generateId();
        db.run(
          `INSERT INTO relations (id, note_id_a, note_id_b, relation_type, similarity_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [reverseId, otherNote.id, newNote.id, relationType, overallSimilarity, now]
        );
        
        linkCount++;
      }
    }
  }
  
  if (linkCount > 0) {
    saveDbSync();
  }
  
  return linkCount;
}

// 重建所有关联
export async function rebuildAllRelations(): Promise<number> {
  const db = getDbSync();
  
  // 清空现有关联
  db.run('DELETE FROM relations');
  saveDbSync();
  
  // 获取所有笔记
  const result = db.exec(
    'SELECT id, title, content, keywords FROM notes WHERE is_deleted = 0'
  );
  
  if (result.length === 0) return 0;
  
  const notes: Note[] = result[0].values.map(row => ({
    id: row[0] as string,
    title: row[1] as string,
    content: row[2] as string,
    keywords: row[3] ? JSON.parse(row[3] as string) : [],
  }));
  
  let linkCount = 0;
  const now = new Date().toISOString();
  
  // 两两比较
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const noteA = notes[i];
      const noteB = notes[j];
      
      const titleSimilarity = calculateSimilarity(noteA.title, noteB.title);
      const contentSimilarity = calculateSimilarity(
        noteA.content.slice(0, 500),
        noteB.content.slice(0, 500)
      );
      
      const keywordMatch = noteA.keywords.filter(k => noteB.keywords.includes(k)).length;
      const keywordSimilarity = keywordMatch > 0 ? keywordMatch / Math.max(noteA.keywords.length, 1) : 0;
      
      const overallSimilarity = titleSimilarity * 0.3 + contentSimilarity * 0.5 + keywordSimilarity * 0.2;
      
      if (overallSimilarity > 0.15) {
        const relationType = overallSimilarity > 0.4 ? 'similar' : 'reference';
        
        const relationId1 = generateId();
        const relationId2 = generateId();
        
        db.run(
          `INSERT INTO relations (id, note_id_a, note_id_b, relation_type, similarity_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [relationId1, noteA.id, noteB.id, relationType, overallSimilarity, now]
        );
        
        db.run(
          `INSERT INTO relations (id, note_id_a, note_id_b, relation_type, similarity_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [relationId2, noteB.id, noteA.id, relationType, overallSimilarity, now]
        );
        
        linkCount++;
      }
    }
  }
  
  saveDbSync();
  return linkCount;
}

// 获取笔记的相关笔记
export function getRelatedNotes(noteId: string, limit = 5): Array<{
  id: string;
  title: string;
  relation_type: string;
  similarity_score: number;
}> {
  const db = getDbSync();
  
  const result = db.exec(`
    SELECT r.note_id_b, n.title, r.relation_type, r.similarity_score
    FROM relations r
    JOIN notes n ON n.id = r.note_id_b
    WHERE r.note_id_a = ? AND n.is_deleted = 0
    ORDER BY r.similarity_score DESC
    LIMIT ?
  `, [noteId, limit]);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    id: row[0] as string,
    title: row[1] as string,
    relation_type: row[2] as string,
    similarity_score: row[3] as number,
  }));
}
