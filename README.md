# baiyangmu.github.io

个人主页静态站点，线上地址 [https://baiyangmu.ccwu.cc](https://baiyangmu.ccwu.cc)。

## 怎么改

改完直接提交，GitHub Pages 会在一两分钟内自动更新。

```bash
git add -A
git commit -m "update site"
git push
```

## 文件结构

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构 + **所有需要你改的文案** |
| `style.css` | 样式。改配色只需动顶部 `:root` 里的 `--c1/--c2/--c3` |
| `app.js` | 粒子背景、打字机、3D 卡片等交互 |
| `CNAME` | 自定义域名，**不要删** |
| `.nojekyll` | 让 Pages 跳过 Jekyll，原样发布文件 |

## 常见改动

- **改文案 / 加链接卡片** → `index.html`，带 `↓↓↓` 注释的地方
- **改打字机那几行字** → `app.js` 里的 `LINES`
- **改配色** → `style.css` 顶部 `:root`
- **加新页面** → 新建 `xxx.html`，然后在 `index.html` 里加链接

## 注意

- `.nojekyll` 存在时，根目录下 `_` 开头的目录（如 `_posts`）不会被处理，当普通文件发布。
- 如果以后引入 `package.json` 等构建工具，去 `Settings → Pages → Build and deployment`
  把 Source 从 `Deploy from a branch` 改成 `GitHub Actions`。
