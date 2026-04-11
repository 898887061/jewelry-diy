export function isWeChatBrowser(ua?: string): boolean {
  const userAgent =
    ua ?? (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /MicroMessenger/i.test(userAgent);
}
