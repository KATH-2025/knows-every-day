import { neon } from "@neondatabase/serverless";
import type { NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * 获取 Neon PostgreSQL 客户端。
 * 需要环境变量 DATABASE_URL（在 Vercel / .env.local 中配置）。
 * 本地未配置时返回 null，API 路由降级返回空数据。
 */
export function getDB(): NeonQueryFunction<false, false> | null {
  if (!process.env.DATABASE_URL) return null;
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}
