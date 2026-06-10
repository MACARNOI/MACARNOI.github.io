// js/render/renderBlog.js

async function renderBlogPage(postPath) {
  const container = document.getElementById('dynamic-content');
  if (!container) return;

  container.innerHTML = '<p style="text-align:center;color:#707070;">加载文章...</p>';

  try {
    // 1. 加载文章索引
    const indexRes = await fetch('./posts/index.json');
    if (!indexRes.ok) throw new Error('索引加载失败');
    const allPosts = await indexRes.json();
    const postMeta = allPosts.find(p => p.path === postPath);
    if (!postMeta) throw new Error('未找到该文章');

    // 2. 加载 Markdown 并解析
    const mdRes = await fetch(`./posts/${postMeta.path}`);
    if (!mdRes.ok) throw new Error('文章文件不存在');
    const mdText = await mdRes.text();
    const post = parseFrontMatter(mdText);
    const contentHTML = marked.parse(post.content, {
      headerIds: true,
      mangle: false
    });

    // 3. 提取分类
    const parts = postMeta.path.split('/');
    const category = parts.length > 1 ? parts[0] : '未分类';

    // 4. 构建完整 HTML（先固定保留右侧容器，但默认隐藏）
    const blogHTML = `
      <div class="blog">
        <div class="left">
          <article class="main-acticle">
            <div class="cover">
              <img src="${postMeta.cover || './assets/blog.png'}" alt="${postMeta.title}">
            </div>
            <header class="article-header">
              <div class="text">
                <div class="categories"><a href="#">${category}</a></div>
                <div class="title">
                  <h2><a href="#">${postMeta.title}</a></h2>
                  <h3>${postMeta.subtitle || ''}</h3>
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
                  <span class="time">${formatDate(postMeta.date)}</span>
                </div>
              </div>
            </header>
            <section class="article-content">
              ${contentHTML}
            </section>
          </article>
          <div class="blog-rooter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="icon icon-tabler icons-tabler-outline icon-tabler-copyright">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
              <path d="M14 9.75a3.016 3.016 0 0 0 -4.163 .173a2.993 2.993 0 0 0 0 4.154a3.016 3.016 0 0 0 4.163 .173" />
            </svg>
            <span>Licensed under CC BY-NC-SA 4.0</span>
          </div>
        </div>
        <!-- 右侧电梯导航，默认隐藏，检测到标题后再显示 -->
        <div class="right" id="blog-toc-right" style="display:none;">
          <div class="nav">
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
            <div class="title">目录</div>
            <div class="nav-elevator" id="toc-container">
              <!-- 目录由 blogNav.js 生成 -->
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = blogHTML;

    // 5. 手动为所有标题补上 id（如果 marked 没生成）
    const article = container.querySelector('.article-content');
    if (article) {
      const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
      console.log('找到的标题数量:', headings.length);  // 调试日志

      headings.forEach((h, index) => {
        if (!h.id) {
          // 用标题文本生成 id，或简单用序号
          const id = 'heading-' + index;
          h.id = id;
          console.log('补充 id:', id, h.textContent.trim());
        } else {
          console.log('已有 id:', h.id, h.textContent.trim());
        }
      });

      // 6. 有标题才显示右侧导航并初始化
      if (headings.length > 0) {
        const rightDiv = document.getElementById('blog-toc-right');
        if (rightDiv) rightDiv.style.display = 'block';

        if (typeof initBlogNav === 'function') {
          initBlogNav();
        } else {
          console.warn('initBlogNav 函数未定义，请检查 blogNav.js 是否加载');
        }
      } else {
        console.log('文章无标题，隐藏电梯导航');
      }
    }
  } catch (error) {
    console.error('渲染博客详情失败:', error);
    container.innerHTML = '<p style="color:red;">文章加载失败，请检查文件是否存在。</p>';
  }
}

// parseFrontMatter 保持不变
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
  return {
    title: meta.title || '未命名',
    date: meta.date || '',
    content: body
  };
}

window.renderBlogPage = renderBlogPage;

// <!-- 博客详细页 -->
//       <div class="blog">
//         <div class="left">
//           <!-- 文章部分 -->
//           <article class="main-acticle">
//             <!-- 文章头部 -->
//             <div class="cover">
//               <img src="./assets/blog.png" alt="">
//             </div>
//             <header class="article-header">
//               <div class="text">
//                 <div class="categories"><a href="#">生活</a></div>
//                 <div class="title">
//                   <h2><a href="#">2026年3月捐赠月度总结</a></h2>
//                   <h3>2026年3月TouchGal的用户捐赠月度总结</h3>
//                 </div>
//                 <div class="edit-time">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//                     class="icon icon-tabler icons-tabler-outline icon-tabler-report">
//                     <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//                     <path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697" />
//                     <path d="M18 14v4h4" />
//                     <path d="M18 11v-4a2 2 0 0 0 -2 -2h-2" />
//                     <path d="M8 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2" />
//                     <path d="M14 18a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
//                     <path d="M8 11h4" />
//                     <path d="M8 15h3" />
//                   </svg>
//                   <span class="time">2026-05-14</span>
//                 </div>
//               </div>
//             </header>
//             <!-- 文章内容部分 -->
//             <section class="article-content">
//               <h2 id="2026年3月网站运营成本公示">2026年3月网站运营成本公示
//               </h2>
//               <h4 id="服务器">服务器
//               </h4>
//               <ul>
//                 <li>
//                   <p>网站服务器：382.56元</p>
//                 </li>
//                 <li>
//                   <p>OVH服务器：39.82元</p>
//                 </li>
//                 <li>
//                   <p>NETCUP邮局服务器：47.47元</p>
//                 </li>
//               </ul>
//               <h4 id="cdn">CDN
//               </h4>
//               <ul>
//                 <li>CDN机器1：419.53元</li>
//               </ul>
//               <h4 id="对象存储">对象存储
//               </h4>
//               <ul>
//                 <li>Backblaze B2：1186.51元</li>
//               </ul>
//               <h4 id="总计207589元">总计：2075.89元
//               </h4>
//               <h2 id="2026年3月用户捐赠公示">2026年3月用户捐赠公示
//               </h2>
//               <p>截至2026年3月31日23:59，本站共收到89笔捐赠，捐赠数额共计2015元。图表里对不上是因为图表显示的是过去30天的数据而3月有31天。</p>
//               <p class="no-text">
//               <div class="gallery">
//                 <figure style="flex-grow: 161; flex-basis: 388px;" class="gallery-image"><a
//                     href="./2026年3月捐赠月度总结_files/screenshot.png" target="_blank"><img
//                       src="./2026年3月捐赠月度总结_files/screenshot.png" width="860" height="531"
//                       srcset="/p/202603dona/screenshot_hu_1e43f12f9c074721.png 480w, /p/202603dona/screenshot_hu_252d25902bff2f26.png 1024w"
//                       loading="lazy" class="gallery-image" data-flex-grow="161" data-flex-basis="388px"></a></figure>
//               </div>
//               </p>
//               <p>你可以从这里下载到3月1日到31日的捐赠详情的excel表：https://pan.touchgal.net/s/gg8lUL</p>
//               <h2 id="2026年3月用户超额捐赠处理公示">2026年3月用户超额捐赠处理公示
//               </h2>
//               <p>2026年3月没有超额捐赠，故不做处理</p>
//               <h2 id="2026年4月网站运营成本预算公示">2026年4月网站运营成本预算公示
//               </h2>
//               <h4 id="服务器-1">服务器
//               </h4>
//               <ul>
//                 <li>
//                   <p>网站服务器：382.56元</p>
//                 </li>
//                 <li>
//                   <p>OVH服务器：39.82元</p>
//                 </li>
//                 <li>
//                   <p>NETCUP邮局服务器：47.47元</p>
//                 </li>
//               </ul>
//               <h4 id="cdn-1">CDN
//               </h4>
//               <ul>
//                 <li>CDN机器1：419.53元</li>
//               </ul>
//               <h4 id="对象存储-1">对象存储
//               </h4>
//               <ul>
//                 <li>Backblaze B2：1186.51元</li>
//               </ul>
//               <h4 id="总计207589元-1">总计：2075.89元
//               </h4>
//               <hr>
//               <h1 id="感谢您的捐赠">感谢您的捐赠
//               </h1>

//             </section>
//           </article>

//           <!-- 版权授权 -->
//           <div class="blog-rooter">
//             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//               class="icon icon-tabler icons-tabler-outline icon-tabler-copyright">
//               <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//               <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
//               <path d="M14 9.75a3.016 3.016 0 0 0 -4.163 .173a2.993 2.993 0 0 0 0 4.154a3.016 3.016 0 0 0 4.163 .173" />
//             </svg>

//             <span>Licensed under CC BY-NC-SA 4.0</span>
//           </div>
//         </div>

//         <!-- 右侧电梯 -->
//         <div class="right">
//           <div class="nav">
//             <div class="svg">
//               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
//                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
//                 class="icon icon-tabler icons-tabler-outline icon-tabler-hash">
//                 <path stroke="none" d="M0 0h24v24H0z" fill="none" />
//                 <path d="M5 9l14 0" />
//                 <path d="M5 15l14 0" />
//                 <path d="M11 4l-4 16" />
//                 <path d="M17 4l-4 16" />
//               </svg>
//             </div>
//             <div class="title">目录</div>
//             <div class="nav-elevator">
//               <ol>
//                 <li>
//                   <a href="#" class="active">2026年3月网站运营成本公示</a>
//                   <ul>
//                     <li><a href="#">服务器</a></li>
//                     <li><a href="#">CDN</a></li>
//                     <li><a href="#">对象存储</a></li>
//                     <li><a href="#">总计：2075.89元</a></li>
//                   </ul>
//                 </li>
//                 <li><a href="#">2026年3月用户捐赠公示</a></li>
//               </ol>

//             </div>
//           </div>
//         </div>
//       </div>