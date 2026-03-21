import { Platform } from '@/types';

interface PlatformInfo {
  platform: Platform;
  type: 'article' | 'answer' | 'note';
  id: string;
}

export function detectPlatform(url: string): PlatformInfo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    // 微信公众号
    if (hostname === 'mp.weixin.qq.com' || hostname.includes('weixin.qq.com')) {
      const biz = urlObj.searchParams.get('__biz');
      const sn = urlObj.searchParams.get('sn');
      if (biz && sn) {
        return {
          platform: 'wechat',
          type: 'article',
          id: `${biz}_${sn}`,
        };
      }
    }

    // 知乎专栏
    if (hostname === 'zhuanlan.zhihu.com') {
      const match = pathname.match(/\/p\/(\d+)/);
      if (match) {
        return {
          platform: 'zhihu',
          type: 'article',
          id: match[1],
        };
      }
    }
    
    // 知乎问答
    if (hostname === 'www.zhihu.com') {
      const answerMatch = pathname.match(/\/answer\/(\d+)/);
      if (answerMatch) {
        return {
          platform: 'zhihu',
          type: 'answer',
          id: answerMatch[1],
        };
      }
    }

    // 小红书
    if (hostname === 'www.xiaohongshu.com' || hostname === 'xiaohongshu.com') {
      const match = pathname.match(/\/discovery\/item\/([a-zA-Z0-9]+)/);
      if (match) {
        return {
          platform: 'xiaohongshu',
          type: 'note',
          id: match[1],
        };
      }
      const match2 = pathname.match(/\/explore\/([a-zA-Z0-9]+)/);
      if (match2) {
        return {
          platform: 'xiaohongshu',
          type: 'note',
          id: match2[1],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
