const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, 'posts');
const outputFile = path.join(postsDir, 'index.json');

function walk(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...walk(filePath));
    } else if (file.endsWith('.md')) {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(raw);
      const relativePath = path.relative(postsDir, filePath).replace(/\\/g, '/');
      // 将日期统一转为字符串（gray-matter 可能将其解析为 Date 对象）
      let dateStr = '';
      if (parsed.data.date) {
        const d = new Date(parsed.data.date);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateStr = `${y}-${m}-${day}`;
        }
      }
      results.push({
        path: relativePath,
        title: parsed.data.title || '未命名',
        subtitle: parsed.data.subtitle || '',
        date: dateStr,
        cover: parsed.data.cover || './assets/images/blog.png'
      });
    }
  });
  return results;
}

const index = walk(postsDir);
index.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log(`文章索引已生成，共 ${index.length} 篇文章`);