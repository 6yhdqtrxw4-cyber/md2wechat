/* 墨排浏览器扩展 v0.2.0
 * 自包含：渲染 + 离线解锁校验，不依赖任何服务器或网站。
 * 解锁码校验用内置 SHA-256 哈希表（keys.js），全程不发网络请求。
 */
const editor = document.getElementById('editor');
const themeSel = document.getElementById('theme');
const tip = document.getElementById('tip');
const unlockPanel = document.getElementById('unlock');
const unlockName = document.getElementById('unlock-name');
const codeInput = document.getElementById('code');
const msg = document.getElementById('msg');
const qrImg = document.getElementById('qr');
const qrPh = document.getElementById('qr-ph');

/* 购买入口。把爱发电商品链接填到这里即可启用（留空则显示「即将上线」占位文案）。
 * 爱发电支持数字商品 + 自动随机发放激活码，收款/发货可全自动，无需人工发码。
 * 必须声明在使用它的 initBuy() 之前，否则会触发 TDZ ReferenceError 并让整个脚本中断
 * （曾实测导致主题下拉变空白）。 */
const PURCHASE_URL = '';

/* 收款码是「可选资源」：只有文件真的存在才引用它，
 * 否则扩展包里会长期存在一个 404 引用（每次打开弹窗都会报错）。
 * 另外 MV3 的 CSP 禁止内联事件处理器（onerror="..."），必须用 addEventListener。 */
function showQrFallback() { qrImg.style.display = 'none'; qrPh.style.display = 'block'; }
qrImg.addEventListener('error', showQrFallback);
(function initQr() {
  const url = chrome.runtime.getURL('pay-qrcode.png');
  fetch(url).then(r => {
    if (r.ok) { qrPh.style.display = 'none'; qrImg.style.display = 'block'; qrImg.src = url; }
    else showQrFallback();
  }).catch(showQrFallback);
})();

/* 已配置购买链接时展示出来（替代"即将上线"占位） */
(function initBuy() {
  if (!PURCHASE_URL) return;
  const a = document.getElementById('buy');
  if (!a) return;
  a.href = PURCHASE_URL;
  a.style.display = 'block';
  qrPh.innerHTML = '点击下方链接购买解锁码<br/>付款后自动发放';
})();

const DEFAULT_TIP = '复制后到公众号编辑器直接粘贴即可；「填入」仅在你已打开公众号后台页面时可用。';

let unlocked = false;
let usableTheme = 'tech';   // 最近一次生效的可用主题（免费或已解锁）
let pendingTheme = null;    // 正在等待解锁的主题

function setMsg(text, cls) { msg.textContent = text || ''; msg.className = cls || ''; }
let tipTimer = null;
function notify(text) {
  tip.textContent = text;
  // 必须取消上一个复位定时器，否则旧消息的定时器会把新消息提前抹掉
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => { tip.textContent = DEFAULT_TIP; }, 2500);
}

function buildThemeSelect() {
  themeSel.innerHTML = '';
  Object.keys(THEMES).forEach(k => {
    const th = THEMES[k];
    const o = document.createElement('option');
    o.value = k;
    o.textContent = th.name + (th.free || unlocked ? '' : ' 🔒');
    themeSel.appendChild(o);
  });
  themeSel.value = usableTheme;
}

/* 解锁码校验：格式规范化 → SHA-256 → 与内置哈希表比对。零网络请求。 */
function normalizeCode(raw) {
  return String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
}
function verifyCode(raw) {
  const norm = normalizeCode(raw);
  if (!/^MQ-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(norm)) return false;
  if (!Array.isArray(UNLOCK_HASHES)) return false;
  return UNLOCK_HASHES.indexOf(sha256(norm)) !== -1;
}

function openUnlock(themeKey) {
  pendingTheme = themeKey;
  unlockName.textContent = '「' + THEMES[themeKey].name + '」';
  setMsg('');
  codeInput.value = '';
  unlockPanel.classList.add('show');
  setTimeout(() => codeInput.focus(), 50);
}
function closeUnlock() {
  pendingTheme = null;
  unlockPanel.classList.remove('show');
}

themeSel.onchange = () => {
  const k = themeSel.value;
  if (THEMES[k].free || unlocked) {
    usableTheme = k;
    closeUnlock();
    chrome.storage.local.set({ theme: k });
    return;
  }
  // 未解锁的付费主题：弹出解锁面板，并把选择回退，避免误解当前渲染的是哪套主题
  openUnlock(k);
  themeSel.value = usableTheme;
};

document.getElementById('btn-cancel').onclick = () => { closeUnlock(); setMsg(''); };

document.getElementById('btn-unlock').onclick = () => {
  const raw = codeInput.value;
  if (!raw.trim()) { setMsg('请先输入解锁码', 'err'); return; }
  if (!verifyCode(raw)) { setMsg('解锁码无效，请检查后重试', 'err'); return; }

  const want = pendingTheme;
  unlocked = true;
  // 存原始码；下次启动会重新做一次哈希校验，改存储值无法绕过
  chrome.storage.local.set({ unlockedCode: normalizeCode(raw) });
  if (want && THEMES[want]) usableTheme = want;
  buildThemeSelect();
  // 自动切换主题时也必须落盘：直接改 select.value 不会触发 change 事件
  if (want && THEMES[want]) chrome.storage.local.set({ theme: want });
  closeUnlock();
  setMsg('');
  notify('🎉 解锁成功！15 套主题全部可用');
};

document.getElementById('copy').onclick = async () => {
  try {
    const html = mdToWechat(editor.value, themeSel.value);
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([editor.value], { type: 'text/plain' })
      })
    ]);
    notify('✅ 已复制！到公众号编辑器粘贴即可');
  } catch (e) {
    notify('复制失败，请重试');
  }
};

document.getElementById('fill').onclick = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs && tabs[0];
    // 关键：未声明 host 权限的标签页读不到 url（为 undefined），必须容错，
    // 否则会在任何非公众号页面上抛出未捕获异常且毫无反馈。
    if (!tab || !tab.url || !tab.url.includes('mp.weixin.qq.com')) {
      notify('⚠️ 请先打开公众号后台文章编辑页');
      return;
    }
    const res = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: html => {
        const ed = document.querySelector('#ueditor_0')?.contentDocument?.body
          || document.querySelector('.ProseMirror') || document.querySelector('[contenteditable=true]');
        if (ed) { ed.focus(); ed.innerHTML = html; return true; }
        return false;
      },
      args: [mdToWechat(editor.value, themeSel.value)]
    });
    notify(res && res[0] && res[0].result ? '✅ 已填入编辑器' : '⚠️ 没找到编辑器，请用复制粘贴');
  } catch (e) {
    notify('⚠️ 注入失败，请用复制粘贴');
  }
};

// —— 启动：恢复草稿、主题与解锁状态 ——
chrome.storage.local.get(['md', 'theme', 'unlockedCode'], r => {
  if (r.md) editor.value = r.md;
  // 重新校验存储的解锁码，而不是只看它是否存在
  if (r.unlockedCode && verifyCode(r.unlockedCode)) unlocked = true;
  if (r.theme && THEMES[r.theme] && (THEMES[r.theme].free || unlocked)) usableTheme = r.theme;
  buildThemeSelect();
});

editor.addEventListener('input', () => chrome.storage.local.set({ md: editor.value }));
