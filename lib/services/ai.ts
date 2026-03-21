// AI 服务 - 调用 OpenClaw 进行内容处理
import type { Note, Material } from '@/types';

const OPENCLAW_API = process.env.OPENCLAW_API || 'http://localhost:3000';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// 生成摘要
export async function generateSummary(content: string): Promise<string | null> {
  try {
    // 调用 OpenClaw 的 AI 能力
    // 这里简化处理，实际需要调用 OpenClaw API
    // 由于 OpenClaw 在本地运行，我们可以通过 sessions_spawn 调用
    
    // 简单的摘要生成：取前 200 字
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (text.length <= 200) return text;
    
    // 尝试按句子分割，取前几句
    const sentences = text.match(/[^。！？.!?]+[。！？.!?]/g) || [];
    if (sentences.length <= 3) return sentences.join('');
    
    return sentences.slice(0, 3).join('') + '...';
  } catch (error) {
    console.error('Generate summary error:', error);
    return null;
  }
}

// 提取关键词
export async function extractKeywords(content: string): Promise<string[]> {
  try {
    const text = content.replace(/<[^>]*>/g, '').trim();
    
    // 简单的关键词提取：提取高频词汇
    const words = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
    const wordCount: Record<string, number> = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // 排序取前5个
    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return sorted;
  } catch (error) {
    console.error('Extract keywords error:', error);
    return [];
  }
}

// 提取素材
export async function extractMaterials(content: string, noteId: string): Promise<Partial<Material>[]> {
  try {
    const materials: Partial<Material>[] = [];
    const text = content.replace(/<[^>]*>/g, '').trim();
    
    // 提取金句（引号中的内容）
    const quotes = text.match(/[""「」『』]([^""「」『』]+)[""「」『』]/g) || [];
    quotes.forEach(quote => {
      const cleaned = quote.replace(/[""「」『』]/g, '').trim();
      if (cleaned.length >= 10 && cleaned.length <= 100) {
        materials.push({
          type: 'quote',
          content: cleaned,
          source_note_id: noteId,
        });
      }
    });
    
    // 提取数据（数字+单位）
    const dataPatterns = text.match(/\d+(?:\.\d+)?(?:%|亿|万|元|美元|天|年|月|人|次|件)/g) || [];
    const uniqueData = [...new Set(dataPatterns)].slice(0, 5);
    uniqueData.forEach(data => {
      materials.push({
        type: 'data',
        content: data,
        source_note_id: noteId,
      });
    });
    
    return materials.slice(0, 10);
  } catch (error) {
    console.error('Extract materials error:', error);
    return [];
  }
}

// 内容降噪
export async function denoiseContent(content: string): Promise<string> {
  try {
    // 移除广告标记
    let cleaned = content
      .replace(/广告/g, '')
      .replace(/推广/g, '')
      .replace(/赞助/g, '')
      .replace(/\[广告\]/g, '')
      .replace(/\[推广\]/g, '')
      // 移除多余空白
      .replace(/\s{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return cleaned;
  } catch (error) {
    console.error('Denoise content error:', error);
    return content;
  }
}

// 计算文本相似度
export function calculateSimilarity(text1: string, text2: string): number {
  // 简单的 Jaccard 相似度
  const words1 = new Set(text1.match(/[\u4e00-\u9fa5]+/g) || []);
  const words2 = new Set(text2.match(/[\u4e00-\u9fa5]+/g) || []);
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// 处理笔记内容
export async function processNoteContent(note: Partial<Note>): Promise<{
  summary: string | null;
  keywords: string[];
  materials: Partial<Material>[];
}> {
  const content = note.content || '';
  
  const [summary, keywords, materials] = await Promise.all([
    generateSummary(content),
    extractKeywords(content),
    extractMaterials(content, note.id || ''),
  ]);
  
  return { summary, keywords, materials };
}
