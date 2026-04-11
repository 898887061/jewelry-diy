# Shopify 后台：Scope、Metafields、Webhook

与代码路径对应，便于一次性配齐生产环境。

## 1. Storefront API（Headless / 自定义店面）

在 Shopify 后台创建 **Headless** 或具备 **Storefront API** 的渠道/应用，生成 **Storefront API access token**，填入：

- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_STOREFRONT_TOKEN`（可与上一项相同）

权限需至少支持：

- 读取产品（含 metafields），供 [getBeadsFromShopify](../src/lib/shopify/queries/beads.ts) 使用。
- **购物车**：`cartCreate` 与结账 URL，供 [cartCreate.ts](../src/lib/shopify/mutations/cartCreate.ts) 与 [/api/shopify/cart](../src/app/api/shopify/cart/route.ts) 使用。

若结账报错，在 Headless 渠道设置中确认已启用 **结账** / 对应 Storefront 权限（以当前后台界面为准）。

## 2. Admin API（管理珠子、上传等）

自定义应用需勾选与 [admin-client.ts](../src/lib/shopify/admin-client.ts) 及 Admin 路由实际调用一致的 scope，通常包括：

- `read_products`、`write_products`
- 若使用文件/图片：`read_files`、`write_files`
- Metafields：`read` / `write` 产品及 metafield 定义（视你实现的 mutation 而定）

将 **Admin API access token**（后台显示的长期令牌）填入 `SHOPIFY_ADMIN_TOKEN`。  
**不要**把 OAuth 的 **Client secret**（`shpss_...`）误当作 Admin token；若后台只有 secret，请在同一应用页找到 **Admin API access token** 或重新安装应用后复制。

## 3. 珠子商品 Metafields

查询使用 namespace **`bead`**，与 [beads.ts](../src/lib/shopify/queries/beads.ts) 一致：

| Key | 建议类型 | 用途 |
|-----|----------|------|
| `color_hex` | 单行文本 | 颜色，如 `#c9a961` |
| `category` | 单行文本 | 分类筛选 |
| `texture_url` | URL 或单行文本 | 纹理图地址（可选） |

产品需带标签 **`bracelet-bead`** 才会出现在配置器列表中（与 GraphQL `query: "tag:bracelet-bead"` 一致）。

在 **设置 → 自定义数据 → 产品** 中创建上述 metafield 定义后，到每个珠子商品上填写值。

## 4. Webhook

**设置 → 通知 → Webhook**（或应用内 Webhook，以你店铺版本为准）添加：

- **URL**：`https://<你的生产域名>/api/shopify/webhooks`  
  例：`https://diy.lilpeb.com/api/shopify/webhooks`
- **格式**：JSON
- **签名密钥**：生成后复制到 Vercel 的 `SHOPIFY_WEBHOOK_SECRET`

本仓库 [webhooks/route.ts](../src/app/api/shopify/webhooks/route.ts) 已处理并验签的主题包括：

| Topic | 行为 |
|-------|------|
| `products/create`、`products/update`、`products/delete` | `revalidatePath` `/builder`、`/products` |
| `inventory_levels/update` | 同上 |
| `orders/create` | 仅日志，可按需扩展 |

添加后在后台对某条 Webhook 使用 **发送测试通知**，应返回 **200**；若 **401**，检查 secret 是否与 `SHOPIFY_WEBHOOK_SECRET` 完全一致（无多余空格）。

## 5. 自定义域 TLS

若主域仍显示「正在预配 TLS」，待 Shopify 显示完成后再大规模推广，避免访客看到证书警告。
