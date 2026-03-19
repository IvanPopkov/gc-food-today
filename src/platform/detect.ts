export function isTelegram(): boolean {
  return !!window.Telegram?.WebApp?.initData
}
