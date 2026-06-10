// js/render/renderCategoryPage.js

async function renderCategoryPage(category, page = 1) {
  const container = document.getElementById('dynamic-content');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#707070;">加载分类...</p>';

  try {
    // 1. 加载文章索引
    const indexRes = await fetch('./posts/index.json');
    if (!indexRes.ok) throw new Error('索引加载失败');
    const allPosts = await indexRes.json();

    // 2. 筛选该分类下的文章
    let categoryPosts = allPosts.filter(p => {
      const parts = p.path.split('/');
      return parts.length > 1 && parts[0] === category;
    });

    // ** 按日期降序排序（新→旧） **
    categoryPosts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    // 3. 加载分类配置（封面图、描述）
    let catConfig = {};
    try {
      const configRes = await fetch('./config/categories.json');
      if (configRes.ok) catConfig = await configRes.json();
    } catch (e) { }

    const catInfo = catConfig[category] || {};
    const coverImg = catInfo.cover || './assets/blog.png';
    const description = catInfo.description || '';

    // 4. 加载每页数量配置
    const configRes = await fetch('./config/home.json');
    const config = configRes.ok ? await configRes.json() : { postsPerPage: 5 };
    const postsPerPage = config.postsPerPage || 5;

    // 5. 分页计算
    const totalPages = Math.ceil(categoryPosts.length / postsPerPage);
    const start = (page - 1) * postsPerPage;
    const end = start + postsPerPage;
    const pagePosts = categoryPosts.slice(start, end);

    // 6. 生成文章列表 HTML
    const blogListHTML = pagePosts.map(post => `
      <li>
        <a href="#" data-page="blog" data-post="${post.path}">
          <div class="left">
            <h2 class="blog-title">${post.title}</h2>
            <span class="time">${formatDate(post.date)}</span>
          </div>
          <div class="right">
            <img src="${post.cover || './assets/blog.png'}" alt="${post.title}">
          </div>
        </a>
      </li>
    `).join('');

    // 7. 生成分页导航
    let paginationHTML = '';
    if (totalPages > 1) {
      paginationHTML = '<div class="nav"><ul>';
      for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<li><a href="#" class="${i === page ? 'active' : ''}" data-page-num="${i}">${i}</a></li>`;
      }
      paginationHTML += '</ul></div>';
    }

    // 8. 生成右侧边栏（基于全部文章数据）
    const rightSidebarHTML = buildRightSidebar(allPosts);

    // 9. 组装完整页面
    const categoryHTML = `
      <div class="categories">
        <div class="content">
          <h3>CATEGORIES</h3>
          <div class="titlebox">
            <div class="left">
              <h3><span class="blog-count">${categoryPosts.length}</span> 个页面</h3>
              <h2 class="cate-title">${category}</h2>
              <span class="cate-description">${description}</span>
            </div>
            <div class="right">
              <img src="${coverImg}" alt="${category}">
            </div>
          </div>

          <div class="blog-list">
            <ul>${blogListHTML}</ul>
          </div>

          ${paginationHTML}
        </div>

        ${rightSidebarHTML}
      </div>
    `;

    container.innerHTML = categoryHTML;

    // 10. 绑定分页点击事件（委托）
    const navDiv = container.querySelector('.nav');
    if (navDiv) {
      navDiv.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-page-num]');
        if (!a) return;
        e.preventDefault();
        const newPage = parseInt(a.getAttribute('data-page-num'), 10);
        if (!isNaN(newPage)) {
          renderCategoryPage(category, newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

  } catch (error) {
    console.error('加载分类详情失败:', error);
    container.innerHTML = '<p style="color:red;">分类加载失败，请检查文件或配置。</p>';
  }
}

/* ========== 右侧边栏生成函数（与主页一致） ========== */
function buildRightSidebar(posts) {
  // 归档
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

  // 分类
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

// 挂载全局
window.renderCategoryPage = renderCategoryPage;
window.buildRightSidebar = buildRightSidebar; // 可供主页复用（如果主页不想再定义一遍）

// < !--categories样式 -->
//   <div class="categories">
//     <div class="content">

//       <h3>CATEGORIES</h3>
//       <div class="titlebox">
//         <div class="left">
//           <h3><span class="blog-count">15</span> 个页面</h3>
//           <h2 class="cate-title">捐赠月度总结</h2>
//           <span class="cate-description">这里展示了TouchGal每月的捐赠总结</span>
//         </div>
//         <div class="right">
//           <img src="./assets/blog.png" alt="">
//         </div>
//       </div>

//       <!--  -->
//       <div class="blog-list">
//         <ul>
//           <li>
//             <a href="#">
//               <div class="left">
//                 <h2 class="blog-title">捐赠月度总结</h2>
//                 <span class="time">2026-05-15</span>
//               </div>
//               <div class="right">
//                 <img src="./assets/blog.png" alt="">
//               </div>
//             </a>
//           </li>

//           <li>
//             <a href="#">
//               <div class="left">
//                 <h2 class="blog-title">捐赠月度总结</h2>
//                 <span class="time">2026-05-15</span>
//               </div>
//               <div class="right">
//                 <img src="./assets/blog.png" alt="">
//               </div>
//             </a>
//           </li>
//         </ul>
//       </div>


//       <!-- 换页导航 -->
//       <div class="nav">
//         <ul>
//           <li>
//             <a href="#" class="active">1</a>
//           </li>
//           <li>
//             <a href="#">2</a>
//           </li>
//           <li>
//             <a href="#">...</a>
//           </li>
//           <li>
//             <a href="#">4</a>
//           </li>
//         </ul>
//       </div>
//     </div>





//     <!-- 主页右侧边栏 -->
//     <div class="right">
//       <!-- 搜索 -->
//       <div class="search">
//         <!-- 左边 -->
//         <div class="left">
//           <span>搜索</span>
//           <input type="text" placeholder="输入关键词...">
//         </div>

//         <div class="svg">
//           <a href="#">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//               class="icon icon-tabler icons-tabler-outline icon-tabler-search">
//               <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//               <path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
//               <path d="M21 21l-6 -6" />
//             </svg>

//           </a>
//         </div>

//       </div>

//       <!-- 归档 -->
//       <div class="col">
//         <div class="svg">
//           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//             class="icon icon-tabler icons-tabler-outline icon-tabler-infinity">
//             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//             <path
//               d="M9.828 9.172a4 4 0 1 0 0 5.656a10 10 0 0 0 2.172 -2.828a10 10 0 0 1 2.172 -2.828a4 4 0 1 1 0 5.656a10 10 0 0 1 -2.172 -2.828a10 10 0 0 0 -2.172 -2.828" />
//           </svg>
//         </div>

//         <div class="title">归档</div>

//         <div class="columns">
//           <ul>
//             <li>
//               <a href="#">
//                 <span class="year">2026</span>
//                 <span class="count">5</span>
//               </a>
//             </li>

//             <li>
//               <a href="#">
//                 <span class="year">2025</span>
//                 <span class="count">5</span>
//               </a>
//             </li>

//           </ul>
//         </div>
//       </div>

//       <!-- 分类 -->
//       <div class="cate">
//         <div class="svg">
//           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//             class="icon icon-tabler icons-tabler-outline icon-tabler-hash">
//             <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//             <path d="M5 9l14 0" />
//             <path d="M5 15l14 0" />
//             <path d="M11 4l-4 16" />
//             <path d="M17 4l-4 16" />
//           </svg>

//         </div>

//         <div class="title">分类</div>

//         <div class="tag">
//           <ul>
//             <li>
//               <a href="">月度分享总结</a>
//             </li>

//             <li>
//               <a href="">月度分享总结</a>
//             </li>

//             <li>
//               <a href="">月度</a>
//             </li>
//             <li>
//               <a href="">月度分享总结</a>
//             </li>
//             <li>
//               <a href="">月度分享总结</a>
//             </li>

//           </ul>
//         </div>
//       </div>
//     </div>
//   </div>