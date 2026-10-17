# baiyangmu.github.io

个人主页静态站点，部署在 [https://baiyangmu.ccwu.cc](https://baiyangmu.ccwu.cc)。

## 怎么改

改完直接提交即可，GitHub Pages 会在一两分钟内自动更新。

```bash
git add -A
git commit -m "update site"
git push
```

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `index.html` | 整个页面（HTML/CSS/JS 都在这一个文件里） |
| `CNAME` | 自定义域名，**不要删** |
| `.nojekyll` | 让 Pages 跳过 Jekyll 构建，原样发布文件 |

## 需要注意的地方

- 想加新页面，就新建 `xxx.html`，然后在 `index.html` 里加个链接。
- 如果以后加 `package.json` 之类的构建工具，记得去 `Settings → Pages → Build and deployment`
  里把 Source 从 `Deploy from a branch` 改成 `GitHub Actions`。
- `.nojekyll` 存在的情况下，根目录下的 `_` 开头目录（如 `_posts`）不会被处理，当普通文件发布。
