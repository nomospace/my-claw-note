import { NextRequest, NextResponse } from 'next/server';
import { 
  generateSummary, 
  extractKeywords, 
  extractMaterials,
  denoiseContent,
  processNoteContent
} from '@/lib/services/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, noteId, note } = body;
    
    switch (action) {
      case 'summary': {
        const summary = await generateSummary(content);
        return NextResponse.json({ summary });
      }
      
      case 'keywords': {
        const keywords = await extractKeywords(content);
        return NextResponse.json({ keywords });
      }
      
      case 'materials': {
        const materials = await extractMaterials(content, noteId);
        return NextResponse.json({ materials });
      }
      
      case 'denoise': {
        const cleaned = await denoiseContent(content);
        return NextResponse.json({ content: cleaned });
      }
      
      case 'process': {
        const result = await processNoteContent(note);
        return NextResponse.json(result);
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
