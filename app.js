/* 墨排 MVP 前端逻辑 */
const SAMPLE = `# 墨排：让 Markdown 一键变成好看的公众号推文

写 Markdown 的人，不该浪费时间在排版上。**左侧写，右侧看**，满意了一键复制到公众号后台。

## 支持的语法

- 标题、**加粗**、*斜体*、\`行内代码\`
- 有序 / 无序列表
- > 引用块，适合放金句
- ![配图](https://picsum.photos/600/300)
- [外链](https://example.com) 与分割线

---

## 代码高亮也安排上了

\`\`\`js
const money = async () => {
  const skill = "ship fast";
  return skill.repeat(100); // 100W 挑战进行中
};
\`\`\`

> 小而美的工具，解决一个真痛点，就有人愿意付钱。

*试试右上角的「主题切换」，锁住的 🔒 是付费主题——这就是本产品的商业模式。*`;

let currentTheme = 'tech';
let pendingTheme = null;

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeBar = document.getElementById('theme-bar');
const modalMask = document.getElementById('modal-mask');
const unlockInput = document.getElementById('unlock-input');
const unlockErr = document.getElementById('unlock-err');
const unlockOk = document.getElementById('unlock-ok');

const UNLOCK_KEY = 'mopai_unlock_v1';

// 已解锁判定（本地持久化）
function isUnlocked() { return !!localStorage.getItem(UNLOCK_KEY); }

// 初始化主题选择条
function buildThemeBar() {
  themeBar.innerHTML = '';
  Object.keys(THEMES).forEach(key => {
    const th = THEMES[key];
    const chip = document.createElement('button');
    chip.className = 'chip' + (key === currentTheme ? ' active' : '') + (th.free || isUnlocked() ? '' : ' locked');
    chip.textContent = th.name;
    chip.title = th.desc;
    chip.onclick = () => {
      if (th.free) {
        currentTheme = key;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        render();
      } else if (isUnlocked()) {
        currentTheme = key;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        render();
      } else {
        pendingTheme = key;
        openPayModal();
      }
    };
    themeBar.appendChild(chip);
  });
}

function openPayModal() {
  unlockErr.textContent = '';
  unlockOk.textContent = '';
  unlockInput.value = '';
  modalMask.classList.add('show');
  setTimeout(() => unlockInput.focus(), 60);
}

modalMask.onclick = e => { if (e.target === modalMask) modalMask.classList.remove('show'); };

// 解锁校验：输入码 → 大写规范化 → SHA-256 → 与 keys.json 哈希表比对
async function verifyUnlockCode(code) {
  const norm = code.trim().toUpperCase().replace(/\s+/g, '');
  if (!/^MQ-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(norm)) return false;
  try {
    const r = await fetch('keys.json', { cache: 'no-store' });
    if (!r.ok) return false;
    const hashes = await r.json();
    const h = sha256(norm);
    return Array.isArray(hashes) && hashes.includes(h);
  } catch (e) {
    return false;
  }
}

document.getElementById('btn-unlock').onclick = async () => {
  unlockErr.textContent = '';
  unlockOk.textContent = '';
  const btn = document.getElementById('btn-unlock');
  const code = unlockInput.value;
  if (!code) { unlockErr.textContent = '请先输入解锁码'; return; }
  btn.disabled = true;
  btn.textContent = '校验中…';
  const ok = await verifyUnlockCode(code);
  btn.disabled = false;
  btn.textContent = '解锁主题包';
  if (!ok) { unlockErr.textContent = '解锁码无效，请检查后重试'; return; }
  localStorage.setItem(UNLOCK_KEY, code.trim().toUpperCase());
  unlockOk.textContent = '✅ 解锁成功！15 套主题全部可用';
  toast('🎉 解锁成功！15 套主题已全部可用');
  buildThemeBar();
  setTimeout(() => {
    modalMask.classList.remove('show');
    if (pendingTheme) {
      const chip = themeBar.querySelectorAll('.chip')[Object.keys(THEMES).indexOf(pendingTheme)];
      if (chip) chip.click();
      pendingTheme = null;
    }
  }, 900);
};

function render() {
  const md = editor.value;
  preview.innerHTML = mdToWechat(md, currentTheme);
  const words = md.replace(/\s/g, '').length;
  document.getElementById('stat').textContent = `${words} 字 · 当前主题：${THEMES[currentTheme].name}`;
}

let timer;
editor.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 120); });

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// 复制富文本（text/html），粘贴进公众号编辑器时保留样式
document.getElementById('btn-copy').onclick = async () => {
  const html = preview.innerHTML;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([html.replace(/<[^>]+>/g, '')], { type: 'text/plain' })
      })
    ]);
    toast('✅ 已复制！直接粘贴到公众号编辑器即可');
  } catch (e) {
    // 非 HTTPS 环境回退：选区复制
    const range = document.createRange();
    range.selectNodeContents(preview);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    toast('已用兼容模式复制，请到公众号编辑器粘贴');
  }
};

document.getElementById('btn-html').onclick = () => {
  const blob = new Blob([preview.innerHTML], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'moipai-article.html';
  a.click();
  toast('已导出 HTML 文件');
};

editor.value = SAMPLE;
buildThemeBar();
render();
