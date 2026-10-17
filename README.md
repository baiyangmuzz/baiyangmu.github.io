# 动效博物馆

站点地址 [https://baiyangmu.ccwu.cc](https://baiyangmu.ccwu.cc) · 部署在 GitHub Pages

40 个基础动效 + 9 个组合演示，纯 CSS 与原生 JS 实现，零依赖、零构建。

## 怎么改

整个站点就一个文件。改完直接提交，GitHub Pages 一两分钟内自动更新。

```bash
git add -A
git commit -m "update"
git push
```

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | **整个站点** —— 结构、样式、脚本全在里面（3633 行，无任何外部依赖） |
| `CNAME` | 自定义域名，**不要删** |
| `.nojekyll` | 让 Pages 跳过 Jekyll 处理，原样发布 |

## 文件里主要有四块

| 位置 | 内容 |
| --- | --- |
| `<style>` 开头 `:root` | 设计 token。`--ink-rgb` 是「记号色」通道，深色下是白、浅色下自动反转成近黑，全站 `rgb(var(--ink-rgb) / .xx)` 会跟着一起翻 |
| `<head>` 的同步脚本 | 在首屏绘制前定好主题，避免闪白 |
| `DEMOS` 对象 | 40 个动效的元数据，每个含 `html`（舞台内容）、`tag`（中文标签）、`code`（展示的源码）、`loop`（是否循环） |
| `COMBOS` 数组 | 9 个组合演示，同样结构 |

新增一个动效：在 `DEMOS` 对应分组里加一项，再写上对应的 `[data-anim="xxx"]` 样式和舞台 HTML 即可，卡片和语法高亮会自动生成。

## 已做的修复

### 组合演示不显示（严重）

原版 CSS 写的是 `.combo-text.play .combo-text__line span`，但 JS 把 `play` 类加在
`article.combo` 上（`el.classList.add('play')`）。选择器对不上，导致
**Text Reveal / Modal / Notification / Hero / Stats 五个组合的内容永远停在
`opacity:0`**，卡片看起来是空的。

改成 20 处 CSS 全部改为从 `.combo` 下挂：`.combo.play .combo-text ...`。

### 动画无法重放

根因：整个组合演示区都是 `transition` 实现，而重放写法是「移除 `.play` → 强制回流 →
加回 `.play`」。对 `animation` 属性，重新加类会重启动画；但对 `transition`，
同一帧内 remove→add 等于没变化，浏览器根本没机会重置。**第一次滚动进视口是好的
（从没播过，值真的从 0 变 1），第二次以后全是抖动。**

统一用 React Transition Group / Framer Motion 内部同款的 reset 手法：

```css
.combo.no-anim *{ transition: none !important }
```

```js
function resetAndPlay(el){
  el.classList.add('no-anim');   // 关掉过渡
  el.classList.remove('play');   // 状态瞬间回到初始值
  void el.offsetWidth;           // 强制回流，确保归零生效
  el.classList.remove('no-anim');// 恢复过渡
  void el.offsetWidth;
  el.classList.add('play');      // 从 0 完整重播
}
```

连带修掉的：

- **Progress / Check** 是全场仅有的两个用 `transition` 实现的基础动效，同样无法重播
  → 已改成 `@keyframes`，40 个动效的实现方式统一
- **Stats** 的数字是 rAF 驱动的，跟 `.play` 无关，原先只会被设成 `0` 然后永远停住
  → 抽出 `countUp()`，重放时重跑
- **Notification** 卡片初始 `translateX(120%)`，被 `.combo__stage` 的 `overflow:hidden`
  裁到舞台外，既看不见也点不到，还被排除在 stage 点击重放之外 → 已移出排除名单
- **Modal** 播完 3.2 秒自动移除 `play` 类，内容重新变透明，看起来像坏了 → 已去掉
- **Card / Button / Trail** 的 CSS 里根本没有 `.play` 规则（靠 hover 和指针驱动），
  套用统一重放后 `↻` 按钮是死的 → 各自补了真实动作（光斑扫过 / 光晕重计时 + 波纹 / 跟随目标归位 + 涟漪）
- **`.combo__code` 有重复定义**，位置靠后的旧写法（`grid-template-rows`）会覆盖前一条 → 已删除

### 深色 / 浅色主题

用 `--ink-rgb` 单记号色通道实现：`rgba(255,255,255,.xx)` 全部替换成
`rgb(var(--ink-rgb) / .xx)`，浅色模式改 `--ink-rgb` 即可让整套视觉自动反转，
不用为第二个主题重写任何一行。语法高亮 10 色、颗粒层混合模式、阴影深浅需单独给浅色值。

主题在 `<head>` 的同步脚本里定下来（早于首屏绘制，不会闪白），选择写进
`localStorage['mm-theme']`，未选择过时跟随系统偏好。切换时用 View Transitions API
做圆形擦除（`document.startViewTransition` + `::view-transition-new(root)` 的 `clip-path`），
不支持或用户要求减少动效时降级为直接切换。

### 其他

- 代码面板原本写死 `max-height:520px`，49 个代码块里有 8 个被静默截断 → 改成 `90vh` + 内部滚动
- `--faint` 透明度 `.3` 对比度只有 2.45:1，未过 WCAG AA → 提到 `.5`（约 4.9:1）
- `cursor:none` 没有兜底，JS 一出错全站无光标 → 改为只在 `html.js-ready` 时生效
- 12 处常驻 `will-change` 长期占用显存 → 全部移除
- `pointerover/out` 委托导致光圈在子元素间抖动 → 加 `relatedTarget` 判断
- 循环型演示被 IntersectionObserver 永久持有引用 → `return` 前先 `unobserve`
- 3 个 `requestAnimationFrame` 循环永不停 → 挂 `visibilitychange`，标签页切走即停
- 用户开启「减少动态效果」时，挂 `.reduce-motion` 直接隐藏光标/光晕/拖尾这类跟随元素
- `<noscript>` 兜底隐藏加载圈，避免 JS 被禁用时永久卡住
- 「开始浏览」原本是 `<button>` 但从没绑过事件，点了没反应 → 改成锚点
- 窄屏（<820px）导航整组消失且无兜底 → 改为可展开菜单，`Esc` 关闭
- 缺少 `:focus-visible` 样式，键盘用户看不到焦点 → 已补
- 标题层级 `h1 → h2 → h4` 跳级 → 改为 `h3`
- 演示按钮只有 `title` 没有 `aria-label` → 已补
- 舞台提示的 `HOVER` / `LOOP` / `CLICK TO PLAY` 等英文文案 → 改为中文

## 已知问题

- 文件里有两个 loader 定时器（`2500ms` 与 `550ms`）。`550ms` 的先跑完并移除
  `#loader`，`2500ms` 的再执行时 `getElementById` 返回 `null`，只剩一句多余的
  `classList.add('ready')`。不会白屏，属冗余。

## 备注

原版使用 `@keyframes spin` 等全局动画名。代码示例字符串里保留了 `will-change` 写法
作为教学内容，那部分是展示内容而非生效样式，未做改动。
