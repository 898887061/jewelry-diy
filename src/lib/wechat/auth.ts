interface WeChatTokenResponse {
  access_token?: string;
  openid?: string;
  errcode?: number;
  errmsg?: string;
}

export function getWeChatAuthUrl(redirectUri: string, state = "admin"): string {
  const appId = process.env.WECHAT_APPID ?? "";
  const encoded = encodeURIComponent(redirectUri);
  return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${encoded}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
}

export async function getOpenIdByCode(code: string): Promise<string> {
  const appId = process.env.WECHAT_APPID ?? "";
  const secret = process.env.WECHAT_SECRET ?? "";

  if (!appId || !secret) {
    throw new Error("Missing WECHAT_APPID or WECHAT_SECRET");
  }

  const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appId}&secret=${secret}&code=${code}&grant_type=authorization_code`;

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as WeChatTokenResponse;

  if (data.errcode || !data.openid) {
    throw new Error(data.errmsg ?? "Failed to get openid from WeChat");
  }

  return data.openid;
}
