// js/render/renderHome.js

/* ========== 工具：解析 Front Matter ========== */
function parseFrontMatter(mdText) {
  const match = mdText.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
  if (!match) return { title: '未命名', date: '', content: mdText };
  const frontMatterStr = match[1];
  const body = match[2];
  const meta = {};
  frontMatterStr.split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx !== -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      meta[key] = value;
    }
  });
  return { title: meta.title || '未命名', date: meta.date || '', content: body };
}

/* ========== 构建单个博客卡片 ========== */
function buildCardHTML(post, category) {
  return `
    <li>
      <div class="img">
        <a href="#" data-page="blog" data-post="${post.path}">
          <img src="${post.cover || './assets/blog.png'}" alt="${post.title}">
        </a>
      </div>
      <div class="text">
        <div class="categories"><a href="#">${category}</a></div>
        <div class="title">
          <h2><a href="#" data-page="blog" data-post="${post.path}">${post.title}</a></h2>
          <h3>${post.subtitle || ''}</h3>
        </div>
        <div class="edit-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-report">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697" />
            <path d="M18 14v4h4" />
            <path d="M18 11v-4a2 2 0 0 0 -2 -2h-2" />
            <path d="M8 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
            <path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            <path d="M8 11h4" />
            <path d="M8 15h3" />
          </svg>
          <span class="time">${formatDate(post.date)}</span>
        </div>
      </div>
    </li>
  `;
}

/* ========== 构建分页导航 ========== */
function buildPaginationHTML(currentPage, totalPages) {
  if (totalPages <= 1) return '';
  let html = '<ul>';
  for (let i = 1; i <= totalPages; i++) {
    html += `<li><a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a></li>`;
  }
  html += '</ul>';
  return `<div class="nav">${html}</div>`;
}

/* ========== 构建右侧边栏（归档 + 分类 + 搜索） ========== */
function buildRightSidebar(posts) {
  // 1. 归档：按年份统计
  const yearCounts = {};
  posts.forEach(post => {
    if (post.date) {
      const year = post.date.slice(0, 4);
      if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  const years = Object.keys(yearCounts).sort((a, b) => b.localeCompare(a));
  const archivesHTML = years.map(year => `
    <li>
      <a href="#" data-page="archives" data-year="${year}">
        <span class="year">${year}</span>
        <span class="count">${yearCounts[year]}</span>
      </a>
    </li>
  `).join('');

  // 2. 分类：从 path 提取第一级文件夹名
  const categoriesSet = new Set();
  posts.forEach(post => {
    const parts = post.path.split('/');
    const cat = parts.length > 1 ? parts[0] : '未分类';
    categoriesSet.add(cat);
  });
  const uniqueCategories = Array.from(categoriesSet).sort();
  const categoriesHTML = uniqueCategories.map(cat => `
    <li><a href="#" data-page="category" data-category="${cat}">${cat}</a></li>
  `).join('');

  return `
    <div class="right">
      <div class="search">
        <div class="left">
          <span>搜索</span>
          <input type="text" placeholder="输入关键词...">
        </div>
        <div class="svg">
          <a href="#">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-search">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
          </a>
        </div>
      </div>

      <div class="col">
        <div class="svg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-infinity">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828" />
          </svg>
        </div>
        <div class="title">归档</div>
        <div class="columns"><ul>${archivesHTML}</ul></div>
      </div>

      <div class="cate">
        <div class="svg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-hash">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 9l14 0" />
            <path d="M5 15l14 0" />
            <path d="M11 4l-4 16" />
            <path d="M17 4l-4 16" />
          </svg>
        </div>
        <div class="title">分类</div>
        <div class="tag"><ul>${categoriesHTML}</ul></div>
      </div>
    </div>
  `;
}

/* ========== 主页渲染 ========== */
async function renderHomePage(page = 1) {
  const container = document.getElementById('dynamic-content');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#707070;">加载文章列表...</p>';

  try {
    // 1. 加载文章索引
    const indexRes = await fetch('./posts/index.json');
    if (!indexRes.ok) throw new Error('索引加载失败');
    const allPosts = await indexRes.json();

    // ** 按日期降序排序（最新的在最前） **
    allPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // 2. 加载每页显示数量配置
    const configRes = await fetch('./assets/home-config.json');
    const config = configRes.ok ? await configRes.json() : { postsPerPage: 5 };
    const postsPerPage = config.postsPerPage || 5;

    // 3. 分页计算
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = allPosts.slice(start, end);

    // 4. 生成卡片 HTML
    let cardsHTML = '';
    pagePosts.forEach(post => {
      const parts = post.path.split('/');
      const category = parts.length > 1 ? parts[0] : '未分类';
      cardsHTML += buildCardHTML(post, category);
    });

    // 5. 组装整个主页
    const homeHTML = `
      <div class="home">
        <div class="post-card">
          <div class="post">
            <ul>${cardsHTML}</ul>
          </div>
          ${buildPaginationHTML(page, totalPages)}
        </div>
        ${buildRightSidebar(allPosts)}
      </div>
    `;

    container.innerHTML = homeHTML;

    // 6. 绑定分页点击事件
    const navDiv = container.querySelector('.nav');
    if (navDiv) {
      navDiv.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-page]');
        if (!a) return;
        e.preventDefault();
        const newPage = parseInt(a.getAttribute('data-page'), 10);
        if (!isNaN(newPage)) {
          renderHomePage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

  } catch (error) {
    console.error('加载文章失败:', error);
    container.innerHTML = '<p style="color:red;">文章列表加载失败，请检查 posts/index.json 是否存在。</p>';
  }
}

// 挂载到全局
window.renderHomePage = renderHomePage;