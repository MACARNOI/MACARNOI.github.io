// js/render/renderArchives.js

async function renderArchivesPage(scrollToYear) {
  const container = document.getElementById('dynamic-content');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#707070;">加载归档...</p>';

  try {
    // 1. 加载分类配置（封面图、描述等）
    let catConfig = {};
    try {
      const configRes = await fetch('./config/categories.json');
      if (configRes.ok) catConfig = await configRes.json();
    } catch (e) {
      console.warn('分类配置加载失败，使用默认封面');
    }

    // 2. 加载文章索引
    const indexRes = await fetch('./posts/index.json');
    if (!indexRes.ok) throw new Error('索引加载失败');
    const allPosts = await indexRes.json();

    // 3. 提取所有分类（按文件夹名去重）
    const categoriesSet = new Set();
    allPosts.forEach(post => {
      const parts = post.path.split('/');
      const cat = parts.length > 1 ? parts[0] : '未分类';
      categoriesSet.add(cat);
    });
    const categories = Array.from(categoriesSet).sort();

    // 4. 生成 categories 卡片区域（封面图来自配置）
    let categoriesHTML = '';
    if (categories.length > 0) {
      categoriesHTML = `
        <div class="A-categories">
          <h2 class="title">CATEGORIES</h2>
          <div class="box">
            <ul>
              ${categories.map(cat => {
        const cover = catConfig[cat]?.cover || './assets/images/blog.png';
        return `
                  <li>
                    <a href="#" data-page="category" data-category="${cat}">
                      <img src="${cover}" alt="${cat}">
                      <div>${cat}</div>
                    </a>
                  </li>
                `;
      }).join('')}
            </ul>
          </div>
        </div>
      `;
    }

    // 5. 按年份分组（与之前相同）
    const yearMap = {};
    allPosts.forEach(post => {
      if (!post.date) return;
      const year = post.date.slice(0, 4);
      if (!yearMap[year]) yearMap[year] = [];
      yearMap[year].push(post);
    });

    const years = Object.keys(yearMap).sort((a, b) => b.localeCompare(a));
    for (const year of years) {
      yearMap[year].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    }

    // 6. 生成年份归档 HTML
    const yearSectionsHTML = years.map(year => {
      const posts = yearMap[year];
      return `
        <div class="year">
          <h2 class="year-title">${year}</h2>
          <div class="year-box">
            <ul>
              ${posts.map(post => `
                <li>
                  <a href="#" data-page="blog" data-post="${post.path}">
                    <div class="left">
                      <h2 class="blog-title">${post.title}</h2>
                      <span class="time">${formatDate(post.date)}</span>
                    </div>
                    <div class="right">
                      <img src="${post.cover || './assets/images/blog.png'}" alt="${post.title}">
                    </div>
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');

    // 7. 组装完整页面
    const archivesHTML = `
      <div class="archives">
        ${categoriesHTML}
        ${yearSectionsHTML}
      </div>
    `;

    container.innerHTML = archivesHTML;

    // 8. 滚动到指定年份
    if (scrollToYear) {
      requestAnimationFrame(() => {
        const allYearTitles = document.querySelectorAll('.year-title');
        for (const el of allYearTitles) {
          if (el.textContent.trim() === scrollToYear) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
          }
        }
      });
    }

    // 9. 初始化横向滚动
    if (typeof initHorizontalScroll === 'function') {
      initHorizontalScroll('.archives .box ul');
    }

  } catch (error) {
    console.error('加载归档失败:', error);
    container.innerHTML = '<p style="color:red;">归档加载失败，请检查索引文件。</p>';
  }
}

window.renderArchivesPage = renderArchivesPage;