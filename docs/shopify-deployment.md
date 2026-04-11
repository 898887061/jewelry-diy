# Jewelry DIY · Shopify 生产部署（Vercel）

本文对应仓库内的 Next.js 应用与 Shopify 店铺的对接方式：**定制站独立托管**，通过 API 与 `*.myshopify.com` 通信；主域名 `lilpeb.com` 仍由 Shopify 在线商店与结账使用。

## 1. Vercel 托管

1. 将本仓库推送到 GitHub / GitLab / Bitbucket。
2. 打开 [Vercel](https://vercel.com)，**Add New Project**，导入该仓库。
3. Framework Preset 选 **Next.js**（与根目录 [vercel.json](../vercel.json) 一致即可）。
4. **Environment Variables**：按下文「环境变量」表逐条添加（Production；Preview 可填相同或测试店）。
5. 首次 **Deploy**。部署成功后记下生产 URL，例如 `https://jewelry-diy.vercel.app`。

### 自定义子域名（推荐）

在阿里云 DNS 为 **子域名** 增加 CNAME（不要改动已指向 Shopify 的根域 `@` 与 `www`）：

| 记录类型 | 主机记录 | 记录值 |
|---------|----------|--------|
| CNAME | `diy`（或 `app`） | Vercel 项目域名给出的 target（如 `cname.vercel-dns.com`） |

在 Vercel 项目 **Settings → Domains** 中添加 `diy.lilpeb.com`，按提示完成校验。

顾客入口示例：`https://diy.lilpeb.com/builder`。

## 2. 环境变量

复制 [.env.example](../.env.example) 为本地 `.env.local`；在 Vercel 中填入 **同名** 变量。

| 变量 | 作用域 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | 客户端 + 服务端 | 填 **`你的店铺.myshopify.com`**，勿用自定义域作主配置。 |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | 客户端 | Headless / 店面 API 的 **Storefront access token**（不是自定义应用的 Client ID）。 |
| `SHOPIFY_DOMAIN` | 服务端 | 可与上一项相同，供 API 路由使用。 |
| `SHOPIFY_STOREFRONT_TOKEN` | 服务端 | 可与 Storefront 公钥相同（服务端优先读此项）。 |
| `SHOPIFY_ADMIN_TOKEN` | 服务端 | 自定义应用的 **Admin API access token**（常见 `shpat_`；以界面显示为准）。 |
| `SHOPIFY_WEBHOOK_SECRET` | 服务端 | 与 Admin 中 Webhook **签名密钥**一致，用于 [webhooks 路由](../src/app/api/shopify/webhooks/route.ts) 验签。 |
| `REVALIDATE_SECRET` | 服务端 | 调用 `/api/revalidate` 时在 JSON body 中传的 `secret`，自行生成强随机串。 |

**切勿**将 `SHOPIFY_ADMIN_TOKEN`、`SHOPIFY_WEBHOOK_SECRET`、`REVALIDATE_SECRET` 以 `NEXT_PUBLIC_` 前缀暴露到浏览器。

微信、管理员相关变量见 `.env.example`，仅在使用对应功能时配置。

## 3. 上线自检

- [ ] `npm run build` 在本地或通过 Vercel 构建成功。
- [ ] 生产环境打开 `/builder`，选珠 → 结账 → 跳转 Shopify Checkout 正常。
- [ ] Webhook：在 Shopify 发送测试事件，响应 200，且无验签失败日志（见 [shopify-admin-setup.md](./shopify-admin-setup.md)）。
- [ ] 若密钥曾在聊天或截图中泄露，已在 Shopify **轮换** 并只写入 Vercel 环境变量（见 [shopify-security.md](./shopify-security.md)）。

## 4. 相关文档

- [主题菜单入口](./shopify-theme-entry.md)
- [Shopify 后台：Metafields、Scope、Webhook](./shopify-admin-setup.md)
- [密钥与安全](./shopify-security.md)
