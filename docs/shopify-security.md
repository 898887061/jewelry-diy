# 密钥与安全清单

## 若密钥已泄露（聊天、截图、录屏、公开仓库）

1. 打开 Shopify 后台 → **设置** → **应用和销售渠道** → 你的自定义应用。
2. **轮换 / 重新生成**：
   - Admin API access token（若支持轮换则换新，旧 token 立即失效）。
   - Client secret（若你曾把 `shpss_...` 当作接口密钥暴露，必须换新）。
3. 在 **Vercel（或所用托管商）** 的 Environment Variables 中更新对应变量，**重新 Deploy**。
4. **切勿**将以下值写入 Git、主题代码或前端 bundle：
   - `SHOPIFY_ADMIN_TOKEN`
   - `SHOPIFY_WEBHOOK_SECRET`
   - `REVALIDATE_SECRET`
   - `WECHAT_SECRET` 等任意服务端密钥

## 仓库与协作

- 仅提交 [.env.example](../.env.example)，不提交 `.env`、`.env.local`。
- 新成员各自在本地与 Vercel 中单独配置密钥，不要用邮件/微信传明文。

## 生产环境变量存放

| 可公开（浏览器可见） | 仅服务器 |
|----------------------|----------|
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | `SHOPIFY_ADMIN_TOKEN` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | `SHOPIFY_WEBHOOK_SECRET` |
| | `REVALIDATE_SECRET` |

Storefront token 虽带 `NEXT_PUBLIC_`，仍建议限制为仅 Storefront 所需 scope，并勿在公开场合张贴完整 token。
