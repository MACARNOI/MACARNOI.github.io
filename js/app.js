/* 日期格式化：将各种日期格式统一转为 YYYY-MM-DD */
function formatDate(dateStr) {
  if (!dateStr) return '';
  // 如果已经是 YYYY-MM-DD 格式，直接返回（避免时区转换偏差）
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // 否则尝试解析（兼容 ISO 8601 等格式）
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr.slice(0, 10); // fallback
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
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