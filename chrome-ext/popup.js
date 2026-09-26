/* 墨排 Chrome 插件逻辑 */
const editor = document.getElementById('editor');
const themeSel = document.getElementById('theme');
const tip = document.getElementById('tip');

// 免费主题才出现在插件版（付费解锁是网页版钩子）
Object.keys(THEMES).forEach(k => {
  if (!THEMES[k].free) return;
  const o = document.createElement('option');
  o.value = k; o.textContent = THEMES[k].name;
  themeSel.appendChild(o);
});

chrome.storage.local.get(['md', 'theme'], r => {
  if (r.md) editor.value = r.md;
  if (r.theme && THEMES[r.theme] && THEMES[r.theme].free) themeSel.value = r.theme;
});
editor.addEventListener('input', () =>
  chrome.storage.local.set({ md: editor.value, theme: themeSel.value }));

function render() { return mdToWechat(editor.value, themeSel.value); }

function notify(msg) { tip.textContent = msg; setTimeout(() => tip.textContent = '复制后到公众号编辑器直接粘贴即可；「填入」仅在你已打开公众号后台页面时可用。', 2500); }

document.getElementById('copy').onclick = async () => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([render()], { type: 'text/html' }),
        'text/plain': new Blob([editor.value], { type: 'text/plain' })
      })
    ]);
    notify('✅ 已复制！到公众号编辑器粘贴即可');
  } catch (e) { notify('复制失败，请重试'); }
};

document.getElementById('fill').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url.includes('mp.weixin.qq.com')) {
    notify('⚠️ 请先打开公众号后台文章编辑页'); return;
  }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: html => {
      const ed = document.querySelector('#ueditor_0')?.contentDocument?.body
        || document.querySelector('.ProseMirror') || document.querySelector('[contenteditable=true]');
      if (ed) { ed.focus(); ed.innerHTML = html; return true; }
      return false;
    },
    args: [render()]
  }).then(r => notify(r[0].result ? '✅ 已填入编辑器' : '⚠️ 没找到编辑器，请用复制粘贴'))
    .catch(() => notify('⚠️ 注入失败，请用复制粘贴'));
};
