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

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeBar = document.getElementById('theme-bar');
const modalMask = document.getElementById('modal-mask');

// 初始化主题选择条
Object.keys(THEMES).forEach(key => {
  const th = THEMES[key];
  const chip = document.createElement('button');
  chip.className = 'chip' + (key === currentTheme ? ' active' : '') + (th.free ? '' : ' locked');
  chip.textContent = th.name;
  chip.title = th.desc;
  chip.onclick = () => {
    if (!th.free) { modalMask.classList.add('show'); return; }
    currentTheme = key;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    render();
  };
  themeBar.appendChild(chip);
});
modalMask.onclick = e => { if (e.target === modalMask) modalMask.classList.remove('show'); };

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
render();
