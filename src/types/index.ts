export interface PostMeta {
  slug: string;       // 文件名不含扩展名，即日期字符串 "2025-07-10"
  title: string;
  date: string;       // "2025-07-10"
  topic: string;
  tags: string[];
  image?: string;     // 配图路径，如 /images/2025-07-10.jpg
  excerpt?: string;   // 正文前100字摘要，用于列表页
}

export interface Post extends PostMeta {
  contentHtml: string;   // 渲染后的 HTML 正文
  isFullPage?: boolean;  // true = 完整 HTML 文档，用 iframe 隔离渲染
}

export interface SearchIndex {
  slug: string;
  title: string;
  date: string;
  topic: string;
  tags: string[];
  excerpt: string;
}

export interface SiteStats {
  total: number;       // 总篇数
  topicCount: number;  // 涉及领域数
  streak: number;      // 当前连续天数
}
