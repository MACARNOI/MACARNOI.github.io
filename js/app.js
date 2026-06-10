/* 日期格式化：将 ISO 8601 转为 YYYY-MM-DD */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.slice(0, 10); // fallback
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function init() {
  await renderSidebar();
  initSidebarEvents();
  // 当归档页面渲染完成后
  if (typeof initHorizontalScroll === 'function') {
    initHorizontalScroll('.archives .box ul');
  }
  // 默认加载首页
  loadPage('home', () => window.renderHomePage(1));
}

init();