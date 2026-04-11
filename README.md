# Jewelry DIY · 定制珠宝平台 MVP

移动端优先的定制手串平台，技术栈为 Next.js App Router + Shopify Storefront API。

## 已实现

- `/builder`：DIY 手串配置器（圆环预览、分类筛选、搜索、选珠/删珠、实时总价）
- `/api/shopify/cart`：创建 Shopify 购物车并返回 `checkoutUrl`
- Shopify 数据读取（失败自动回退 mock，保证本地可演示）
- `/api/shopify/webhooks`、`/api/revalidate` 预留路由

## 本地启动

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 环境变量

复制 `.env.example` 到 `.env.local` 后填写（说明见 `.env.example` 内注释）。

如果 Shopify 配置缺失，页面会自动使用 `src/lib/mock/beads.ts` 演示数据。

## 生产部署（Shopify + Vercel）

步骤、子域 DNS、环境变量表与安全清单见：

- [docs/shopify-deployment.md](docs/shopify-deployment.md)
- [docs/shopify-theme-entry.md](docs/shopify-theme-entry.md)（主题菜单入口）
- [docs/shopify-admin-setup.md](docs/shopify-admin-setup.md)（Scope、Metafields、Webhook）
- [docs/shopify-security.md](docs/shopify-security.md)

根目录 [vercel.json](vercel.json) 供 Vercel 使用；上线前在本地或 CI 执行 `npm run build` 确认构建通过。

## 关键目录

- `src/app/builder/page.tsx`
- `src/components/bracelet-builder/*`
- `src/lib/shopify/*`
- `src/app/api/shopify/cart/route.ts`

## 下一步建议

1. 在 Shopify 为珠子商品补齐 metafields（见 `docs/shopify-admin-setup.md`）
2. 生产环境配置 `SHOPIFY_WEBHOOK_SECRET` 并注册 Webhook（验签已在 `src/app/api/shopify/webhooks/route.ts` 实现）
3. 增加 Playwright 移动端冒烟测试（选珠 → 结账按钮可用）
