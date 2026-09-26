// 主题引擎：每个主题 = 一组"元素 → 内联样式"映射
// 微信公众号只保留内联样式，所以渲染时必须全部 inline

const F = {
  song: '"Optima-Regular","PingFangTC-light",PingFangSC,"Microsoft YaHei",sans-serif',
  hei: '"PingFangSC-light","Microsoft YaHei",sans-serif',
  kai: '"Kaiti SC","STKaiti","KaiTi",serif'
};

const base = (accent, bg) => ({
  section: `padding:20px 16px;background:${bg};font-size:15px;color:#3f3f3f;line-height:1.75;letter-spacing:.03em;font-family:${F.song};`,
  h1: `font-size:22px;font-weight:bold;color:${accent};border-bottom:2px solid ${accent};padding:0 0 10px;margin:0 0 20px;font-family:${F.hei};`,
  h2: `font-size:19px;font-weight:bold;color:${accent};border-left:4px solid ${accent};padding-left:10px;margin:28px 0 14px;font-family:${F.hei};`,
  h3: `font-size:16.5px;font-weight:bold;color:#2b2b2b;margin:22px 0 10px;font-family:${F.hei};`,
  p: `margin:0 0 16px;`,
  blockquote: `margin:16px 0;padding:12px 16px;background:#f7f7f7;border-left:4px solid ${accent};color:#6a6a6a;font-size:14px;`,
  code: `font-family:Consolas,Menlo,monospace;font-size:13px;background:#f2f3f5;color:#c7254e;padding:2px 6px;border-radius:4px;`,
  pre: `font-family:Consolas,Menlo,monospace;font-size:13px;background:#282c34;color:#abb2bf;padding:14px 16px;border-radius:6px;overflow-x:auto;line-height:1.6;margin:16px 0;`,
  li: `margin:6px 0;`,
  ul: `padding-left:1.4em;margin:0 0 16px;list-style:disc;`,
  ol: `padding-left:1.6em;margin:0 0 16px;list-style:decimal;`,
  a: `color:${accent};text-decoration:none;border-bottom:1px solid ${accent};`,
  strong: `color:#000;font-weight:bold;`,
  em: `color:${accent};font-style:italic;`,
  hr: `border:none;border-top:1px dashed #ccc;margin:24px 0;`,
  img: `max-width:100%;border-radius:6px;display:block;margin:12px auto;`,
  table: `width:100%;border-collapse:collapse;font-size:13.5px;margin:16px 0;`,
  th: `border:1px solid #ddd;background:#f5f7fa;padding:8px 10px;text-align:left;font-weight:bold;color:#2b2b2b;`,
  td: `border:1px solid #ddd;padding:8px 10px;color:#3f3f3f;`
});

const THEMES = {
  tech: {
    name: '科技蓝', free: true,
    desc: '默认主题，开发者气质',
    styles: base('#1e6ef5', '#ffffff')
  },
  minimal: {
    name: '极简灰', free: true,
    desc: '冷淡风，适合深度长文',
    styles: (() => { const s = base('#333333', '#ffffff'); s.h2 = `font-size:19px;font-weight:bold;color:#111;border-left:4px solid #111;padding-left:10px;margin:28px 0 14px;font-family:${F.hei};`; s.h1 = `font-size:22px;font-weight:bold;color:#111;border-bottom:1px solid #ddd;padding:0 0 10px;margin:0 0 20px;font-family:${F.hei};`; return s; })()
  },
  forest: {
    name: '森林绿', free: true,
    desc: '清新自然，生活方式类首选',
    styles: base('#2e9e5b', '#f4fbf6')
  },
  // —— 以下为付费主题（变现钩子）——
  business: {
    name: '商务深蓝', free: false,
    desc: '职场 / 商业分析专用',
    styles: (() => { const s = base('#123a6d', '#ffffff'); s.blockquote = `margin:16px 0;padding:12px 16px;background:#eef3fa;border-left:4px solid #123a6d;color:#44546a;font-size:14px;`; return s; })()
  },
  china: {
    name: '国风朱砂', free: false,
    desc: '文化 / 历史 / 节日推文',
    styles: (() => { const s = base('#a63a2b', '#fdf9f3'); s.h2 = `font-size:19px;font-weight:bold;color:#a63a2b;border-left:4px solid #a63a2b;padding-left:10px;margin:28px 0 14px;font-family:${F.kai};`; s.h1 = `font-size:22px;font-weight:bold;color:#7c2a1e;border-bottom:2px solid #a63a2b;padding:0 0 10px;margin:0 0 20px;font-family:${F.kai};`; return s; })()
  },
  dark: {
    name: '暗夜极客', free: false,
    desc: '科技媒体 / 暗色代码风',
    styles: (() => { const s = base('#e6a23c', '#1d1f24'); s.section = `padding:20px 16px;background:#1d1f24;font-size:15px;color:#c8c9cc;line-height:1.75;letter-spacing:.03em;font-family:${F.song};`; s.h1 = `font-size:22px;font-weight:bold;color:#e6a23c;border-bottom:2px solid #e6a23c;padding:0 0 10px;margin:0 0 20px;font-family:${F.hei};`; s.h2 = `font-size:19px;font-weight:bold;color:#e6a23c;border-left:4px solid #e6a23c;padding-left:10px;margin:28px 0 14px;font-family:${F.hei};`; s.strong = `color:#ffffff;font-weight:bold;`; s.blockquote = `margin:16px 0;padding:12px 16px;background:#26282e;border-left:4px solid #e6a23c;color:#9a9ba0;font-size:14px;`; s.code = `font-family:Consolas,Menlo,monospace;font-size:13px;background:#26282e;color:#e6a23c;padding:2px 6px;border-radius:4px;`; s.hr = `border:none;border-top:1px dashed #444;margin:24px 0;`; return s; })()
  }
};

const FREE_THEMES = Object.keys(THEMES).filter(k => THEMES[k].free);

// 代码高亮（内联 span，微信可保留）
function highlight(code) {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc(code)
    .replace(/(&quot;.*?&quot;|".*?"|'.*?'|`.*?`)/gs, m => `<span style="color:#98c379">${m}</span>`)
    .replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g, m => `<span style="color:#5c6370;font-style:italic">${m}</span>`)
    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|new|await|async|def|print|None|True|False|true|false|null|undefined)\b/g,
      m => `<span style="color:#c678dd">${m}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:#d19a66">${m}</span>`);
}

function inlineFmt(text, t) {
  let s = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/`([^`]+)`/g, (m, c) => `<code style="${t.code}">${c}</code>`);
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (m, a, u) => `<img src="${u}" alt="${a}" style="${t.img}"/>`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (m, a, u) => `<a href="${u}" style="${t.a}">${a}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, `<strong style="${t.strong}">$1</strong>`);
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, `$1<em style="${t.em}">$2</em>`);
  return s;
}

// Markdown → 内联样式 HTML（公众号可直接粘贴）
function mdToWechat(md, themeKey) {
  const t = THEMES[themeKey].styles;
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0, listStack = [];

  const closeLists = () => { while (listStack.length) { out.push(listStack.pop().type === 'ul' ? '</ul>' : '</ol>'); } };

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (/^```/.test(line)) {
      closeLists();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre style="${t.pre}"><code>${highlight(buf.join('\n'))}</code></pre>`);
      continue;
    }
    // 标题
    const h = line.match(/^(#{1,3})\s+(.*)/);
    if (h) {
      closeLists();
      const tag = 'h' + h[1].length;
      out.push(`<${tag} style="${t[tag]}">${inlineFmt(h[2], t)}</${tag}>`);
      i++; continue;
    }
    // 分割线
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      closeLists(); out.push(`<hr style="${t.hr}"/>`); i++; continue;
    }
    // 表格（| 开头 且 下一行是分隔行）
    if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeLists();
      const cells = row => row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
      const header = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      let html = `<table style="${t.table}"><thead><tr>`;
      header.forEach(c => html += `<th style="${t.th}">${inlineFmt(c, t)}</th>`);
      html += '</tr></thead><tbody>';
      rows.forEach(r => {
        html += '<tr>' + header.map((_, idx) => `<td style="${t.td}">${inlineFmt(r[idx] || '', t)}</td>`).join('') + '</tr>';
      });
      html += '</tbody></table>';
      out.push(html);
      continue;
    }
    // 引用
    if (/^>\s?/.test(line)) {
      closeLists();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote style="${t.blockquote}">${buf.map(b => inlineFmt(b, t)).join('<br/>')}</blockquote>`);
      continue;
    }
    // 列表
    const li = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)/);
    if (li) {
      const type = /\d/.test(li[2]) ? 'ol' : 'ul';
      const depth = Math.floor(li[1].length / 2);
      while (listStack.length > depth + 1) out.push(listStack.pop().type === 'ul' ? '</ul>' : '</ol>');
      if (!listStack.length || listStack[listStack.length - 1].depth !== depth || listStack[listStack.length - 1].type !== type) {
        if (!listStack.length || listStack[listStack.length - 1].depth < depth) {
          out.push(`<${type} style="${t[type]}">`);
          listStack.push({ type, depth });
        } else {
          out.push(listStack.pop().type === 'ul' ? '</ul>' : '</ol>');
          out.push(`<${type} style="${t[type]}">`);
          listStack.push({ type, depth });
        }
      }
      out.push(`<li style="${t.li}">${inlineFmt(li[3], t)}</li>`);
      i++; continue;
    }
    // 空行
    if (/^\s*$/.test(line)) { closeLists(); i++; continue; }
    // 普通段落
    closeLists();
    out.push(`<p style="${t.p}">${inlineFmt(line, t)}</p>`);
    i++;
  }
  closeLists();
  return `<section style="${t.section}">${out.join('')}</section>`;
}

if (typeof module !== 'undefined') module.exports = { mdToWechat, THEMES, FREE_THEMES };
