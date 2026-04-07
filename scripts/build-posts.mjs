import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const postsDir = path.join(__dirname, '../posts')
const outFile = path.join(__dirname, '../src/lib/posts-data.json')

const posts = {}

for (const file of fs.readdirSync(postsDir)) {
  if (file.startsWith('_')) continue  // 跳过模板文件
  const ext = path.extname(file)
  if (!['.html', '.md'].includes(ext)) continue
  const slug = path.basename(file, ext)
  posts[slug] = {
    content: fs.readFileSync(path.join(postsDir, file), 'utf-8'),
    ext,
  }
}

fs.writeFileSync(outFile, JSON.stringify(posts))
console.log(`✅ Built ${Object.keys(posts).length} posts`)
